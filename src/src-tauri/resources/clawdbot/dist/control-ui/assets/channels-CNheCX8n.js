import{h as e,o as t,p as n}from"./string-coerce-C4mH-Yei.js";import{B as r,H as i,V as a,c as o,l as s,z as c}from"./index-DV4QBOU4.js";import{n as l,t as u}from"./channel-config-extras-9-Vez2TC.js";function d(e,t){let n=e;for(let e of t){if(!n)return null;let t=i(n);if(t===`object`){let t=n.properties??{};if(typeof e==`string`&&t[e]){n=t[e];continue}let r=n.additionalProperties;if(typeof e==`string`&&r&&typeof r==`object`){n=r;continue}return null}if(t===`array`){if(typeof e!=`number`)return null;n=(Array.isArray(n.items)?n.items[0]:n.items)??null;continue}return null}return n}function f(e,t){return l(e,t)??{}}var p=[`groupPolicy`,`streamMode`,`dmPolicy`];function m(t){let n=p.flatMap(e=>e in t?[[e,t[e]]]:[]);return n.length===0?null:e`
    <div class="status-list" style="margin-top: 12px;">
      ${n.map(([t,n])=>e`
          <div>
            <span class="label">${t}</span>
            <span>${u(n)}</span>
          </div>
        `)}
    </div>
  `}function h(t){let n=o(t.schema),r=n.schema;if(!r)return e` <div class="callout danger">Schema unavailable. Use Raw.</div> `;let i=d(r,[`channels`,t.channelId]);if(!i)return e` <div class="callout danger">Channel config schema unavailable.</div> `;let a=f(t.configValue??{},t.channelId);return e`
    <div class="config-form">
      ${s({schema:i,value:a,path:[`channels`,t.channelId],hints:t.uiHints,unsupported:new Set(n.unsupportedPaths),disabled:t.disabled,showLabel:!1,onPatch:t.onPatch})}
    </div>
    ${m(a)}
  `}function g(n){let{channelId:r,props:i}=n,a=i.configSaving||i.configSchemaLoading;return e`
    <div style="margin-top: 16px;">
      ${i.configSchemaLoading?e` <div class="muted">Loading config schema…</div> `:h({channelId:r,configValue:i.configForm,schema:i.configSchema,uiHints:i.configUiHints,disabled:a,onPatch:i.onConfigPatch})}
      <div class="row" style="margin-top: 12px;">
        <button
          class="btn primary"
          ?disabled=${a||!i.configFormDirty}
          @click=${()=>i.onConfigSave()}
        >
          ${i.configSaving?`Saving…`:`Save`}
        </button>
        <button class="btn" ?disabled=${a} @click=${()=>i.onConfigReload()}>
          ${t(`common.reload`)}
        </button>
      </div>
    </div>
  `}function _(e,t){return t.snapshot?.channels?.[e]}function v(e,t){let n=t.snapshot?.channelAccounts?.[e]??[],r=t.snapshot?.channelDefaultAccountId?.[e];return(r?n.find(e=>e.accountId===r):void 0)??n[0]??null}function y(e,t){let n=_(e,t),r=t.snapshot?.channelAccounts?.[e]??[],i=v(e,t);return{configured:typeof n?.configured==`boolean`?n.configured:typeof i?.configured==`boolean`?i.configured:null,running:typeof n?.running==`boolean`?n.running:null,connected:typeof n?.connected==`boolean`?n.connected:null,defaultAccount:i,hasAnyActiveAccount:r.some(e=>e.configured||e.running||e.connected),status:n}}function b(e,t){if(!t.snapshot)return!1;let n=y(e,t);return n.configured===!0||n.running===!0||n.connected===!0||n.hasAnyActiveAccount}function x(e,t){return y(e,t).configured}function S(e){return t(e==null?`common.na`:e?`common.yes`:`common.no`)}function C(t){return e`
    <div class="card">
      <div class="card-title">${t.title}</div>
      <div class="card-sub">${t.subtitle}</div>
      ${t.accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        ${t.statusRows.map(t=>e`
            <div>
              <span class="label">${t.label}</span>
              <span>${t.value}</span>
            </div>
          `)}
      </div>

      ${t.lastError?e`<div class="callout danger" style="margin-top: 12px;">${t.lastError}</div>`:n}
      ${t.secondaryCallout??n} ${t.extraContent??n}
      ${t.configSection} ${t.footer??n}
    </div>
  `}function w(e,t){return t?.[e]?.length??0}function T(t,r){let i=w(t,r);return i<2?n:e`<div class="account-count">Accounts (${i})</div>`}function E(r){let{props:i,discord:a,accountCountLabel:o}=r,s=x(`discord`,i);return C({title:`Discord`,subtitle:`Bot status and channel configuration.`,accountCountLabel:o,statusRows:[{label:t(`common.configured`),value:S(s)},{label:t(`common.running`),value:a?.running?t(`common.yes`):t(`common.no`)},{label:t(`common.lastStart`),value:a?.lastStartAt?c(a.lastStartAt):t(`common.na`)},{label:t(`common.lastProbe`),value:a?.lastProbeAt?c(a.lastProbeAt):t(`common.na`)}],lastError:a?.lastError,secondaryCallout:a?.probe?e`<div class="callout" style="margin-top: 12px;">
          ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
          ${a.probe.status??``} ${a.probe.error??``}
        </div>`:n,configSection:g({channelId:`discord`,props:i}),footer:e`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
    </div>`})}function D(r){let{props:i,googleChat:a,accountCountLabel:o}=r,s=x(`googlechat`,i);return C({title:`Google Chat`,subtitle:`Chat API webhook status and channel configuration.`,accountCountLabel:o,statusRows:[{label:t(`common.configured`),value:S(s)},{label:t(`common.running`),value:a?a.running?t(`common.yes`):t(`common.no`):t(`common.na`)},{label:t(`common.credential`),value:a?.credentialSource??t(`common.na`)},{label:t(`common.audience`),value:a?.audienceType?`${a.audienceType}${a.audience?` · ${a.audience}`:``}`:t(`common.na`)},{label:t(`common.lastStart`),value:a?.lastStartAt?c(a.lastStartAt):t(`common.na`)},{label:t(`common.lastProbe`),value:a?.lastProbeAt?c(a.lastProbeAt):t(`common.na`)}],lastError:a?.lastError,secondaryCallout:a?.probe?e`<div class="callout" style="margin-top: 12px;">
          ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
          ${a.probe.status??``} ${a.probe.error??``}
        </div>`:n,configSection:g({channelId:`googlechat`,props:i}),footer:e`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
    </div>`})}function O(r){let{props:i,imessage:a,accountCountLabel:o}=r,s=x(`imessage`,i);return C({title:`iMessage`,subtitle:`macOS bridge status and channel configuration.`,accountCountLabel:o,statusRows:[{label:t(`common.configured`),value:S(s)},{label:t(`common.running`),value:a?.running?t(`common.yes`):t(`common.no`)},{label:t(`common.lastStart`),value:a?.lastStartAt?c(a.lastStartAt):t(`common.na`)},{label:t(`common.lastProbe`),value:a?.lastProbeAt?c(a.lastProbeAt):t(`common.na`)}],lastError:a?.lastError,secondaryCallout:a?.probe?e`<div class="callout" style="margin-top: 12px;">
          ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
          ${a.probe.error??``}
        </div>`:n,configSection:g({channelId:`imessage`,props:i}),footer:e`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
    </div>`})}function k(e){return e?e.length<=20?e:`${e.slice(0,8)}...${e.slice(-8)}`:t(`common.na`)}function A(r){let{props:i,nostr:o,nostrAccounts:s,accountCountLabel:l,profileFormState:u,profileFormCallbacks:d,onEditProfile:f}=r,p=s[0],m=o?.configured??p?.configured??!1,h=o?.running??p?.running??!1,_=o?.publicKey??p?.publicKey,v=o?.lastStartAt??p?.lastStartAt??null,y=o?.lastError??p?.lastError??null,b=s.length>1,x=u!=null,S=r=>{let i=r.publicKey,a=r.profile;return e`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">${a?.displayName??a?.name??r.name??r.accountId}</div>
          <div class="account-card-id">${r.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">${t(`common.running`)}</span>
            <span>${r.running?t(`common.yes`):t(`common.no`)}</span>
          </div>
          <div>
            <span class="label">${t(`common.configured`)}</span>
            <span>${r.configured?t(`common.yes`):t(`common.no`)}</span>
          </div>
          <div>
            <span class="label">${t(`common.publicKey`)}</span>
            <span class="monospace" title="${i??``}">${k(i)}</span>
          </div>
          <div>
            <span class="label">${t(`common.lastInbound`)}</span>
            <span
              >${r.lastInboundAt?c(r.lastInboundAt):t(`common.na`)}</span
            >
          </div>
          ${r.lastError?e` <div class="account-card-error">${r.lastError}</div> `:n}
        </div>
      </div>
    `};return e`
    <div class="card">
      <div class="card-title">Nostr</div>
      <div class="card-sub">Decentralized DMs via Nostr relays (NIP-04).</div>
      ${l}
      ${b?e`
            <div class="account-card-list">
              ${s.map(e=>S(e))}
            </div>
          `:e`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">${t(`common.configured`)}</span>
                <span>${t(m?`common.yes`:`common.no`)}</span>
              </div>
              <div>
                <span class="label">${t(`common.running`)}</span>
                <span>${t(h?`common.yes`:`common.no`)}</span>
              </div>
              <div>
                <span class="label">${t(`common.publicKey`)}</span>
                <span class="monospace" title="${_??``}"
                  >${k(_)}</span
                >
              </div>
              <div>
                <span class="label">${t(`common.lastStart`)}</span>
                <span>
                  ${v?c(v):t(`common.na`)}
                </span>
              </div>
            </div>
          `}
      ${y?e`<div class="callout danger" style="margin-top: 12px;">${y}</div>`:n}
      ${(()=>{if(x&&d)return a({state:u,callbacks:d,accountId:s[0]?.accountId??`default`});let{name:r,displayName:i,about:c,picture:l,nip05:h}=p?.profile??o?.profile??{},g=r||i||c||l||h;return e`
      <div
        style="margin-top: 16px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-md);"
      >
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"
        >
          <div style="font-weight: 500;">${t(`channels.nostr.profile`)}</div>
          ${m?e`
                <button
                  class="btn btn--sm"
                  @click=${f}
                  style="font-size: 12px; padding: 4px 8px;"
                >
                  ${t(`channels.nostr.editProfile`)}
                </button>
              `:n}
        </div>
        ${g?e`
              <div class="status-list">
                ${l?e`
                      <div style="margin-bottom: 8px;">
                        <img
                          src=${l}
                          alt=${t(`channels.nostr.profilePicture`)}
                          style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"
                          @error=${e=>{e.target.style.display=`none`}}
                        />
                      </div>
                    `:n}
                ${r?e`<div>
                      <span class="label">${t(`channels.nostr.name`)}</span><span>${r}</span>
                    </div>`:n}
                ${i?e`<div>
                      <span class="label">${t(`channels.nostr.displayName`)}</span
                      ><span>${i}</span>
                    </div>`:n}
                ${c?e`<div>
                      <span class="label">${t(`channels.nostr.about`)}</span
                      ><span style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;"
                        >${c}</span
                      >
                    </div>`:n}
                ${h?e`<div><span class="label">NIP-05</span><span>${h}</span></div>`:n}
              </div>
            `:e`
              <div style="color: var(--text-muted); font-size: 13px">
                ${t(`channels.nostr.noProfile`)} ${t(`channels.nostr.noProfileHint`)}
              </div>
            `}
      </div>
    `})()} ${g({channelId:`nostr`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!1)}>${t(`common.refresh`)}</button>
      </div>
    </div>
  `}function j(r){let{props:i,signal:a,accountCountLabel:o}=r,s=x(`signal`,i);return C({title:`Signal`,subtitle:`signal-cli status and channel configuration.`,accountCountLabel:o,statusRows:[{label:t(`common.configured`),value:S(s)},{label:t(`common.running`),value:a?.running?t(`common.yes`):t(`common.no`)},{label:t(`common.baseUrl`),value:a?.baseUrl??t(`common.na`)},{label:t(`common.lastStart`),value:a?.lastStartAt?c(a.lastStartAt):t(`common.na`)},{label:t(`common.lastProbe`),value:a?.lastProbeAt?c(a.lastProbeAt):t(`common.na`)}],lastError:a?.lastError,secondaryCallout:a?.probe?e`<div class="callout" style="margin-top: 12px;">
          ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
          ${a.probe.status??``} ${a.probe.error??``}
        </div>`:n,configSection:g({channelId:`signal`,props:i}),footer:e`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
    </div>`})}function M(r){let{props:i,slack:a,accountCountLabel:o}=r,s=x(`slack`,i);return C({title:`Slack`,subtitle:`Socket mode status and channel configuration.`,accountCountLabel:o,statusRows:[{label:t(`common.configured`),value:S(s)},{label:t(`common.running`),value:a?.running?t(`common.yes`):t(`common.no`)},{label:t(`common.lastStart`),value:a?.lastStartAt?c(a.lastStartAt):t(`common.na`)},{label:t(`common.lastProbe`),value:a?.lastProbeAt?c(a.lastProbeAt):t(`common.na`)}],lastError:a?.lastError,secondaryCallout:a?.probe?e`<div class="callout" style="margin-top: 12px;">
          ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
          ${a.probe.status??``} ${a.probe.error??``}
        </div>`:n,configSection:g({channelId:`slack`,props:i}),footer:e`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
    </div>`})}function N(r){let{props:i,telegram:a,telegramAccounts:o,accountCountLabel:s}=r,l=o.length>1,u=x(`telegram`,i),d=r=>{let i=r.probe?.bot?.username,a=r.name||r.accountId;return e`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">${i?`@${i}`:a}</div>
          <div class="account-card-id">${r.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">${t(`common.running`)}</span>
            <span>${r.running?t(`common.yes`):t(`common.no`)}</span>
          </div>
          <div>
            <span class="label">${t(`common.configured`)}</span>
            <span>${r.configured?t(`common.yes`):t(`common.no`)}</span>
          </div>
          <div>
            <span class="label">${t(`common.lastInbound`)}</span>
            <span
              >${r.lastInboundAt?c(r.lastInboundAt):t(`common.na`)}</span
            >
          </div>
          ${r.lastError?e` <div class="account-card-error">${r.lastError}</div> `:n}
        </div>
      </div>
    `};return l?e`
      <div class="card">
        <div class="card-title">Telegram</div>
        <div class="card-sub">Bot status and channel configuration.</div>
        ${s}

        <div class="account-card-list">
          ${o.map(e=>d(e))}
        </div>

        ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">${a.lastError}</div>`:n}
        ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
              ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
              ${a.probe.status??``} ${a.probe.error??``}
            </div>`:n}
        ${g({channelId:`telegram`,props:i})}

        <div class="row" style="margin-top: 12px;">
          <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
        </div>
      </div>
    `:C({title:`Telegram`,subtitle:`Bot status and channel configuration.`,accountCountLabel:s,statusRows:[{label:t(`common.configured`),value:S(u)},{label:t(`common.running`),value:a?.running?t(`common.yes`):t(`common.no`)},{label:t(`common.mode`),value:a?.mode??t(`common.na`)},{label:t(`common.lastStart`),value:a?.lastStartAt?c(a.lastStartAt):t(`common.na`)},{label:t(`common.lastProbe`),value:a?.lastProbeAt?c(a.lastProbeAt):t(`common.na`)}],lastError:a?.lastError,secondaryCallout:a?.probe?e`<div class="callout" style="margin-top: 12px;">
          ${a.probe.ok?t(`common.probeOk`):t(`common.probeFailed`)} ·
          ${a.probe.status??``} ${a.probe.error??``}
        </div>`:n,configSection:g({channelId:`telegram`,props:i}),footer:e`<div class="row" style="margin-top: 12px;">
      <button class="btn" @click=${()=>i.onRefresh(!0)}>${t(`common.probe`)}</button>
    </div>`})}function P(i){let{props:a,whatsapp:o,accountCountLabel:s}=i,l=x(`whatsapp`,a);return C({title:`WhatsApp`,subtitle:`Link WhatsApp Web and monitor connection health.`,accountCountLabel:s,statusRows:[{label:t(`common.configured`),value:S(l)},{label:t(`common.linked`),value:o?.linked?t(`common.yes`):t(`common.no`)},{label:t(`common.running`),value:o?.running?t(`common.yes`):t(`common.no`)},{label:t(`common.connected`),value:o?.connected?t(`common.yes`):t(`common.no`)},{label:t(`common.lastConnect`),value:o?.lastConnectedAt?c(o.lastConnectedAt):t(`common.na`)},{label:t(`common.lastMessage`),value:o?.lastMessageAt?c(o.lastMessageAt):t(`common.na`)},{label:t(`common.authAge`),value:o?.authAgeMs==null?t(`common.na`):r(o.authAgeMs)}],lastError:o?.lastError,extraContent:e`
      ${a.whatsappMessage?e`<div class="callout" style="margin-top: 12px;">${a.whatsappMessage}</div>`:n}
      ${a.whatsappQrDataUrl?e`<div class="qr-wrap">
            <img src=${a.whatsappQrDataUrl} alt="WhatsApp QR" />
          </div>`:n}
    `,configSection:g({channelId:`whatsapp`,props:a}),footer:e`<div class="row" style="margin-top: 14px; flex-wrap: wrap;">
      <button
        class="btn primary"
        ?disabled=${a.whatsappBusy}
        @click=${()=>a.onWhatsAppStart(!1)}
      >
        ${a.whatsappBusy?t(`common.working`):t(`common.showQr`)}
      </button>
      <button
        class="btn"
        ?disabled=${a.whatsappBusy}
        @click=${()=>a.onWhatsAppStart(!0)}
      >
        ${t(`common.relink`)}
      </button>
      <button class="btn" ?disabled=${a.whatsappBusy} @click=${()=>a.onWhatsAppWait()}>
        ${t(`common.waitForScan`)}
      </button>
      <button
        class="btn danger"
        ?disabled=${a.whatsappBusy}
        @click=${()=>a.onWhatsAppLogout()}
      >
        ${t(`common.logout`)}
      </button>
      <button class="btn" @click=${()=>a.onRefresh(!0)}>${t(`common.refresh`)}</button>
    </div>`})}function F(r){let i=r.snapshot?.channels,a=i?.whatsapp??void 0,o=i?.telegram??void 0,s=i?.discord??null,l=i?.googlechat??null,u=i?.slack??null,d=i?.signal??null,f=i?.imessage??null,p=i?.nostr??null;return e`
    <section class="grid grid-cols-2">
      ${I(r.snapshot).map((e,t)=>({key:e,enabled:b(e,r),order:t})).toSorted((e,t)=>e.enabled===t.enabled?e.order-t.order:e.enabled?-1:1).map(e=>L(e.key,r,{whatsapp:a,telegram:o,discord:s,googlechat:l,slack:u,signal:d,imessage:f,nostr:p,channelAccounts:r.snapshot?.channelAccounts??null}))}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">${t(`channels.health.title`)}</div>
          <div class="card-sub">${t(`channels.health.subtitle`)}</div>
        </div>
        <div class="muted">
          ${r.lastSuccessAt?c(r.lastSuccessAt):t(`common.na`)}
        </div>
      </div>
      ${r.lastError?e`<div class="callout danger" style="margin-top: 12px;">${r.lastError}</div>`:n}
      <pre class="code-block" style="margin-top: 12px;">
${r.snapshot?JSON.stringify(r.snapshot,null,2):t(`channels.health.noSnapshotYet`)}
      </pre
      >
    </section>
  `}function I(e){return e?.channelMeta?.length?e.channelMeta.map(e=>e.id):e?.channelOrder?.length?e.channelOrder:[`whatsapp`,`telegram`,`discord`,`googlechat`,`slack`,`signal`,`imessage`,`nostr`]}function L(e,t,n){let r=T(e,n.channelAccounts);switch(e){case`whatsapp`:return P({props:t,whatsapp:n.whatsapp,accountCountLabel:r});case`telegram`:return N({props:t,telegram:n.telegram,telegramAccounts:n.channelAccounts?.telegram??[],accountCountLabel:r});case`discord`:return E({props:t,discord:n.discord,accountCountLabel:r});case`googlechat`:return D({props:t,googleChat:n.googlechat,accountCountLabel:r});case`slack`:return M({props:t,slack:n.slack,accountCountLabel:r});case`signal`:return j({props:t,signal:n.signal,accountCountLabel:r});case`imessage`:return O({props:t,imessage:n.imessage,accountCountLabel:r});case`nostr`:{let e=n.channelAccounts?.nostr??[],i=e[0],a=i?.accountId??`default`,o=i?.profile??null,s=t.nostrProfileAccountId===a?t.nostrProfileFormState:null,c=s?{onFieldChange:t.onNostrProfileFieldChange,onSave:t.onNostrProfileSave,onImport:t.onNostrProfileImport,onCancel:t.onNostrProfileCancel,onToggleAdvanced:t.onNostrProfileToggleAdvanced}:null;return A({props:t,nostr:n.nostr,nostrAccounts:e,accountCountLabel:r,profileFormState:s,profileFormCallbacks:c,onEditProfile:()=>t.onNostrProfileEdit(a,o)})}default:return R(e,t,n.channelAccounts??{})}}function R(r,i,a){let o=B(i.snapshot,r),s=y(r,i),c=typeof s.status?.lastError==`string`?s.status.lastError:void 0,l=a[r]??[],u=T(r,a);return e`
    <div class="card">
      <div class="card-title">${o}</div>
      <div class="card-sub">${t(`channels.generic.subtitle`)}</div>
      ${u}
      ${l.length>0?e`
            <div class="account-card-list">
              ${l.map(e=>G(e))}
            </div>
          `:e`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">${t(`common.configured`)}</span>
                <span>${S(s.configured)}</span>
              </div>
              <div>
                <span class="label">${t(`common.running`)}</span>
                <span>${S(s.running)}</span>
              </div>
              <div>
                <span class="label">${t(`common.connected`)}</span>
                <span>${S(s.connected)}</span>
              </div>
            </div>
          `}
      ${c?e`<div class="callout danger" style="margin-top: 12px;">${c}</div>`:n}
      ${g({channelId:r,props:i})}
    </div>
  `}function z(e){return e?.channelMeta?.length?Object.fromEntries(e.channelMeta.map(e=>[e.id,e])):{}}function B(e,t){return z(e)[t]?.label??e?.channelLabels?.[t]??t}var V=600*1e3;function H(e){return e.lastInboundAt?Date.now()-e.lastInboundAt<V:!1}function U(e){return e.running?t(`common.yes`):H(e)?t(`common.active`):t(`common.no`)}function W(e){return e.connected===!0?t(`common.yes`):e.connected===!1?t(`common.no`):H(e)?t(`common.active`):t(`common.na`)}function G(r){let i=U(r),a=W(r);return e`
    <div class="account-card">
      <div class="account-card-header">
        <div class="account-card-title">${r.name||r.accountId}</div>
        <div class="account-card-id">${r.accountId}</div>
      </div>
      <div class="status-list account-card-status">
        <div>
          <span class="label">${t(`common.running`)}</span>
          <span>${i}</span>
        </div>
        <div>
          <span class="label">${t(`common.configured`)}</span>
          <span>${r.configured?t(`common.yes`):t(`common.no`)}</span>
        </div>
        <div>
          <span class="label">${t(`common.connected`)}</span>
          <span>${a}</span>
        </div>
        <div>
          <span class="label">${t(`common.lastInbound`)}</span>
          <span
            >${r.lastInboundAt?c(r.lastInboundAt):t(`common.na`)}</span
          >
        </div>
        ${r.lastError?e` <div class="account-card-error">${r.lastError}</div> `:n}
      </div>
    </div>
  `}export{F as renderChannels};
//# sourceMappingURL=channels-CNheCX8n.js.map