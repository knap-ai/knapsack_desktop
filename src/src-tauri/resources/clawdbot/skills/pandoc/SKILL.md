---
name: Pandoc
description: Convert documents between formats — Markdown, HTML, PDF, DOCX, and more.
metadata: {"clawdbot":{"emoji":"📑","homepage":"https://pandoc.org","requires":{"bins":["pandoc"]},"install":[{"id":"brew","kind":"brew","formula":"pandoc","bins":["pandoc"]}]}}
---

# Pandoc

Use Pandoc to convert between document formats.

## When to activate

- User asks to convert Markdown to PDF, HTML, DOCX, or other formats
- User wants to generate documentation from source files
- User needs to transform document structure or metadata

## Common operations

| Task | Command |
|------|---------|
| Markdown to HTML | `pandoc input.md -o output.html` |
| Markdown to PDF | `pandoc input.md -o output.pdf` |
| Markdown to DOCX | `pandoc input.md -o output.docx` |
| HTML to Markdown | `pandoc input.html -o output.md` |
| With template | `pandoc input.md --template=tpl.html -o out.html` |
