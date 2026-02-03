export enum KNFileType {
  AI = 'AI',
  CSS = 'CSS',
  EXCEL = 'EXCEL',
  EMAIL = 'EMAIL',
  GIF = 'GIF',
  JPG = 'JPG',
  PDF = 'PDF',
  PNG = 'PNG',
  PSD = 'PSD',
  PPTX = 'PPTX',
  TXT = 'TXT',
  SVG = 'SVG',
  WORD_DOC = 'DOC',
  ZIP = 'ZIP',
  CODE = 'CODE',
  DRIVE = 'DRIVE',
}

const FILE_IMAGE_ASSETS_DIR = 'assets/images/fileTypes/'

export function fileTypeToIcon(fileType: KNFileType | null): string {
  switch (fileType) {
    case KNFileType.AI:
      return FILE_IMAGE_ASSETS_DIR + 'ai.png'
    case KNFileType.CSS:
      return FILE_IMAGE_ASSETS_DIR + 'css.png'
    case KNFileType.EXCEL:
      return FILE_IMAGE_ASSETS_DIR + 'xlsx.png'
    case KNFileType.GIF:
      return FILE_IMAGE_ASSETS_DIR + 'gif.png'
    case KNFileType.JPG:
      return FILE_IMAGE_ASSETS_DIR + 'jpg.png'
    case KNFileType.PDF:
      return FILE_IMAGE_ASSETS_DIR + 'pdf.png'
    case KNFileType.PNG:
      return FILE_IMAGE_ASSETS_DIR + 'png.png'
    case KNFileType.PSD:
      return FILE_IMAGE_ASSETS_DIR + 'psd.png'
    case KNFileType.PPTX:
      return FILE_IMAGE_ASSETS_DIR + 'pptx.png'
    case KNFileType.TXT:
      return FILE_IMAGE_ASSETS_DIR + 'txt.png'
    case KNFileType.SVG:
      return FILE_IMAGE_ASSETS_DIR + 'svg.png'
    case KNFileType.WORD_DOC:
      return FILE_IMAGE_ASSETS_DIR + 'docx.png'
    case KNFileType.ZIP:
      return FILE_IMAGE_ASSETS_DIR + 'zip.png'
    case KNFileType.CODE:
      return FILE_IMAGE_ASSETS_DIR + 'code.png'
    case KNFileType.EMAIL:
      return FILE_IMAGE_ASSETS_DIR + 'email.png'
    case KNFileType.DRIVE:
      return FILE_IMAGE_ASSETS_DIR + 'drive.png'
    default:
      return FILE_IMAGE_ASSETS_DIR + 'default.png'
  }
}

export function getFileExtension(path: string): string {
  return path.split('.').pop()?.toLowerCase() ?? ''
}

