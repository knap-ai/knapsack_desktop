#!/usr/bin/env python3

import json
import os
import signal
import sqlite3
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlparse


HOME = Path.home()
KNAPSACK_DIR = HOME / ".knapsack"
DB_PATH = HOME / ".knapsack.db"
NOTES_DIR = KNAPSACK_DIR / "notes"
MOBILE_METADATA_DIR = KNAPSACK_DIR / "mobile_meetings"
MOBILE_RECORDINGS_DIR = KNAPSACK_DIR / "mobile_recordings"
PROFILE_PATH = KNAPSACK_DIR / "profile.dat"
DESKTOP_CHAT_URL = "http://127.0.0.1:8897/api/clawd/chat"
DESKTOP_FEED_URL = "http://127.0.0.1:8897/api/knapsack/feed_items"
HOST = "0.0.0.0"
PORTS = (18898, 8898)
SERVICE_PORT = 18898


def now_ts() -> int:
    return int(time.time())


def ensure_dirs() -> None:
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    MOBILE_METADATA_DIR.mkdir(parents=True, exist_ok=True)
    MOBILE_RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[sqlite3.Row]:
    with db() as conn:
        return list(conn.execute(query, params).fetchall())


def fetch_one(query: str, params: tuple[Any, ...] = ()) -> sqlite3.Row | None:
    with db() as conn:
        return conn.execute(query, params).fetchone()


def execute(query: str, params: tuple[Any, ...] = ()) -> int:
    with db() as conn:
        cur = conn.execute(query, params)
        conn.commit()
        return int(cur.lastrowid or 0)


def load_json(path: Path) -> Any | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def save_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2))


def load_profile() -> dict[str, Any]:
    return load_json(PROFILE_PATH) or {}


def profile_string(obj: dict[str, Any] | None, key: str) -> str | None:
    value = (obj or {}).get(key)
    if isinstance(value, str):
        value = value.strip()
        if value:
            return value
    return None


def infer_profile() -> dict[str, Any] | None:
    root = load_profile()
    kn_profile = root.get("KN_PROFILE") or {}

    row = fetch_one("SELECT id, email, uuid FROM users WHERE email IS NOT NULL AND email != '' ORDER BY id ASC LIMIT 1")
    email = profile_string(kn_profile, "email") or (row["email"] if row else None)
    if not email:
        return None

    lookup = fetch_one("SELECT id, email, uuid FROM users WHERE email = ? LIMIT 1", (email,))
    return {
        "email": email,
        "name": profile_string(kn_profile, "name"),
        "uuid": profile_string(kn_profile, "uuid") or (lookup["uuid"] if lookup else None),
        "provider": profile_string(kn_profile, "provider"),
        "profileImage": profile_string(kn_profile, "profile_image"),
        "sharingPermission": root.get("kn_share_notes_permission"),
    }


def infer_scopes(email: str | None) -> list[str]:
    scopes = [row["scope"] for row in fetch_all("SELECT scope FROM connections ORDER BY id ASC")]
    if not scopes:
        raw = load_profile().get("KN_CONNECTIONS") or []
        scopes = [value for value in raw if isinstance(value, str)]
    return sorted(set(scopes))


def mobile_session() -> dict[str, Any]:
    profile = infer_profile()
    scopes = infer_scopes(profile["email"] if profile else None)
    return {
        "linked": profile is not None,
        "profile": profile,
        "connectionScopes": scopes,
        "calendarConnected": any(scope in ("google_calendar_read", "microsoft_calendar_read") for scope in scopes),
        "emailConnected": any(scope in ("google_gmail_modify", "microsoft_outlook_read") for scope in scopes),
        "driveConnected": any(scope in ("google_drive_read", "microsoft_onedrive_read") for scope in scopes),
        "desktopLabel": "Linked to your desktop Knapsack app",
    }


def metadata_path(thread_id: int) -> Path:
    return MOBILE_METADATA_DIR / f"{thread_id}.json"


def load_metadata(thread_id: int) -> dict[str, Any] | None:
    return load_json(metadata_path(thread_id))


def default_metadata(thread_id: int, source_device: str | None = "iphone") -> dict[str, Any]:
    return {
        "threadId": thread_id,
        "status": "CREATED",
        "sourceDevice": source_device,
        "latestAudioFile": None,
        "notesPreview": None,
        "startedAt": None,
        "endedAt": None,
        "updatedAt": now_ts(),
    }


def save_metadata(payload: dict[str, Any]) -> None:
    payload["updatedAt"] = now_ts()
    save_json(metadata_path(int(payload["threadId"])), payload)


