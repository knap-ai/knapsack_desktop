import './TextRenderer.scss'

import React from 'react'

import { open } from '@tauri-apps/api/shell'

interface TextRendererProps {
  text: string
}

const TextRenderer: React.FC<TextRendererProps> = ({ text }) => {
    const lines = text.split('\n')

  const getHeaderMargin = (line: string, index: number): string => {
    if (index == 0) {
      return 'my-0'
    }

    if (line.startsWith('# ')) {
      return 'my-0'
    } else if (line.startsWith('## ')) {
      return 'my-0'
    } else if (line.startsWith('### ')) {
      return 'my-0'
    } else if (line.startsWith('#### ')) {
      return 'my-0'
    } else {
      return 'my-0'
    }
  }

  // Function to determine the class for headers and body text
  const getClassName = (line: string, index: number): string => {
    const headerMargin = getHeaderMargin(line, index)
    if (line.startsWith('# ')) {
      return 'text-base font-bold leading-5 ' + headerMargin
    } else if (line.startsWith('## ')) {
      return 'text-sm font-bold leading-5 ' + headerMargin
    } else if (line.startsWith('### ')) {
      return 'text-sm font-semibold leading-5 ' + headerMargin
    } else if (line.startsWith('#### ')) {
      return 'text-sm font-regular leading-5 ' + headerMargin
    } else if (line.startsWith('* ')) {
      return 'text-sm font-regular leading-5 customBullet '
    } else {
      return 'text-sm leading-5 ' + headerMargin
    }
  }

  const removeMarkdown = (line: string): string => {
    const equalsRegex = /^=+\s*$/ // Matches lines with 3 or more "=" characters

    if (equalsRegex.test(line.trim())) {
      return '' // Remove lines with "===" or more
    }

    if (line.startsWith('# ') || line.startsWith('* ')) {
      return line.substring(2)
    } else if (line.startsWith('## ')) {
      return line.substring(3)
    } else if (line.startsWith('### ')) {
      return line.substring(4)
    } else if (line.startsWith('#### ')) {
      return line.substring(5)
    } else {
      return line
    }
  }

  // Function to parse and render italic text
  const parseItalicText = (line: string): React.ReactNode => {
    const regex = /_\*(.*?)\*_/g
    const parts = line.split(regex)
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className="italic">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  // Function to parse and render bold text
  const parseText = (line: string): React.ReactNode => {
    const regex = /\*\*(.*?)\*\*/g
    const parts = line.split(regex)
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className="font-bold">
          {parseItalicText(part)}
        </span>
      ) : (
        parseItalicText(part)
      ),
    )
  }

  // Function to parse and render blockquotes
  const parseBlockquotes = (line: string, index: number): React.ReactNode => {
    if (line.startsWith('> ') || line.startsWith('>')) {
      const quoteText = line.replace(/^[_> ]+/, '').replace(/_+$/, '')
      return (
        <div className="border-l-4 border-slate-300 pl-4 my-0 italic text-slate-500">
          {parseMarkdown(quoteText, index)}
        </div>
      )
    }
    return null
  }

  // New function to handle rendering newlines as vertical space
  const parseNewlines = (line: string, index: number): React.ReactNode => {
    if (line.trim() === '') {
      return (
        <div
          key={`newline-${index}`}
          className="my-0 min-h-[0.5rem]" // Ensures vertical space without overlapping
        />
      )
    }
    return null
  }

  const parseHorizontalRules = (line: string, index: number): React.ReactNode => {
    const hrRegex = /^(?:-+|\*+|_+|=+)\s*$/ // Matches --- *** ___ === with 3 or more characters
    if (hrRegex.test(line.trim())) {
      return (
        <div key={`hr-${index}`} className="my-2 border border-2 rounded-md border-slate-300" />
      )
    }
    return null
  }

  const onForwardToUrl = (url: string) => {
    open(url)
  }

  // Function to parse and render links
  const parseLinks = (line: string): React.ReactNode => {
    // Regex for Markdown links
    const markdownRegex = /\[(.*?)\]\((.*?)\)/g
    // Regex for plain URLs
    const urlRegex = /https?:\/\/[^\s]+/g

    // First, we split the line by Markdown links
    const parts = line.split(markdownRegex)

    // We will use this array to collect the final parts with URLs transformed to <a> elements
    const finalParts: React.ReactNode[] = []

    parts.forEach((part, index) => {
      if (index % 3 === 1) {
        // Link text for Markdown link
        const url = parts[index + 1]
        finalParts.push(
          <a
            key={`markdown-${index}`}
            onClick={() => {
              onForwardToUrl(url)
            }}
            className="underline text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>,
        )
      } else if (index % 3 === 0) {
        // Normal text which may contain plain URLs
        const subParts = part.split(urlRegex)

        // Find all plain URLs in this part
        const urls = part.match(urlRegex)

        subParts.forEach((subPart, subIndex) => {
          finalParts.push(subPart)

          if (urls && urls[subIndex]) {
            const url = urls[subIndex]
            finalParts.push(
              <a
                key={`url-${index}-${subIndex}`}
                onClick={() => {
                  onForwardToUrl(url)
                }}
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {url}
              </a>,
            )
          }
        })
      }
    })

    return finalParts
  }

  const parseTables = (lines: string[]) => {
    if (!lines.length) return lines
    let index = 0
    const response = []
    while (index < lines.length) {
      let line = lines[index]
      const tableLines = []
      while (line.startsWith('|') && line.endsWith('|')) {
        tableLines.push(line)
        index += 1
        line = lines[index]
        if (line === undefined) {
          return response
        }
      }
      if (tableLines.length) {
        response.push(
          <table className="customTable text-body">
            <thead>
              <tr>
                {tableLines[0]
                  .split('|')
                  .filter(content => content)
                  .map((header, index) => (
                    <th key={`header-${index}`}>{parseMarkdown(header, index)}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableLines
                .slice(1)
                .filter(item => item.replace(/-|:|\|/g, '').trim().length)
                .map((row, index) => (
                  <tr key={`row-${index}`}>
                    {row
                      .split('|')
                      .filter(content => content)
                      .map((cell, cellIndex) => (
                        <td key={`cell-${cellIndex}`}>{parseMarkdown(cell, index)}</td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>,
        )
        index -= 1
      } else {
        response.push(line)
      }
      index += 1
    }
    return response
  }

  // Function to parse and render the text with all Markdown elements
  const parseMarkdown = (line: string, index: number): React.ReactNode => {
    const blockquoteParsed = parseBlockquotes(line, index)
    if (blockquoteParsed) {
      return blockquoteParsed
    }

    const verticalRuleParsed = parseNewlines(line, index)
    if (verticalRuleParsed) {
      return verticalRuleParsed
    }

    const horizontalRuleParsed = parseHorizontalRules(line, index)
    if (horizontalRuleParsed) {
      return horizontalRuleParsed
    }

    const parsedText = parseText(line)
    if (typeof parsedText === 'string') {
      return parseLinks(parsedText)
    } else {
      return React.Children.map(parsedText, child =>
        typeof child === 'string' ? parseLinks(child) : child,
      )
    }
  }

  return (
    <div>
      {parseTables(lines).map((line, index) => (
        <React.Fragment key={index}>
          {typeof line == 'string' ? (
            <div className={`break-words ${getClassName(line, index)}`}>
              {parseMarkdown(removeMarkdown(line), index)}
            </div>
          ) : (
            line
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default TextRenderer
