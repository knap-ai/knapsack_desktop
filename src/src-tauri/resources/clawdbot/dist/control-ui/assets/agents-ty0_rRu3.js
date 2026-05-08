import{h as e,l as t,o as n,p as r,t as i}from"./string-coerce-C4mH-Yei.js";import{A as a,C as o,D as s,E as c,M as l,O as u,S as d,T as f,_ as p,a as m,b as h,f as ee,g,j as _,k as te,m as v,n as y,p as ne,r as b,t as x,v as re,w as S,x as C,y as w,z as T}from"./index-DV4QBOU4.js";import{r as E}from"./channel-config-extras-9-Vez2TC.js";import{i as D,n as O,r as k,t as A}from"./skills-shared-CPeVPsa-.js";function ie(t){let{agent:i,configForm:a,agentFilesList:l,configLoading:d,configSaving:p,configDirty:m,onConfigReload:h,onConfigSave:ee,onModelChange:g,onModelFallbacksChange:_,onSelectPanel:te}=t,v=f(a,i.id),y=i.model,ne=(l&&l.agentId===i.id?l.workspace:null)||v.entry?.workspace||v.defaults?.workspace||i.workspace||`default`,b=v.entry?.model?s(v.entry?.model):v.defaults?.model?s(v.defaults?.model):s(y),x=s(v.defaults?.model??y),C=u(v.entry?.model),w=u(v.defaults?.model)||(x===`-`?null:o(x))||(a?null:u(y)),T=C??w??null,E=c(v.entry?.model)??c(v.defaults?.model)??(a?null:c(y))??[],D=Array.isArray(v.entry?.skills)?v.entry?.skills:null,O=D?.length??null,k=!!(t.defaultId&&i.id===t.defaultId),A=!a||d||p,ie=e=>{let t=E.filter((t,n)=>n!==e);_(i.id,t)};return e`
    <section class="card">
      <div class="card-title">Overview</div>
      <div class="card-sub">Workspace paths and identity metadata.</div>

      <div class="agents-overview-grid" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Workspace</div>
          <div>
            <button
              type="button"
              class="workspace-link mono"
              @click=${()=>te(`files`)}
              title="Open Files tab"
            >
              ${ne}
            </button>
          </div>
        </div>
        <div class="agent-kv">
          <div class="label">Primary Model</div>
          <div class="mono">${b}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Skills Filter</div>
          <div>${D?`${O} selected`:`all skills`}</div>
        </div>
      </div>

      ${m?e`
            <div class="callout warn" style="margin-top: 16px">
              You have unsaved config changes.
            </div>
          `:r}

      <div class="agent-model-select" style="margin-top: 20px;">
        <div class="label">Model Selection</div>
        <div class="agent-model-fields">
          <label class="field">
            <span>Primary model${k?` (default)`:``}</span>
            <select
              .value=${k?T??``:C??``}
              ?disabled=${A}
              @change=${e=>g(i.id,e.target.value||null)}
            >
              ${k?e` <option value="">Not set</option> `:e`
                    <option value="">
                      ${w?`Inherit default (${w})`:`Inherit default`}
                    </option>
                  `}
              ${re(a,T??void 0,t.modelCatalog)}
            </select>
          </label>
          <div class="field">
            <span>Fallbacks</span>
            <div
              class="agent-chip-input"
              @click=${e=>{let t=e.currentTarget.querySelector(`input`);t&&t.focus()}}
            >
              ${E.map((t,n)=>e`
                  <span class="chip">
                    ${t}
                    <button
                      type="button"
                      class="chip-remove"
                      ?disabled=${A}
                      @click=${()=>ie(n)}
                    >
                      &times;
                    </button>
                  </span>
                `)}
              <input
                ?disabled=${A}
                placeholder=${E.length===0?`provider/model`:``}
                @keydown=${e=>{let t=e.target;if(e.key===`Enter`||e.key===`,`){e.preventDefault();let n=S(t.value);n.length>0&&(_(i.id,[...E,...n]),t.value=``)}}}
                @blur=${e=>{let t=e.target,n=S(t.value);n.length>0&&(_(i.id,[...E,...n]),t.value=``)}}
              />
            </div>
          </div>
        </div>
        <div class="agent-model-actions">
          <button
            type="button"
            class="btn btn--sm"
            ?disabled=${d}
            @click=${h}
          >
            ${n(`common.reloadConfig`)}
          </button>
          <button
            type="button"
            class="btn btn--sm primary"
            ?disabled=${p||!m}
            @click=${ee}
          >
            ${p?`Saving…`:`Save`}
          </button>
        </div>
      </div>
    </section>
  `}var ae=Object.defineProperty,oe=(e,t,n)=>t in e?ae(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,j=(e,t,n)=>oe(e,typeof t==`symbol`?t:t+``,n),se={classPrefix:`cm-`,theme:`github`,linkTarget:`_blank`,sanitize:!1,plugins:[],customRenderers:{}};function ce(e){return{...se,...e,plugins:e?.plugins??[],customRenderers:e?.customRenderers??{}}}function le(e,t){return typeof t==`function`?t(e):e}function ue(e,t){let n=ce(t),r=n.classPrefix,i=e;for(let e of n.plugins)e.transformBlock&&(i=i.map(e.transformBlock));let a=`<div class="${r}preview">${i.map(e=>{for(let t of n.plugins)if(t.renderBlock){let r=t.renderBlock(e,()=>fe(e,n));if(r!==null)return r}let t=n.customRenderers[e.type];return t?t(e):fe(e,n)}).join(`
`)}</div>`;return a=le(a,n.sanitize),a}async function de(e,t){let n=ce(t);for(let e of n.plugins)e.init&&await e.init();let r=ue(e,t);for(let e of n.plugins)e.postProcess&&(r=await e.postProcess(r));return r}function fe(e,t){let n=t.classPrefix;switch(e.type){case`paragraph`:return`<p class="${n}paragraph">${M(e.content,t)}</p>`;case`heading`:return pe(e,t);case`bulletList`:return me(e,t);case`numberedList`:return he(e,t);case`checkList`:return ge(e,t);case`codeBlock`:return _e(e,t);case`blockquote`:return`<blockquote class="${n}blockquote">${M(e.content,t)}</blockquote>`;case`table`:return ve(e,t);case`image`:return ye(e,t);case`divider`:return`<hr class="${n}divider" />`;case`callout`:return be(e,t);default:return`<div class="${n}unknown">${M(e.content,t)}</div>`}}function pe(e,t){let n=t.classPrefix,r=e.props.level,i=`h${r}`;return`<${i} class="${n}heading ${n}h${r}">${M(e.content,t)}</${i}>`}function me(e,t){return`<ul class="${t.classPrefix}bullet-list">
${e.children.map(e=>`<li>${M(e.content,t)}</li>`).join(`
`)}
</ul>`}function he(e,t){return`<ol class="${t.classPrefix}numbered-list">
${e.children.map(e=>`<li>${M(e.content,t)}</li>`).join(`
`)}
</ol>`}function ge(e,t){let n=t.classPrefix,r=e.props.checked;return`
<div class="${n}checklist-item">
  <input type="checkbox" ${r?`checked disabled`:`disabled`} />
  <span class="${r?`${n}checked`:``}">${M(e.content,t)}</span>
</div>`.trim()}function _e(e,t){let n=t.classPrefix,r=e.content.map(e=>e.text).join(``),i=e.props.language||``,a=N(r),o=i?` language-${i}`:``;return`<pre class="${n}code-block"${i?` data-language="${i}"`:``}><code class="${n}code${o}">${a}</code></pre>`}function ve(e,t){let n=t.classPrefix,{headers:r,rows:i,alignments:a}=e.props,o=e=>{let t=a?.[e];return t?` style="text-align: ${t}"`:``};return`<table class="${n}table">
${r.length>0?`<thead><tr>${r.map((e,t)=>`<th${o(t)}>${N(e)}</th>`).join(``)}</tr></thead>`:``}
<tbody>
${i.map(e=>`<tr>${e.map((e,t)=>`<td${o(t)}>${N(e)}</td>`).join(``)}</tr>`).join(`
`)}
</tbody>
</table>`}function ye(e,t){let n=t.classPrefix,{url:r,alt:i,title:a,width:o,height:s}=e.props,c=i?` alt="${N(i)}"`:` alt=""`,l=a?` title="${N(a)}"`:``,u=o?` width="${o}"`:``,d=s?` height="${s}"`:``;return`<figure class="${n}image">${`<img src="${N(r)}"${c}${l}${u}${d} />`}${i?`<figcaption>${N(i)}</figcaption>`:``}</figure>`}function be(e,t){let n=t.classPrefix,r=e.props.type;return`
<div class="${n}callout ${n}callout-${r}" role="alert">
  <strong class="${n}callout-title">${r}</strong>
  <div class="${n}callout-content">${M(e.content,t)}</div>
</div>`.trim()}function M(e,t){return e.map(e=>xe(e,t)).join(``)}function xe(e,t){let n=N(e.text),r=e.styles;if(r.code&&(n=`<code>${n}</code>`),r.highlight&&(n=`<mark>${n}</mark>`),r.strikethrough&&(n=`<del>${n}</del>`),r.underline&&(n=`<u>${n}</u>`),r.italic&&(n=`<em>${n}</em>`),r.bold&&(n=`<strong>${n}</strong>`),r.link){let e=t.linkTarget===`_blank`?` target="_blank" rel="noopener noreferrer"`:``,i=r.link.title?` title="${N(r.link.title)}"`:``;n=`<a href="${N(r.link.url)}"${i}${e}>${n}</a>`}return n}function N(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function Se(e){return[...[1,2,3,4,5,6].map(t=>({tag:`h${t}`,classes:[`${e}heading`,`${e}h${t}`]})),{tag:`p`,classes:[`${e}paragraph`]},{tag:`ul`,classes:[`${e}bullet-list`]},{tag:`ol`,classes:[`${e}numbered-list`]},{tag:`pre`,classes:[`${e}code-block`]},{tag:`blockquote`,classes:[`${e}blockquote`]},{tag:`hr`,classes:[`${e}divider`]},{tag:`table`,classes:[`${e}table`]},{tag:`figure`,classes:[`${e}image`]}]}function Ce(e,t){let n=t.join(` `),r=/\bclass\s*=\s*"([^"]*)"/i,i=e.match(r);return i?e.replace(r,`class="${n} ${i[1]}"`):e.endsWith(`/>`)?e.slice(0,-2)+` class="${n}" />`:e.slice(0,-1)+` class="${n}">`}function we(e,t){return e.replace(/(?<!<figure[^>]*>\s*)(<img\s[^>]*\/?>)(?!\s*<\/figure>)/gi,`<figure class="${t}image">$1</figure>`)}function Te(e,t){let n=t?.classPrefix??`cm-`,r=t?.wrapperClass??`${n}preview`,i=Se(n),a=e;for(let{tag:e,classes:t}of i){let n=RegExp(`<${e}(\\s[^>]*)?>|<${e}\\s*\\/?>`,`gi`);a=a.replace(n,e=>Ce(e,t))}return a=we(a,n),a=`<div class="${r}">${a}</div>`,typeof t?.sanitize==`function`&&(a=t.sanitize(a)),a}async function Ee(e){try{return(await t(()=>import(`./preview-B6vi4el7.js`),[],import.meta.url)).parse(e)}catch{throw Error(`@create-markdown/core is required to parse markdown in <markdown-preview>. Install it, or provide pre-parsed blocks via the blocks attribute / setBlocks().`)}}j(class extends HTMLElement{constructor(){super(),j(this,`_shadow`,null),j(this,`plugins`,[]),j(this,`defaultTheme`,`github`),j(this,`styleElement`),j(this,`contentElement`);let e=this.constructor._shadowMode;e!==`none`&&(this._shadow=this.attachShadow({mode:e})),this.styleElement=document.createElement(`style`),this.renderRoot.appendChild(this.styleElement),this.contentElement=document.createElement(`div`),this.contentElement.className=`markdown-preview-content`,this.renderRoot.appendChild(this.contentElement),this.updateStyles()}static get observedAttributes(){return[`theme`,`link-target`,`async`]}get renderRoot(){return this._shadow??this}connectedCallback(){this.render()}attributeChangedCallback(e,t,n){this.render()}setPlugins(e){this.plugins=e,this.render()}setDefaultTheme(e){this.defaultTheme=e,this.render()}getMarkdown(){let e=this.getAttribute(`blocks`);if(e)try{return JSON.parse(e).map(e=>e.content.map(e=>e.text).join(``)).join(`

`)}catch{return``}return this.textContent||``}setMarkdown(e){this.textContent=e,this.render()}setBlocks(e){this.setAttribute(`blocks`,JSON.stringify(e)),this.render()}getOptions(){return{theme:this.getAttribute(`theme`)||this.defaultTheme,linkTarget:this.getAttribute(`link-target`)||`_blank`,plugins:this.plugins}}async getBlocks(){let e=this.getAttribute(`blocks`);if(e)try{return JSON.parse(e)}catch{return console.warn(`Invalid blocks JSON in markdown-preview element`),[]}return Ee(this.textContent||``)}async render(){let e=await this.getBlocks(),t=this.getOptions(),n=this.hasAttribute(`async`)||this.plugins.length>0;try{let r;r=n?await de(e,t):ue(e,t),this.contentElement.innerHTML=r}catch(e){console.error(`Error rendering markdown preview:`,e),this.contentElement.innerHTML=`<div class="error">Error rendering content</div>`}}updateStyles(){let e=this.plugins.filter(e=>e.getCSS).map(e=>e.getCSS()).join(`

`),t=this._shadow?`:host { display: block; }`:`markdown-preview { display: block; }`;this.styleElement.textContent=`
${t}

.markdown-preview-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

.error {
  color: #cf222e;
  padding: 1rem;
  background: #ffebe9;
  border-radius: 6px;
}

${e}
    `.trim()}},`_shadowMode`,`open`);function De(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var P=De();function Oe(e){P=e}var F={exec:()=>null};function I(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(L.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var ke=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),L={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,`i`),blockquoteBeginRegex:e=>RegExp(`^ {0,${Math.min(3,e-1)}}>`)},Ae=/^(?:[ \t]*(?:\n|$))+/,je=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Me=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,R=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ne=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Pe=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,Fe=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Ie=I(Fe).replace(/bull/g,Pe).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),Le=I(Fe).replace(/bull/g,Pe).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Re=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ze=/^[^\n]+/,Be=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Ve=I(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,Be).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),He=I(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Pe).getRegex(),z=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,Ue=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,We=I(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,Ue).replace(`tag`,z).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Ge=I(Re).replace(`hr`,R).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,z).getRegex(),Ke={blockquote:I(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,Ge).getRegex(),code:je,def:Ve,fences:Me,heading:Ne,hr:R,html:We,lheading:Ie,list:He,newline:Ae,paragraph:Ge,table:F,text:ze},qe=I(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,R).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,z).getRegex(),Je={...Ke,lheading:Le,table:qe,paragraph:I(Re).replace(`hr`,R).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,qe).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,z).getRegex()},Ye={...Ke,html:I(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,Ue).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:F,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:I(Re).replace(`hr`,R).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,Ie).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},Xe=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Ze=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Qe=/^( {2,}|\\)\n(?!\s*$)/,$e=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,B=/[\p{P}\p{S}]/u,V=/[\s\p{P}\p{S}]/u,et=/[^\s\p{P}\p{S}]/u,tt=I(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,V).getRegex(),nt=/(?!~)[\p{P}\p{S}]/u,rt=/(?!~)[\s\p{P}\p{S}]/u,it=/(?:[^\s\p{P}\p{S}]|~)/u,at=I(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,ke?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),ot=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,st=I(ot,`u`).replace(/punct/g,B).getRegex(),ct=I(ot,`u`).replace(/punct/g,nt).getRegex(),lt=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,ut=I(lt,`gu`).replace(/notPunctSpace/g,et).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),dt=I(lt,`gu`).replace(/notPunctSpace/g,it).replace(/punctSpace/g,rt).replace(/punct/g,nt).getRegex(),ft=I(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,et).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),pt=I(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,B).getRegex(),mt=I(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,et).replace(/punctSpace/g,V).replace(/punct/g,B).getRegex(),ht=I(/\\(punct)/,`gu`).replace(/punct/g,B).getRegex(),gt=I(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),_t=I(Ue).replace(`(?:-->|$)`,`-->`).getRegex(),vt=I(`^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,_t).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),H=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,yt=I(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace(`label`,H).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),bt=I(/^!?\[(label)\]\[(ref)\]/).replace(`label`,H).replace(`ref`,Be).getRegex(),xt=I(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,Be).getRegex(),St=I(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,bt).replace(`nolink`,xt).getRegex(),Ct=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,wt={_backpedal:F,anyPunctuation:ht,autolink:gt,blockSkip:at,br:Qe,code:Ze,del:F,delLDelim:F,delRDelim:F,emStrongLDelim:st,emStrongRDelimAst:ut,emStrongRDelimUnd:ft,escape:Xe,link:yt,nolink:xt,punctuation:tt,reflink:bt,reflinkSearch:St,tag:vt,text:$e,url:F},Tt={...wt,link:I(/^!?\[(label)\]\((.*?)\)/).replace(`label`,H).getRegex(),reflink:I(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,H).getRegex()},Et={...wt,emStrongRDelimAst:dt,emStrongLDelim:ct,delLDelim:pt,delRDelim:mt,url:I(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`protocol`,Ct).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:I(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace(`protocol`,Ct).getRegex()},Dt={...Et,br:I(Qe).replace(`{2,}`,`*`).getRegex(),text:I(Et.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},U={normal:Ke,gfm:Je,pedantic:Ye},W={normal:wt,gfm:Et,breaks:Dt,pedantic:Tt},Ot={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},kt=e=>Ot[e];function G(e,t){if(t){if(L.escapeTest.test(e))return e.replace(L.escapeReplace,kt)}else if(L.escapeTestNoEncode.test(e))return e.replace(L.escapeReplaceNoEncode,kt);return e}function At(e){try{e=encodeURI(e).replace(L.percentDecode,`%`)}catch{return null}return e}function jt(e,t){let n=e.replace(L.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(L.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``);for(;r<n.length;r++)n[r]=n[r].trim().replace(L.slashPipe,`|`);return n}function K(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function Mt(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&L.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function Nt(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}function Pt(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function Ft(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`);r.state.inLink=!0;let c={type:e[0].charAt(0)===`!`?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:r.inlineTokens(s)};return r.state.inLink=!1,c}function It(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return r.length>=i.length?e.slice(i.length):e}).join(`
`)}var q=class{options;rules;lexer;constructor(e){this.options=e||P}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:Mt(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=It(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=K(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:K(t[0],`
`),depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:K(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=K(t[0],`
`).split(`
`),n=``,r=``,i=[];for(;e.length>0;){let t=!1,a=[],o;for(o=0;o<e.length;o++)if(this.rules.other.blockquoteStart.test(e[o]))a.push(e[o]),t=!0;else if(!t)a.push(e[o]);else break;e=e.slice(o);let s=a.join(`
`),c=s.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,``);n=n?`${n}
${s}`:s,r=r?`${r}
${c}`:c;let l=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=l,e.length===0)break;let u=i.at(-1);if(u?.type===`code`)break;if(u?.type===`blockquote`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.blockquote(a);i[i.length-1]=o,n=n.substring(0,n.length-t.raw.length)+o.raw,r=r.substring(0,r.length-t.text.length)+o.text;break}else if(u?.type===`list`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.list(a);i[i.length-1]=o,n=n.substring(0,n.length-u.raw.length)+o.raw,r=r.substring(0,r.length-t.raw.length)+o.raw,e=a.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:`blockquote`,raw:n,tokens:i,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,i={type:`list`,raw:``,ordered:r,start:r?+n.slice(0,-1):``,loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:`[*+-]`);let a=this.rules.other.listItemRegex(n),o=!1;for(;e;){let n=!1,r=``,s=``;if(!(t=a.exec(e))||this.rules.block.hr.test(e))break;r=t[0],e=e.substring(r.length);let c=Pt(t[2].split(`
`,1)[0],t[1].length),l=e.split(`
`,1)[0],u=!c.trim(),d=0;if(this.options.pedantic?(d=2,s=c.trimStart()):u?d=t[1].length+1:(d=c.search(this.rules.other.nonSpaceChar),d=d>4?1:d,s=c.slice(d),d+=t[1].length),u&&this.rules.other.blankLine.test(l)&&(r+=l+`
`,e=e.substring(l.length+1),n=!0),!n){let t=this.rules.other.nextBulletRegex(d),n=this.rules.other.hrRegex(d),i=this.rules.other.fencesBeginRegex(d),a=this.rules.other.headingBeginRegex(d),o=this.rules.other.htmlBeginRegex(d),f=this.rules.other.blockquoteBeginRegex(d);for(;e;){let p=e.split(`
`,1)[0],m;if(l=p,this.options.pedantic?(l=l.replace(this.rules.other.listReplaceNesting,`  `),m=l):m=l.replace(this.rules.other.tabCharGlobal,`    `),i.test(l)||a.test(l)||o.test(l)||f.test(l)||t.test(l)||n.test(l))break;if(m.search(this.rules.other.nonSpaceChar)>=d||!l.trim())s+=`
`+m.slice(d);else{if(u||c.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||i.test(c)||a.test(c)||n.test(c))break;s+=`
`+l}u=!l.trim(),r+=p+`
`,e=e.substring(p.length+1),c=m.slice(d)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(r)&&(o=!0)),i.items.push({type:`list_item`,raw:r,task:!!this.options.gfm&&this.rules.other.listIsTask.test(s),loose:!1,text:s,tokens:[]}),i.raw+=r}let s=i.items.at(-1);if(s)s.raw=s.raw.trimEnd(),s.text=s.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let e of i.items){if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),e.task){if(e.text=e.text.replace(this.rules.other.listReplaceTask,``),e.tokens[0]?.type===`text`||e.tokens[0]?.type===`paragraph`){e.tokens[0].raw=e.tokens[0].raw.replace(this.rules.other.listReplaceTask,``),e.tokens[0].text=e.tokens[0].text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}}let t=this.rules.other.listTaskCheckbox.exec(e.raw);if(t){let n={type:`checkbox`,raw:t[0]+` `,checked:t[0]!==`[ ]`};e.checked=n.checked,i.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=n.raw+e.tokens[0].raw,e.tokens[0].text=n.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(n)):e.tokens.unshift({type:`paragraph`,raw:n.raw,text:n.raw,tokens:[n]}):e.tokens.unshift(n)}}if(!i.loose){let t=e.tokens.filter(e=>e.type===`space`);i.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}}if(i.loose)for(let e of i.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return i}}html(e){let t=this.rules.block.html.exec(e);if(t){let e=Mt(t[0]);return{type:`html`,block:!0,raw:e,pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:e}}}def(e){let t=this.rules.block.def.exec(e);if(t){let e=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal,` `),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:K(t[0],`
`),href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=jt(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:K(t[0],`
`),header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(jt(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:K(t[0],`
`),depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let e=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(e)){if(!this.rules.other.endAngleBracket.test(e))return;let t=K(e.slice(0,-1),`\\`);if((e.length-t.length)%2==0)return}else{let e=Nt(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let n=t[2],r=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(n);e&&(n=e[1],r=e[3])}else r=t[3]?t[3].slice(1,-1):``;return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(n=this.options.pedantic&&!this.rules.other.endAngleBracket.test(e)?n.slice(1):n.slice(1,-1)),Ft(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,`$1`),title:r&&r.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let e=t[(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal,` `).toLowerCase()];if(!e){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return Ft(n,e,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=0,c=r[0][0]===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*e.length+n);(r=c.exec(t))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i)continue;if(a=[...i].length,r[3]||r[4]){o+=a;continue}else if((r[5]||r[6])&&n%3&&!((n+a)%3)){s+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+s);let t=[...r[0]][0].length,c=e.slice(0,n+r.index+t+a);if(Math.min(n,a)%2){let e=c.slice(1,-1);return{type:`em`,raw:c,text:e,tokens:this.lexer.inlineTokens(e)}}let l=c.slice(2,-2);return{type:`strong`,raw:c,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim;for(s.lastIndex=0,t=t.slice(-1*e.length+n);(r=s.exec(t))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:t[0],escaped:e}}}},J=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||P,this.options.tokenizer=this.options.tokenizer||new q,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:L,block:U.normal,inline:W.normal};this.options.pedantic?(t.block=U.pedantic,t.inline=W.pedantic):this.options.gfm&&(t.block=U.gfm,this.options.breaks?t.inline=W.breaks:t.inline=W.gfm),this.tokenizer.rules=t}static get rules(){return{block:U,inline:W}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(L.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(L.tabCharGlobal,`    `).replace(L.spaceLine,``));let r=1/0;for(;e;){if(e.length<r)r=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(n=>(i=n.call({lexer:this},e,t))?(e=e.substring(i.raw.length),t.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let n=t.at(-1);i.raw.length===1&&n!==void 0?n.raw+=`
`:t.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+i.raw,n.text+=`
`+i.text,this.inlineQueue.at(-1).src=n.text):t.push(i);continue}if(i=this.tokenizer.fences(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.heading(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.hr(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.blockquote(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.list(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.html(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+i.raw,n.text+=`
`+i.raw,this.inlineQueue.at(-1).src=n.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},t.push(i));continue}if(i=this.tokenizer.table(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.lheading(e)){e=e.substring(i.raw.length),t.push(i);continue}let a=e;if(this.options.extensions?.startBlock){let t=1/0,n=e.slice(1),r;this.options.extensions.startBlock.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(a=e.substring(0,t+1))}if(this.state.top&&(i=this.tokenizer.paragraph(a))){let r=t.at(-1);n&&r?.type===`paragraph`?(r.raw+=(r.raw.endsWith(`
`)?``:`
`)+i.raw,r.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=r.text):t.push(i),n=a.length!==e.length,e=e.substring(i.raw.length);continue}if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let n=t.at(-1);n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+i.raw,n.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(i);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=e,r=null;if(this.tokens.links){let e=Object.keys(this.tokens.links);if(e.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!==null;)e.includes(r[0].slice(r[0].lastIndexOf(`[`)+1,-1))&&(n=n.slice(0,r.index)+`[`+`a`.repeat(r[0].length-2)+`]`+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!==null;)n=n.slice(0,r.index)+`++`+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let i;for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!==null;)i=r[2]?r[2].length:0,n=n.slice(0,r.index+i)+`[`+`a`.repeat(r[0].length-i-2)+`]`+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);n=this.options.hooks?.emStrongMask?.call({lexer:this},n)??n;let a=!1,o=``,s=1/0;for(;e;){if(e.length<s)s=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}a||(o=``),a=!1;let r;if(this.options.extensions?.inline?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.escape(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.tag(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.link(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(r.raw.length);let n=t.at(-1);r.type===`text`&&n?.type===`text`?(n.raw+=r.raw,n.text+=r.text):t.push(r);continue}if(r=this.tokenizer.emStrong(e,n,o)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.codespan(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.br(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.del(e,n,o)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.autolink(e)){e=e.substring(r.raw.length),t.push(r);continue}if(!this.state.inLink&&(r=this.tokenizer.url(e))){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(r=this.tokenizer.inlineText(i)){e=e.substring(r.raw.length),r.raw.slice(-1)!==`_`&&(o=r.raw.slice(-1)),a=!0;let n=t.at(-1);n?.type===`text`?(n.raw+=r.raw,n.text+=r.text):t.push(r);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},Y=class{options;parser;constructor(e){this.options=e||P}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(L.notSpaceStart)?.[0],i=e.replace(L.endingNewline,``)+`
`;return r?`<pre><code class="language-`+G(r)+`">`+(n?i:G(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:G(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return``}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r=``;for(let t=0;t<e.items.length;t++){let n=e.items[t];r+=this.listitem(n)}let i=t?`ol`:`ul`,a=t&&n!==1?` start="`+n+`"`:``;return`<`+i+a+`>
`+r+`</`+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return`<input `+(e?`checked="" `:``)+`disabled="" type="checkbox"> `}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t=``,n=``;for(let t=0;t<e.header.length;t++)n+=this.tablecell(e.header[t]);t+=this.tablerow({text:n});let r=``;for(let t=0;t<e.rows.length;t++){let i=e.rows[t];n=``;for(let e=0;e<i.length;e++)n+=this.tablecell(i[e]);r+=this.tablerow({text:n})}return r&&=`<tbody>${r}</tbody>`,`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?`th`:`td`;return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${G(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let r=this.parser.parseInline(n),i=At(e);if(i===null)return r;e=i;let a=`<a href="`+e+`"`;return t&&(a+=` title="`+G(t)+`"`),a+=`>`+r+`</a>`,a}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=At(e);if(i===null)return G(n);e=i;let a=`<img src="${e}" alt="${G(n)}"`;return t&&(a+=` title="${G(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:G(e.text)}},Lt=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return``+e}image({text:e}){return``+e}br(){return``}checkbox({raw:e}){return e}},X=class e{options;renderer;textRenderer;constructor(e){this.options=e||P,this.options.renderer=this.options.renderer||new Y,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Lt}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n||``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},Z=class{options;block;constructor(e){this.options=e||P}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?J.lex:J.lexInline}provideParser(e=this.block){return e?X.parse:X.parseInline}},Q=new class{defaults=De();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=X;Renderer=Y;TextRenderer=Lt;Lexer=J;Tokenizer=q;Hooks=Z;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)n=n.concat(this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)n=n.concat(this.walkTokens(e.tokens,t));break}case`list`:{let e=r;n=n.concat(this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);n=n.concat(this.walkTokens(i,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new Y(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new q(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new Z;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];Z.passThroughHooks.has(n)?t[r]=e=>{if(this.defaults.async&&Z.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:t[r]=(...e)=>{if(this.defaults.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return J.lex(e,t??this.defaults)}parser(e,t){return X.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?J.lex:J.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?X.parse:X.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?J.lex:J.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?X.parse:X.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+G(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function $(e,t){return Q.parse(e,t)}$.options=$.setOptions=function(e){return Q.setOptions(e),$.defaults=Q.defaults,Oe($.defaults),$},$.getDefaults=De,$.defaults=P,$.use=function(...e){return Q.use(...e),$.defaults=Q.defaults,Oe($.defaults),$},$.walkTokens=function(e,t){return Q.walkTokens(e,t)},$.parseInline=Q.parseInline,$.Parser=X,$.parser=X.parse,$.Renderer=Y,$.TextRenderer=Lt,$.Lexer=J,$.lexer=J.lex,$.Tokenizer=q,$.Hooks=Z,$.parse=$,$.options,$.setOptions,$.use,$.walkTokens,$.parseInline,X.parse,J.lex;function Rt(e){let t=e.trim();return t?t.split(/\s+/).length:0}function zt(e){return e.length===0?0:e.split(/\r?\n/).length}function Bt(e){return e<=0?`Empty draft`:`${Math.max(1,Math.round(e/220))} min read`}function Vt(e){let t=e.split(`.`).pop()?.trim().toLowerCase();return t===`md`||t===`markdown`?`Markdown Preview`:t?`${t.toUpperCase()} Preview`:`Preview`}function Ht(e,t){let n=e.trim(),r=t?.trim();if(!n)return``;if(r&&n===r)return`.`;if(r&&n.startsWith(`${r}/`))return n.slice(r.length+1)||`.`;let i=n.split(/[\\/]+/);for(let e=i.length-1;e>=0;--e){let t=i[e];if(t)return t}return n}function Ut(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)||`preview`}function Wt(e,t){if(!(e instanceof HTMLElement))return;let n=t?`Collapse preview`:`Expand preview`;e.classList.toggle(`is-fullscreen`,t),e.setAttribute(`aria-pressed`,String(t)),e.setAttribute(`aria-label`,n),e.setAttribute(`title`,n)}function Gt(t,n,r){return e`
    <section class="card">
      <div class="card-title">Agent Context</div>
      <div class="card-sub">${n}</div>
      <div class="agents-overview-grid" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Workspace</div>
          <div>
            <button
              type="button"
              class="workspace-link mono"
              @click=${()=>r(`files`)}
              title="Open Files tab"
            >
              ${t.workspace}
            </button>
          </div>
        </div>
        <div class="agent-kv">
          <div class="label">Primary Model</div>
          <div class="mono">${t.model}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Name</div>
          <div>${t.identityName}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Avatar</div>
          <div>${t.identityAvatar}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Skills Filter</div>
          <div>${t.skillsLabel}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Default</div>
          <div>${t.isDefault?`yes`:`no`}</div>
        </div>
      </div>
    </section>
  `}function Kt(e,t){let n=e.channelMeta?.find(e=>e.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function qt(e){if(!e)return[];let t=new Set;for(let n of e.channelOrder??[])t.add(n);for(let n of e.channelMeta??[])t.add(n.id);for(let n of Object.keys(e.channelAccounts??{}))t.add(n);let n=[],r=e.channelOrder?.length?e.channelOrder:Array.from(t);for(let e of r)t.has(e)&&(n.push(e),t.delete(e));for(let e of t)n.push(e);return n.map(t=>({id:t,label:Kt(e,t),accounts:e.channelAccounts?.[t]??[]}))}var Jt=[`groupPolicy`,`streamMode`,`dmPolicy`];function Yt(e){let t=0,n=0,r=0;for(let i of e){let e=i.probe&&typeof i.probe==`object`&&`ok`in i.probe?!!i.probe.ok:!1;(i.connected===!0||i.running===!0||e)&&(t+=1),i.configured&&(n+=1),i.enabled&&(r+=1)}return{total:e.length,connected:t,configured:n,enabled:r}}function Xt(t){let i=qt(t.snapshot),a=t.lastSuccess?T(t.lastSuccess):`never`;return e`
    <section class="grid grid-cols-2">
      ${Gt(t.context,`Workspace, identity, and model configuration.`,t.onSelectPanel)}
      <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Channels</div>
            <div class="card-sub">Gateway-wide channel status snapshot.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${t.loading} @click=${t.onRefresh}>
            ${t.loading?n(`common.refreshing`):n(`common.refresh`)}
          </button>
        </div>
        <div class="muted" style="margin-top: 8px;">Last refresh: ${a}</div>
        ${t.error?e`<div class="callout danger" style="margin-top: 12px;">${t.error}</div>`:r}
        ${t.snapshot?r:e`
              <div class="callout info" style="margin-top: 12px">
                Load channels to see live status.
              </div>
            `}
        ${i.length===0?e` <div class="muted" style="margin-top: 16px">No channels found.</div> `:e`
              <div class="list" style="margin-top: 16px;">
                ${i.map(n=>{let i=Yt(n.accounts),a=i.total?`${i.connected}/${i.total} connected`:`no accounts`,o=i.configured?`${i.configured} configured`:`not configured`,s=i.total?`${i.enabled} enabled`:`disabled`,c=E({configForm:t.configForm,channelId:n.id,fields:Jt});return e`
                    <div class="list-item">
                      <div class="list-main">
                        <div class="list-title">${n.label}</div>
                        <div class="list-sub mono">${n.id}</div>
                      </div>
                      <div class="list-meta">
                        <div>${a}</div>
                        <div>${o}</div>
                        <div>${s}</div>
                        ${i.configured===0?e`
                              <div>
                                <a
                                  href="https://docs.openclaw.ai/channels"
                                  target="_blank"
                                  rel="noopener"
                                  style="color: var(--accent); font-size: 12px"
                                  >Setup guide</a
                                >
                              </div>
                            `:r}
                        ${c.length>0?c.map(t=>e`<div>${t.label}: ${t.value}</div>`):r}
                      </div>
                    </div>
                  `})}
              </div>
            `}
      </section>
    </section>
  `}function Zt(t){let i=t.jobs.filter(e=>e.agentId===t.agentId);return e`
    <section class="grid grid-cols-2">
      ${Gt(t.context,`Workspace and scheduling targets.`,t.onSelectPanel)}
      <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Scheduler</div>
            <div class="card-sub">Gateway cron status.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${t.loading} @click=${t.onRefresh}>
            ${t.loading?n(`common.refreshing`):n(`common.refresh`)}
          </button>
        </div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">${n(`common.enabled`)}</div>
            <div class="stat-value">
              ${t.status?t.status.enabled?n(`common.yes`):n(`common.no`):n(`common.na`)}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">Jobs</div>
            <div class="stat-value">${t.status?.jobs??n(`common.na`)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Next wake</div>
            <div class="stat-value">${m(t.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        ${t.error?e`<div class="callout danger" style="margin-top: 12px;">${t.error}</div>`:r}
      </section>
    </section>
    <section class="card">
      <div class="card-title">Agent Cron Jobs</div>
      <div class="card-sub">Scheduled jobs targeting this agent.</div>
      ${i.length===0?e` <div class="muted" style="margin-top: 16px">No jobs assigned.</div> `:e`
            <div class="list" style="margin-top: 16px;">
              ${i.map(n=>e`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${n.name}</div>
                      ${n.description?e`<div class="list-sub">${n.description}</div>`:r}
                      <div class="chip-row" style="margin-top: 6px;">
                        <span class="chip">${y(n)}</span>
                        <span class="chip ${n.enabled?`chip-ok`:`chip-warn`}">
                          ${n.enabled?`enabled`:`disabled`}
                        </span>
                        <span class="chip">${n.sessionTarget}</span>
                      </div>
                    </div>
                    <div class="list-meta">
                      <div class="mono">${b(n)}</div>
                      <div class="muted">${x(n)}</div>
                      <button
                        class="btn btn--sm"
                        style="margin-top: 6px;"
                        ?disabled=${!n.enabled}
                        @click=${()=>t.onRunNow(n.id)}
                      >
                        Run Now
                      </button>
                    </div>
                  </div>
                `)}
            </div>
          `}
    </section>
  `}function Qt(t){let i=t.agentFilesList?.agentId===t.agentId?t.agentFilesList:null,a=i?.files??[],o=t.agentFileActive??null,s=o?a.find(e=>e.name===o)??null:null,c=o?t.agentFileContents[o]??``:``,l=o?t.agentFileDrafts[o]??c:``,u=o?l!==c:!1,d=s?Te($.parse(l,{gfm:!0,breaks:!0}),{sanitize:e=>ee.sanitize(e)}):``,f=w(new TextEncoder().encode(l).length),p=Rt(l),m=zt(l),h=s?Ht(s.path,i?.workspace):``,g=s?`agent-file-preview-title-${Ut(s.name)}`:``,_=s?.missing?`Will Create on Save`:u?`Live Draft Preview`:`Saved Preview`,te=s?.missing?`is-missing`:u?`is-dirty`:`is-synced`,y=s?.updatedAtMs?`Updated ${T(s.updatedAtMs)}`:s?.missing?`Not Created Yet`:`Updated Unknown`;return e`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Core Files</div>
          <div class="card-sub">Bootstrap persona, identity, and tool guidance.</div>
        </div>
        <button
          class="btn btn--sm"
          ?disabled=${t.agentFilesLoading}
          @click=${()=>t.onLoadFiles(t.agentId)}
        >
          ${t.agentFilesLoading?n(`common.loading`):n(`common.refresh`)}
        </button>
      </div>
      ${i?e`<div class="muted mono" style="margin-top: 8px;">
            Workspace: <span>${i.workspace}</span>
          </div>`:r}
      ${t.agentFilesError?e`<div class="callout danger" style="margin-top: 12px;">
            ${t.agentFilesError}
          </div>`:r}
      ${i?a.length===0?e` <div class="muted" style="margin-top: 16px">No files found.</div> `:e`
              <div class="agent-tabs" style="margin-top: 14px;">
                ${a.map(n=>{let i=o===n.name,a=n.name.replace(/\.md$/i,``);return e`
                    <button
                      class="agent-tab ${i?`active`:``} ${n.missing?`agent-tab--missing`:``}"
                      @click=${()=>t.onSelectFile(n.name)}
                    >
                      ${a}${n.missing?e` <span class="agent-tab-badge">missing</span> `:r}
                    </button>
                  `})}
              </div>
              ${s?e`
                    <div class="agent-file-header" style="margin-top: 14px;">
                      <div>
                        <div class="agent-file-sub mono">${s.path}</div>
                      </div>
                      <div class="agent-file-actions">
                        <button
                          class="btn btn--sm"
                          title="Preview rendered markdown"
                          @click=${e=>{let t=e.currentTarget.closest(`.card`)?.querySelector(`dialog`);t&&t.showModal()}}
                        >
                          ${v.eye} Preview
                        </button>
                        <button
                          class="btn btn--sm"
                          ?disabled=${!u}
                          @click=${()=>t.onFileReset(s.name)}
                        >
                          Reset
                        </button>
                        <button
                          class="btn btn--sm primary"
                          ?disabled=${t.agentFileSaving||!u}
                          @click=${()=>t.onFileSave(s.name)}
                        >
                          ${t.agentFileSaving?`Saving…`:`Save`}
                        </button>
                      </div>
                    </div>
                    ${s.missing?e`
                          <div class="callout info" style="margin-top: 10px">
                            This file is missing. Saving will create it in the agent workspace.
                          </div>
                        `:r}
                    <label class="field agent-file-field" style="margin-top: 12px;">
                      <span>Content</span>
                      <textarea
                        class="agent-file-textarea"
                        .value=${l}
                        @input=${e=>t.onFileDraftChange(s.name,e.target.value)}
                      ></textarea>
                    </label>
                    <dialog
                      class="md-preview-dialog"
                      aria-labelledby=${g}
                      @click=${e=>{let t=e.currentTarget;e.target===t&&t.close()}}
                      @close=${e=>{let t=e.currentTarget;t.querySelector(`.md-preview-dialog__panel`)?.classList.remove(`fullscreen`),Wt(t.querySelector(`.md-preview-expand-btn`),!1)}}
                    >
                      <div class="md-preview-dialog__panel">
                        <div class="md-preview-dialog__header">
                          <div class="md-preview-dialog__header-main">
                            <div class="md-preview-dialog__eyebrow">
                              ${v.scrollText}
                              <span>${Vt(s.name)}</span>
                            </div>
                            <div class="md-preview-dialog__title-wrap">
                              <div
                                id=${g}
                                class="md-preview-dialog__title"
                                translate="no"
                              >
                                ${s.name}
                              </div>
                              <div class="md-preview-dialog__path mono" translate="no">
                                ${h}
                              </div>
                            </div>
                          </div>
                          <div class="md-preview-dialog__actions">
                            <button
                              type="button"
                              class="btn btn--sm md-preview-icon-btn md-preview-expand-btn"
                              title="Expand preview"
                              aria-label="Expand preview"
                              aria-pressed="false"
                              @click=${e=>{let t=e.currentTarget,n=t.closest(`.md-preview-dialog__panel`);n&&Wt(t,n.classList.toggle(`fullscreen`))}}
                            >
                              <span class="when-normal" aria-hidden="true">${v.maximize}</span
                              ><span class="when-fullscreen" aria-hidden="true"
                                >${v.minimize}</span
                              >
                            </button>
                            <button
                              type="button"
                              class="btn btn--sm md-preview-icon-btn"
                              title="Edit file"
                              aria-label="Edit file"
                              @click=${e=>{e.currentTarget.closest(`dialog`)?.close(),document.querySelector(`.agent-file-textarea`)?.focus()}}
                            >
                              <span aria-hidden="true">${v.edit}</span>
                            </button>
                            <button
                              type="button"
                              class="btn btn--sm md-preview-icon-btn"
                              title="Close preview"
                              aria-label="Close preview"
                              @click=${e=>{e.currentTarget.closest(`dialog`)?.close()}}
                            >
                              <span aria-hidden="true">${v.x}</span>
                            </button>
                          </div>
                        </div>
                        <div class="md-preview-dialog__meta">
                          <div class="md-preview-dialog__chip ${te}">
                            <strong>${_}</strong>
                          </div>
                          <div class="md-preview-dialog__chip">
                            <strong>${Bt(p)}</strong>
                            <span>${p} words</span>
                          </div>
                          <div class="md-preview-dialog__chip">
                            <strong>${m}</strong>
                            <span>lines</span>
                          </div>
                          <div class="md-preview-dialog__chip">
                            <strong>${f}</strong>
                            <span>${y}</span>
                          </div>
                        </div>
                        <div class="md-preview-dialog__body">
                          <article class="md-preview-dialog__reader sidebar-markdown">
                            ${ne(d)}
                          </article>
                        </div>
                      </div>
                    </dialog>
                  `:e` <div class="muted" style="margin-top: 16px">Select a file to edit.</div> `}
            `:e`
            <div class="callout info" style="margin-top: 12px">
              Load the agent workspace files to edit core instructions.
            </div>
          `}
    </section>
  `}function $t(t){return t.length===0?r:e`
    <div class="agent-tool-badges">
      ${t.map(t=>e`<span class="agent-pill">${t}</span>`)}
    </div>
  `}function en(e,t){let n=t.source??e.source,r=t.pluginId??e.pluginId,i=[];return n===`plugin`&&r?i.push(`Plugin: ${r}`):n===`core`&&i.push(`Built-In`),t.optional&&i.push(`Optional`),i}function tn(e){let t=en(e.section,e.tool);return e.activeEntry&&t.unshift(`Live Now`),t}function nn(e){return e.denied?`Disabled by agent override.`:e.allowed&&e.baseAllowed?`Enabled by the current profile.`:e.allowed?`Enabled by agent override.`:`Not included in the current profile.`}function rn(e,t){let n=t.source??e.source,r=t.pluginId??e.pluginId;return n===`plugin`&&r?`Plugin: ${r}`:`Built-In`}function an(e){return e.denied?`Override Off`:e.allowed&&e.baseAllowed?`Enabled`:e.allowed?`Override On`:`Profile Off`}function on(e){return e.activeEntry?`Live Now`:e.runtimeSessionMatchesSelectedAgent?`Not Live`:`Other Agent`}function sn(e){return`agent-tool-${l(e).replace(/[^a-z0-9_-]+/g,`-`)}`}function cn(e,t,n=`${t}s`){return`${e} ${e===1?t:n}`}function ln(e){return(e??[]).flatMap(e=>e.tools)}var un=12;function dn(e){let t=e.currentTarget;if(!(!(t instanceof HTMLDetailsElement)||t.open))for(let e of t.querySelectorAll(`.agent-tool-card[open]`))e.open=!1}function fn(e,t){let n=document.getElementById(t);if(!(n instanceof HTMLDetailsElement))return;e.preventDefault();let r=n.closest(`.agent-tools-group`);r&&(r.open=!0),n.open=!0;let i=new URL(window.location.href);i.hash=t,window.history.replaceState(null,``,i),requestAnimationFrame(()=>{let e=typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;n.scrollIntoView?.({block:`center`,behavior:e?`auto`:`smooth`}),n.querySelector(`summary`)?.focus()})}function pn(e){return e.source===`plugin`?e.pluginId?n(`agentTools.connectedSource`,{id:e.pluginId}):n(`agentTools.connected`):e.source===`channel`?e.channelId?n(`agentTools.channelSource`,{id:e.channelId}):n(`agentTools.channel`):n(`agentTools.builtIn`)}function mn(t){let i=f(t.configForm,t.agentId),o=i.entry?.tools??{},s=i.globalTools??{},c=o.profile??s.profile??`full`,u=a(t.toolsCatalogResult),d=_(t.toolsCatalogResult),p=o.profile?`agent override`:s.profile?`global default`:`default`,m=Array.isArray(o.allow)&&o.allow.length>0,ee=Array.isArray(s.allow)&&s.allow.length>0,g=!!t.configForm&&!t.configLoading&&!t.configSaving&&!m&&!(t.toolsCatalogLoading&&!t.toolsCatalogResult&&!t.toolsCatalogError),v=m?[]:Array.isArray(o.alsoAllow)?o.alsoAllow:[],y=m?[]:Array.isArray(o.deny)?o.deny:[],ne=m?{allow:o.allow??[],deny:o.deny??[]}:te(c)??void 0,b=d.flatMap(e=>e.tools.map(e=>e.id)),x=e=>{let t=h(e,ne),n=C(e,v),r=C(e,y);return{allowed:(t||n)&&!r,baseAllowed:t,denied:r}},re=b.filter(e=>x(e).allowed).length,S=t.runtimeSessionMatchesSelectedAgent&&!t.toolsEffectiveError?ln(t.toolsEffectiveResult?.groups):[],w=Array.from(new Map(S.map(e=>[l(e.id),e])).values()),T=w.slice(0,un),E=Math.max(0,w.length-T.length),D=w.length,O=new Map(S.map(e=>[l(e.id),e])),k=new Set(O.keys()),A=e=>e.toSorted((e,t)=>{let n=l(e.id),r=l(t.id),i=+!!k.has(n),a=+!!k.has(r);if(i!==a)return a-i;let o=+!!x(e.id).allowed,s=+!!x(t.id).allowed;return o===s?e.label.localeCompare(t.label):s-o}),ie=(e,n)=>{let r=new Set(v.map(e=>l(e)).filter(e=>e.length>0)),i=new Set(y.map(e=>l(e)).filter(e=>e.length>0)),a=x(e).baseAllowed,o=l(e);n?(i.delete(o),a||r.add(o)):(r.delete(o),i.add(o)),t.onOverridesChange(t.agentId,[...r],[...i])},ae=e=>{let n=new Set(v.map(e=>l(e)).filter(e=>e.length>0)),r=new Set(y.map(e=>l(e)).filter(e=>e.length>0));for(let t of b){let i=x(t).baseAllowed,a=l(t);e?(r.delete(a),i||n.add(a)):(n.delete(a),r.add(a))}t.onOverridesChange(t.agentId,[...n],[...r])};return e`
    <section class="card">
      <div class="agent-tools-header">
        <div class="agent-tools-header__intro">
          <div class="card-title">Tool Access</div>
          <div class="card-sub">
            Profile + per-tool overrides for this agent.
            <span class="mono">${re}/${b.length}</span> enabled.
          </div>
        </div>
        <div class="agent-tools-header__actions">
          <button class="btn btn--sm" ?disabled=${!g} @click=${()=>ae(!0)}>
            Enable All
          </button>
          <button class="btn btn--sm" ?disabled=${!g} @click=${()=>ae(!1)}>
            Disable All
          </button>
          <button
            class="btn btn--sm"
            ?disabled=${t.configLoading}
            @click=${t.onConfigReload}
          >
            ${n(`common.reloadConfig`)}
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${t.configSaving||!t.configDirty}
            @click=${t.onConfigSave}
          >
            ${t.configSaving?`Saving…`:`Save`}
          </button>
        </div>
      </div>

      ${t.configForm?r:e`
            <div class="callout info" style="margin-top: 12px">
              Load the gateway config to adjust tool profiles.
            </div>
          `}
      ${m?e`
            <div class="callout info" style="margin-top: 12px">
              This agent is using an explicit allowlist in config. Tool overrides are managed in the
              Config tab.
            </div>
          `:r}
      ${ee?e`
            <div class="callout info" style="margin-top: 12px">
              Global tools.allow is set. Agent overrides cannot enable tools that are globally
              blocked.
            </div>
          `:r}
      ${t.toolsCatalogLoading&&!t.toolsCatalogResult&&!t.toolsCatalogError?e`
            <div class="callout info" style="margin-top: 12px">Loading runtime tool catalog…</div>
          `:r}
      ${t.toolsCatalogError?e`
            <div class="callout info" style="margin-top: 12px">
              Could not load runtime tool catalog. Showing built-in fallback list instead.
            </div>
          `:r}

      <div class="agent-tools-overview">
        <div class="agent-tools-overview__primary">
          <div class="agent-tools-pane">
            <div class="label">Available Right Now</div>
            <div class="card-sub">
              What this agent can use in the current chat session.
              <span class="mono">${t.runtimeSessionKey||`no session`}</span>
            </div>
            ${t.runtimeSessionMatchesSelectedAgent?t.toolsEffectiveLoading&&!t.toolsEffectiveResult&&!t.toolsEffectiveError?e`
                    <div class="callout info" style="margin-top: 12px">
                      Loading available tools…
                    </div>
                  `:t.toolsEffectiveError?e`
                      <div class="callout info" style="margin-top: 12px">
                        Could not load available tools for this session.
                      </div>
                    `:(t.toolsEffectiveResult?.groups?.length??0)===0?e`
                        <div class="callout info" style="margin-top: 12px">
                          No tools are available for this session right now.
                        </div>
                      `:e`
                        <div class="agent-tools-runtime">
                          ${T.map(t=>{let n=sn(t.id);return e`
                              <a
                                class="agent-tools-runtime-chip"
                                href="#${n}"
                                @click=${e=>fn(e,n)}
                              >
                                <span class="mono" translate="no">${t.label}</span>
                                <span class="agent-tools-runtime-chip__meta"
                                  >${pn(t)}</span
                                >
                              </a>
                            `})}
                          ${E>0?e`
                                <span
                                  class="agent-tools-runtime-chip agent-tools-runtime-chip--more"
                                  title=${`${E} more live tools are available in the groups below.`}
                                >
                                  +${E} more live tools
                                </span>
                              `:r}
                        </div>
                      `:e`
                  <div class="callout info" style="margin-top: 12px">
                    Switch chat to this agent to view its live runtime tools.
                  </div>
                `}
          </div>

          <div class="agent-tools-pane">
            <div class="label">Quick Presets</div>
            <div class="agent-tools-buttons">
              ${u.map(n=>e`
                  <button
                    class="btn btn--sm ${c===n.id?`active`:``}"
                    ?disabled=${!g}
                    @click=${()=>t.onProfileChange(t.agentId,n.id,!0)}
                  >
                    ${n.label}
                  </button>
                `)}
              <button
                class="btn btn--sm"
                ?disabled=${!g}
                @click=${()=>t.onProfileChange(t.agentId,null,!1)}
              >
                Inherit
              </button>
            </div>
          </div>
        </div>

        <div class="agent-tools-facts">
          <div class="agent-tools-fact">
            <div class="label">Profile</div>
            <div class="mono">${c}</div>
          </div>
          <div class="agent-tools-fact">
            <div class="label">Source</div>
            <div>${p}</div>
          </div>
          <div class="agent-tools-fact">
            <div class="label">Enabled</div>
            <div class="mono">${re}/${b.length}</div>
          </div>
          <div class="agent-tools-fact">
            <div class="label">Live</div>
            <div class="mono">${D}</div>
          </div>
          <div class="agent-tools-fact">
            <div class="label">Status</div>
            <div class="mono">
              ${t.configSaving?`saving…`:t.configDirty?`unsaved`:`saved`}
            </div>
          </div>
        </div>
      </div>

      <div class="agent-tools-grid">
        ${d.map(n=>{let i=A(n.tools),a=n.tools.filter(e=>x(e.id).allowed).length,o=n.tools.filter(e=>k.has(l(e.id))).length,s=i.slice(0,4),c=Math.max(0,i.length-s.length);return e`
            <details class="agent-tools-group" @toggle=${dn}>
              <summary class="agent-tools-group__summary">
                <span class="agent-tools-group__summary-main">
                  <span class="agent-tools-group__title">
                    ${n.label}
                    ${n.source===`plugin`&&n.pluginId?e`<span class="agent-pill">Plugin: ${n.pluginId}</span>`:r}
                  </span>
                  <span class="agent-tools-group__preview" aria-label="Tool preview">
                    ${s.map(t=>e`<span class="mono" translate="no" title=${t.label}
                          >${t.label}</span
                        >`)}
                    ${c>0?e`<span>+${c} more</span>`:r}
                  </span>
                </span>
                <span class="agent-tools-group__counts">
                  <span>${cn(n.tools.length,`Tool`)}</span>
                  <span>${cn(a,`Enabled Tool`)}</span>
                  ${o>0?e`<span>${cn(o,`Live Tool`)}</span>`:r}
                </span>
              </summary>
              <div class="agent-tools-list agent-tools-list--stacked">
                ${i.map(i=>{let a=sn(i.id),o=x(i.id),s=O.get(l(i.id))??null,c=i.defaultProfiles??[],u=tn({section:n,tool:i,activeEntry:s}),d=an(o),f=on({activeEntry:s,runtimeSessionMatchesSelectedAgent:t.runtimeSessionMatchesSelectedAgent});return e`
                    <details class="agent-tool-card" id=${a}>
                      <summary class="agent-tool-summary">
                        <div class="agent-tool-summary__main">
                          <div class="agent-tool-summary__title-row">
                            <span class="agent-tool-title mono" translate="no">${i.label}</span>
                          </div>
                          <div class="agent-tool-sub">${i.description}</div>
                        </div>
                        <dl class="agent-tool-summary__facts">
                          <div class="agent-tool-summary__fact">
                            <dt class="label">Access</dt>
                            <dd>${d}</dd>
                          </div>
                          <div class="agent-tool-summary__fact">
                            <dt class="label">Session</dt>
                            <dd>${f}</dd>
                          </div>
                        </dl>
                        <div class="agent-tool-summary__badges">
                          ${$t(u)}
                        </div>
                        <label
                          class="cfg-toggle agent-tool-toggle"
                          @click=${e=>e.stopPropagation()}
                          @keydown=${e=>e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            .checked=${o.allowed}
                            ?disabled=${!g}
                            aria-label=${`${o.allowed?`Disable`:`Enable`} ${i.label}`}
                            @change=${e=>ie(i.id,e.target.checked)}
                          />
                          <span class="cfg-toggle__track"></span>
                        </label>
                      </summary>
                      <div class="agent-tool-details">
                        <div class="agent-tool-details-strip">
                          <div class="agent-tool-detail agent-tool-detail--inline">
                            <div class="label">Access</div>
                            <div>${nn(o)}</div>
                          </div>
                          <div class="agent-tool-detail agent-tool-detail--inline">
                            <div class="label">Source</div>
                            <div>${rn(n,i)}</div>
                          </div>
                          ${c.length>0?e`
                                <div class="agent-tool-detail agent-tool-detail--inline">
                                  <div class="label">Default Presets</div>
                                  <div class="agent-tool-badges">
                                    ${c.map(t=>e`<span class="agent-pill">${t}</span>`)}
                                  </div>
                                </div>
                              `:r}
                          <div class="agent-tool-detail agent-tool-detail--inline">
                            <div class="label">Current Session</div>
                            <div>
                              ${s?`Available now via ${pn(s)}.`:t.runtimeSessionMatchesSelectedAgent?`Not available in this chat session right now.`:`Switch chat to this agent to inspect live availability.`}
                            </div>
                          </div>
                          <a class="agent-tool-jump" href="#${a}"> Link to This Tool </a>
                        </div>
                      </div>
                    </details>
                  `})}
              </div>
            </details>
          `})}
      </div>
    </section>
  `}function hn(t){let a=!!t.configForm&&!t.configLoading&&!t.configSaving,o=f(t.configForm,t.agentId),s=Array.isArray(o.entry?.skills)?o.entry?.skills:void 0,c=new Set((s??[]).map(e=>e.trim()).filter(Boolean)),l=s!==void 0,u=!!(t.report&&t.activeAgentId===t.agentId),d=u?t.report?.skills??[]:[],p=i(t.filter),m=p?d.filter(e=>i([e.name,e.description,e.source].join(` `)).includes(p)):d,h=D(m),ee=l?d.filter(e=>c.has(e.name)).length:d.length,g=d.length;return e`
    <section class="card">
      <div class="row" style="justify-content: space-between; flex-wrap: wrap;">
        <div style="min-width: 0;">
          <div class="card-title">Skills</div>
          <div class="card-sub">
            Per-agent skill allowlist and workspace skills.
            ${g>0?e`<span class="mono">${ee}/${g}</span>`:r}
          </div>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap;">
          <div
            class="row"
            style="gap: 4px; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 2px;"
          >
            <button
              class="btn btn--sm"
              ?disabled=${!a}
              @click=${()=>t.onClear(t.agentId)}
            >
              Enable All
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!a}
              @click=${()=>t.onDisableAll(t.agentId)}
            >
              Disable All
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!a||!l}
              @click=${()=>t.onClear(t.agentId)}
              title="Remove per-agent allowlist and use all skills"
            >
              Reset
            </button>
          </div>
          <button
            class="btn btn--sm"
            ?disabled=${t.configLoading}
            @click=${t.onConfigReload}
          >
            ${n(`common.reloadConfig`)}
          </button>
          <button class="btn btn--sm" ?disabled=${t.loading} @click=${t.onRefresh}>
            ${t.loading?n(`common.loading`):n(`common.refresh`)}
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${t.configSaving||!t.configDirty}
            @click=${t.onConfigSave}
          >
            ${t.configSaving?`Saving…`:`Save`}
          </button>
        </div>
      </div>

      ${t.configForm?r:e`
            <div class="callout info" style="margin-top: 12px">
              Load the gateway config to set per-agent skills.
            </div>
          `}
      ${l?e`
            <div class="callout info" style="margin-top: 12px">
              This agent uses a custom skill allowlist.
            </div>
          `:e`
            <div class="callout info" style="margin-top: 12px">
              All skills are enabled. Disabling any skill will create a per-agent allowlist.
            </div>
          `}
      ${!u&&!t.loading?e`
            <div class="callout info" style="margin-top: 12px">
              Load skills for this agent to view workspace-specific entries.
            </div>
          `:r}
      ${t.error?e`<div class="callout danger" style="margin-top: 12px;">${t.error}</div>`:r}

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="flex: 1;">
          <span>Filter</span>
          <input
            .value=${t.filter}
            @input=${e=>t.onFilterChange(e.target.value)}
            placeholder="Search skills"
            autocomplete="off"
            name="agent-skills-filter"
          />
        </label>
        <div class="muted">${m.length} shown</div>
      </div>

      ${m.length===0?e` <div class="muted" style="margin-top: 16px">No skills found.</div> `:e`
            <div class="agent-skills-groups" style="margin-top: 16px;">
              ${h.map(e=>gn(e,{agentId:t.agentId,allowSet:c,usingAllowlist:l,editable:a,onToggle:t.onToggle}))}
            </div>
          `}
    </section>
  `}function gn(t,n){return e`
    <details class="agent-skills-group" ?open=${!(t.id===`workspace`||t.id===`built-in`)}>
      <summary class="agent-skills-header">
        <span>${t.label}</span>
        <span class="muted">${t.skills.length}</span>
      </summary>
      <div class="list skills-grid">
        ${t.skills.map(e=>_n(e,{agentId:n.agentId,allowSet:n.allowSet,usingAllowlist:n.usingAllowlist,editable:n.editable,onToggle:n.onToggle}))}
      </div>
    </details>
  `}function _n(t,n){let i=n.usingAllowlist?n.allowSet.has(t.name):!0,a=A(t),o=O(t);return e`
    <div class="list-item agent-skill-row">
      <div class="list-main">
        <div class="list-title">${t.emoji?`${t.emoji} `:``}${t.name}</div>
        <div class="list-sub">${t.description}</div>
        ${k({skill:t})}
        ${a.length>0?e`<div class="muted" style="margin-top: 6px;">Missing: ${a.join(`, `)}</div>`:r}
        ${o.length>0?e`<div class="muted" style="margin-top: 6px;">Reason: ${o.join(`, `)}</div>`:r}
      </div>
      <div class="list-meta">
        <label class="cfg-toggle">
          <input
            type="checkbox"
            .checked=${i}
            ?disabled=${!n.editable}
            @change=${e=>n.onToggle(n.agentId,t.name,e.target.checked)}
          />
          <span class="cfg-toggle__track"></span>
        </label>
      </div>
    </div>
  `}function vn(t){let i=t.agentsList?.agents??[],a=t.agentsList?.defaultId??null,o=t.selectedAgentId??a??i[0]?.id??null,s=o?i.find(e=>e.id===o)??null:null,c=o&&t.agentSkills.agentId===o?t.agentSkills.report?.skills?.length??null:null,l=t.channels.snapshot?Object.keys(t.channels.snapshot.channelAccounts??{}).length:null,u=o?t.cron.jobs.filter(e=>e.agentId===o).length:null,f={files:t.agentFiles.list?.files?.length??null,skills:c,channels:l,cron:u||null};return e`
    <div class="agents-layout">
      <section class="agents-toolbar">
        <div class="agents-toolbar-row">
          <div class="agents-control-select">
            <select
              class="agents-select"
              .value=${o??``}
              ?disabled=${t.loading||i.length===0}
              @change=${e=>t.onSelectAgent(e.target.value)}
            >
              ${i.length===0?e` <option value="">No agents</option> `:i.map(t=>e`
                      <option value=${t.id} ?selected=${t.id===o}>
                        ${d(t)}${g(t.id,a)?` (${g(t.id,a)})`:``}
                      </option>
                    `)}
            </select>
          </div>
          <div class="agents-toolbar-actions">
            ${s?e`
                  <button
                    type="button"
                    class="btn btn--sm btn--ghost"
                    @click=${()=>void navigator.clipboard.writeText(s.id)}
                    title="Copy agent ID to clipboard"
                  >
                    Copy ID
                  </button>
                  <button
                    type="button"
                    class="btn btn--sm btn--ghost"
                    ?disabled=${!!(a&&s.id===a)}
                    @click=${()=>t.onSetDefault(s.id)}
                    title=${a&&s.id===a?`Already the default agent`:`Set as the default agent`}
                  >
                    ${a&&s.id===a?`Default`:`Set Default`}
                  </button>
                `:r}
            <button
              class="btn btn--sm agents-refresh-btn"
              ?disabled=${t.loading}
              @click=${t.onRefresh}
            >
              ${t.loading?n(`common.loading`):n(`common.refresh`)}
            </button>
          </div>
        </div>
        ${t.error?e`<div class="callout danger" style="margin-top: 8px;">${t.error}</div>`:r}
      </section>
      <section class="agents-main">
        ${s?e`
              ${yn(t.activePanel,e=>t.onSelectPanel(e),f)}
              ${t.activePanel===`overview`?ie({agent:s,basePath:t.basePath,defaultId:a,configForm:t.config.form,agentFilesList:t.agentFiles.list,agentIdentity:t.agentIdentityById[s.id]??null,agentIdentityError:t.agentIdentityError,agentIdentityLoading:t.agentIdentityLoading,configLoading:t.config.loading,configSaving:t.config.saving,configDirty:t.config.dirty,modelCatalog:t.modelCatalog,onConfigReload:t.onConfigReload,onConfigSave:t.onConfigSave,onModelChange:t.onModelChange,onModelFallbacksChange:t.onModelFallbacksChange,onSelectPanel:t.onSelectPanel}):r}
              ${t.activePanel===`files`?Qt({agentId:s.id,agentFilesList:t.agentFiles.list,agentFilesLoading:t.agentFiles.loading,agentFilesError:t.agentFiles.error,agentFileActive:t.agentFiles.active,agentFileContents:t.agentFiles.contents,agentFileDrafts:t.agentFiles.drafts,agentFileSaving:t.agentFiles.saving,onLoadFiles:t.onLoadFiles,onSelectFile:t.onSelectFile,onFileDraftChange:t.onFileDraftChange,onFileReset:t.onFileReset,onFileSave:t.onFileSave}):r}
              ${t.activePanel===`tools`?mn({agentId:s.id,configForm:t.config.form,configLoading:t.config.loading,configSaving:t.config.saving,configDirty:t.config.dirty,toolsCatalogLoading:t.toolsCatalog.loading,toolsCatalogError:t.toolsCatalog.error,toolsCatalogResult:t.toolsCatalog.result,toolsEffectiveLoading:t.toolsEffective.loading,toolsEffectiveError:t.toolsEffective.error,toolsEffectiveResult:t.toolsEffective.result,runtimeSessionKey:t.runtimeSessionKey,runtimeSessionMatchesSelectedAgent:t.runtimeSessionMatchesSelectedAgent,onProfileChange:t.onToolsProfileChange,onOverridesChange:t.onToolsOverridesChange,onConfigReload:t.onConfigReload,onConfigSave:t.onConfigSave}):r}
              ${t.activePanel===`skills`?hn({agentId:s.id,report:t.agentSkills.report,loading:t.agentSkills.loading,error:t.agentSkills.error,activeAgentId:t.agentSkills.agentId,configForm:t.config.form,configLoading:t.config.loading,configSaving:t.config.saving,configDirty:t.config.dirty,filter:t.agentSkills.filter,onFilterChange:t.onSkillsFilterChange,onRefresh:t.onSkillsRefresh,onToggle:t.onAgentSkillToggle,onClear:t.onAgentSkillsClear,onDisableAll:t.onAgentSkillsDisableAll,onConfigReload:t.onConfigReload,onConfigSave:t.onConfigSave}):r}
              ${t.activePanel===`channels`?Xt({context:p(s,t.config.form,t.agentFiles.list,a,t.agentIdentityById[s.id]??null),configForm:t.config.form,snapshot:t.channels.snapshot,loading:t.channels.loading,error:t.channels.error,lastSuccess:t.channels.lastSuccess,onRefresh:t.onChannelsRefresh,onSelectPanel:t.onSelectPanel}):r}
              ${t.activePanel===`cron`?Zt({context:p(s,t.config.form,t.agentFiles.list,a,t.agentIdentityById[s.id]??null),agentId:s.id,jobs:t.cron.jobs,status:t.cron.status,loading:t.cron.loading,error:t.cron.error,onRefresh:t.onCronRefresh,onRunNow:t.onCronRunNow,onSelectPanel:t.onSelectPanel}):r}
            `:e`
              <div class="card">
                <div class="card-title">Select an agent</div>
                <div class="card-sub">Pick an agent to inspect its workspace and tools.</div>
              </div>
            `}
      </section>
    </div>
  `}function yn(t,n,i){return e`
    <div class="agent-tabs">
      ${[{id:`overview`,label:`Overview`},{id:`files`,label:`Files`},{id:`tools`,label:`Tools`},{id:`skills`,label:`Skills`},{id:`channels`,label:`Channels`},{id:`cron`,label:`Cron Jobs`}].map(a=>e`
          <button
            class="agent-tab ${t===a.id?`active`:``}"
            type="button"
            @click=${()=>n(a.id)}
          >
            ${a.label}${i[a.id]==null?r:e`<span class="agent-tab-count">${i[a.id]}</span>`}
          </button>
        `)}
    </div>
  `}export{vn as renderAgents};
//# sourceMappingURL=agents-ty0_rRu3.js.map