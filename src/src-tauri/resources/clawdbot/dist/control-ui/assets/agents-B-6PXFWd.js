import{i as e,n as t}from"./lit-BZwq2xLD.js";import{l as n}from"./format-DeRVtGzv.js";import{C as r,D as i,E as a,O as o,S as s,T as c,_ as l,a as u,b as d,d as f,f as p,g as m,h,k as g,m as _,n as v,p as y,r as b,t as x,u as S,v as C,w,x as T,y as E}from"./index-sc9GrLxu.js";import{r as D}from"./channel-config-extras-UBRJa-vU.js";import{i as O,n as k,r as A,t as j}from"./skills-shared-CPLqvR1x.js";function M(n){let{agent:r,configForm:i,agentFilesList:a,configLoading:o,configSaving:c,configDirty:u,onConfigReload:f,onConfigSave:m,onModelChange:h,onModelFallbacksChange:g,onSelectPanel:_}=n,v=E(i,r.id),y=(a&&a.agentId===r.id?a.workspace:null)||v.entry?.workspace||v.defaults?.workspace||`default`,b=v.entry?.model?T(v.entry?.model):T(v.defaults?.model),x=T(v.defaults?.model),S=s(v.entry?.model),w=s(v.defaults?.model)||(x===`-`?null:l(x)),D=S??w??null,O=d(v.entry?.model)??[],k=Array.isArray(v.entry?.skills)?v.entry?.skills:null,A=k?.length??null,j=!!(n.defaultId&&r.id===n.defaultId),M=!i||o||c,N=e=>{let t=O.filter((t,n)=>n!==e);g(r.id,t)};return e`
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
              @click=${()=>_(`files`)}
              title="Open Files tab"
            >${y}</button>
          </div>
        </div>
        <div class="agent-kv">
          <div class="label">Primary Model</div>
          <div class="mono">${b}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Skills Filter</div>
          <div>${k?`${A} selected`:`all skills`}</div>
        </div>
      </div>

      ${u?e`
              <div class="callout warn" style="margin-top: 16px">You have unsaved config changes.</div>
            `:t}

      <div class="agent-model-select" style="margin-top: 20px;">
        <div class="label">Model Selection</div>
        <div class="agent-model-fields">
          <label class="field">
            <span>Primary model${j?` (default)`:``}</span>
            <select
              .value=${j?D??``:S??``}
              ?disabled=${M}
              @change=${e=>h(r.id,e.target.value||null)}
            >
              ${j?t:e`
                      <option value="">
                        ${w?`Inherit default (${w})`:`Inherit default`}
                      </option>
                    `}
              ${p(i,D??void 0)}
            </select>
          </label>
          <div class="field">
            <span>Fallbacks</span>
            <div class="agent-chip-input" @click=${e=>{let t=e.currentTarget.querySelector(`input`);t&&t.focus()}}>
              ${O.map((t,n)=>e`
                  <span class="chip">
                    ${t}
                    <button
                      type="button"
                      class="chip-remove"
                      ?disabled=${M}
                      @click=${()=>N(n)}
                    >&times;</button>
                  </span>
                `)}
              <input
                ?disabled=${M}
                placeholder=${O.length===0?`provider/model`:``}
                @keydown=${e=>{let t=e.target;if(e.key===`Enter`||e.key===`,`){e.preventDefault();let n=C(t.value);n.length>0&&(g(r.id,[...O,...n]),t.value=``)}}}
                @blur=${e=>{let t=e.target,n=C(t.value);n.length>0&&(g(r.id,[...O,...n]),t.value=``)}}
              />
            </div>
          </div>
        </div>
        <div class="agent-model-actions">
          <button type="button" class="btn btn--sm" ?disabled=${o} @click=${f}>
            Reload Config
          </button>
          <button
            type="button"
            class="btn btn--sm primary"
            ?disabled=${c||!u}
            @click=${m}
          >
            ${c?`Saving…`:`Save`}
          </button>
        </div>
      </div>
    </section>
  `}function N(t,n){return e`
    <section class="card">
      <div class="card-title">Agent Context</div>
      <div class="card-sub">${n}</div>
      <div class="agents-overview-grid" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Workspace</div>
          <div class="mono">${t.workspace}</div>
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
  `}function P(e,t){let n=e.channelMeta?.find(e=>e.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function F(e){if(!e)return[];let t=new Set;for(let n of e.channelOrder??[])t.add(n);for(let n of e.channelMeta??[])t.add(n.id);for(let n of Object.keys(e.channelAccounts??{}))t.add(n);let n=[],r=e.channelOrder?.length?e.channelOrder:Array.from(t);for(let e of r)t.has(e)&&(n.push(e),t.delete(e));for(let e of t)n.push(e);return n.map(t=>({id:t,label:P(e,t),accounts:e.channelAccounts?.[t]??[]}))}var I=[`groupPolicy`,`streamMode`,`dmPolicy`];function L(e){let t=0,n=0,r=0;for(let i of e){let e=i.probe&&typeof i.probe==`object`&&`ok`in i.probe?!!i.probe.ok:!1;(i.connected===!0||i.running===!0||e)&&(t+=1),i.configured&&(n+=1),i.enabled&&(r+=1)}return{total:e.length,connected:t,configured:n,enabled:r}}function R(r){let i=F(r.snapshot),a=r.lastSuccess?n(r.lastSuccess):`never`;return e`
    <section class="grid grid-cols-2">
      ${N(r.context,`Workspace, identity, and model configuration.`)}
      <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Channels</div>
            <div class="card-sub">Gateway-wide channel status snapshot.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${r.loading} @click=${r.onRefresh}>
            ${r.loading?`Refreshing…`:`Refresh`}
          </button>
        </div>
        <div class="muted" style="margin-top: 8px;">
          Last refresh: ${a}
        </div>
        ${r.error?e`<div class="callout danger" style="margin-top: 12px;">${r.error}</div>`:t}
        ${r.snapshot?t:e`
                <div class="callout info" style="margin-top: 12px">Load channels to see live status.</div>
              `}
        ${i.length===0?e`
                <div class="muted" style="margin-top: 16px">No channels found.</div>
              `:e`
                <div class="list" style="margin-top: 16px;">
                  ${i.map(n=>{let i=L(n.accounts),a=i.total?`${i.connected}/${i.total} connected`:`no accounts`,o=i.configured?`${i.configured} configured`:`not configured`,s=i.total?`${i.enabled} enabled`:`disabled`,c=D({configForm:r.configForm,channelId:n.id,fields:I});return e`
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
                                `:t}
                          ${c.length>0?c.map(t=>e`<div>${t.label}: ${t.value}</div>`):t}
                        </div>
                      </div>
                    `})}
                </div>
              `}
      </section>
    </section>
  `}function z(n){let r=n.jobs.filter(e=>e.agentId===n.agentId);return e`
    <section class="grid grid-cols-2">
      ${N(n.context,`Workspace and scheduling targets.`)}
      <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Scheduler</div>
            <div class="card-sub">Gateway cron status.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${n.loading} @click=${n.onRefresh}>
            ${n.loading?`Refreshing…`:`Refresh`}
          </button>
        </div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">Enabled</div>
            <div class="stat-value">
              ${n.status?n.status.enabled?`Yes`:`No`:`n/a`}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">Jobs</div>
            <div class="stat-value">${n.status?.jobs??`n/a`}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Next wake</div>
            <div class="stat-value">${u(n.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        ${n.error?e`<div class="callout danger" style="margin-top: 12px;">${n.error}</div>`:t}
      </section>
    </section>
    <section class="card">
      <div class="card-title">Agent Cron Jobs</div>
      <div class="card-sub">Scheduled jobs targeting this agent.</div>
      ${r.length===0?e`
              <div class="muted" style="margin-top: 16px">No jobs assigned.</div>
            `:e`
              <div class="list" style="margin-top: 16px;">
                ${r.map(r=>e`
                    <div class="list-item">
                      <div class="list-main">
                        <div class="list-title">${r.name}</div>
                        ${r.description?e`<div class="list-sub">${r.description}</div>`:t}
                        <div class="chip-row" style="margin-top: 6px;">
                          <span class="chip">${v(r)}</span>
                          <span class="chip ${r.enabled?`chip-ok`:`chip-warn`}">
                            ${r.enabled?`enabled`:`disabled`}
                          </span>
                          <span class="chip">${r.sessionTarget}</span>
                        </div>
                      </div>
                      <div class="list-meta">
                        <div class="mono">${b(r)}</div>
                        <div class="muted">${x(r)}</div>
                        <button
                          class="btn btn--sm"
                          style="margin-top: 6px;"
                          ?disabled=${!r.enabled}
                          @click=${()=>n.onRunNow(r.id)}
                        >Run Now</button>
                      </div>
                    </div>
                  `)}
              </div>
            `}
    </section>
  `}function B(n){let r=n.agentFilesList?.agentId===n.agentId?n.agentFilesList:null,a=r?.files??[],s=n.agentFileActive??null,c=s?a.find(e=>e.name===s)??null:null,l=s?n.agentFileContents[s]??``:``,u=s?n.agentFileDrafts[s]??l:``,d=s?u!==l:!1;return e`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Core Files</div>
          <div class="card-sub">Bootstrap persona, identity, and tool guidance.</div>
        </div>
        <button
          class="btn btn--sm"
          ?disabled=${n.agentFilesLoading}
          @click=${()=>n.onLoadFiles(n.agentId)}
        >
          ${n.agentFilesLoading?`Loading…`:`Refresh`}
        </button>
      </div>
      ${r?e`<div class="muted mono" style="margin-top: 8px;">Workspace: ${r.workspace}</div>`:t}
      ${n.agentFilesError?e`<div class="callout danger" style="margin-top: 12px;">${n.agentFilesError}</div>`:t}
      ${r?e`
              <div class="agent-files-grid" style="margin-top: 16px;">
                <div class="agent-files-list">
                  ${a.length===0?e`
                          <div class="muted">No files found.</div>
                        `:a.map(e=>V(e,s,()=>n.onSelectFile(e.name)))}
                </div>
                <div class="agent-files-editor">
                  ${c?e`
                          <div class="agent-file-header">
                            <div>
                              <div class="agent-file-title mono">${c.name}</div>
                              <div class="agent-file-sub mono">${c.path}</div>
                            </div>
                            <div class="agent-file-actions">
                              <button
                                class="btn btn--sm"
                                title="Preview rendered markdown"
                                @click=${e=>{let t=e.currentTarget.closest(`.agent-files-editor`)?.querySelector(`dialog`);t&&t.showModal()}}
                              >
                                ${o.eye} Preview
                              </button>
                              <button
                                class="btn btn--sm"
                                ?disabled=${!d}
                                @click=${()=>n.onFileReset(c.name)}
                              >
                                Reset
                              </button>
                              <button
                                class="btn btn--sm primary"
                                ?disabled=${n.agentFileSaving||!d}
                                @click=${()=>n.onFileSave(c.name)}
                              >
                                ${n.agentFileSaving?`Saving…`:`Save`}
                              </button>
                            </div>
                          </div>
                          ${c.missing?e`
                                  <div class="callout info" style="margin-top: 10px">
                                    This file is missing. Saving will create it in the agent workspace.
                                  </div>
                                `:t}
                          <label class="field agent-file-field" style="margin-top: 12px;">
                            <span>Content</span>
                            <textarea
                              class="agent-file-textarea"
                              .value=${u}
                              @input=${e=>n.onFileDraftChange(c.name,e.target.value)}
                            ></textarea>
                          </label>
                          <dialog
                            class="md-preview-dialog"
                            @click=${e=>{let t=e.currentTarget;e.target===t&&t.close()}}
                          >
                            <div class="md-preview-dialog__panel">
                              <div class="md-preview-dialog__header">
                                <div class="md-preview-dialog__title mono">${c.name}</div>
                                <button
                                  class="btn btn--sm"
                                  @click=${e=>{e.currentTarget.closest(`dialog`)?.close()}}
                                >${o.x} Close</button>
                              </div>
                              <div class="md-preview-dialog__body sidebar-markdown">
                                ${g(i(u))}
                              </div>
                            </div>
                          </dialog>
                        `:e`
                          <div class="muted">Select a file to edit.</div>
                        `}
                </div>
              </div>
            `:e`
              <div class="callout info" style="margin-top: 12px">
                Load the agent workspace files to edit core instructions.
              </div>
            `}
    </section>
  `}function V(r,i,a){let o=r.missing?`Missing`:`${y(r.size)} · ${n(r.updatedAtMs??null)}`;return e`
    <button
      type="button"
      class="agent-file-row ${i===r.name?`active`:``}"
      @click=${a}
    >
      <div>
        <div class="agent-file-name mono">${r.name}</div>
        <div class="agent-file-meta">${o}</div>
      </div>
      ${r.missing?e`
              <span class="agent-pill warn">missing</span>
            `:t}
    </button>
  `}function H(n,r){let i=r.source??n.source,a=r.pluginId??n.pluginId,o=[];return i===`plugin`&&a?o.push(`plugin:${a}`):i===`core`&&o.push(`core`),r.optional&&o.push(`optional`),o.length===0?t:e`
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
      ${o.map(t=>e`<span class="agent-pill">${t}</span>`)}
    </div>
  `}function U(n){let i=E(n.configForm,n.agentId),o=i.entry?.tools??{},s=i.globalTools??{},l=o.profile??s.profile??`full`,u=w(n.toolsCatalogResult),d=c(n.toolsCatalogResult),f=o.profile?`agent override`:s.profile?`global default`:`default`,p=Array.isArray(o.allow)&&o.allow.length>0,m=Array.isArray(s.allow)&&s.allow.length>0,g=!!n.configForm&&!n.configLoading&&!n.configSaving&&!p&&!(n.toolsCatalogLoading&&!n.toolsCatalogResult&&!n.toolsCatalogError),v=p?[]:Array.isArray(o.alsoAllow)?o.alsoAllow:[],y=p?[]:Array.isArray(o.deny)?o.deny:[],b=p?{allow:o.allow??[],deny:o.deny??[]}:r(l)??void 0,x=d.flatMap(e=>e.tools.map(e=>e.id)),S=e=>{let t=_(e,b),n=h(e,v),r=h(e,y);return{allowed:(t||n)&&!r,baseAllowed:t,denied:r}},C=x.filter(e=>S(e).allowed).length,T=(e,t)=>{let r=new Set(v.map(e=>a(e)).filter(e=>e.length>0)),i=new Set(y.map(e=>a(e)).filter(e=>e.length>0)),o=S(e).baseAllowed,s=a(e);t?(i.delete(s),o||r.add(s)):(r.delete(s),i.add(s)),n.onOverridesChange(n.agentId,[...r],[...i])},D=e=>{let t=new Set(v.map(e=>a(e)).filter(e=>e.length>0)),r=new Set(y.map(e=>a(e)).filter(e=>e.length>0));for(let n of x){let i=S(n).baseAllowed,o=a(n);e?(r.delete(o),i||t.add(o)):(t.delete(o),r.add(o))}n.onOverridesChange(n.agentId,[...t],[...r])};return e`
    <section class="card">
      <div class="row" style="justify-content: space-between; flex-wrap: wrap;">
        <div style="min-width: 0;">
          <div class="card-title">Tool Access</div>
          <div class="card-sub">
            Profile + per-tool overrides for this agent.
            <span class="mono">${C}/${x.length}</span> enabled.
          </div>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap;">
          <button class="btn btn--sm" ?disabled=${!g} @click=${()=>D(!0)}>
            Enable All
          </button>
          <button class="btn btn--sm" ?disabled=${!g} @click=${()=>D(!1)}>
            Disable All
          </button>
          <button class="btn btn--sm" ?disabled=${n.configLoading} @click=${n.onConfigReload}>
            Reload Config
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${n.configSaving||!n.configDirty}
            @click=${n.onConfigSave}
          >
            ${n.configSaving?`Saving…`:`Save`}
          </button>
        </div>
      </div>

      ${n.configForm?t:e`
              <div class="callout info" style="margin-top: 12px">
                Load the gateway config to adjust tool profiles.
              </div>
            `}
      ${p?e`
              <div class="callout info" style="margin-top: 12px">
                This agent is using an explicit allowlist in config. Tool overrides are managed in the Config tab.
              </div>
            `:t}
      ${m?e`
              <div class="callout info" style="margin-top: 12px">
                Global tools.allow is set. Agent overrides cannot enable tools that are globally blocked.
              </div>
            `:t}
      ${n.toolsCatalogLoading&&!n.toolsCatalogResult&&!n.toolsCatalogError?e`
              <div class="callout info" style="margin-top: 12px">Loading runtime tool catalog…</div>
            `:t}
      ${n.toolsCatalogError?e`
              <div class="callout info" style="margin-top: 12px">
                Could not load runtime tool catalog. Showing built-in fallback list instead.
              </div>
            `:t}

      <div class="agent-tools-meta" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Profile</div>
          <div class="mono">${l}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Source</div>
          <div>${f}</div>
        </div>
        ${n.configDirty?e`
                <div class="agent-kv">
                  <div class="label">Status</div>
                  <div class="mono">unsaved</div>
                </div>
              `:t}
      </div>

      <div class="agent-tools-presets" style="margin-top: 16px;">
        <div class="label">Quick Presets</div>
        <div class="agent-tools-buttons">
          ${u.map(t=>e`
              <button
                class="btn btn--sm ${l===t.id?`active`:``}"
                ?disabled=${!g}
                @click=${()=>n.onProfileChange(n.agentId,t.id,!0)}
              >
                ${t.label}
              </button>
            `)}
          <button
            class="btn btn--sm"
            ?disabled=${!g}
            @click=${()=>n.onProfileChange(n.agentId,null,!1)}
          >
            Inherit
          </button>
        </div>
      </div>

      <div class="agent-tools-grid" style="margin-top: 20px;">
        ${d.map(n=>e`
              <div class="agent-tools-section">
                <div class="agent-tools-header">
                  ${n.label}
                  ${n.source===`plugin`&&n.pluginId?e`<span class="agent-pill" style="margin-left: 8px;">plugin:${n.pluginId}</span>`:t}
                </div>
                <div class="agent-tools-list">
                  ${n.tools.map(t=>{let{allowed:r}=S(t.id);return e`
                      <div class="agent-tool-row">
                        <div>
                          <div class="agent-tool-title mono">${t.label}</div>
                          <div class="agent-tool-sub">${t.description}</div>
                          ${H(n,t)}
                        </div>
                        <label class="cfg-toggle">
                          <input
                            type="checkbox"
                            .checked=${r}
                            ?disabled=${!g}
                            @change=${e=>T(t.id,e.target.checked)}
                          />
                          <span class="cfg-toggle__track"></span>
                        </label>
                      </div>
                    `})}
                </div>
              </div>
            `)}
      </div>
    </section>
  `}function W(n){let r=!!n.configForm&&!n.configLoading&&!n.configSaving,i=E(n.configForm,n.agentId),a=Array.isArray(i.entry?.skills)?i.entry?.skills:void 0,o=new Set((a??[]).map(e=>e.trim()).filter(Boolean)),s=a!==void 0,c=!!(n.report&&n.activeAgentId===n.agentId),l=c?n.report?.skills??[]:[],u=n.filter.trim().toLowerCase(),d=u?l.filter(e=>[e.name,e.description,e.source].join(` `).toLowerCase().includes(u)):l,f=O(d),p=s?l.filter(e=>o.has(e.name)).length:l.length,m=l.length;return e`
    <section class="card">
      <div class="row" style="justify-content: space-between; flex-wrap: wrap;">
        <div style="min-width: 0;">
          <div class="card-title">Skills</div>
          <div class="card-sub">
            Per-agent skill allowlist and workspace skills.
            ${m>0?e`<span class="mono">${p}/${m}</span>`:t}
          </div>
        </div>
        <div class="row" style="gap: 8px; flex-wrap: wrap;">
          <div class="row" style="gap: 4px; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 2px;">
            <button class="btn btn--sm" ?disabled=${!r} @click=${()=>n.onClear(n.agentId)}>
              Enable All
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!r}
              @click=${()=>n.onDisableAll(n.agentId)}
            >
              Disable All
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!r||!s}
              @click=${()=>n.onClear(n.agentId)}
              title="Remove per-agent allowlist and use all skills"
            >
              Reset
            </button>
          </div>
          <button class="btn btn--sm" ?disabled=${n.configLoading} @click=${n.onConfigReload}>
            Reload Config
          </button>
          <button class="btn btn--sm" ?disabled=${n.loading} @click=${n.onRefresh}>
            ${n.loading?`Loading…`:`Refresh`}
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${n.configSaving||!n.configDirty}
            @click=${n.onConfigSave}
          >
            ${n.configSaving?`Saving…`:`Save`}
          </button>
        </div>
      </div>

      ${n.configForm?t:e`
              <div class="callout info" style="margin-top: 12px">
                Load the gateway config to set per-agent skills.
              </div>
            `}
      ${s?e`
              <div class="callout info" style="margin-top: 12px">This agent uses a custom skill allowlist.</div>
            `:e`
              <div class="callout info" style="margin-top: 12px">
                All skills are enabled. Disabling any skill will create a per-agent allowlist.
              </div>
            `}
      ${!c&&!n.loading?e`
              <div class="callout info" style="margin-top: 12px">
                Load skills for this agent to view workspace-specific entries.
              </div>
            `:t}
      ${n.error?e`<div class="callout danger" style="margin-top: 12px;">${n.error}</div>`:t}

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="flex: 1;">
          <span>Filter</span>
          <input
            .value=${n.filter}
            @input=${e=>n.onFilterChange(e.target.value)}
            placeholder="Search skills"
            autocomplete="off"
            name="agent-skills-filter"
          />
        </label>
        <div class="muted">${d.length} shown</div>
      </div>

      ${d.length===0?e`
              <div class="muted" style="margin-top: 16px">No skills found.</div>
            `:e`
              <div class="agent-skills-groups" style="margin-top: 16px;">
                ${f.map(e=>G(e,{agentId:n.agentId,allowSet:o,usingAllowlist:s,editable:r,onToggle:n.onToggle}))}
              </div>
            `}
    </section>
  `}function G(t,n){return e`
    <details class="agent-skills-group" ?open=${!(t.id===`workspace`||t.id===`built-in`)}>
      <summary class="agent-skills-header">
        <span>${t.label}</span>
        <span class="muted">${t.skills.length}</span>
      </summary>
      <div class="list skills-grid">
        ${t.skills.map(e=>K(e,{agentId:n.agentId,allowSet:n.allowSet,usingAllowlist:n.usingAllowlist,editable:n.editable,onToggle:n.onToggle}))}
      </div>
    </details>
  `}function K(n,r){let i=r.usingAllowlist?r.allowSet.has(n.name):!0,a=j(n),o=k(n);return e`
    <div class="list-item agent-skill-row">
      <div class="list-main">
        <div class="list-title">${n.emoji?`${n.emoji} `:``}${n.name}</div>
        <div class="list-sub">${n.description}</div>
        ${A({skill:n})}
        ${a.length>0?e`<div class="muted" style="margin-top: 6px;">Missing: ${a.join(`, `)}</div>`:t}
        ${o.length>0?e`<div class="muted" style="margin-top: 6px;">Reason: ${o.join(`, `)}</div>`:t}
      </div>
      <div class="list-meta">
        <label class="cfg-toggle">
          <input
            type="checkbox"
            .checked=${i}
            ?disabled=${!r.editable}
            @change=${e=>r.onToggle(r.agentId,n.name,e.target.checked)}
          />
          <span class="cfg-toggle__track"></span>
        </label>
      </div>
    </div>
  `}function q(n){let r=n.agentsList?.agents??[],i=n.agentsList?.defaultId??null,a=n.selectedAgentId??i??r[0]?.id??null,o=a?r.find(e=>e.id===a)??null:null,s=a&&n.agentSkills.agentId===a?n.agentSkills.report?.skills?.length??null:null,c=n.channels.snapshot?Object.keys(n.channels.snapshot.channelAccounts??{}).length:null,l=a?n.cron.jobs.filter(e=>e.agentId===a).length:null,u={files:n.agentFiles.list?.files?.length??null,skills:s,channels:c,cron:l||null};return e`
    <div class="agents-layout">
      <section class="agents-toolbar">
        <div class="agents-toolbar-row">
          <span class="agents-toolbar-label">Agent</span>
          <div class="agents-control-row">
            <div class="agents-control-select">
              <select
                class="agents-select"
                .value=${a??``}
                ?disabled=${n.loading||r.length===0}
                @change=${e=>n.onSelectAgent(e.target.value)}
              >
                ${r.length===0?e`
                        <option value="">No agents</option>
                      `:r.map(t=>e`
                        <option value=${t.id} ?selected=${t.id===a}>
                          ${m(t)}${S(t.id,i)?` (${S(t.id,i)})`:``}
                        </option>
                      `)}
              </select>
            </div>
            <div class="agents-control-actions">
              ${o?e`
                      <div class="agent-actions-wrap">
                        <button
                          class="agent-actions-toggle"
                          type="button"
                          @click=${()=>{J=!J}}
                        >⋯</button>
                        ${J?e`
                                <div class="agent-actions-menu">
                                  <button type="button" @click=${()=>{navigator.clipboard.writeText(o.id),J=!1}}>Copy agent ID</button>
                                  <button
                                    type="button"
                                    ?disabled=${!!(i&&o.id===i)}
                                    @click=${()=>{n.onSetDefault(o.id),J=!1}}
                                  >
                                    ${i&&o.id===i?`Already default`:`Set as default`}
                                  </button>
                                </div>
                              `:t}
                      </div>
                    `:t}
              <button class="btn btn--sm agents-refresh-btn" ?disabled=${n.loading} @click=${n.onRefresh}>
                ${n.loading?`Loading…`:`Refresh`}
              </button>
            </div>
          </div>
        </div>
        ${n.error?e`<div class="callout danger" style="margin-top: 8px;">${n.error}</div>`:t}
      </section>
      <section class="agents-main">
        ${o?e`
                ${Y(n.activePanel,e=>n.onSelectPanel(e),u)}
                ${n.activePanel===`overview`?M({agent:o,basePath:n.basePath,defaultId:i,configForm:n.config.form,agentFilesList:n.agentFiles.list,agentIdentity:n.agentIdentityById[o.id]??null,agentIdentityError:n.agentIdentityError,agentIdentityLoading:n.agentIdentityLoading,configLoading:n.config.loading,configSaving:n.config.saving,configDirty:n.config.dirty,onConfigReload:n.onConfigReload,onConfigSave:n.onConfigSave,onModelChange:n.onModelChange,onModelFallbacksChange:n.onModelFallbacksChange,onSelectPanel:n.onSelectPanel}):t}
                ${n.activePanel===`files`?B({agentId:o.id,agentFilesList:n.agentFiles.list,agentFilesLoading:n.agentFiles.loading,agentFilesError:n.agentFiles.error,agentFileActive:n.agentFiles.active,agentFileContents:n.agentFiles.contents,agentFileDrafts:n.agentFiles.drafts,agentFileSaving:n.agentFiles.saving,onLoadFiles:n.onLoadFiles,onSelectFile:n.onSelectFile,onFileDraftChange:n.onFileDraftChange,onFileReset:n.onFileReset,onFileSave:n.onFileSave}):t}
                ${n.activePanel===`tools`?U({agentId:o.id,configForm:n.config.form,configLoading:n.config.loading,configSaving:n.config.saving,configDirty:n.config.dirty,toolsCatalogLoading:n.toolsCatalog.loading,toolsCatalogError:n.toolsCatalog.error,toolsCatalogResult:n.toolsCatalog.result,onProfileChange:n.onToolsProfileChange,onOverridesChange:n.onToolsOverridesChange,onConfigReload:n.onConfigReload,onConfigSave:n.onConfigSave}):t}
                ${n.activePanel===`skills`?W({agentId:o.id,report:n.agentSkills.report,loading:n.agentSkills.loading,error:n.agentSkills.error,activeAgentId:n.agentSkills.agentId,configForm:n.config.form,configLoading:n.config.loading,configSaving:n.config.saving,configDirty:n.config.dirty,filter:n.agentSkills.filter,onFilterChange:n.onSkillsFilterChange,onRefresh:n.onSkillsRefresh,onToggle:n.onAgentSkillToggle,onClear:n.onAgentSkillsClear,onDisableAll:n.onAgentSkillsDisableAll,onConfigReload:n.onConfigReload,onConfigSave:n.onConfigSave}):t}
                ${n.activePanel===`channels`?R({context:f(o,n.config.form,n.agentFiles.list,i,n.agentIdentityById[o.id]??null),configForm:n.config.form,snapshot:n.channels.snapshot,loading:n.channels.loading,error:n.channels.error,lastSuccess:n.channels.lastSuccess,onRefresh:n.onChannelsRefresh}):t}
                ${n.activePanel===`cron`?z({context:f(o,n.config.form,n.agentFiles.list,i,n.agentIdentityById[o.id]??null),agentId:o.id,jobs:n.cron.jobs,status:n.cron.status,loading:n.cron.loading,error:n.cron.error,onRefresh:n.onCronRefresh,onRunNow:n.onCronRunNow}):t}
              `:e`
                <div class="card">
                  <div class="card-title">Select an agent</div>
                  <div class="card-sub">Pick an agent to inspect its workspace and tools.</div>
                </div>
              `}
      </section>
    </div>
  `}var J=!1;function Y(n,r,i){return e`
    <div class="agent-tabs">
      ${[{id:`overview`,label:`Overview`},{id:`files`,label:`Files`},{id:`tools`,label:`Tools`},{id:`skills`,label:`Skills`},{id:`channels`,label:`Channels`},{id:`cron`,label:`Cron Jobs`}].map(a=>e`
          <button
            class="agent-tab ${n===a.id?`active`:``}"
            type="button"
            @click=${()=>r(a.id)}
          >
            ${a.label}${i[a.id]==null?t:e`<span class="agent-tab-count">${i[a.id]}</span>`}
          </button>
        `)}
    </div>
  `}export{q as renderAgents};
//# sourceMappingURL=agents-B-6PXFWd.js.map