export function getCodeFileIcon(path: string): string {
  const iconsMap: Record<string, string> = {
    js: 'nf-seti-javascript',
    py: 'nf-seti-python',
    java: 'nf-seti-java',
    c: 'nf-seti-c',
    cpp: 'nf-seti-cpp',
    cs: 'nf-seti-c_sharp',
    rb: 'nf-seti-ruby',
    go: 'nf-seti-go',
    rs: 'nf-seti-rust',
    php: 'nf-seti-php',
    html: 'nf-seti-html',
    css: 'nf-seti-css',
    scss: 'nf-seti-sass',
    json: 'nf-seti-json',
    md: 'nf-seti-markdown',
    ts: 'nf-seti-typescript',
    jsx: 'nf-seti-react',
    tsx: 'nf-seti-react',
    sh: 'nf-seti-shell',
    yml: 'nf-seti-yml',
    yaml: 'nf-seti-yml',
    xml: 'nf-seti-xml',
    pl: 'nf-seti-perl',
    dart: 'nf-seti-dart',
    r: 'nf-seti-r',
    swift: 'nf-seti-swift',
    kt: 'nf-custom-kotlin',
    lua: 'nf-seti-lua',
    h: 'nf-seti-c',
    hpp: 'nf-seti-cpp',
    nim: 'nf-seti-nim',
    jl: 'nf-seti-julia',
    hs: 'nf-seti-haskell',
    elm: 'nf-custom-elm',
    ex: 'nf-custom-elixir',
    exs: 'nf-custom-elixir',
    cr: 'nf-custom-crystal',
    purs: 'nf-custom-purescript',
    ml: 'nf-seti-ocaml',
    clj: 'nf-seti-clojure',
    cljs: 'nf-seti-clojure',
    coffee: 'nf-seti-coffee',
    vim: 'nf-custom-vim',
    bat: 'nf-custom-msdos',
    exe: 'nf-custom-windows',
    tex: 'nf-seti-tex',
    less: 'nf-seti-sass',
    styl: 'nf-seti-stylus',
    mustache: 'nf-seti-mustache',
    ejs: 'nf-seti-ejs',
    pug: 'nf-seti-pug',
    vue: 'nf-seti-vue',
    svelte: 'nf-seti-svelte',
    toml: 'nf-custom-toml',
    sql: 'nf-seti-db',
    ps1: 'nf-seti-powershell',
    prisma: 'nf-seti-prisma',
    zig: 'nf-seti-zig',
    asm: 'nf-custom-asm',
    v: 'nf-custom-v_lang',
    neovim: 'nf-custom-neovim',
    fennel: 'nf-custom-fennel',
    lisp: 'nf-custom-common_lisp',
    scheme: 'nf-custom-scheme',
    astro: 'nf-custom-astro',
    prettier: 'nf-custom-prettier',
    ada: 'nf-custom-ada',
  }
  const extension = getFileExtension(path)
  return iconsMap[extension] ?? null
}

export function getCodeFilePrismJSLanguageName(path: string): string {
  const languagesMap: Record<string, string> = {
    js: 'javascript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    php: 'php',
    html: 'markup',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    ts: 'typescript',
    jsx: 'jsx',
    tsx: 'tsx',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'markup',
    pl: 'perl',
    dart: 'dart',
    r: 'r',
    swift: 'swift',
    kt: 'kotlin',
    lua: 'lua',
    h: 'c',
    hpp: 'cpp',
    nim: 'nim',
    jl: 'julia',
    hs: 'haskell',
    elm: 'elm',
    ex: 'elixir',
    exs: 'elixir',
    cr: 'crystal',
    purs: 'purescript',
    ml: 'ocaml',
    clj: 'clojure',
    cljs: 'clojure',
    coffee: 'coffeescript',
    vim: 'vim',
    bat: 'batch',
    tex: 'latex',
    less: 'less',
    styl: 'stylus',
    ejs: 'markup-templating',
    pug: 'pug',
    vue: 'markup-templating',
    sql: 'sql',
    ps1: 'powershell',
    asm: 'asm6502',
    lisp: 'lisp',
    scheme: 'scheme',
    ada: 'ada',
  }
  const extension = getFileExtension(path)
  return languagesMap[extension] ?? 'none'
}

export function fileToFileType(path: string): KNFileType | null {
  switch (getFileExtension(path)) {
    case 'ai':
      return KNFileType.AI
    case 'css':
      return KNFileType.CSS
    case 'xls':
    case 'xlsx':
      return KNFileType.EXCEL
    case 'gif':
      return KNFileType.GIF
    case 'jpg':
    case 'jpeg':
      return KNFileType.JPG
    case 'pdf':
      return KNFileType.PDF
    case 'png':
      return KNFileType.PNG
    case 'psd':
      return KNFileType.PSD
    case 'pptx':
      return KNFileType.PPTX
    case 'txt':
      return KNFileType.TXT
    case 'svg':
      return KNFileType.SVG
    case 'doc':
    case 'docx':
      return KNFileType.WORD_DOC
    case 'zip':
      return KNFileType.ZIP
    default:
      return null
  }
}

export function fileTypeShouldShowSearchDetails(fileType: KNFileType): boolean {
  return (
    fileType === KNFileType.PDF ||
    fileType === KNFileType.WORD_DOC ||
    fileType === KNFileType.PPTX ||
    fileType === KNFileType.CODE ||
    fileType === KNFileType.EMAIL
  )
}