def load_notes(thread_id: int) -> str | None:
    path = NOTES_DIR / str(thread_id)
    return path.read_text() if path.exists() else None


def save_notes(thread_id: int, notes: str) -> None:
    (NOTES_DIR / str(thread_id)).write_text(notes)


def optional_bool(value: Any) -> bool | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value != 0
    return None


def thread_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "timestamp": row["timestamp"],
        "hideFollowUp": optional_bool(row["hideFollowUp"]),
        "feedItemId": row["feed_item_id"],
        "title": row["title"],
        "subtitle": row["subtitle"],
        "threadType": row["thread_type"],
        "recorded": optional_bool(row["recorded"]),
        "savedTranscript": row["saved_transcript"],
        "promptTemplate": row["prompt_template"],
    }


def normalize_thread_dict(thread: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": thread.get("id"),
        "timestamp": thread.get("timestamp"),
        "hideFollowUp": optional_bool(thread.get("hideFollowUp")),
        "feedItemId": thread.get("feedItemId"),
        "title": thread.get("title"),
        "subtitle": thread.get("subtitle"),
        "threadType": thread.get("threadType"),
        "recorded": optional_bool(thread.get("recorded")),
        "savedTranscript": thread.get("savedTranscript"),
        "promptTemplate": thread.get("promptTemplate"),
    }


def build_meeting_detail(row: sqlite3.Row) -> dict[str, Any]:
    thread = thread_row_to_dict(row)
    thread_id = int(row["id"])
    notes = load_notes(thread_id)
    metadata = load_metadata(thread_id) or default_metadata(thread_id)
    if not metadata.get("notesPreview") and notes:
      metadata["notesPreview"] = "\n".join(notes.splitlines()[:3])
    return {"thread": thread, "metadata": metadata, "notes": notes}


def list_meetings() -> list[dict[str, Any]]:
    rows = fetch_all(
        """
        SELECT id, timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template
        FROM threads
        WHERE thread_type = 'MEETING NOTES'
        ORDER BY timestamp DESC
        LIMIT 50
        """
    )
    return [build_meeting_detail(row) for row in rows]


def list_calendar() -> list[dict[str, Any]]:
    six_hours_ago_ms = int(time.time() * 1000) - (6 * 60 * 60 * 1000)
    rows = fetch_all(
        """
        SELECT id, event_id, title, description, location, start, end, google_meet_url, calendar_account_email
        FROM calendar_events
        WHERE COALESCE(start, 0) >= ?
        ORDER BY start ASC
        LIMIT 20
        """,
        (six_hours_ago_ms,),
    )
    return [
        {
            "id": row["id"],
            "eventId": row["event_id"],
            "title": row["title"],
            "description": row["description"],
            "location": row["location"],
            "start": row["start"],
            "end": row["end"],
            "googleMeetURL": row["google_meet_url"],
            "calendarAccountEmail": row["calendar_account_email"],
        }
        for row in rows
    ]


def clean_email_preview(raw: str | None, limit: int = 180) -> str | None:
    if not raw:
        return None
    compact = " ".join(str(raw).split())
    if not compact:
        return None
    return compact[: limit - 1] + "…" if len(compact) > limit else compact


def is_unread_email(row: sqlite3.Row) -> bool:
    return int(row["is_read"] or 0) == 0


def is_deleted_or_archived_email(row: sqlite3.Row) -> bool:
    return int(row["is_deleted"] or 0) != 0 or int(row["is_archived"] or 0) != 0


def lower_join(values: list[str | None]) -> str:
    return " ".join((value or "").lower() for value in values)


def contains_any(haystack: str, needles: tuple[str, ...]) -> bool:
    return any(needle in haystack for needle in needles)


def is_noise_email(row: sqlite3.Row) -> bool:
    text = lower_join([row["sender"], row["subject"], row["body"]])
    return contains_any(
        text,
        (
            "unsubscribe",
            "newsletter",
            "digest",
            "promotion",
            "marketing",
            "sale",
            "deal",
            "sponsored",
            "announcement",
        ),
    )


def is_tracking_email(row: sqlite3.Row) -> bool:
    text = lower_join([row["sender"], row["subject"], row["body"]])
    return contains_any(
        text,
        (
            "tracking",
            "delivered",
            "delivery",
            "shipment",
            "receipt",
            "invoice",
            "order",
            "reservation",
            "booking",
            "itinerary",
            "travel",
            "flight",
        ),
    )


def recent_emails(limit: int = 80) -> list[sqlite3.Row]:
    return fetch_all(
        """
        SELECT id, email_uid, subject, date, sender, recipient, cc, body, thread_id,
               is_starred, is_read, is_archived, is_deleted, account_email
        FROM emails
        ORDER BY date DESC
        LIMIT ?
        """,
        (limit,),
    )


