import{h as e,o as t,p as n,r,t as i}from"./string-coerce-B9QFF8sN.js";import{u as a}from"./format-CZkRKadr.js";import{M as o,j as s,p as c,s as l}from"./index-ckUmEo1l.js";var u=[`off`,`minimal`,`low`,`medium`,`high`],d=[{value:``,label:`inherit`},{value:`off`,label:`off (explicit)`},{value:`on`,label:`on`},{value:`full`,label:`full`}],f=[{value:``,label:`inherit`},{value:`on`,label:`on`},{value:`off`,label:`off`}],p=[``,`off`,`on`,`stream`],m=[10,25,50,100];function h(e){return o(e)??i(e)}function g(e){return[{value:``,label:`inherit`},...(e.thinkingLevels?.length?e.thinkingLevels:(e.thinkingOptions?.length?e.thinkingOptions:u).map(e=>({id:h(e),label:e}))).map(e=>({value:h(e.id),label:e.label}))]}function _(e,t){return!t||e.includes(t)?[...e]:[...e,t]}function v(e,t){return!t||e.some(e=>e.value===t)?[...e]:[...e,{value:t,label:`${t} (custom)`}]}function y(e){return e||null}function b(e,t){let n=i(t);return n?e.filter(e=>{let t=i(e.key),r=i(e.label),a=i(e.kind),o=i(e.displayName);return t.includes(n)||r.includes(n)||a.includes(n)||o.includes(n)}):e}function x(e,t,n){let r=n===`asc`?1:-1;return[...e].toSorted((e,n)=>{let i=0;switch(t){case`key`:i=(e.key??``).localeCompare(n.key??``);break;case`kind`:i=(e.kind??``).localeCompare(n.kind??``);break;case`updated`:i=(e.updatedAt??0)-(n.updatedAt??0);break;case`tokens`:i=(e.totalTokens??e.inputTokens??e.outputTokens??0)-(n.totalTokens??n.inputTokens??n.outputTokens??0);break}return i*r})}function S(e,t,n){let r=t*n;return e.slice(r,r+n)}function C(e){switch(e){case`manual`:return`manual`;case`auto-threshold`:return`auto-threshold`;case`overflow-retry`:return`overflow retry`;case`timeout-retry`:return`timeout retry`;default:return e}}function w(e){return typeof e.tokensBefore==`number`&&typeof e.tokensAfter==`number`&&Number.isFinite(e.tokensBefore)&&Number.isFinite(e.tokensAfter)?`${e.tokensBefore.toLocaleString()} → ${e.tokensAfter.toLocaleString()} tokens`:typeof e.tokensBefore==`number`&&Number.isFinite(e.tokensBefore)?`${e.tokensBefore.toLocaleString()} tokens before`:`token delta unavailable`}function T(r){let i=x(b(r.result?.sessions??[],r.searchQuery),r.sortColumn,r.sortDir),a=i.length,o=Math.max(1,Math.ceil(a/r.pageSize)),s=Math.min(r.page,o-1),l=S(i,s,r.pageSize),u=(t,n,i=``)=>{let a=r.sortColumn===t,o=a&&r.sortDir===`asc`?`desc`:`asc`;return e`
      <th
        class=${i}
        data-sortable
        data-sort-dir=${a?r.sortDir:``}
        @click=${()=>r.onSortChange(t,a?o:`desc`)}
      >
        ${n}
        <span class="data-table-sort-icon">${c.arrowUpDown}</span>
      </th>
    `};return e`
    <section class="card">
      <div class="row" style="justify-content: space-between; margin-bottom: 12px;">
        <div>
          <div class="card-title">Sessions</div>
          <div class="card-sub">
            ${r.result?`Store: ${r.result.path}`:`Active session keys and per-session overrides.`}
          </div>
        </div>
        <button class="btn" ?disabled=${r.loading} @click=${r.onRefresh}>
          ${r.loading?t(`common.loading`):t(`common.refresh`)}
        </button>
      </div>

      <div class="filters" style="margin-bottom: 12px;">
        <label class="field-inline">
          <span>Active</span>
          <input
            style="width: 72px;"
            placeholder="min"
            .value=${r.activeMinutes}
            @input=${e=>r.onFiltersChange({activeMinutes:e.target.value,limit:r.limit,includeGlobal:r.includeGlobal,includeUnknown:r.includeUnknown})}
          />
        </label>
        <label class="field-inline">
          <span>Limit</span>
          <input
            style="width: 64px;"
            .value=${r.limit}
            @input=${e=>r.onFiltersChange({activeMinutes:r.activeMinutes,limit:e.target.value,includeGlobal:r.includeGlobal,includeUnknown:r.includeUnknown})}
          />
        </label>
        <label class="field-inline checkbox">
          <input
            type="checkbox"
            .checked=${r.includeGlobal}
            @change=${e=>r.onFiltersChange({activeMinutes:r.activeMinutes,limit:r.limit,includeGlobal:e.target.checked,includeUnknown:r.includeUnknown})}
          />
          <span>Global</span>
        </label>
        <label class="field-inline checkbox">
          <input
            type="checkbox"
            .checked=${r.includeUnknown}
            @change=${e=>r.onFiltersChange({activeMinutes:r.activeMinutes,limit:r.limit,includeGlobal:r.includeGlobal,includeUnknown:e.target.checked})}
          />
          <span>Unknown</span>
        </label>
      </div>

      ${r.error?e`<div class="callout danger" style="margin-bottom: 12px;">${r.error}</div>`:n}

      <div class="data-table-wrapper">
        <div class="data-table-toolbar">
          <div class="data-table-search">
            <input
              type="text"
              placeholder="Filter by key, label, kind…"
              .value=${r.searchQuery}
              @input=${e=>r.onSearchChange(e.target.value)}
            />
          </div>
        </div>

        ${r.selectedKeys.size>0?e`
              <div class="data-table-bulk-bar">
                <span>${r.selectedKeys.size} selected</span>
                <button class="btn btn--sm" @click=${r.onDeselectAll}>
                  ${t(`common.unselect`)}
                </button>
                <button
                  class="btn btn--sm danger"
                  ?disabled=${r.loading}
                  @click=${r.onDeleteSelected}
                >
                  ${c.trash} Delete
                </button>
              </div>
            `:n}

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="data-table-checkbox-col">
                  ${l.length>0?e`<input
                        type="checkbox"
                        .checked=${l.length>0&&l.every(e=>r.selectedKeys.has(e.key))}
                        .indeterminate=${l.some(e=>r.selectedKeys.has(e.key))&&!l.every(e=>r.selectedKeys.has(e.key))}
                        @change=${()=>{l.every(e=>r.selectedKeys.has(e.key))?r.onDeselectPage(l.map(e=>e.key)):r.onSelectPage(l.map(e=>e.key))}}
                        aria-label="Select all on page"
                      />`:n}
                </th>
                ${u(`key`,`Key`,`data-table-key-col`)}
                <th>Label</th>
                ${u(`kind`,`Kind`)} ${u(`updated`,`Updated`)}
                ${u(`tokens`,`Tokens`)}
                <th>Compaction</th>
                <th>Thinking</th>
                <th>Fast</th>
                <th>Verbose</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              ${l.length===0?e`
                    <tr>
                      <td
                        colspan="11"
                        style="text-align: center; padding: 48px 16px; color: var(--muted)"
                      >
                        No sessions found.
                      </td>
                    </tr>
                  `:l.flatMap(e=>E(e,r))}
            </tbody>
          </table>
        </div>

        ${a>0?e`
              <div class="data-table-pagination">
                <div class="data-table-pagination__info">
                  ${s*r.pageSize+1}-${Math.min((s+1)*r.pageSize,a)}
                  of ${a} row${a===1?``:`s`}
                </div>
                <div class="data-table-pagination__controls">
                  <select
                    style="height: 32px; padding: 0 8px; font-size: 13px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--card);"
                    .value=${String(r.pageSize)}
                    @change=${e=>r.onPageSizeChange(Number(e.target.value))}
                  >
                    ${m.map(t=>e`<option value=${t}>${t} per page</option>`)}
                  </select>
                  <button ?disabled=${s<=0} @click=${()=>r.onPageChange(s-1)}>
                    Previous
                  </button>
                  <button
                    ?disabled=${s>=o-1}
                    @click=${()=>r.onPageChange(s+1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            `:n}
      </div>
    </section>
  `}function E(i,o){let c=i.updatedAt?a(i.updatedAt):t(`common.na`),u=i.thinkingLevel??``,m=u?h(u):``,b=v(g(i),m),x=i.fastMode===!0?`on`:i.fastMode===!1?`off`:``,S=v(f,x),T=i.verboseLevel??``,E=v(d,T),D=i.reasoningLevel??``,O=_(p,D),k=i.latestCompactionCheckpoint,A=i.compactionCheckpointCount??0,j=o.expandedCheckpointKey===i.key,M=o.checkpointItemsByKey[i.key]??[],N=o.checkpointErrorByKey[i.key],P=r(i.displayName)??null,F=r(i.label)??``,I=!!(P&&P!==i.key&&P!==F),L=i.kind!==`global`,R=L?`${s(`chat`,o.basePath)}?session=${encodeURIComponent(i.key)}`:null,z=i.kind===`direct`?`data-table-badge--direct`:i.kind===`group`?`data-table-badge--group`:i.kind===`global`?`data-table-badge--global`:`data-table-badge--unknown`;return[e`<tr>
      <td class="data-table-checkbox-col">
        <input
          type="checkbox"
          .checked=${o.selectedKeys.has(i.key)}
          @change=${()=>o.onToggleSelect(i.key)}
          aria-label="Select session"
        />
      </td>
      <td class="data-table-key-col">
        <div class="mono session-key-cell">
          ${L?e`<a
                href=${R}
                class="session-link"
                @click=${e=>{e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||o.onNavigateToChat&&(e.preventDefault(),o.onNavigateToChat(i.key))}}
                >${i.key}</a
              >`:i.key}
          ${I?e`<span class="muted session-key-display-name">${P}</span>`:n}
        </div>
      </td>
      <td>
        <input
          .value=${i.label??``}
          ?disabled=${o.loading}
          placeholder="(optional)"
          style="width: 100%; max-width: 140px; padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm);"
          @change=${e=>{let t=r(e.target.value)??null;o.onPatch(i.key,{label:t})}}
        />
      </td>
      <td>
        <span class="data-table-badge ${z}">${i.kind}</span>
      </td>
      <td>${c}</td>
      <td>${l(i)}</td>
      <td>
        <div style="display: grid; gap: 6px;">
          <span class="muted" style="font-size: 12px;">
            ${A>0?`${A} checkpoint${A===1?``:`s`}`:`none`}
          </span>
          ${k?e`
                <span style="font-size: 12px;">
                  ${C(k.reason)} ·
                  ${a(k.createdAt)}
                </span>
              `:n}
          <button
            class="btn btn--sm"
            ?disabled=${o.checkpointLoadingKey===i.key}
            @click=${()=>o.onToggleCheckpointDetails(i.key)}
          >
            ${j?`Hide checkpoints`:`Show checkpoints`}
          </button>
        </div>
      </td>
      <td>
        <select
          ?disabled=${o.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;o.onPatch(i.key,{thinkingLevel:y(t)})}}
        >
          ${b.map(t=>e`<option value=${t.value} ?selected=${m===t.value}>
                ${t.label}
              </option>`)}
        </select>
      </td>
      <td>
        <select
          ?disabled=${o.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;o.onPatch(i.key,{fastMode:t===``?null:t===`on`})}}
        >
          ${S.map(t=>e`<option value=${t.value} ?selected=${x===t.value}>
                ${t.label}
              </option>`)}
        </select>
      </td>
      <td>
        <select
          ?disabled=${o.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;o.onPatch(i.key,{verboseLevel:t||null})}}
        >
          ${E.map(t=>e`<option value=${t.value} ?selected=${T===t.value}>
                ${t.label}
              </option>`)}
        </select>
      </td>
      <td>
        <select
          ?disabled=${o.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;o.onPatch(i.key,{reasoningLevel:t||null})}}
        >
          ${O.map(t=>e`<option value=${t} ?selected=${D===t}>
                ${t||`inherit`}
              </option>`)}
        </select>
      </td>
    </tr>`,...j?[e`<tr>
            <td colspan="11" style="padding: 0;">
              <div
                style="padding: 14px 16px; border-top: 1px solid var(--border); background: var(--surface-2, rgba(127, 127, 127, 0.05));"
              >
                ${o.checkpointLoadingKey===i.key?e`<div class="muted">Loading checkpoints…</div>`:N?e`<div class="callout danger">${N}</div>`:M.length===0?e`<div class="muted">
                          No compaction checkpoints recorded for this session.
                        </div>`:e`
                          <div style="display: grid; gap: 10px;">
                            ${M.map(t=>e`
                                <div
                                  style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; display: grid; gap: 8px;"
                                >
                                  <div
                                    style="display: flex; gap: 8px; justify-content: space-between; align-items: center; flex-wrap: wrap;"
                                  >
                                    <strong>
                                      ${C(t.reason)} ·
                                      ${a(t.createdAt)}
                                    </strong>
                                    <span class="muted" style="font-size: 12px;">
                                      ${w(t)}
                                    </span>
                                  </div>
                                  ${t.summary?e`<div style="white-space: pre-wrap;">
                                        ${t.summary}
                                      </div>`:e`<div class="muted">No summary captured.</div>`}
                                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <button
                                      class="btn btn--sm"
                                      ?disabled=${o.checkpointBusyKey===t.checkpointId}
                                      @click=${()=>o.onBranchFromCheckpoint(i.key,t.checkpointId)}
                                    >
                                      Branch from checkpoint
                                    </button>
                                    <button
                                      class="btn btn--sm"
                                      ?disabled=${o.checkpointBusyKey===t.checkpointId}
                                      @click=${()=>o.onRestoreCheckpoint(i.key,t.checkpointId)}
                                    >
                                      Restore
                                    </button>
                                  </div>
                                </div>
                              `)}
                          </div>
                        `}
              </div>
            </td>
          </tr>`]:[]]}export{T as renderSessions};
//# sourceMappingURL=sessions-DVqTjKNU.js.map