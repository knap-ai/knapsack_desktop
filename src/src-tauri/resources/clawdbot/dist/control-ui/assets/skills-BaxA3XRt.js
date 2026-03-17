import{i as e,n as t}from"./lit-BZwq2xLD.js";import{t as n}from"./format-DeRVtGzv.js";import{i as r,n as i,r as a,t as o}from"./skills-shared-CPLqvR1x.js";function s(n){let i=n.report?.skills??[],a=n.filter.trim().toLowerCase(),o=a?i.filter(e=>[e.name,e.description,e.source].join(` `).toLowerCase().includes(a)):i,s=r(o);return e`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Skills</div>
          <div class="card-sub">Installed skills and their status.</div>
        </div>
        <button class="btn" ?disabled=${n.loading||!n.connected} @click=${n.onRefresh}>
          ${n.loading?`Loading…`:`Refresh`}
        </button>
      </div>

      <div class="filters" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 14px;">
        <a
          class="btn"
          href="https://clawhub.com"
          target="_blank"
          rel="noreferrer"
          title="Browse skills on ClawHub"
        >Browse Skills Store</a>
        <label class="field" style="flex: 1; min-width: 180px;">
          <input
            .value=${n.filter}
            @input=${e=>n.onFilterChange(e.target.value)}
            placeholder="Search skills"
            autocomplete="off"
            name="skills-filter"
          />
        </label>
        <div class="muted">${o.length} shown</div>
      </div>

      ${n.error?e`<div class="callout danger" style="margin-top: 12px;">${n.error}</div>`:t}

      ${o.length===0?e`
              <div class="muted" style="margin-top: 16px">
                ${!n.connected&&!n.report?`Not connected to gateway.`:`No skills found.`}
              </div>
            `:e`
            <div class="agent-skills-groups" style="margin-top: 16px;">
              ${s.map(t=>e`
                  <details class="agent-skills-group" ?open=${!(t.id===`workspace`||t.id===`built-in`)}>
                    <summary class="agent-skills-header">
                      <span>${t.label}</span>
                      <span class="muted">${t.skills.length}</span>
                    </summary>
                    <div class="list skills-grid">
                      ${t.skills.map(e=>c(e,n))}
                    </div>
                  </details>
                `)}
            </div>
          `}
    </section>
  `}function c(r,s){let c=s.busyKey===r.skillKey,l=s.edits[r.skillKey]??``,u=s.messages[r.skillKey]??null,d=r.install.length>0&&r.missing.bins.length>0,f=!!(r.bundled&&r.source!==`openclaw-bundled`),p=o(r),m=i(r);return e`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">
          ${r.emoji?`${r.emoji} `:``}${r.name}
        </div>
        <div class="list-sub">${n(r.description,140)}</div>
        ${a({skill:r,showBundledBadge:f})}
        ${p.length>0?e`
              <div class="muted" style="margin-top: 6px;">
                Missing: ${p.join(`, `)}
              </div>
            `:t}
        ${m.length>0?e`
              <div class="muted" style="margin-top: 6px;">
                Reason: ${m.join(`, `)}
              </div>
            `:t}
      </div>
      <div class="list-meta">
        <div class="row" style="justify-content: flex-end; flex-wrap: wrap;">
          <button
            class="btn"
            ?disabled=${c}
            @click=${()=>s.onToggle(r.skillKey,r.disabled)}
          >
            ${r.disabled?`Enable`:`Disable`}
          </button>
          ${d?e`<button
                class="btn"
                ?disabled=${c}
                @click=${()=>s.onInstall(r.skillKey,r.name,r.install[0].id)}
              >
                ${c?`Installing…`:r.install[0].label}
              </button>`:t}
        </div>
        ${u?e`<div
              class="muted"
              style="margin-top: 8px; color: ${u.kind===`error`?`var(--danger-color, #d14343)`:`var(--success-color, #0a7f5a)`};"
            >
              ${u.message}
            </div>`:t}
        ${r.primaryEnv?e`
              <div class="field" style="margin-top: 10px;">
                <span>API key</span>
                <input
                  type="password"
                  .value=${l}
                  @input=${e=>s.onEdit(r.skillKey,e.target.value)}
                />
              </div>
              <button
                class="btn primary"
                style="margin-top: 8px;"
                ?disabled=${c}
                @click=${()=>s.onSaveKey(r.skillKey)}
              >
                Save key
              </button>
            `:t}
      </div>
    </div>
  `}export{s as renderSkills};
//# sourceMappingURL=skills-BaxA3XRt.js.map