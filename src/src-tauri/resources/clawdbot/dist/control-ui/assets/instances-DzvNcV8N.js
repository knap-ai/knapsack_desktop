import{h as e,o as t,p as n}from"./string-coerce-B9QFF8sN.js";import{o as r,p as i}from"./index-ckUmEo1l.js";var a=!1;function o(r){let o=!a;return e`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">${t(`instances.title`)}</div>
          <div class="card-sub">${t(`instances.subtitle`)}</div>
        </div>
        <div class="row" style="gap: 8px;">
          <button
            class="btn btn--icon ${o?``:`active`}"
            @click=${()=>{a=!a,r.onRefresh()}}
            title=${t(o?`instances.showHosts`:`instances.hideHosts`)}
            aria-label=${t(`instances.toggleHostVisibility`)}
            aria-pressed=${!o}
            style="width: 36px; height: 36px;"
          >
            ${o?i.eyeOff:i.eye}
          </button>
          <button class="btn" ?disabled=${r.loading} @click=${r.onRefresh}>
            ${r.loading?t(`common.loading`):t(`common.refresh`)}
          </button>
        </div>
      </div>
      ${r.lastError?e`<div class="callout danger" style="margin-top: 12px;">${r.lastError}</div>`:n}
      ${r.statusMessage?e`<div class="callout" style="margin-top: 12px;">${r.statusMessage}</div>`:n}
      <div class="list" style="margin-top: 16px;">
        ${r.entries.length===0?e` <div class="muted">${t(`instances.noInstances`)}</div> `:r.entries.map(e=>s(e,o))}
      </div>
    </section>
  `}function s(i,a){let o=i.lastInputSeconds==null?t(`common.na`):t(`common.secondsAgo`,{count:String(i.lastInputSeconds)}),s=i.mode??`unknown`,c=i.host??`unknown host`,l=i.ip??null,u=Array.isArray(i.roles)?i.roles.filter(Boolean):[],d=Array.isArray(i.scopes)?i.scopes.filter(Boolean):[],f=d.length>0?d.length>3?`${d.length} scopes`:`scopes: ${d.join(`, `)}`:null;return e`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">
          <span class="${a?`redacted`:``}">${c}</span>
        </div>
        <div class="list-sub">
          ${l?e`<span class="${a?`redacted`:``}">${l}</span> `:n}${s}
          ${i.version??``}
        </div>
        <div class="chip-row">
          <span class="chip">${s}</span>
          ${u.map(t=>e`<span class="chip">${t}</span>`)}
          ${f?e`<span class="chip">${f}</span>`:n}
          ${i.platform?e`<span class="chip">${i.platform}</span>`:n}
          ${i.deviceFamily?e`<span class="chip">${i.deviceFamily}</span>`:n}
          ${i.modelIdentifier?e`<span class="chip">${i.modelIdentifier}</span>`:n}
          ${i.version?e`<span class="chip">${i.version}</span>`:n}
        </div>
      </div>
      <div class="list-meta">
        <div>${r(i)}</div>
        <div class="muted">${t(`instances.lastInput`,{time:o})}</div>
        <div class="muted">${t(`instances.reason`,{reason:i.reason??``})}</div>
      </div>
    </div>
  `}export{o as renderInstances};
//# sourceMappingURL=instances-DzvNcV8N.js.map