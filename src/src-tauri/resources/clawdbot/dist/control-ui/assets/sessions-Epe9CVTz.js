import{f as e,r as t,u as n}from"./i18n-CBV1HzVj.js";import{u as r}from"./format-8X3T6jaJ.js";import{r as i,t as a}from"./string-coerce-BcFtIWA_.js";import{o}from"./navigation-D43qCMw3.js";import{t as s}from"./icons-C1s9fbQ1.js";import{s as c}from"./presenter-iVT0AIJi.js";var l=[``,`off`,`minimal`,`low`,`medium`,`high`,`xhigh`],u=[``,`off`,`on`],d=[{value:``,label:`inherit`},{value:`off`,label:`off (explicit)`},{value:`on`,label:`on`},{value:`full`,label:`full`}],f=[{value:``,label:`inherit`},{value:`on`,label:`on`},{value:`off`,label:`off`}],p=[``,`off`,`on`,`stream`],m=[10,25,50,100];function h(e){if(!e)return``;let t=a(e);return t===`z.ai`||t===`z-ai`?`zai`:t}function g(e){return h(e)===`zai`}function _(e){return g(e)?u:l}function v(e,t){return!t||e.includes(t)?[...e]:[...e,t]}function y(e,t){return!t||e.some(e=>e.value===t)?[...e]:[...e,{value:t,label:`${t} (custom)`}]}function b(e,t){return!t||!e||e===`off`?e:`on`}function x(e,t){return e?t&&e===`on`?`low`:e:null}function S(e,t){let n=a(t);return n?e.filter(e=>{let t=a(e.key),r=a(e.label),i=a(e.kind),o=a(e.displayName);return t.includes(n)||r.includes(n)||i.includes(n)||o.includes(n)}):e}function C(e,t,n){let r=n===`asc`?1:-1;return[...e].toSorted((e,n)=>{let i=0;switch(t){case`key`:i=(e.key??``).localeCompare(n.key??``);break;case`kind`:i=(e.kind??``).localeCompare(n.kind??``);break;case`updated`:i=(e.updatedAt??0)-(n.updatedAt??0);break;case`tokens`:i=(e.totalTokens??e.inputTokens??e.outputTokens??0)-(n.totalTokens??n.inputTokens??n.outputTokens??0);break}return i*r})}function w(e,t,n){let r=t*n;return e.slice(r,r+n)}function T(e){switch(e){case`manual`:return`manual`;case`auto-threshold`:return`auto-threshold`;case`overflow-retry`:return`overflow retry`;case`timeout-retry`:return`timeout retry`;default:return e}}function E(e){return typeof e.tokensBefore==`number`&&typeof e.tokensAfter==`number`&&Number.isFinite(e.tokensBefore)&&Number.isFinite(e.tokensAfter)?`${e.tokensBefore.toLocaleString()} → ${e.tokensAfter.toLocaleString()} tokens`:typeof e.tokensBefore==`number`&&Number.isFinite(e.tokensBefore)?`${e.tokensBefore.toLocaleString()} tokens before`:`token delta unavailable`}function D(r){let i=C(S(r.result?.sessions??[],r.searchQuery),r.sortColumn,r.sortDir),a=i.length,o=Math.max(1,Math.ceil(a/r.pageSize)),c=Math.min(r.page,o-1),l=w(i,c,r.pageSize),u=(t,n,i=``)=>{let a=r.sortColumn===t,o=a&&r.sortDir===`asc`?`desc`:`asc`;return e`
      <th
        class=${i}
        data-sortable
        data-sort-dir=${a?r.sortDir:``}
        @click=${()=>r.onSortChange(t,a?o:`desc`)}
      >
        ${n}
        <span class="data-table-sort-icon">${s.arrowUpDown}</span>
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
                  ${s.trash} Delete
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
                  `:l.flatMap(e=>O(e,r))}
            </tbody>
          </table>
        </div>

        ${a>0?e`
              <div class="data-table-pagination">
                <div class="data-table-pagination__info">
                  ${c*r.pageSize+1}-${Math.min((c+1)*r.pageSize,a)}
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
                  <button ?disabled=${c<=0} @click=${()=>r.onPageChange(c-1)}>
                    Previous
                  </button>
                  <button
                    ?disabled=${c>=o-1}
                    @click=${()=>r.onPageChange(c+1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            `:n}
      </div>
    </section>
  `}function O(a,s){let l=a.updatedAt?r(a.updatedAt):t(`common.na`),u=a.thinkingLevel??``,m=g(a.modelProvider),h=b(u,m),S=v(_(a.modelProvider),h),C=a.fastMode===!0?`on`:a.fastMode===!1?`off`:``,w=y(f,C),D=a.verboseLevel??``,O=y(d,D),k=a.reasoningLevel??``,A=v(p,k),j=a.latestCompactionCheckpoint,M=a.compactionCheckpointCount??0,N=s.expandedCheckpointKey===a.key,P=s.checkpointItemsByKey[a.key]??[],F=s.checkpointErrorByKey[a.key],I=i(a.displayName)??null,L=i(a.label)??``,R=!!(I&&I!==a.key&&I!==L),z=a.kind!==`global`,B=z?`${o(`chat`,s.basePath)}?session=${encodeURIComponent(a.key)}`:null,V=a.kind===`direct`?`data-table-badge--direct`:a.kind===`group`?`data-table-badge--group`:a.kind===`global`?`data-table-badge--global`:`data-table-badge--unknown`;return[e`<tr>
      <td class="data-table-checkbox-col">
        <input
          type="checkbox"
          .checked=${s.selectedKeys.has(a.key)}
          @change=${()=>s.onToggleSelect(a.key)}
          aria-label="Select session"
        />
      </td>
      <td class="data-table-key-col">
        <div class="mono session-key-cell">
          ${z?e`<a
                href=${B}
                class="session-link"
                @click=${e=>{e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||s.onNavigateToChat&&(e.preventDefault(),s.onNavigateToChat(a.key))}}
                >${a.key}</a
              >`:a.key}
          ${R?e`<span class="muted session-key-display-name">${I}</span>`:n}
        </div>
      </td>
      <td>
        <input
          .value=${a.label??``}
          ?disabled=${s.loading}
          placeholder="(optional)"
          style="width: 100%; max-width: 140px; padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm);"
          @change=${e=>{let t=i(e.target.value)??null;s.onPatch(a.key,{label:t})}}
        />
      </td>
      <td>
        <span class="data-table-badge ${V}">${a.kind}</span>
      </td>
      <td>${l}</td>
      <td>${c(a)}</td>
      <td>
        <div style="display: grid; gap: 6px;">
          <span class="muted" style="font-size: 12px;">
            ${M>0?`${M} checkpoint${M===1?``:`s`}`:`none`}
          </span>
          ${j?e`
                <span style="font-size: 12px;">
                  ${T(j.reason)} ·
                  ${r(j.createdAt)}
                </span>
              `:n}
          <button
            class="btn btn--sm"
            ?disabled=${s.checkpointLoadingKey===a.key}
            @click=${()=>s.onToggleCheckpointDetails(a.key)}
          >
            ${N?`Hide checkpoints`:`Show checkpoints`}
          </button>
        </div>
      </td>
      <td>
        <select
          ?disabled=${s.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;s.onPatch(a.key,{thinkingLevel:x(t,m)})}}
        >
          ${S.map(t=>e`<option value=${t} ?selected=${h===t}>
                ${t||`inherit`}
              </option>`)}
        </select>
      </td>
      <td>
        <select
          ?disabled=${s.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;s.onPatch(a.key,{fastMode:t===``?null:t===`on`})}}
        >
          ${w.map(t=>e`<option value=${t.value} ?selected=${C===t.value}>
                ${t.label}
              </option>`)}
        </select>
      </td>
      <td>
        <select
          ?disabled=${s.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;s.onPatch(a.key,{verboseLevel:t||null})}}
        >
          ${O.map(t=>e`<option value=${t.value} ?selected=${D===t.value}>
                ${t.label}
              </option>`)}
        </select>
      </td>
      <td>
        <select
          ?disabled=${s.loading}
          style="padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: var(--radius-sm); min-width: 90px;"
          @change=${e=>{let t=e.target.value;s.onPatch(a.key,{reasoningLevel:t||null})}}
        >
          ${A.map(t=>e`<option value=${t} ?selected=${k===t}>
                ${t||`inherit`}
              </option>`)}
        </select>
      </td>
    </tr>`,...N?[e`<tr>
            <td colspan="11" style="padding: 0;">
              <div
                style="padding: 14px 16px; border-top: 1px solid var(--border); background: var(--surface-2, rgba(127, 127, 127, 0.05));"
              >
                ${s.checkpointLoadingKey===a.key?e`<div class="muted">Loading checkpoints…</div>`:F?e`<div class="callout danger">${F}</div>`:P.length===0?e`<div class="muted">
                          No compaction checkpoints recorded for this session.
                        </div>`:e`
                          <div style="display: grid; gap: 10px;">
                            ${P.map(t=>e`
                                <div
                                  style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; display: grid; gap: 8px;"
                                >
                                  <div
                                    style="display: flex; gap: 8px; justify-content: space-between; align-items: center; flex-wrap: wrap;"
                                  >
                                    <strong>
                                      ${T(t.reason)} ·
                                      ${r(t.createdAt)}
                                    </strong>
                                    <span class="muted" style="font-size: 12px;">
                                      ${E(t)}
                                    </span>
                                  </div>
                                  ${t.summary?e`<div style="white-space: pre-wrap;">
                                        ${t.summary}
                                      </div>`:e`<div class="muted">No summary captured.</div>`}
                                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <button
                                      class="btn btn--sm"
                                      ?disabled=${s.checkpointBusyKey===t.checkpointId}
                                      @click=${()=>s.onBranchFromCheckpoint(a.key,t.checkpointId)}
                                    >
                                      Branch from checkpoint
                                    </button>
                                    <button
                                      class="btn btn--sm"
                                      ?disabled=${s.checkpointBusyKey===t.checkpointId}
                                      @click=${()=>s.onRestoreCheckpoint(a.key,t.checkpointId)}
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
          </tr>`]:[]]}export{D as renderSessions};
//# sourceMappingURL=sessions-Epe9CVTz.js.map