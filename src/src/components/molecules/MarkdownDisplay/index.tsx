import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import './markdown-styles.css'

interface MarkdownDisplayProps {
  markdown: string
  className?: string
  onChange?: (updatedMarkdown: string) => void
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  markdown = '',
  className = '',
  onChange,
}) => {

  const [content, setContent] = useState(markdown);

  // – "[ ] Cooper: Update the pitch deck to include more compliance content and a bigger story for investors."


  useEffect(() => {
    setContent(markdown)
  }, [markdown])

  // No longer needed since we're using the task text directly

  const handleCheckboxToggle = (taskText: string, checked: boolean) => {
    console.log("handle toggle:", taskText, checked)

    let newContent = content
    console.log("content: ", newContent)
    console.log("taskText: ", taskText)
    console.log("taskText substr: ", taskText.substring(4))

    const position = newContent.indexOf(taskText)

    console.log(position)
    if (position !== -1) {
      // Create the replacement with the new checkbox state
      const newCheckboxPrefix = checked ? '\\[x\\]' : '\\[ \\]';
      const replacement = `${newCheckboxPrefix} ${taskText.substring(4)}`
      console.log("replacement: ", replacement)

      // Replace just this occurrence
      newContent =
        newContent.substring(0, position) +
        replacement +
        newContent.substring(position + taskText.length)

      console.log("newContent: ", newContent)

      setContent(newContent)
      if (onChange) {
        onChange(newContent)
      }
    }
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-lg font-InterTight font-bold mt-2 leading-7" {...props} />,
          h2: ({ node, ...props }) => <h2 className="uppercase font-InterTight text-sm font-bold leading-6 mt-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-medium mt-2 mb-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-sm font-bold mt-2 mb-1" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mt-2 mb-1" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-sm font-medium mt-2 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="my-3" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mt-1 mb-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: ({ node, ...props }) => {
            const isTaskListItem =
              (node?.children?.[0]?.type === 'text' && node?.children?.[0]?.value?.includes('[ ] ')) ||
              (node?.children?.[0]?.type === 'text' && node?.children?.[0]?.value?.includes('[x] '))

            if (isTaskListItem) {
              // Get the text content and determine if it's checked
              const textContent = (node.children[0] as any).value
              const isChecked = textContent.startsWith('[x] ')

              // Extract the task text without the checkbox prefix
              const taskText = textContent.substring(4)

              return (
                <li className="mb-1 flex items-start">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxToggle(textContent, !isChecked)}
                    className="mt-1 mr-2"
                  />
                  <span className={isChecked ? "line-through text-gray-500" : ""}>
                    {taskText}
                  </span>
                </li>
              )
            }

            return <li className="mb-1" {...props} />;
          },
          table: ({ node, ...props }) => (
            <div className="rounded-lg border border-gray-400 overflow-x-auto my-4">
              <table className="min-w-full" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="text-white bg-ks-gunpowder-900" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="[&>tr:nth-child(odd)]:bg-ks-gunpowder-200" {...props} />,
          tr: ({ node, ...props }) => <tr className="" {...props} />,
          th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-semibold" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="pl-4 text-gray-700 my-3" {...props} />,
          code: ({ node, ...props }) =>
            <code className="block bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto my-3" {...props} />,
          pre: ({ node, ...props }) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto my-3" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-6" {...props} />,
          img: ({ node, ...props }) => <img className="max-w-full h-auto my-4" {...props} alt={props.alt || ''} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownDisplay
