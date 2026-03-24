import { t as __commonJSMin } from "./chunk-DORXReHP.js";
//#region node_modules/@aws-sdk/nested-clients/package.json
var version = "3.996.13";
//#endregion
//#region node_modules/@aws-sdk/nested-clients/node_modules/@smithy/querystring-parser/dist-cjs/index.js
var require_dist_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	function parseQueryString(querystring) {
		const query = {};
		querystring = querystring.replace(/^\?/, "");
		if (querystring) for (const pair of querystring.split("&")) {
			let [key, value = null] = pair.split("=");
			key = decodeURIComponent(key);
			if (value) value = decodeURIComponent(value);
			if (!(key in query)) query[key] = value;
			else if (Array.isArray(query[key])) query[key].push(value);
			else query[key] = [query[key], value];
		}
		return query;
	}
	exports.parseQueryString = parseQueryString;
}));
//#endregion
//#region node_modules/@aws-sdk/nested-clients/node_modules/@smithy/url-parser/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	var querystringParser = require_dist_cjs$1();
	const parseUrl = (url) => {
		if (typeof url === "string") return parseUrl(new URL(url));
		const { hostname, pathname, port, protocol, search } = url;
		let query;
		if (search) query = querystringParser.parseQueryString(search);
		return {
			hostname,
			port: port ? parseInt(port) : void 0,
			protocol,
			path: pathname,
			query
		};
	};
	exports.parseUrl = parseUrl;
}));
//#endregion
export { version as n, require_dist_cjs as t };