def default_brain_root() -> Path:
    return NOTES_DIR


def humanize_brain_name(name: str) -> str:
    return name.removesuffix(".md").replace("-", " ").replace("_", " ").strip() or "Brain page"


def markdown_title(content: str, fallback: str) -> str:
    for line in content.splitlines():
        trimmed = line.strip()
        if not trimmed:
            continue
        candidate = trimmed.lstrip("#").lstrip("-").lstrip("*").strip()
        if candidate:
            return candidate
    return humanize_brain_name(fallback)


def brain_title_for_path(rel_path: str) -> str:
    return humanize_brain_name(Path(rel_path).name)


def list_brain_entries(sub_path: str = "") -> list[dict[str, Any]]:
    root = default_brain_root()
    current = (root / sub_path).resolve() if sub_path else root.resolve()
    root_resolved = root.resolve()

    if not current.exists() or root_resolved not in [current, *current.parents]:
        return []

    entries = []
    for child in sorted(current.iterdir(), key=lambda item: (not item.is_dir(), item.name.lower())):
        rel_path = child.relative_to(root_resolved).as_posix()
        title = humanize_brain_name(child.name)
        if child.is_file():
            try:
                title = markdown_title(child.read_text(), child.name)
            except Exception:
                pass
        entries.append(
            {
                "name": child.name,
                "title": title,
                "relPath": rel_path,
                "isDir": child.is_dir(),
            }
        )
    return entries


def read_brain_page(rel_path: str) -> dict[str, Any] | None:
    rel = rel_path.strip().lstrip("/")
    if not rel:
        return None
    root = default_brain_root().resolve()
    target = (root / rel).resolve()
    if root not in [target, *target.parents] or not target.exists() or not target.is_file():
        return None
    try:
        content = target.read_text()
    except Exception:
        return None
    return {
        "relPath": rel,
        "title": markdown_title(content, Path(rel).name),
        "content": content,
    }


