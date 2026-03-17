import{i as e,n as t}from"./lit-BZwq2xLD.js";import{d as n,l as r}from"./format-DeRVtGzv.js";import{M as i,c as a,j as o,l as s}from"./index-UvgeZ3yV.js";import{n as c,t as l}from"./channel-config-extras-UBRJa-vU.js";function u(e,t){let n=e;for(let e of t){if(!n)return null;let t=i(n);if(t===`object`){let t=n.properties??{};if(typeof e==`string`&&t[e]){n=t[e];continue}let r=n.additionalProperties;if(typeof e==`string`&&r&&typeof r==`object`){n=r;continue}return null}if(t===`array`){if(typeof e!=`number`)return null;n=(Array.isArray(n.items)?n.items[0]:n.items)??null;continue}return null}return n}function d(e,t){return c(e,t)??{}}var f=[`groupPolicy`,`streamMode`,`dmPolicy`];function p(t){let n=f.flatMap(e=>e in t?[[e,t[e]]]:[]);return n.length===0?null:e`
    <div class="status-list" style="margin-top: 12px;">
      ${n.map(([t,n])=>e`
          <div>
            <span class="label">${t}</span>
            <span>${l(n)}</span>
          </div>
        `)}
    </div>
  `}function m(t){let n=a(t.schema),r=n.schema;if(!r)return e`
      <div class="callout danger">Schema unavailable. Use Raw.</div>
    `;let i=u(r,[`channels`,t.channelId]);if(!i)return e`
      <div class="callout danger">Channel config schema unavailable.</div>
    `;let o=d(t.configValue??{},t.channelId);return e`
    <div class="config-form">
      ${s({schema:i,value:o,path:[`channels`,t.channelId],hints:t.uiHints,unsupported:new Set(n.unsupportedPaths),disabled:t.disabled,showLabel:!1,onPatch:t.onPatch})}
    </div>
    ${p(o)}
  `}function h(t){let{channelId:n,props:r}=t,i=r.configSaving||r.configSchemaLoading;return e`
    <div style="margin-top: 16px;">
      ${r.configSchemaLoading?e`
              <div class="muted">Loading config schema…</div>
            `:m({channelId:n,configValue:r.configForm,schema:r.configSchema,uiHints:r.configUiHints,disabled:i,onPatch:r.onConfigPatch})}
      <div class="row" style="margin-top: 12px;">
        <button
          class="btn primary"
          ?disabled=${i||!r.configFormDirty}
          @click=${()=>r.onConfigSave()}
        >
          ${r.configSaving?`Saving…`:`Save`}
        </button>
        <button
          class="btn"
          ?disabled=${i}
          @click=${()=>r.onConfigReload()}
        >
          Reload
        </button>
      </div>
    </div>
  `}function g(n){let{props:i,discord:a,accountCountLabel:o}=n;return e`
    <div class="card">
      <div class="card-title">Discord</div>
      <div class="card-sub">Bot status and channel configuration.</div>
      ${o}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${a?.configured?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${a?.running?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${a?.lastStartAt?r(a.lastStartAt):`n/a`}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${a?.lastProbeAt?r(a.lastProbeAt):`n/a`}</span>
        </div>
      </div>

      ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${a.lastError}
          </div>`:t}

      ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
            Probe ${a.probe.ok?`ok`:`failed`} ·
            ${a.probe.status??``} ${a.probe.error??``}
          </div>`:t}

      ${h({channelId:`discord`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function _(n){let{props:i,googleChat:a,accountCountLabel:o}=n;return e`
    <div class="card">
      <div class="card-title">Google Chat</div>
      <div class="card-sub">Chat API webhook status and channel configuration.</div>
      ${o}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${a?a.configured?`Yes`:`No`:`n/a`}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${a?a.running?`Yes`:`No`:`n/a`}</span>
        </div>
        <div>
          <span class="label">Credential</span>
          <span>${a?.credentialSource??`n/a`}</span>
        </div>
        <div>
          <span class="label">Audience</span>
          <span>
            ${a?.audienceType?`${a.audienceType}${a.audience?` · ${a.audience}`:``}`:`n/a`}
          </span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${a?.lastStartAt?r(a.lastStartAt):`n/a`}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${a?.lastProbeAt?r(a.lastProbeAt):`n/a`}</span>
        </div>
      </div>

      ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${a.lastError}
          </div>`:t}

      ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
            Probe ${a.probe.ok?`ok`:`failed`} ·
            ${a.probe.status??``} ${a.probe.error??``}
          </div>`:t}

      ${h({channelId:`googlechat`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function v(n){let{props:i,imessage:a,accountCountLabel:o}=n;return e`
    <div class="card">
      <div class="card-title">iMessage</div>
      <div class="card-sub">macOS bridge status and channel configuration.</div>
      ${o}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${a?.configured?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${a?.running?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${a?.lastStartAt?r(a.lastStartAt):`n/a`}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${a?.lastProbeAt?r(a.lastProbeAt):`n/a`}</span>
        </div>
      </div>

      ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${a.lastError}
          </div>`:t}

      ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
            Probe ${a.probe.ok?`ok`:`failed`} ·
            ${a.probe.error??``}
          </div>`:t}

      ${h({channelId:`imessage`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function y(e){return e?e.length<=20?e:`${e.slice(0,8)}...${e.slice(-8)}`:`n/a`}function b(n){let{props:i,nostr:a,nostrAccounts:s,accountCountLabel:c,profileFormState:l,profileFormCallbacks:u,onEditProfile:d}=n,f=s[0],p=a?.configured??f?.configured??!1,m=a?.running??f?.running??!1,g=a?.publicKey??f?.publicKey,_=a?.lastStartAt??f?.lastStartAt??null,v=a?.lastError??f?.lastError??null,b=s.length>1,x=l!=null,S=n=>{let i=n.publicKey,a=n.profile;return e`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">${a?.displayName??a?.name??n.name??n.accountId}</div>
          <div class="account-card-id">${n.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">Running</span>
            <span>${n.running?`Yes`:`No`}</span>
          </div>
          <div>
            <span class="label">Configured</span>
            <span>${n.configured?`Yes`:`No`}</span>
          </div>
          <div>
            <span class="label">Public Key</span>
            <span class="monospace" title="${i??``}">${y(i)}</span>
          </div>
          <div>
            <span class="label">Last inbound</span>
            <span>${n.lastInboundAt?r(n.lastInboundAt):`n/a`}</span>
          </div>
          ${n.lastError?e`
                <div class="account-card-error">${n.lastError}</div>
              `:t}
        </div>
      </div>
    `};return e`
    <div class="card">
      <div class="card-title">Nostr</div>
      <div class="card-sub">Decentralized DMs via Nostr relays (NIP-04).</div>
      ${c}

      ${b?e`
            <div class="account-card-list">
              ${s.map(e=>S(e))}
            </div>
          `:e`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">Configured</span>
                <span>${p?`Yes`:`No`}</span>
              </div>
              <div>
                <span class="label">Running</span>
                <span>${m?`Yes`:`No`}</span>
              </div>
              <div>
                <span class="label">Public Key</span>
                <span class="monospace" title="${g??``}"
                  >${y(g)}</span
                >
              </div>
              <div>
                <span class="label">Last start</span>
                <span>${_?r(_):`n/a`}</span>
              </div>
            </div>
          `}

      ${v?e`<div class="callout danger" style="margin-top: 12px;">${v}</div>`:t}

      ${(()=>{if(x&&u)return o({state:l,callbacks:u,accountId:s[0]?.accountId??`default`});let{name:n,displayName:r,about:i,picture:c,nip05:m}=f?.profile??a?.profile??{},h=n||r||i||c||m;return e`
      <div style="margin-top: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: 500;">Profile</div>
          ${p?e`
                <button
                  class="btn btn-sm"
                  @click=${d}
                  style="font-size: 12px; padding: 4px 8px;"
                >
                  Edit Profile
                </button>
              `:t}
        </div>
        ${h?e`
              <div class="status-list">
                ${c?e`
                      <div style="margin-bottom: 8px;">
                        <img
                          src=${c}
                          alt="Profile picture"
                          style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"
                          @error=${e=>{e.target.style.display=`none`}}
                        />
                      </div>
                    `:t}
                ${n?e`<div><span class="label">Name</span><span>${n}</span></div>`:t}
                ${r?e`<div><span class="label">Display Name</span><span>${r}</span></div>`:t}
                ${i?e`<div><span class="label">About</span><span style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${i}</span></div>`:t}
                ${m?e`<div><span class="label">NIP-05</span><span>${m}</span></div>`:t}
              </div>
            `:e`
                <div style="color: var(--text-muted); font-size: 13px">
                  No profile set. Click "Edit Profile" to add your name, bio, and avatar.
                </div>
              `}
      </div>
    `})()}

      ${h({channelId:`nostr`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!1)}>Refresh</button>
      </div>
    </div>
  `}function x(e,t){let n=t.snapshot,r=n?.channels;if(!n||!r)return!1;let i=r[e],a=typeof i?.configured==`boolean`&&i.configured,o=typeof i?.running==`boolean`&&i.running,s=typeof i?.connected==`boolean`&&i.connected,c=(n.channelAccounts?.[e]??[]).some(e=>e.configured||e.running||e.connected);return a||o||s||c}function S(e,t){return t?.[e]?.length??0}function C(n,r){let i=S(n,r);return i<2?t:e`<div class="account-count">Accounts (${i})</div>`}function w(n){let{props:i,signal:a,accountCountLabel:o}=n;return e`
    <div class="card">
      <div class="card-title">Signal</div>
      <div class="card-sub">signal-cli status and channel configuration.</div>
      ${o}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${a?.configured?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${a?.running?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Base URL</span>
          <span>${a?.baseUrl??`n/a`}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${a?.lastStartAt?r(a.lastStartAt):`n/a`}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${a?.lastProbeAt?r(a.lastProbeAt):`n/a`}</span>
        </div>
      </div>

      ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${a.lastError}
          </div>`:t}

      ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
            Probe ${a.probe.ok?`ok`:`failed`} ·
            ${a.probe.status??``} ${a.probe.error??``}
          </div>`:t}

      ${h({channelId:`signal`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function T(n){let{props:i,slack:a,accountCountLabel:o}=n;return e`
    <div class="card">
      <div class="card-title">Slack</div>
      <div class="card-sub">Socket mode status and channel configuration.</div>
      ${o}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${a?.configured?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${a?.running?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${a?.lastStartAt?r(a.lastStartAt):`n/a`}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${a?.lastProbeAt?r(a.lastProbeAt):`n/a`}</span>
        </div>
      </div>

      ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${a.lastError}
          </div>`:t}

      ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
            Probe ${a.probe.ok?`ok`:`failed`} ·
            ${a.probe.status??``} ${a.probe.error??``}
          </div>`:t}

      ${h({channelId:`slack`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function E(n){let{props:i,telegram:a,telegramAccounts:o,accountCountLabel:s}=n,c=o.length>1,l=n=>{let i=n.probe?.bot?.username,a=n.name||n.accountId;return e`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">
            ${i?`@${i}`:a}
          </div>
          <div class="account-card-id">${n.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">Running</span>
            <span>${n.running?`Yes`:`No`}</span>
          </div>
          <div>
            <span class="label">Configured</span>
            <span>${n.configured?`Yes`:`No`}</span>
          </div>
          <div>
            <span class="label">Last inbound</span>
            <span>${n.lastInboundAt?r(n.lastInboundAt):`n/a`}</span>
          </div>
          ${n.lastError?e`
                <div class="account-card-error">
                  ${n.lastError}
                </div>
              `:t}
        </div>
      </div>
    `};return e`
    <div class="card">
      <div class="card-title">Telegram</div>
      <div class="card-sub">Bot status and channel configuration.</div>
      ${s}

      ${c?e`
            <div class="account-card-list">
              ${o.map(e=>l(e))}
            </div>
          `:e`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">Configured</span>
                <span>${a?.configured?`Yes`:`No`}</span>
              </div>
              <div>
                <span class="label">Running</span>
                <span>${a?.running?`Yes`:`No`}</span>
              </div>
              <div>
                <span class="label">Mode</span>
                <span>${a?.mode??`n/a`}</span>
              </div>
              <div>
                <span class="label">Last start</span>
                <span>${a?.lastStartAt?r(a.lastStartAt):`n/a`}</span>
              </div>
              <div>
                <span class="label">Last probe</span>
                <span>${a?.lastProbeAt?r(a.lastProbeAt):`n/a`}</span>
              </div>
            </div>
          `}

      ${a?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${a.lastError}
          </div>`:t}

      ${a?.probe?e`<div class="callout" style="margin-top: 12px;">
            Probe ${a.probe.ok?`ok`:`failed`} ·
            ${a.probe.status??``} ${a.probe.error??``}
          </div>`:t}

      ${h({channelId:`telegram`,props:i})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>i.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function D(i){let{props:a,whatsapp:o,accountCountLabel:s}=i;return e`
    <div class="card">
      <div class="card-title">WhatsApp</div>
      <div class="card-sub">Link WhatsApp Web and monitor connection health.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${o?.configured?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Linked</span>
          <span>${o?.linked?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${o?.running?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Connected</span>
          <span>${o?.connected?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Last connect</span>
          <span>
            ${o?.lastConnectedAt?r(o.lastConnectedAt):`n/a`}
          </span>
        </div>
        <div>
          <span class="label">Last message</span>
          <span>
            ${o?.lastMessageAt?r(o.lastMessageAt):`n/a`}
          </span>
        </div>
        <div>
          <span class="label">Auth age</span>
          <span>
            ${o?.authAgeMs==null?`n/a`:n(o.authAgeMs)}
          </span>
        </div>
      </div>

      ${o?.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${o.lastError}
          </div>`:t}

      ${a.whatsappMessage?e`<div class="callout" style="margin-top: 12px;">
            ${a.whatsappMessage}
          </div>`:t}

      ${a.whatsappQrDataUrl?e`<div class="qr-wrap">
            <img src=${a.whatsappQrDataUrl} alt="WhatsApp QR" />
          </div>`:t}

      <div class="row" style="margin-top: 14px; flex-wrap: wrap;">
        <button
          class="btn primary"
          ?disabled=${a.whatsappBusy}
          @click=${()=>a.onWhatsAppStart(!1)}
        >
          ${a.whatsappBusy?`Working…`:`Show QR`}
        </button>
        <button
          class="btn"
          ?disabled=${a.whatsappBusy}
          @click=${()=>a.onWhatsAppStart(!0)}
        >
          Relink
        </button>
        <button
          class="btn"
          ?disabled=${a.whatsappBusy}
          @click=${()=>a.onWhatsAppWait()}
        >
          Wait for scan
        </button>
        <button
          class="btn danger"
          ?disabled=${a.whatsappBusy}
          @click=${()=>a.onWhatsAppLogout()}
        >
          Logout
        </button>
        <button class="btn" @click=${()=>a.onRefresh(!0)}>
          Refresh
        </button>
      </div>

      ${h({channelId:`whatsapp`,props:a})}
    </div>
  `}function O(n){let i=n.snapshot?.channels,a=i?.whatsapp??void 0,o=i?.telegram??void 0,s=i?.discord??null,c=i?.googlechat??null,l=i?.slack??null,u=i?.signal??null,d=i?.imessage??null,f=i?.nostr??null;return e`
    <section class="grid grid-cols-2">
      ${k(n.snapshot).map((e,t)=>({key:e,enabled:x(e,n),order:t})).toSorted((e,t)=>e.enabled===t.enabled?e.order-t.order:e.enabled?-1:1).map(e=>A(e.key,n,{whatsapp:a,telegram:o,discord:s,googlechat:c,slack:l,signal:u,imessage:d,nostr:f,channelAccounts:n.snapshot?.channelAccounts??null}))}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Channel health</div>
          <div class="card-sub">Channel status snapshots from the gateway.</div>
        </div>
        <div class="muted">${n.lastSuccessAt?r(n.lastSuccessAt):`n/a`}</div>
      </div>
      ${n.lastError?e`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:t}
      <pre class="code-block" style="margin-top: 12px;">
${n.snapshot?JSON.stringify(n.snapshot,null,2):`No snapshot yet.`}
      </pre>
    </section>
  `}function k(e){return e?.channelMeta?.length?e.channelMeta.map(e=>e.id):e?.channelOrder?.length?e.channelOrder:[`whatsapp`,`telegram`,`discord`,`googlechat`,`slack`,`signal`,`imessage`,`nostr`]}function A(e,t,n){let r=C(e,n.channelAccounts);switch(e){case`whatsapp`:return D({props:t,whatsapp:n.whatsapp,accountCountLabel:r});case`telegram`:return E({props:t,telegram:n.telegram,telegramAccounts:n.channelAccounts?.telegram??[],accountCountLabel:r});case`discord`:return g({props:t,discord:n.discord,accountCountLabel:r});case`googlechat`:return _({props:t,googleChat:n.googlechat,accountCountLabel:r});case`slack`:return T({props:t,slack:n.slack,accountCountLabel:r});case`signal`:return w({props:t,signal:n.signal,accountCountLabel:r});case`imessage`:return v({props:t,imessage:n.imessage,accountCountLabel:r});case`nostr`:{let e=n.channelAccounts?.nostr??[],i=e[0],a=i?.accountId??`default`,o=i?.profile??null,s=t.nostrProfileAccountId===a?t.nostrProfileFormState:null,c=s?{onFieldChange:t.onNostrProfileFieldChange,onSave:t.onNostrProfileSave,onImport:t.onNostrProfileImport,onCancel:t.onNostrProfileCancel,onToggleAdvanced:t.onNostrProfileToggleAdvanced}:null;return b({props:t,nostr:n.nostr,nostrAccounts:e,accountCountLabel:r,profileFormState:s,profileFormCallbacks:c,onEditProfile:()=>t.onNostrProfileEdit(a,o)})}default:return j(e,t,n.channelAccounts??{})}}function j(n,r,i){let a=N(r.snapshot,n),o=r.snapshot?.channels?.[n],s=typeof o?.configured==`boolean`?o.configured:void 0,c=typeof o?.running==`boolean`?o.running:void 0,l=typeof o?.connected==`boolean`?o.connected:void 0,u=typeof o?.lastError==`string`?o.lastError:void 0,d=i[n]??[];return e`
    <div class="card">
      <div class="card-title">${a}</div>
      <div class="card-sub">Channel status and configuration.</div>
      ${C(n,i)}

      ${d.length>0?e`
            <div class="account-card-list">
              ${d.map(e=>R(e))}
            </div>
          `:e`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">Configured</span>
                <span>${s==null?`n/a`:s?`Yes`:`No`}</span>
              </div>
              <div>
                <span class="label">Running</span>
                <span>${c==null?`n/a`:c?`Yes`:`No`}</span>
              </div>
              <div>
                <span class="label">Connected</span>
                <span>${l==null?`n/a`:l?`Yes`:`No`}</span>
              </div>
            </div>
          `}

      ${u?e`<div class="callout danger" style="margin-top: 12px;">
            ${u}
          </div>`:t}

      ${h({channelId:n,props:r})}
    </div>
  `}function M(e){return e?.channelMeta?.length?Object.fromEntries(e.channelMeta.map(e=>[e.id,e])):{}}function N(e,t){return M(e)[t]?.label??e?.channelLabels?.[t]??t}var P=600*1e3;function F(e){return e.lastInboundAt?Date.now()-e.lastInboundAt<P:!1}function I(e){return e.running?`Yes`:F(e)?`Active`:`No`}function L(e){return e.connected===!0?`Yes`:e.connected===!1?`No`:F(e)?`Active`:`n/a`}function R(n){let i=I(n),a=L(n);return e`
    <div class="account-card">
      <div class="account-card-header">
        <div class="account-card-title">${n.name||n.accountId}</div>
        <div class="account-card-id">${n.accountId}</div>
      </div>
      <div class="status-list account-card-status">
        <div>
          <span class="label">Running</span>
          <span>${i}</span>
        </div>
        <div>
          <span class="label">Configured</span>
          <span>${n.configured?`Yes`:`No`}</span>
        </div>
        <div>
          <span class="label">Connected</span>
          <span>${a}</span>
        </div>
        <div>
          <span class="label">Last inbound</span>
          <span>${n.lastInboundAt?r(n.lastInboundAt):`n/a`}</span>
        </div>
        ${n.lastError?e`
              <div class="account-card-error">
                ${n.lastError}
              </div>
            `:t}
      </div>
    </div>
  `}export{O as renderChannels};
//# sourceMappingURL=channels-CVtOMGr_.js.map