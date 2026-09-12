import assert from "node:assert/strict";
import test from "node:test";

import {
  formatBrainDocumentContext,
  rankBrainDocuments,
} from "../src/utils/brainContext.ts";

const workspace = (documents) => ({
  id: 1,
  uuid: "workspace-1",
  name: "Bankaya",
  description: "Bankaya correspondence",
  icon: null,
  createdAt: 1,
  updatedAt: 1,
  documents,
  autoCurated: 1,
  entityType: "project",
  entityKey: "bankaya",
  lastCuratedAt: 1,
});

const document = (overrides) => ({
  id: 1,
  workspaceUuid: "workspace-1",
  documentName: "Ordinary update",
  documentPath: null,
  documentType: "email",
  contentHash: "Nothing actionable in this message.",
  embedded: 0,
  createdAt: Math.floor(Date.now() / 1000),
  tags: null,
  autoTags: null,
  summary: null,
  sourceType: "email",
  sourceId: "email-1",
  ...overrides,
});

test("commitment questions retrieve full email content instead of title-only summaries", () => {
  const rows = rankBrainDocuments(
    [
      workspace([
        document({ id: 1 }),
        document({
          id: 2,
          documentName: "Unrelated subject line",
          sourceId: "email-2",
          contentHash:
            "<p>I will send Paula the revised proposal by Friday.</p><p>Regards, Mark</p>",
        }),
      ]),
    ],
    "What have I promised people recently?",
  );

  assert.equal(rows[0].document.id, 2);
  assert.match(
    rows[0].excerpt,
    /I will send Paula the revised proposal by Friday/,
  );
  assert.doesNotMatch(rows[0].excerpt, /<p>/);
});

test("formatted context retains provenance and bounded source content", () => {
  const [row] = rankBrainDocuments(
    [
      workspace([
        document({
          contentHash: `I will follow up. ${"detail ".repeat(1000)}`,
        }),
      ]),
    ],
    "What did I commit to?",
  );
  const context = formatBrainDocumentContext(row);

  assert.match(context, /Source record: email-1/);
  assert.match(context, /Content excerpt: I will follow up/);
  assert.ok(context.length < 2600);
});