def build_autopilot_brief() -> dict[str, Any]:
    now = now_ts()
    calendar = list_calendar()
    meetings = list_meetings()[:4]
    chats = list_chats()[:4]
    emails = recent_emails()

    sections: list[dict[str, Any]] = []

    attention_rows = [
        row for row in emails
        if is_unread_email(row) and not is_deleted_or_archived_email(row) and not is_noise_email(row)
    ][:4]
    if attention_rows:
        sections.append(
            {
                "id": "needs-attention",
                "title": "Needs attention",
                "subtitle": "Important inbox items that look worth a quick decision.",
                "cards": [
                    {
                        "id": f"email-attention-{row['id']}",
                        "kind": "email",
                        "title": row["subject"] or "Untitled email",
                        "subtitle": row["sender"] or row["account_email"] or "Email",
                        "preview": clean_email_preview(row["body"]),
                        "rationale": "Unread and not obviously newsletter-like.",
                        "badge": "Unread",
                        "timestamp": int(row["date"] or 0),
                        "relatedThreadID": None,
                        "relatedChatThreadID": None,
                        "suggestedPrompts": [
                            f"Summarize this email and tell me whether I should reply: {row['subject']}",
                            f"Draft a concise response to this email: {row['subject']}",
                        ],
                    }
                    for row in attention_rows
                ],
            }
        )

    today_cards: list[dict[str, Any]] = []
    for index, event in enumerate(calendar[:3]):
        today_cards.append(
            {
                "id": f"calendar-{event['id']}-{index}",
                "kind": "calendar",
                "title": event.get("title") or "Upcoming event",
                "subtitle": event.get("calendarAccountEmail") or "Calendar",
                "preview": clean_email_preview(event.get("description")),
                "rationale": "Coming up soon on your calendar.",
                "badge": "Agenda",
                "timestamp": event.get("start"),
                "relatedThreadID": None,
                "relatedChatThreadID": None,
                "suggestedPrompts": [
                    f"Prep me for this meeting: {event.get('title') or 'upcoming meeting'}",
                ],
            }
        )
    for index, meeting in enumerate(meetings[:2]):
        today_cards.append(
            {
                "id": f"meeting-{meeting['metadata']['threadId']}-{index}",
                "kind": "meeting",
                "title": meeting["thread"].get("title") or "Meeting notes",
                "subtitle": meeting["metadata"].get("status") or "Meeting",
                "preview": clean_email_preview(meeting.get("notes") or meeting["metadata"].get("notesPreview")),
                "rationale": "Recent meeting that may need cleanup or follow-up.",
                "badge": "Notes",
                "timestamp": meeting["metadata"].get("updatedAt"),
                "relatedThreadID": meeting["metadata"].get("threadId"),
                "relatedChatThreadID": None,
                "suggestedPrompts": [
                    f"Turn these notes into follow-ups for {meeting['thread'].get('title') or 'this meeting'}.",
                ],
            }
        )
    if today_cards:
        sections.append(
            {
                "id": "today",
                "title": "Today",
                "subtitle": "What to prep for and polish before the day runs away.",
                "cards": today_cards,
            }
        )

    track_cards: list[dict[str, Any]] = []
    for index, row in enumerate([row for row in emails if is_tracking_email(row)][:3]):
        track_cards.append(
            {
                "id": f"track-{row['id']}-{index}",
                "kind": "tracking",
                "title": row["subject"] or "Life admin",
                "subtitle": row["sender"] or "Inbox",
                "preview": clean_email_preview(row["body"]),
                "rationale": "Looks like a receipt, delivery, booking, or travel update.",
                "badge": "Track",
                "timestamp": int(row["date"] or 0),
                "relatedThreadID": None,
                "relatedChatThreadID": None,
                "suggestedPrompts": [
                    f"Extract the important logistics from this message: {row['subject']}",
                ],
            }
        )
    for index, chat in enumerate(chats[:2]):
        chat_id = chat.get("thread", {}).get("id")
        track_cards.append(
            {
                "id": f"workspace-{chat_id}-{index}",
                "kind": "workspace",
                "title": chat.get("thread", {}).get("title") or "Recent chat",
                "subtitle": "Pick up an active desktop conversation",
                "preview": clean_email_preview(chat.get("preview")),
                "rationale": "Desktop context worth carrying onto the phone.",
                "badge": "Workspace",
                "timestamp": int(chat.get("updatedAt") or 0),
                "relatedThreadID": None,
                "relatedChatThreadID": chat_id,
                "suggestedPrompts": [
                    f"Continue this desktop conversation: {chat.get('thread', {}).get('title') or 'recent chat'}",
                ],
            }
        )
    if track_cards:
        sections.append(
            {
                "id": "track",
                "title": "Track",
                "subtitle": "Logistics, life admin, and active conversations.",
                "cards": track_cards,
            }
        )

    sender_counts: dict[str, int] = {}
    for row in emails:
        sender = (row["sender"] or "").strip()
        if not sender or not is_noise_email(row):
            continue
        sender_counts[sender] = sender_counts.get(sender, 0) + 1
    cleanup_cards = []
    for index, (sender, count) in enumerate(sorted(sender_counts.items(), key=lambda item: item[1], reverse=True)[:3]):
        cleanup_cards.append(
            {
                "id": f"cleanup-{index}",
                "kind": "cleanup",
                "title": sender,
                "subtitle": f"{count} recent low-signal emails",
                "preview": "Likely candidate for unsubscribe, archive, or a tighter filter.",
                "rationale": "Repeated noisy mailer in your recent inbox.",
                "badge": "Cleanup",
                "timestamp": None,
                "relatedThreadID": None,
                "relatedChatThreadID": None,
                "suggestedPrompts": [
                    f"Help me clean up emails from {sender}.",
                ],
            }
        )
    if cleanup_cards:
        sections.append(
            {
                "id": "cleanup",
                "title": "Cleanup",
                "subtitle": "Senders that are stealing attention without giving much back.",
                "cards": cleanup_cards,
            }
        )

    total_cards = sum(len(section["cards"]) for section in sections)
    headline = "Your day is under control"
    if attention_rows:
        headline = f"{len(attention_rows)} emails need a decision"
    elif calendar:
        headline = f"{len(calendar[:3])} upcoming items to prep for"
    elif chats:
        headline = "Your desktop context is ready on mobile"

    summary_bits = []
    if attention_rows:
        summary_bits.append(f"{len(attention_rows)} worthwhile inbox items")
    if calendar:
        summary_bits.append(f"{len(calendar[:3])} agenda items")
    if chats:
        summary_bits.append(f"{len(chats[:2])} active chats")
    if cleanup_cards:
        summary_bits.append(f"{len(cleanup_cards)} cleanup targets")
    summary = ", ".join(summary_bits) if summary_bits else "Link your desktop account to turn Knapsack into a calmer life inbox."

    return {
        "headline": headline,
        "summary": summary,
        "generatedAt": now,
        "sections": sections,
    }


def fetch_desktop_json(url: str, timeout: int = 60) -> Any:
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode())


