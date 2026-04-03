import{directive as i}from"lit/directive.js";import{AsyncDirective as t}from"lit/async-directive.js";import{Signal as s}from"signal-polyfill";
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let o=!1;const n=new s.subtle.Watcher(async()=>{o||(o=!0,queueMicrotask(()=>{o=!1;for(const i of n.getPending())i.get();n.watch()}))});class r extends t{_$S_(){var i,t;void 0===this._$Sm&&(this._$Sj=new s.Computed(()=>{var i;const t=null===(i=this._$SW)||void 0===i?void 0:i.get();return this.setValue(t),t}),this._$Sm=null!==(t=null===(i=this._$Sk)||void 0===i?void 0:i.h)&&void 0!==t?t:n,this._$Sm.watch(this._$Sj),s.subtle.untrack(()=>{var i;return null===(i=this._$Sj)||void 0===i?void 0:i.get()}))}_$Sp(){void 0!==this._$Sm&&(this._$Sm.unwatch(this._$SW),this._$Sm=void 0)}render(i){return s.subtle.untrack(()=>i.get())}update(i,[t]){var o,n;return null!==(o=this._$Sk)&&void 0!==o||(this._$Sk=null===(n=i.options)||void 0===n?void 0:n.host),t!==this._$SW&&void 0!==this._$SW&&this._$Sp(),this._$SW=t,this._$S_(),s.subtle.untrack(()=>this._$SW.get())}disconnected(){this._$Sp()}reconnected(){this._$S_()}}const h=i(r);export{r as WatchDirective,h as watch};
//# sourceMappingURL=watch.js.map
