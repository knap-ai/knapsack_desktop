import { readDir } from '@tauri-apps/api/fs'
import { Cadence } from '../automations/automation'

export const formatText = (text: string) => {
  const lines = text.split('\n')
  const formattedLines: string[] = []

  lines.forEach(line => {
    let formattedLine = ''
    let currentLineLength = 0

    for (let i = 0; i < line.length; i++) {
      if (currentLineLength >= 80) {
        const lastSpaceIndex = formattedLine.lastIndexOf(' ')

        if (lastSpaceIndex !== -1) {
          formattedLine =
            formattedLine.slice(0, lastSpaceIndex) + '\n' + formattedLine.slice(lastSpaceIndex + 1)
          currentLineLength = line[i].length
        } else {
          formattedLine += '\n'
          currentLineLength = 0
        }
      }

      formattedLine += line[i]
      currentLineLength++
    }

    formattedLines.push(formattedLine)
  })

  return formattedLines.join('\n')
}

export const getFilenameWithoutExtension = (filePath: string): string => {
  const fileNameWithExt = filePath.split('/').pop() || ''
  const fileNameWithoutExt = fileNameWithExt.split('.').slice(0, -1).join('.')
  return fileNameWithoutExt
}

export const getFilesFromFolderWithoutExtension = async (dirPath: string): Promise<string[]> => {
  const supported_extensions = [
    'txt', 'md', 'csv', 'log', 'ini', 'yaml', 'yml',
    'toml', 'conf', 'cfg', 'docx', 'doc', 'pdf', 'rtf',
  ]
  const list = await readDir(dirPath)
  const filePaths = list
    .map(file => file.path)
    .filter(path => supported_extensions.some(ext => path.toLowerCase().endsWith(`.${ext}`)))
  return filePaths
}

export const convertToCadenceDisplayStr = (
  automationName: string,
  times: Cadence[]
): string => {
  // TODO: we'll need to generalize this
  if (automationName === "Meeting Prep") {
    return "1 HR BEFORE MEETING"
  }
  if (times.length <= 0) {
    return "ON DEMAND"
  }

  const formatTime = (time: string) => {
    const [hour, _] = time.split(':').map(Number);
    const isPM = hour >= 12;
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const suffix = isPM ? 'pm' : 'am';
    return `${displayHour}${suffix}`;
  };

  const sortedTimes = times.sort((a, b) => {
    if (a.time === undefined || b.time === undefined) {
      return 0
    }
    return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
  })

  const cadenceStrings = sortedTimes.map((timeObj) => {
    switch (timeObj.type) {
      case "daily":
        if (timeObj.time === undefined) {
          return ""
      }
        return formatTime(timeObj.time);
      default:
        return ""; // For future handling of other types
    }
  });

  return `Daily at ${cadenceStrings.join(', ')}`.toUpperCase();
}