def desktop_feed_items() -> list[dict[str, Any]]:
    try:
        payload = fetch_desktop_json(DESKTOP_FEED_URL, timeout=120)
    except Exception:
        return []
    if isinstance(payload, dict):
        data = payload.get("data")
        if isinstance(data, list):
            return data
    return []


def desktop_chat_summaries() -> list[dict[str, Any]]:
    chats: list[dict[str, Any]] = []
    for item in desktop_feed_items():
        for thread_with_messages in item.get("threads") or []:
            thread = normalize_thread_dict(thread_with_messages.get("thread") or {})
            if thread.get("threadType") != "CHAT":
                continue
            messages = thread_with_messages.get("messages") or []
            preview = None
            if messages:
                last_message = messages[-1]
                preview = (last_message.get("contentFacade") or last_message.get("content") or "").strip() or None
            chats.append(
                {
                    "thread": thread,
                    "preview": preview or thread.get("subtitle"),
                    "updatedAt": thread.get("timestamp") or now_ts(),
                    "messageCount": len(messages),
                }
            )
    return chats


def list_local_chats() -> list[dict[str, Any]]:
    rows = fetch_all(
        """
        SELECT id, timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template
        FROM threads
        WHERE thread_type = 'CHAT'
        ORDER BY timestamp DESC
        LIMIT 30
        """
    )
    chats: list[dict[str, Any]] = []
    for row in rows:
        thread_id = int(row["id"])
        msg = fetch_one(
            """
            SELECT timestamp, content, content_facade
            FROM messages
            WHERE thread_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (thread_id,),
        )
        count_row = fetch_one("SELECT COUNT(*) AS count FROM messages WHERE thread_id = ?", (thread_id,))
        preview = None
        updated_at = row["timestamp"] or now_ts()
        if msg:
            preview = (msg["content_facade"] or msg["content"] or "").strip() or None
            updated_at = msg["timestamp"] or updated_at
        chats.append(
            {
                "thread": thread_row_to_dict(row),
                "preview": preview,
                "updatedAt": updated_at,
                "messageCount": int(count_row["count"] if count_row else 0),
            }
        )
    return chats


def list_chats() -> list[dict[str, Any]]:
    merged: dict[int, dict[str, Any]] = {}

    for chat in desktop_chat_summaries():
        thread_id = chat.get("thread", {}).get("id")
        if isinstance(thread_id, int):
            merged[thread_id] = chat

    for chat in list_local_chats():
        thread_id = chat.get("thread", {}).get("id")
        if not isinstance(thread_id, int):
            continue
        existing = merged.get(thread_id)
        if existing is None or chat.get("messageCount", 0) >= existing.get("messageCount", 0):
            merged[thread_id] = chat

    return sorted(
        merged.values(),
        key=lambda chat: int(chat.get("updatedAt") or 0),
        reverse=True,
    )[:30]


def user_id_for_messages() -> int | None:
    profile = infer_profile()
    if profile:
        row = fetch_one("SELECT id FROM users WHERE email = ? LIMIT 1", (profile["email"],))
        if row:
            return int(row["id"])
    row = fetch_one("SELECT id FROM users ORDER BY id ASC LIMIT 1")
    return int(row["id"]) if row else None


def message_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "timestamp": row["timestamp"],
        "role": "user" if row["user_id"] is not None else "assistant",
        "content": (row["content_facade"] or row["content"] or ""),
    }


def chat_detail(thread_id: int) -> dict[str, Any] | None:
    thread = fetch_one(
        """
        SELECT id, timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template
        FROM threads
        WHERE id = ?
        LIMIT 1
        """,
        (thread_id,),
    )
    if not thread or thread["thread_type"] != "CHAT":
        for item in desktop_feed_items():
            for thread_with_messages in item.get("threads") or []:
                thread_dict = thread_with_messages.get("thread") or {}
                if thread_dict.get("id") != thread_id or thread_dict.get("threadType") != "CHAT":
                    continue
                messages = thread_with_messages.get("messages") or []
                normalized_messages = [
                    {
                        "id": message.get("id"),
                        "timestamp": message.get("timestamp"),
                        "role": "user" if message.get("userId") is not None else "assistant",
                        "content": message.get("contentFacade") or message.get("content") or "",
                    }
                    for message in messages
                ]
                return {
                    "thread": normalize_thread_dict(thread_dict),
                    "messages": normalized_messages,
                    "updatedAt": thread_dict.get("timestamp") or now_ts(),
                }
        return None
    messages = fetch_all(
        """
        SELECT id, timestamp, user_id, content, content_facade
        FROM messages
        WHERE thread_id = ?
        ORDER BY id ASC
        """,
        (thread_id,),
    )
    updated_at = messages[-1]["timestamp"] if messages else (thread["timestamp"] or now_ts())
    return {
        "thread": thread_row_to_dict(thread),
        "messages": [message_row_to_dict(row) for row in messages],
        "updatedAt": updated_at,
    }


def create_chat(title: str | None) -> dict[str, Any]:
    thread_id = execute(
        """
        INSERT INTO threads(timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template)
        VALUES (?, ?, NULL, ?, ?, 'CHAT', ?, NULL, NULL)
        """,
        (int(time.time() * 1000), 0, title or "New chat", "Started from iPhone", 0),
    )
    return chat_detail(thread_id) or {}


def create_meeting(title: str | None, subtitle: str | None, source_device: str | None) -> dict[str, Any]:
    thread_id = execute(
        """
        INSERT INTO threads(timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template)
        VALUES (?, ?, NULL, ?, ?, 'MEETING NOTES', ?, NULL, NULL)
        """,
        (int(time.time() * 1000), 0, title or "Mobile meeting", subtitle, 0),
    )
    metadata = default_metadata(thread_id, source_device or "iphone")
    save_metadata(metadata)
    row = fetch_one(
        """
        SELECT id, timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template
        FROM threads WHERE id = ?
        """,
        (thread_id,),
    )
    return build_meeting_detail(row) if row else {}


def insert_message(thread_id: int, text: str, user_id: int | None) -> None:
    execute(
        """
        INSERT INTO messages(timestamp, user_id, thread_id, content, content_facade, document_ids)
        VALUES (?, ?, ?, ?, ?, NULL)
        """,
        (int(time.time() * 1000), user_id, thread_id, text, text),
    )


def build_seed_history(messages: list[dict[str, Any]], limit: int = 12) -> list[dict[str, str]]:
    seed: list[dict[str, str]] = []
    for message in messages:
        role = str(message.get("role") or "").strip()
        content = str(message.get("content") or "").strip()
        if role not in {"user", "assistant"} or not content:
            continue
        seed.append({"role": role, "content": content})
    return seed[-limit:]


def forward_chat(thread_id: int, text: str, seed_history: list[dict[str, str]] | None = None) -> str:
    session = mobile_session()
    payload: dict[str, Any] = {
        "text": text,
        # Use a mobile-specific session id so phone-originated chats do not
        # collide with desktop thread ids that the desktop runtime may treat
        # differently internally.
        "sessionId": f"mobile-thread-{thread_id}",
        "autonomyMode": "assist",
    }
    if seed_history:
        payload["seedHistory"] = seed_history
    profile = session.get("profile")
    if profile and profile.get("email"):
        payload["userEmail"] = profile["email"]
    if profile and profile.get("name"):
        payload["userName"] = profile["name"]

    req = urllib.request.Request(
        DESKTOP_CHAT_URL,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            body = json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        try:
            body = json.loads(exc.read().decode())
            detail = body.get("message") or body.get("error")
        except Exception:
            detail = exc.reason
        raise RuntimeError(f"Desktop chat failed: {detail}") from exc
    except Exception as exc:
        raise RuntimeError("Desktop chat is unavailable") from exc

    reply = (body.get("reply") or "").strip()
    if not reply:
        raise RuntimeError(body.get("message") or body.get("error") or "Desktop chat did not return a response")
    return reply


def update_meeting_status(thread_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    metadata = load_metadata(thread_id) or default_metadata(thread_id, payload.get("sourceDevice"))
    for key in ("status", "sourceDevice", "startedAt", "endedAt"):
        if key in payload:
            metadata[key] = payload[key]
    save_metadata(metadata)
    return metadata


def save_recording(thread_id: int, headers: dict[str, str], body: bytes) -> dict[str, Any]:
    filename = headers.get("x-knapsack-file-name") or f"{thread_id}-{now_ts()}.m4a"
    safe_name = Path(filename).name
    out_path = MOBILE_RECORDINGS_DIR / safe_name
    out_path.write_bytes(body)
    metadata = load_metadata(thread_id) or default_metadata(thread_id)
    metadata["latestAudioFile"] = str(out_path)
    metadata["status"] = "UPLOADED"
    if "x-knapsack-started-at" in headers:
        metadata["startedAt"] = int(headers["x-knapsack-started-at"])
    if "x-knapsack-ended-at" in headers:
        metadata["endedAt"] = int(headers["x-knapsack-ended-at"])
    save_metadata(metadata)
    return metadata


def json_success(data: Any) -> bytes:
    return json.dumps({"success": True, "data": data}).encode()


def json_error(message: str, status: int = 400) -> tuple[int, bytes]:
    return status, json.dumps({"success": False, "error": message}).encode()


class MobileBridgeHandler(BaseHTTPRequestHandler):
    server_version = "KnapsackMobileBridge/0.1"

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/":
            self.respond(HTTPStatus.OK, b"pong", content_type="text/plain")
            return
        if path == "/api/knapsack/mobile/session":
            self.respond_json(HTTPStatus.OK, json_success(mobile_session()))
            return
        if path == "/api/knapsack/mobile/calendar":
            self.respond_json(HTTPStatus.OK, json_success(list_calendar()))
            return
        if path == "/api/knapsack/mobile/gbrain/root":
            self.respond_json(HTTPStatus.OK, json_success(str(default_brain_root())))
            return
        if path == "/api/knapsack/mobile/gbrain/list":
            query = dict(parse_qsl(urlparse(self.path).query))
            self.respond_json(HTTPStatus.OK, json_success(list_brain_entries(query.get("subPath", ""))))
            return
        if path == "/api/knapsack/mobile/gbrain/page":
            query = dict(parse_qsl(urlparse(self.path).query))
            page = read_brain_page(query.get("relPath", ""))
            if page is None:
                self.respond_json(*json_error("Brain page not found", 404))
            else:
                self.respond_json(HTTPStatus.OK, json_success(page))
            return
        if path == "/api/knapsack/mobile/autopilot":
            self.respond_json(HTTPStatus.OK, json_success(build_autopilot_brief()))
            return
        if path == "/api/knapsack/mobile/meetings":
            self.respond_json(HTTPStatus.OK, json_success(list_meetings()))
            return
        if path == "/api/knapsack/mobile/chats":
            self.respond_json(HTTPStatus.OK, json_success(list_chats()))
            return

        parts = path.strip("/").split("/")
        if len(parts) == 5 and parts[:4] == ["api", "knapsack", "mobile", "meetings"]:
            detail = self.get_meeting(parts[4])
            return
        if len(parts) == 5 and parts[:4] == ["api", "knapsack", "mobile", "chats"]:
            detail = self.get_chat(parts[4])
            return

        self.respond_json(*json_error("Not found", 404))

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        body = self.read_body()

        if path == "/api/knapsack/mobile/chats":
            payload = self.parse_json(body)
            self.respond_json(HTTPStatus.OK, json_success(create_chat(payload.get("title"))))
            return

        if path == "/api/knapsack/mobile/meetings":
            payload = self.parse_json(body)
            self.respond_json(
                HTTPStatus.OK,
                json_success(create_meeting(payload.get("title"), payload.get("subtitle"), payload.get("sourceDevice"))),
            )
            return

        parts = path.strip("/").split("/")
        if len(parts) == 6 and parts[:4] == ["api", "knapsack", "mobile", "chats"] and parts[5] == "messages":
            self.send_chat(parts[4], body)
            return
        if len(parts) == 6 and parts[:4] == ["api", "knapsack", "mobile", "meetings"] and parts[5] == "notes":
            self.save_meeting_notes(parts[4], body)
            return
        if len(parts) == 6 and parts[:4] == ["api", "knapsack", "mobile", "meetings"] and parts[5] == "status":
            self.update_meeting(parts[4], body)
            return
        if len(parts) == 6 and parts[:4] == ["api", "knapsack", "mobile", "meetings"] and parts[5] == "recording":
            self.upload_recording(parts[4], body)
            return

        self.respond_json(*json_error("Not found", 404))

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stdout.write(f"[mobile-bridge] {self.address_string()} {fmt % args}\n")
        sys.stdout.flush()

    def read_body(self) -> bytes:
        length = int(self.headers.get("Content-Length", "0"))
        return self.rfile.read(length) if length else b""

    def parse_json(self, body: bytes) -> dict[str, Any]:
        if not body:
            return {}
        try:
            return json.loads(body.decode())
        except Exception:
            return {}

    def respond(self, status: int, body: bytes, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def respond_json(self, status: int, body: bytes) -> None:
        self.respond(status, body, content_type="application/json")

    def get_meeting(self, raw_thread_id: str) -> None:
        try:
            thread_id = int(raw_thread_id)
        except ValueError:
            self.respond_json(*json_error("Meeting not found", 404))
            return
        row = fetch_one(
            """
            SELECT id, timestamp, hideFollowUp, feed_item_id, title, subtitle, thread_type, recorded, saved_transcript, prompt_template
            FROM threads WHERE id = ? AND thread_type = 'MEETING NOTES'
            """,
            (thread_id,),
        )
        if not row:
            self.respond_json(*json_error("Meeting not found", 404))
            return
        self.respond_json(HTTPStatus.OK, json_success(build_meeting_detail(row)))

    def get_chat(self, raw_thread_id: str) -> None:
        try:
            thread_id = int(raw_thread_id)
        except ValueError:
            self.respond_json(*json_error("Chat not found", 404))
            return
        detail = chat_detail(thread_id)
        if not detail:
            self.respond_json(*json_error("Chat not found", 404))
            return
        self.respond_json(HTTPStatus.OK, json_success(detail))

    def save_meeting_notes(self, raw_thread_id: str, body: bytes) -> None:
        try:
            thread_id = int(raw_thread_id)
        except ValueError:
            self.respond_json(*json_error("Meeting not found", 404))
            return
        payload = self.parse_json(body)
        notes = str(payload.get("notes") or "")
        save_notes(thread_id, notes)
        metadata = load_metadata(thread_id) or default_metadata(thread_id)
        metadata["notesPreview"] = "\n".join(notes.splitlines()[:3]) if notes else None
        save_metadata(metadata)
        self.respond_json(HTTPStatus.OK, json_success(metadata))

    def update_meeting(self, raw_thread_id: str, body: bytes) -> None:
        try:
            thread_id = int(raw_thread_id)
        except ValueError:
            self.respond_json(*json_error("Meeting not found", 404))
            return
        payload = self.parse_json(body)
        self.respond_json(HTTPStatus.OK, json_success(update_meeting_status(thread_id, payload)))

    def upload_recording(self, raw_thread_id: str, body: bytes) -> None:
        try:
            thread_id = int(raw_thread_id)
        except ValueError:
            self.respond_json(*json_error("Meeting not found", 404))
            return
        headers = {k.lower(): v for k, v in self.headers.items()}
        self.respond_json(HTTPStatus.OK, json_success(save_recording(thread_id, headers, body)))

    def send_chat(self, raw_thread_id: str, body: bytes) -> None:
        try:
            thread_id = int(raw_thread_id)
        except ValueError:
            self.respond_json(*json_error("Chat not found", 404))
            return
        payload = self.parse_json(body)
        text = str(payload.get("text") or "").strip()
        if not text:
            self.respond_json(*json_error("Message text is required", 400))
            return
        existing_chat = chat_detail(thread_id)
        if not existing_chat:
            self.respond_json(*json_error("Chat not found", 404))
            return
        seed_history = build_seed_history(existing_chat.get("messages") or [])
        insert_message(thread_id, text, user_id_for_messages())
        try:
            reply = forward_chat(thread_id, text, seed_history)
        except RuntimeError as exc:
            self.respond_json(*json_error(str(exc), 502))
            return
        insert_message(thread_id, reply, None)
        self.respond_json(HTTPStatus.OK, json_success(chat_detail(thread_id)))


@dataclass
class ServerRuntime:
    server: ThreadingHTTPServer
    thread: threading.Thread


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def start_http_server(port: int) -> ServerRuntime:
    server = ReusableThreadingHTTPServer((HOST, port), MobileBridgeHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return ServerRuntime(server=server, thread=thread)


def start_discovery(port: int) -> subprocess.Popen[bytes] | None:
    hostname = os.uname().nodename.split(".")[0]
    service_name = f"Knapsack on {hostname}"
    try:
        return subprocess.Popen(
            [
                "dns-sd",
                "-R",
                service_name,
                "_knapsack-mobile._tcp",
                "local.",
                str(port),
                "txtvers=1",
                "service=knapsack-mobile",
            ],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return None


def main() -> int:
    ensure_dirs()
    runtimes: list[ServerRuntime] = []
    discovery = start_discovery(SERVICE_PORT)
    try:
        for port in PORTS:
            runtimes.append(start_http_server(port))
            print(f"[mobile-bridge] listening on http://{HOST}:{port}")
        if discovery:
            print(f"[mobile-bridge] advertising _knapsack-mobile._tcp on {SERVICE_PORT}")

        stop_event = threading.Event()

        def handle_signal(signum: int, _frame: Any) -> None:
            print(f"[mobile-bridge] stopping on signal {signum}")
            stop_event.set()

        signal.signal(signal.SIGINT, handle_signal)
        signal.signal(signal.SIGTERM, handle_signal)
        while not stop_event.is_set():
            time.sleep(0.5)
        return 0
    finally:
        if discovery:
            discovery.terminate()
        for runtime in runtimes:
            runtime.server.shutdown()
            runtime.server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
