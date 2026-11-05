import { getHTMLFromFragment } from '@tiptap/core'
import Table from '@tiptap/extension-table'
import { Fragment, type Node } from '@tiptap/pm/model'

// GFM cannot represent every table node. The library's GFM serializer also
// leaves literal pipes unescaped. Store the structured table as HTML for both
// simple and complex cells; the display path sanitizes it before rendering.
export const MeetingNotesTable = Table.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: { write(value: string): void; closeBlock(node: Node): void }, node: Node) {
          state.write(getHTMLFromFragment(Fragment.from(node), node.type.schema))
          state.closeBlock(node)
        },
        parse: {},
      },
    }
  },
})
