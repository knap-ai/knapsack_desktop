// @generated automatically by Diesel CLI.

diesel::table! {
    automation_runs (id) {
        id -> Nullable<Integer>,
        automation_uuid -> Text,
        user_id -> Integer,
        schedule_timestamp -> Nullable<Timestamp>,
        execution_timestamp -> Nullable<Timestamp>,
        thread_id -> Nullable<Integer>,
        run_params -> Nullable<Text>,
        feed_item_id -> Nullable<Integer>,
        created_timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    automation_steps (id) {
        id -> Nullable<Integer>,
        automation_uuid -> Text,
        name -> Text,
        ordering -> Nullable<Integer>,
        args_json -> Nullable<Text>,
    }
}

diesel::table! {
    automations (id) {
        id -> Nullable<Integer>,
        uuid -> Text,
        name -> Text,
        is_active -> Nullable<Bool>,
        is_beta -> Nullable<Bool>,
        description -> Nullable<Text>,
        show_library -> Nullable<Bool>,
        icon -> Nullable<Text>,
    }
}

diesel::table! {
    cadence_triggers (id) {
        id -> Nullable<Integer>,
        automation_uuid -> Text,
        cadence_type -> Text,
        day_of_week -> Nullable<Text>,
        time -> Nullable<Text>,
        created_timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    calendar_events (id) {
        id -> Nullable<Integer>,
        event_id -> Text,
        title -> Nullable<Text>,
        description -> Nullable<Text>,
        creator_email -> Nullable<Text>,
        attendees_json -> Nullable<Text>,
        location -> Nullable<Text>,
        start -> Nullable<Integer>,
        end -> Nullable<Integer>,
        google_meet_url -> Nullable<Text>,
        recurrence_json -> Nullable<Text>,
        recurrence_id -> Nullable<Text>,
    }
}

diesel::table! {
    connections (id) {
        id -> Nullable<Integer>,
        scope -> Text,
        provider -> Text,
    }
}

diesel::table! {
    data_source_trigger (id) {
        id -> Nullable<Integer>,
        automation_uuid -> Text,
        data_source -> Text,
        offset_minutes -> Nullable<Integer>,
        created_timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    db_version (version) {
        version -> Integer,
        qdrant_version -> Integer,
    }
}

diesel::table! {
    documents (id) {
        id -> Nullable<Integer>,
        foreign_table -> Text,
        foreign_table_id -> Integer,
        timestamp -> Nullable<Integer>,
        hash -> Text,
    }
}

diesel::table! {
    drive_documents (id) {
        id -> Nullable<Integer>,
        drive_id -> Text,
        filename -> Text,
        file_size -> Integer,
        date_modified -> Integer,
        date_created -> Integer,
        summary -> Nullable<Text>,
        checksum -> Nullable<Text>,
        url -> Text,
        timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    emails (id) {
        id -> Nullable<Integer>,
        email_uid -> Text,
        subject -> Text,
        date -> Integer,
        sender -> Text,
        recipient -> Text,
        cc -> Nullable<Text>,
        body -> Text,
        thread_id -> Nullable<Text>,
        is_starred -> Nullable<Bool>,
        is_archived -> Nullable<Bool>,
        is_read -> Nullable<Bool>,
        is_deleted -> Nullable<Bool>,
    }
}

diesel::table! {
    feed_items (id) {
        id -> Nullable<Integer>,
        title -> Text,
        timestamp -> Nullable<Integer>,
        deleted -> Nullable<Bool>,
    }
}

diesel::table! {
    local_files (id) {
        id -> Nullable<Integer>,
        filename -> Text,
        path -> Text,
        file_size -> Integer,
        date_modified -> Integer,
        date_created -> Integer,
        title -> Text,
        summary -> Nullable<Text>,
        checksum -> Nullable<Text>,
        timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    message_feedbacks (id) {
        id -> Nullable<Integer>,
        message_id -> Integer,
        user_id -> Integer,
        feedback -> Integer,
        timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    messages (id) {
        id -> Nullable<Integer>,
        timestamp -> Nullable<Integer>,
        user_id -> Nullable<Integer>,
        thread_id -> Integer,
        content -> Text,
        content_facade -> Nullable<Text>,
        document_ids -> Nullable<Text>,
    }
}

diesel::table! {
    threads (id) {
        id -> Nullable<Integer>,
        timestamp -> Nullable<Integer>,
        hideFollowUp -> Nullable<Bool>,
        feed_item_id -> Nullable<Integer>,
        title -> Nullable<Text>,
        subtitle -> Nullable<Text>,
        thread_type -> Nullable<Text>,
        recorded -> Nullable<Bool>,
        saved_transcript -> Nullable<Text>,
        prompt_template -> Nullable<Text>,
    }
}

diesel::table! {
    transcripts (id) {
        id -> Nullable<Integer>,
        thread_id -> Integer,
        filename -> Text,
        start_time -> Nullable<Integer>,
        end_time -> Nullable<Integer>,
        timestamp -> Nullable<Integer>,
    }
}

diesel::table! {
    user_connections (id) {
        id -> Nullable<Integer>,
        user_id -> Integer,
        connection_id -> Integer,
        token -> Text,
        last_synced -> Nullable<Integer>,
        refresh_token -> Nullable<Text>,
    }
}

diesel::table! {
    users (id) {
        id -> Nullable<Integer>,
        email -> Text,
        uuid -> Nullable<Text>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    automation_runs,
    automation_steps,
    automations,
    cadence_triggers,
    calendar_events,
    connections,
    data_source_trigger,
    db_version,
    documents,
    drive_documents,
    emails,
    feed_items,
    local_files,
    message_feedbacks,
    messages,
    threads,
    transcripts,
    user_connections,
    users,
);
