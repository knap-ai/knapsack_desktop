# Remember meeting-note name spellings

Open **Review name spellings** in a meeting note to save a preferred spelling. In edit mode, you can capture the original name before correcting it and capture the preferred spelling afterward. Confirm the pair with **Remember spelling**. Ordinary typing, pasted text, and automatic note generation do not teach spellings automatically.

Remembered pairs belong to the signed-in profile on this device. Disable a pair or forget it from the review panel. Spelling memory does not sync across devices.

Relevant confirmed spellings can guide future note generation. When generation uses a cloud model, those relevant pairs may be included in its prompt. The panel explains this before you remember a pair. Model guidance does not guarantee a correction, so review ambiguous names and speaker attribution.

For a completed meeting, **Preview remembered spellings in this note** shows proposed changes without saving them. Review individual occurrences, then apply the selected changes. Larger sets are shown in batches of up to 30. Use Undo to restore an applied note revision. The transcript is not changed.

Previews conservatively skip protected Markdown, including code, quotations, links, and HTML. Some names and formatting require manual editing. First-name references are used when the meeting's user identity is reliable; uncertain attribution stays neutral.

## Development checks

From `src/`, run `npm run test:meeting-spellings`, the TypeScript check, and the production build. Tests use synthetic identities and note content.
