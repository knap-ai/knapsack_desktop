import{html as o,svg as t}from"lit/html.js";import{watch as s}from"./watch.js";import{Signal as i}from"signal-polyfill";
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const m=o=>(t,...m)=>o(t,...m.map(o=>o instanceof i.State||o instanceof i.Computed?s(o):o)),l=m(o),r=m(t);export{l as html,r as svg,m as withWatch};
//# sourceMappingURL=html-tag.js.map
