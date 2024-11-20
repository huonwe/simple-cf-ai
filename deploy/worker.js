var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __template = (cooked, raw2) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw2 || cooked.slice()) }));

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", 8);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((...paths) => {
  let p = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p[p.length - 1] === "/") {
      p = p.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p = `${p}/`;
    } else if (path !== "/") {
      p = `${p}${path}`;
    }
    if (path === "/" && p === "") {
      p = "/";
    }
  }
  return p;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (!path.match(/\:.+\?$/)) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var escapeRe = /[&<>'"]/;
var stringBufferToString = /* @__PURE__ */ __name(async (buffer, callbacks) => {
  let str = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
}, "stringBufferToString");
var escapeToBuffer = /* @__PURE__ */ __name((str, buffer) => {
  const match = str.search(escapeRe);
  if (match === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
}, "escapeToBuffer");
var resolveCallbackSync = /* @__PURE__ */ __name((str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
}, "resolveCallbackSync");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = /* @__PURE__ */ __name((headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
}, "setHeaders");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status = 200;
  #executionCtx;
  #headers;
  #preparedHeaders;
  #res;
  #isFresh = true;
  #layout;
  #renderer;
  #notFoundHandler;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      try {
        for (const [k, v] of this.#res.headers.entries()) {
          if (k === "content-type") {
            continue;
          }
          if (k === "set-cookie") {
            const cookies = this.#res.headers.getSetCookie();
            _res.headers.delete("set-cookie");
            for (const cookie of cookies) {
              _res.headers.append("set-cookie", cookie);
            }
          } else {
            _res.headers.set(k, v);
          }
        }
      } catch (e) {
        if (e instanceof TypeError && e.message.includes("immutable")) {
          this.res = new Response(_res.body, {
            headers: _res.headers,
            status: _res.status
          });
          return;
        } else {
          throw e;
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v, k) => {
          if (k === "set-cookie") {
            header.append(k, v);
          } else {
            header.set(k, v);
          }
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v, k) => {
        if (k === "set-cookie") {
          this.#headers?.append(k, v);
        } else {
          this.#headers?.set(k, v);
        }
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") {
        this.#headers.set(k, v);
      } else {
        this.#headers.delete(k);
        for (const v2 of v) {
          this.#headers.append(k, v2);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.#newResponse(data, arg, headers) : this.#newResponse(data, arg);
  };
  text = (text, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    return typeof arg === "number" ? this.#newResponse(text, arg, headers) : this.#newResponse(text, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json; charset=UTF-8";
    return typeof arg === "number" ? this.#newResponse(body, arg, headers) : this.#newResponse(body, arg);
  };
  html = (html2, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html2 === "object") {
      return resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html22) => {
        return typeof arg === "number" ? this.#newResponse(html22, arg, headers) : this.#newResponse(html22, arg);
      });
    }
    return typeof arg === "number" ? this.#newResponse(html2, arg, headers) : this.#newResponse(html2, arg);
  };
  redirect = (location, status) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    const isContext = context instanceof Context;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        if (isContext) {
          context.req.routeIndex = i;
        }
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (!handler) {
        if (isContext && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && isContext && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/hono-base.js
var COMPOSED_HANDLER = Symbol("composedHandler");
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    return err.getResponse();
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = /* @__PURE__ */ Object.create(null);
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      if (Object.keys(curNode.#children).includes(p)) {
        curNode = curNode.#children[p];
        const pattern2 = getPattern(p);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.#children[p] = new Node2();
      const pattern = getPattern(p);
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[p];
    }
    const m = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      score: this.#order
    };
    m[method] = handlerSet;
    curNode.#methods.push(m);
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          const processed = processedSet[handlerSet.score];
          handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
          processedSet[handlerSet.score] = true;
        }
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = /* @__PURE__ */ Object.create(null);
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(
                  nextNode.#children["*"],
                  method,
                  node.#params,
                  /* @__PURE__ */ Object.create(null)
                )
              );
            }
            handlerSets.push(
              ...this.#getHandlerSets(nextNode, method, node.#params, /* @__PURE__ */ Object.create(null))
            );
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(
                ...this.#getHandlerSets(astNode, method, node.#params, /* @__PURE__ */ Object.create(null))
              );
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
            continue;
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [results.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      if (opts.allowMethods?.length) {
        set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: c.res.statusText
      });
    }
    await next();
  }, "cors2");
}, "cors");

// node_modules/hono/dist/utils/stream.js
var StreamingApi = /* @__PURE__ */ __name(class {
  writer;
  encoder;
  writable;
  abortSubscribers = [];
  responseReadable;
  aborted = false;
  closed = false;
  constructor(writable, _readable) {
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder();
    const reader = _readable.getReader();
    this.abortSubscribers.push(async () => {
      await reader.cancel();
    });
    this.responseReadable = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        done ? controller.close() : controller.enqueue(value);
      },
      cancel: () => {
        this.abort();
      }
    });
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch {
    }
    this.closed = true;
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
  onAbort(listener) {
    this.abortSubscribers.push(listener);
  }
  abort() {
    if (!this.aborted) {
      this.aborted = true;
      this.abortSubscribers.forEach((subscriber) => subscriber());
    }
  }
}, "StreamingApi");

// node_modules/hono/dist/helper/streaming/stream.js
var contextStash = /* @__PURE__ */ new WeakMap();
var stream = /* @__PURE__ */ __name((c, cb, onError) => {
  const { readable, writable } = new TransformStream();
  const stream2 = new StreamingApi(writable, readable);
  c.req.raw.signal.addEventListener("abort", () => {
    if (!stream2.closed) {
      stream2.abort();
    }
  });
  contextStash.set(stream2.responseReadable, c);
  (async () => {
    try {
      await cb(stream2);
    } catch (e) {
      if (e instanceof Error && onError) {
        await onError(e, stream2);
      } else {
        console.error(e);
      }
    } finally {
      stream2.close();
    }
  })();
  return c.newResponse(stream2.responseReadable);
}, "stream");

// node_modules/hono/dist/helper/streaming/text.js
var streamText = /* @__PURE__ */ __name((c, cb, onError) => {
  c.header("Content-Type", TEXT_PLAIN);
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Transfer-Encoding", "chunked");
  return stream(c, cb, onError);
}, "streamText");

// node_modules/eventsource-parser/dist/index.js
var __defProp2 = Object.defineProperty;
var __defNormalProp = /* @__PURE__ */ __name((obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value, "__defNormalProp");
var __publicField = /* @__PURE__ */ __name((obj, key, value) => __defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), "__publicField");
var ParseError = class extends Error {
  constructor(message, options) {
    super(message), __publicField(this, "type"), __publicField(this, "field"), __publicField(this, "value"), __publicField(this, "line"), this.name = "ParseError", this.type = options.type, this.field = options.field, this.value = options.value, this.line = options.line;
  }
};
__name(ParseError, "ParseError");
function noop(_arg) {
}
__name(noop, "noop");
function createParser(callbacks) {
  const { onEvent = noop, onError = noop, onRetry = noop, onComment } = callbacks;
  let incompleteLine = "", isFirstChunk = true, id, data = "", eventType = "";
  function feed(newChunk) {
    const chunk = isFirstChunk ? newChunk.replace(/^\xEF\xBB\xBF/, "") : newChunk, [complete, incomplete] = splitLines(`${incompleteLine}${chunk}`);
    for (const line of complete)
      parseLine(line);
    incompleteLine = incomplete, isFirstChunk = false;
  }
  __name(feed, "feed");
  function parseLine(line) {
    if (line === "") {
      dispatchEvent();
      return;
    }
    if (line.startsWith(":")) {
      onComment && onComment(line.slice(line.startsWith(": ") ? 2 : 1));
      return;
    }
    const fieldSeparatorIndex = line.indexOf(":");
    if (fieldSeparatorIndex !== -1) {
      const field = line.slice(0, fieldSeparatorIndex), offset = line[fieldSeparatorIndex + 1] === " " ? 2 : 1, value = line.slice(fieldSeparatorIndex + offset);
      processField(field, value, line);
      return;
    }
    processField(line, "", line);
  }
  __name(parseLine, "parseLine");
  function processField(field, value, line) {
    switch (field) {
      case "event":
        eventType = value;
        break;
      case "data":
        data = `${data}${value}
`;
        break;
      case "id":
        id = value.includes("\0") ? void 0 : value;
        break;
      case "retry":
        /^\d+$/.test(value) ? onRetry(parseInt(value, 10)) : onError(
          new ParseError(`Invalid \`retry\` value: "${value}"`, {
            type: "invalid-retry",
            value,
            line
          })
        );
        break;
      default:
        onError(
          new ParseError(
            `Unknown field "${field.length > 20 ? `${field.slice(0, 20)}\u2026` : field}"`,
            { type: "unknown-field", field, value, line }
          )
        );
        break;
    }
  }
  __name(processField, "processField");
  function dispatchEvent() {
    data.length > 0 && onEvent({
      id,
      event: eventType || void 0,
      // If the data buffer's last character is a U+000A LINE FEED (LF) character,
      // then remove the last character from the data buffer.
      data: data.endsWith(`
`) ? data.slice(0, -1) : data
    }), id = void 0, data = "", eventType = "";
  }
  __name(dispatchEvent, "dispatchEvent");
  function reset(options = {}) {
    incompleteLine && options.consume && parseLine(incompleteLine), id = void 0, data = "", eventType = "", incompleteLine = "";
  }
  __name(reset, "reset");
  return { feed, reset };
}
__name(createParser, "createParser");
function splitLines(chunk) {
  const lines = [];
  let incompleteLine = "";
  const totalLength = chunk.length;
  for (let i = 0; i < totalLength; i++) {
    const char = chunk[i];
    char === "\r" && chunk[i + 1] === `
` ? (lines.push(incompleteLine), incompleteLine = "", i++) : char === "\r" || char === `
` ? (lines.push(incompleteLine), incompleteLine = "") : incompleteLine += char;
  }
  return [lines, incompleteLine];
}
__name(splitLines, "splitLines");

// node_modules/eventsource-parser/dist/stream.js
var EventSourceParserStream = class extends TransformStream {
  constructor({ onError, onRetry, onComment } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error) {
            onError === "terminate" ? controller.error(error) : typeof onError == "function" && onError(error);
          },
          onRetry,
          onComment
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
};
__name(EventSourceParserStream, "EventSourceParserStream");

// node_modules/hono/dist/helper/html/index.js
var html = /* @__PURE__ */ __name((strings, ...values) => {
  const buffer = [""];
  for (let i = 0, len = strings.length - 1; i < len; i++) {
    buffer[0] += strings[i];
    const children = Array.isArray(values[i]) ? values[i].flat(Infinity) : [values[i]];
    for (let i2 = 0, len2 = children.length; i2 < len2; i2++) {
      const child = children[i2];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "number") {
        ;
        buffer[0] += child;
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (typeof child === "object" && child.isEscaped) {
        if (child.callbacks) {
          buffer.unshift("", child);
        } else {
          const tmp = child.toString();
          if (tmp instanceof Promise) {
            buffer.unshift("", tmp);
          } else {
            buffer[0] += tmp;
          }
        }
      } else if (child instanceof Promise) {
        buffer.unshift("", child);
      } else {
        escapeToBuffer(child.toString(), buffer);
      }
    }
  }
  buffer[0] += strings[strings.length - 1];
  return buffer.length === 1 ? "callbacks" in buffer ? raw(resolveCallbackSync(raw(buffer[0], buffer.callbacks))) : raw(buffer[0]) : stringBufferToString(buffer, buffer.callbacks);
}, "html");

// src/index.ts
var PROMPT = "\u4F60\u662F\u4E00\u4E2AAI\u52A9\u624B, \u4F60\u4F1A\u5C3D\u5168\u529B\u56DE\u7B54\u522B\u4EBA\u95EE\u4F60\u7684\u95EE\u9898";
var AI_MODEL_NAME = "@cf/qwen/qwen1.5-14b-chat-awq";
var app = new Hono2();
app.use(
  cors({
    // !!!
    // 将*改为你的域名
    // Change the * to your domain
    origin: ["http://localhost", "*"],
    allowHeaders: ["Origin", "Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
    credentials: true
  })
);
var _a;
app.get("/", async (c) => {
  return c.html(
    html(_a || (_a = __template([`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/markdown.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/c.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/cpp.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.2/markdown-it.min.js"
        integrity="sha512-ohlWmsCxOu0bph1om5eDL0jm/83eH09fvqLDhiEdiqfDeJbEvz4FSbeY0gLJSVJwQAp0laRhTXbUQG+ZUuifUQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"><\/script>
    <style>
        body {
            // !!!
            // \u4F60\u53EF\u4EE5\u8BBE\u7F6E\u9875\u9762\u7684\u80CC\u666F\u56FE\u7247, \u53D6\u6D88\u4E0B\u884C\u6CE8\u91CA, \u5E76\u5728url()\u5185\u586B\u5165\u4F60\u7684\u56FE\u7247\u94FE\u63A5
            // background-image: url(...);
            background-repeat: no-repeat;
            background-size: cover;
            background-attachment: fixed;
            
            padding-left: 100px;
            padding-right: 100px;
            
            overflow: hidden;
        }

        .box {
            height: 100vh;
            /* margin-bottom: 1rem; */
        }

        .user-input {
            margin-top: 1rem;
            width: 100%;
            min-height: 1rem;
            max-height: 5rem;
            /* border: 1px solid saddlebrown; */
            /* left: 0;
      top: 0; */
            display: flex;
        }

        .user-input textarea {
            word-break: break-all;
            resize: none;
            flex: 4;
            border-radius: 15px;
            border: 1px solid rgb(135, 181, 241);
            background-color: #ffffffcd;
            color: dodgerblue;
            font-size: 1rem;
        }

        .user-input textarea:hover {
            border: 1px solid dodgerblue;
        }

        .user-input textarea:focus {
            border: 1px solid dodgerblue;
        }

        .user-input button {
            margin-left: 1rem;
            /* color: pink; */
            background-color: #ffffff7a;
            border: 1px solid rgb(135, 181, 241);
            border-radius: 15px;
            font-size: 2rem;
            padding: 1rem;
            flex: 0.5;

            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .user-input button:hover {
            background-color: #ffffffcd;
            border: 1px solid dodgerblue;
        }

        .history-box {
            height: 80%;
            width: 100%;
            background-color: rgba(240, 248, 255, 0.942);

            overflow-y: auto;
            overflow-x: auto;

            word-wrap: break-word;

            border-radius: 15px;
            font-size: medium;
        }

        .chat-history {
            display: flex;
            flex-direction: column;
            max-height: 80vh;
        }

        .chat-history .message-user {
            /* width: 70%; */
            background-color: rgba(171, 150, 255, 0.6);
            text-align: right;

            margin-top: 1rem;
            margin-bottom: 1rem;

            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0.3rem;

            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;

            border-top-right-radius: 15px;
            border-bottom-right-radius: 0px;
        }

        .chat-history .message-user::before {
            content: "You";
            color: green;
        }

        .chat-history .message-assistant {
            /* min-height: 3rem; */
            background-color: rgba(190, 85, 255, 0.6);

            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0.3rem;

            border-top-left-radius: 15px;
            border-bottom-left-radius: 0px;

            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
        }

        .red_backg {
            background-color: rgba(255, 100, 100, 0.558);
        }

        .chat-history .message-assistant::before {
            height: 2rem;
            width: 2rem;
            // background-image: url(...);
            // background-size: contain;
            display: block;
            content: "AI";
            border-radius: 15px;
            color: rgb(155, 100, 100);
        }

        .chat-history .special-btn {
            color: rgba(255, 100, 100, 0.74);
            display: block;
            background-color: #ffffffec;
            border-radius: 10px;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            /* width: 3rem;
  height: 2rem; */
        }

        .chat-history .special-btn:hover {
            color: rgba(255, 100, 100, 0.914);
            background-color: #ffffff;
        }

        .message-assistant pre {
            /* background-color: rgba(255, 251, 240, 0.986); */
            border-radius: 15px;
            overflow-y: auto;

            padding: 0.5rem;
        }

        /* .message-assistant pre code {
  border-radius: 15px;
} */

        .message-assistant * img {
            height: 3rem;
            display: inline;
        }
        #in {
            font-size: 1.5rem;
        }
        #btn-send {
            font-size: 1.5rem;
        }
        button.busying {
            background-image: url(/icons/loading-Ellipsis@1x-1.0s-200px-200px-transp.svg);
        }

        button.availiable {
            /* height: 100%;
  width: 100%; */
            /* object-fit: contain; */
        }
        button.availiable:hover {
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="box">
        <div id="history-box" class="history-box">
            <div id="chat-hello" class="chat-history"></div>
            <div id="chat-history" class="chat-history"></div>
        </div>

        <div class="user-input">
            <textarea id="in" type="text"></textarea>
            <!-- <button id="btn-img-upload" onclick="add_img()">\u4E0A\u4F20<input id="img-input" type="file" accept="image/*" style="display:none"></button> -->
            <button id="btn-send" class="availiable" onclick="ask_ai()">\u53D1\u9001</button>
        </div>

    </div>
</body>
<script>
    const domReady = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    var md;
    function markdownit_init() {
        md = markdownit() || md;
        // console.log("Ready")
        md.set({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                            '</code></pre>';
                    } catch (__) { }
                }

                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });
        set_send_btn(btn_status.availiable)
    }
      
    const default_chat_model = "/api/chat";
    const spark_chat_model = "/api/spark_chat"

    /**
     * @description \u8F6C\u6362\u6587\u4EF6\u6210base64\u6570\u636E
     * @param {Object} file - \u6587\u4EF6\u5BF9\u8C61
     */
    function changeFileIntoBase64(file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = (result) => {
                const base64Str = result.currentTarget.result;
                resolve(base64Str);
            };
        });
    }

    domReady(() => {
        set_send_btn(btn_status.busying)
        try {
            markdownit_init()
        } catch {
            setTimeout(markdownit_init, 100)
        }
    })
    function text2emo(text) {
        // let text_n = text.replace(/<em>rolls eyes</em>/gi, "<img src=/exprs/rolls-eyes.png>");
        // text_n = text_n.replace(/<em>smirk</em>/gi, "\u{1F60F}");
        // text_n = text_n.replace(/<em>sigh</em>/gi, "\u{1F62E}\u200D\u{1F4A8}");
        // text_n = text_n.replace(/<em>crosses arms and raises an eyebrow</em>/gi, "<img src=/exprs/crossing-arms.png>");
        // text_n = text_n.replace(/<em>crosses arms</em>/gi, "<img src=/exprs/crossing-arms.png>");
        // text_n = text_n.replace(/<em>folding arms</em>/gi, "<img src=/exprs/folding-arms.png>");

        // text_n = text_n.replace(/<em>pouts</em>/gi, "<img src=/exprs/pouts.png>");
        // text_n = text_n.replace(/<em>ahem</em>/gi, "ahem\u{1F624}");
        // text_n = text_n.replace(/<em>huff</em>/gi, "<img src=/exprs/huff.gif>");
        // text_n = text_n.replace(/<em>scoff</em>/gi, "<img src=/exprs/scoff.png>");
        return text
    }

    function highlightCode(content) {
        const codeEls = [...content.querySelectorAll("code")];
        for (const codeEl of codeEls) {
            hljs.highlightElement(codeEl);
        }
    }
    function createChatMessageElement(msg) {
        const div = document.createElement("div");
        div.className = "message-"+msg.role;
        if (msg.role === "assistant") {
            const response = document.createElement("div");
            response.className = "response";
            // const html = md.render(msg.content);
            const html = msg.content;
            response.innerHTML = html;
            div.appendChild(response);
            highlightCode(div);
            // const modelDisplay = document.createElement("p");
            // modelDisplay.className = "message-model";
            // const settings = retrieveChatSettings();
            // modelDisplay.innerText = settings.model;
            // div.appendChild(modelDisplay);
        } else {
            const userMessage = document.createElement("p");
            userMessage.innerText = msg.content;
            div.appendChild(userMessage);
        }
        // \u901A\u7528\u90E8\u5206 \u5982\u679C\u6D88\u606F\u4E2D\u6709image\uFF0C\u5219\u989D\u5916\u6DFB\u52A0child
        const img = msg.image;
        if (img) {
            const _img = document.createElement("img");
            _img.src = img;
            div.appendChild(_img);
        }
        return div;
    }

    function retrieveMessages() {
        const msgJSON = localStorage.getItem("messages");
        if (!msgJSON) {
            return [];
        }
        return JSON.parse(msgJSON);
    }

    function storeMessages(msgs) {
        localStorage.setItem("messages", JSON.stringify(msgs));
    }

    async function ask_ai() {
        // const btn_send = document.querySelector("#btn-send")
        set_send_btn(btn_status.busying)
        const config = {};
        const historyBox = document.querySelector("#history-box")
        const chatHistory = document.getElementById("chat-history");
        const input = document.querySelector("#in");
        if (input.value == "") {
            set_send_btn(btn_status.availiable)
            return
        }

        // let image = await changeFileIntoBase64(document.querySelector("#img-input").files[0])

        const userMsg = { role: "user", content: input.value, image: "" };
        chatHistory.append(createChatMessageElement(userMsg));
        historyBox.scrollTop = historyBox.scrollHeight;
        const messages = retrieveMessages();
        messages.push(userMsg);
        const payload = { messages, config };
        input.value = "";

        let assistantMsg = { role: "assistant", content: "" };
        const assistantMessage = createChatMessageElement(assistantMsg);
        chatHistory.append(assistantMessage);
        // Scroll to the latest message
        historyBox.scrollTop = historyBox.scrollHeight;
        const assistantResponse = assistantMessage.lastChild;

        // !!!
        // \u5982\u679C\u4F60\u4F7F\u7528\u8BAF\u98DE\u661F\u706B\u5927\u6A21\u578B, \u8BF7\u5C06default_chat_model\u6539\u4E3Aspark_chat_model
        const response = await fetch(default_chat_model, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }).catch(e => {
            console.error(e);
            assistantResponse.innerHTML = "There may be some errors."
            set_send_btn(btn_status.availiable)
        });

        ///////////////
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let haveResponse = true
        while (true) {
            const { value, done } = await reader.read();
            // console.log(value)
            if (done) {
                // console.log("Stream done");
                if (assistantMsg.content == "") {
                    haveResponse = false;
                    console.log("\u65E0\u6CD5\u83B7\u53D6\u6A21\u578B\u8F93\u51FA");
                }
                break;
            }
            assistantMsg.content += value;
            // Continually render the markdown => HTML
            // Do not wipe out the model display
            // console.log(assistantMsg.content)
            assistantResponse.innerHTML = md.render(assistantMsg.content);
            assistantResponse.innerHTML = text2emo(assistantResponse.innerHTML);
            // highlightCode(assistantResponse)
            historyBox.scrollTop = historyBox.scrollHeight;
            // assistantResponse.innerHTML = assistantMsg.content
        }
        /////////////////
        if (haveResponse) {
            messages.push(assistantMsg);
            storeMessages(messages);
        } else {
            assistantResponse.innerHTML = "There may be some errors."
        }
        historyBox.scrollTop = historyBox.scrollHeight;
        set_send_btn(btn_status.availiable)
    }

    const btn_status = {
        "availiable": 0,
        "busying": 1
    }
    function set_send_btn(status) {
        const btn_send = document.querySelector("#btn-send")
        switch (status) {
            case btn_status.busying:
                btn_send.disabled = true
                // btn_send.setAttribute("class","busying")
                btn_send.className = "busying"
                break
            case btn_status.availiable:
                btn_send.disabled = false
                btn_send.className = "availiable"
            // btn_send.setAttribute("class","availiable")
        }
        // console.log(btn_send.className)
    }


    function add_img() {
        document.querySelector("#img-input").click()
    }

    function handleImgChange(e) {
        let file = e.target.files[0];
        console.log(file)
    }

    localStorage.clear();
    const user_input = document.querySelector("#in");
    user_input.onkeyup = (e) => {
        var key = e.which;
        if (key == 13) {
            ask_ai()
        }
    };

    md = markdownit();
    // console.log(md)
    init_hello();

    function init_hello() {
        const chatHello = document.getElementById("chat-hello");
        chatHello.innerHTML = "";
        let assistantMsg = {
            role: "assistant", content: "\u4F60\u597D\uFF0C\u8BF7\u95EE\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u52A9\u4F60\uFF1F"
        };
        let assistantMessage = createChatMessageElement(assistantMsg);
        chatHello.prepend(assistantMessage);
    }

    function get_selected_chat_model() {
        let now_selected = localStorage.getItem("NowSelectedModel");
        if (now_selected == null) {
            localStorage.setItem("NowSelectedModel", 0)
            now_selected = 0;
        }
        return parseInt(now_selected, 10);
    }

    function change_chat_model() {
        localStorage.setItem("NowSelectedModel", (get_selected_chat_model() + 1) % TOTAL_MODEL);
        console.log(get_selected_chat_model())
        if (localStorage.getItem("NowSelectedModel") == "0") {
            document.querySelector(".response").innerHTML = "aaa";
        } else
            if (localStorage.getItem("NowSelectedModel") == "1") {
                document.querySelector(".response").innerHTML = "bbb";
            }
    }

    // let img_input = document.querySelector("#img-input")
    // img_input.onchange = function (e) {
    //     let file = e.target.files[0];
    //     console.log(file)
    // }
<\/script>

</html>
    `], [`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/markdown.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/c.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/cpp.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.2/markdown-it.min.js"
        integrity="sha512-ohlWmsCxOu0bph1om5eDL0jm/83eH09fvqLDhiEdiqfDeJbEvz4FSbeY0gLJSVJwQAp0laRhTXbUQG+ZUuifUQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"><\/script>
    <style>
        body {
            // !!!
            // \u4F60\u53EF\u4EE5\u8BBE\u7F6E\u9875\u9762\u7684\u80CC\u666F\u56FE\u7247, \u53D6\u6D88\u4E0B\u884C\u6CE8\u91CA, \u5E76\u5728url()\u5185\u586B\u5165\u4F60\u7684\u56FE\u7247\u94FE\u63A5
            // background-image: url(...);
            background-repeat: no-repeat;
            background-size: cover;
            background-attachment: fixed;
            
            padding-left: 100px;
            padding-right: 100px;
            
            overflow: hidden;
        }

        .box {
            height: 100vh;
            /* margin-bottom: 1rem; */
        }

        .user-input {
            margin-top: 1rem;
            width: 100%;
            min-height: 1rem;
            max-height: 5rem;
            /* border: 1px solid saddlebrown; */
            /* left: 0;
      top: 0; */
            display: flex;
        }

        .user-input textarea {
            word-break: break-all;
            resize: none;
            flex: 4;
            border-radius: 15px;
            border: 1px solid rgb(135, 181, 241);
            background-color: #ffffffcd;
            color: dodgerblue;
            font-size: 1rem;
        }

        .user-input textarea:hover {
            border: 1px solid dodgerblue;
        }

        .user-input textarea:focus {
            border: 1px solid dodgerblue;
        }

        .user-input button {
            margin-left: 1rem;
            /* color: pink; */
            background-color: #ffffff7a;
            border: 1px solid rgb(135, 181, 241);
            border-radius: 15px;
            font-size: 2rem;
            padding: 1rem;
            flex: 0.5;

            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .user-input button:hover {
            background-color: #ffffffcd;
            border: 1px solid dodgerblue;
        }

        .history-box {
            height: 80%;
            width: 100%;
            background-color: rgba(240, 248, 255, 0.942);

            overflow-y: auto;
            overflow-x: auto;

            word-wrap: break-word;

            border-radius: 15px;
            font-size: medium;
        }

        .chat-history {
            display: flex;
            flex-direction: column;
            max-height: 80vh;
        }

        .chat-history .message-user {
            /* width: 70%; */
            background-color: rgba(171, 150, 255, 0.6);
            text-align: right;

            margin-top: 1rem;
            margin-bottom: 1rem;

            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0.3rem;

            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;

            border-top-right-radius: 15px;
            border-bottom-right-radius: 0px;
        }

        .chat-history .message-user::before {
            content: "You";
            color: green;
        }

        .chat-history .message-assistant {
            /* min-height: 3rem; */
            background-color: rgba(190, 85, 255, 0.6);

            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0.3rem;

            border-top-left-radius: 15px;
            border-bottom-left-radius: 0px;

            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
        }

        .red_backg {
            background-color: rgba(255, 100, 100, 0.558);
        }

        .chat-history .message-assistant::before {
            height: 2rem;
            width: 2rem;
            // background-image: url(...);
            // background-size: contain;
            display: block;
            content: "AI";
            border-radius: 15px;
            color: rgb(155, 100, 100);
        }

        .chat-history .special-btn {
            color: rgba(255, 100, 100, 0.74);
            display: block;
            background-color: #ffffffec;
            border-radius: 10px;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            /* width: 3rem;
  height: 2rem; */
        }

        .chat-history .special-btn:hover {
            color: rgba(255, 100, 100, 0.914);
            background-color: #ffffff;
        }

        .message-assistant pre {
            /* background-color: rgba(255, 251, 240, 0.986); */
            border-radius: 15px;
            overflow-y: auto;

            padding: 0.5rem;
        }

        /* .message-assistant pre code {
  border-radius: 15px;
} */

        .message-assistant * img {
            height: 3rem;
            display: inline;
        }
        #in {
            font-size: 1.5rem;
        }
        #btn-send {
            font-size: 1.5rem;
        }
        button.busying {
            background-image: url(/icons/loading-Ellipsis@1x-1.0s-200px-200px-transp.svg);
        }

        button.availiable {
            /* height: 100%;
  width: 100%; */
            /* object-fit: contain; */
        }
        button.availiable:hover {
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="box">
        <div id="history-box" class="history-box">
            <div id="chat-hello" class="chat-history"></div>
            <div id="chat-history" class="chat-history"></div>
        </div>

        <div class="user-input">
            <textarea id="in" type="text"></textarea>
            <!-- <button id="btn-img-upload" onclick="add_img()">\u4E0A\u4F20<input id="img-input" type="file" accept="image/*" style="display:none"></button> -->
            <button id="btn-send" class="availiable" onclick="ask_ai()">\u53D1\u9001</button>
        </div>

    </div>
</body>
<script>
    const domReady = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    var md;
    function markdownit_init() {
        md = markdownit() || md;
        // console.log("Ready")
        md.set({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                            '</code></pre>';
                    } catch (__) { }
                }

                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });
        set_send_btn(btn_status.availiable)
    }
      
    const default_chat_model = "/api/chat";
    const spark_chat_model = "/api/spark_chat"

    /**
     * @description \u8F6C\u6362\u6587\u4EF6\u6210base64\u6570\u636E
     * @param {Object} file - \u6587\u4EF6\u5BF9\u8C61
     */
    function changeFileIntoBase64(file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = (result) => {
                const base64Str = result.currentTarget.result;
                resolve(base64Str);
            };
        });
    }

    domReady(() => {
        set_send_btn(btn_status.busying)
        try {
            markdownit_init()
        } catch {
            setTimeout(markdownit_init, 100)
        }
    })
    function text2emo(text) {
        // let text_n = text.replace(/<em>rolls eyes<\\/em>/gi, "<img src=/exprs/rolls-eyes.png>");
        // text_n = text_n.replace(/<em>smirk<\\/em>/gi, "\u{1F60F}");
        // text_n = text_n.replace(/<em>sigh<\\/em>/gi, "\u{1F62E}\u200D\u{1F4A8}");
        // text_n = text_n.replace(/<em>crosses arms and raises an eyebrow<\\/em>/gi, "<img src=/exprs/crossing-arms.png>");
        // text_n = text_n.replace(/<em>crosses arms<\\/em>/gi, "<img src=/exprs/crossing-arms.png>");
        // text_n = text_n.replace(/<em>folding arms<\\/em>/gi, "<img src=/exprs/folding-arms.png>");

        // text_n = text_n.replace(/<em>pouts<\\/em>/gi, "<img src=/exprs/pouts.png>");
        // text_n = text_n.replace(/<em>ahem<\\/em>/gi, "ahem\u{1F624}");
        // text_n = text_n.replace(/<em>huff<\\/em>/gi, "<img src=/exprs/huff.gif>");
        // text_n = text_n.replace(/<em>scoff<\\/em>/gi, "<img src=/exprs/scoff.png>");
        return text
    }

    function highlightCode(content) {
        const codeEls = [...content.querySelectorAll("code")];
        for (const codeEl of codeEls) {
            hljs.highlightElement(codeEl);
        }
    }
    function createChatMessageElement(msg) {
        const div = document.createElement("div");
        div.className = "message-"+msg.role;
        if (msg.role === "assistant") {
            const response = document.createElement("div");
            response.className = "response";
            // const html = md.render(msg.content);
            const html = msg.content;
            response.innerHTML = html;
            div.appendChild(response);
            highlightCode(div);
            // const modelDisplay = document.createElement("p");
            // modelDisplay.className = "message-model";
            // const settings = retrieveChatSettings();
            // modelDisplay.innerText = settings.model;
            // div.appendChild(modelDisplay);
        } else {
            const userMessage = document.createElement("p");
            userMessage.innerText = msg.content;
            div.appendChild(userMessage);
        }
        // \u901A\u7528\u90E8\u5206 \u5982\u679C\u6D88\u606F\u4E2D\u6709image\uFF0C\u5219\u989D\u5916\u6DFB\u52A0child
        const img = msg.image;
        if (img) {
            const _img = document.createElement("img");
            _img.src = img;
            div.appendChild(_img);
        }
        return div;
    }

    function retrieveMessages() {
        const msgJSON = localStorage.getItem("messages");
        if (!msgJSON) {
            return [];
        }
        return JSON.parse(msgJSON);
    }

    function storeMessages(msgs) {
        localStorage.setItem("messages", JSON.stringify(msgs));
    }

    async function ask_ai() {
        // const btn_send = document.querySelector("#btn-send")
        set_send_btn(btn_status.busying)
        const config = {};
        const historyBox = document.querySelector("#history-box")
        const chatHistory = document.getElementById("chat-history");
        const input = document.querySelector("#in");
        if (input.value == "") {
            set_send_btn(btn_status.availiable)
            return
        }

        // let image = await changeFileIntoBase64(document.querySelector("#img-input").files[0])

        const userMsg = { role: "user", content: input.value, image: "" };
        chatHistory.append(createChatMessageElement(userMsg));
        historyBox.scrollTop = historyBox.scrollHeight;
        const messages = retrieveMessages();
        messages.push(userMsg);
        const payload = { messages, config };
        input.value = "";

        let assistantMsg = { role: "assistant", content: "" };
        const assistantMessage = createChatMessageElement(assistantMsg);
        chatHistory.append(assistantMessage);
        // Scroll to the latest message
        historyBox.scrollTop = historyBox.scrollHeight;
        const assistantResponse = assistantMessage.lastChild;

        // !!!
        // \u5982\u679C\u4F60\u4F7F\u7528\u8BAF\u98DE\u661F\u706B\u5927\u6A21\u578B, \u8BF7\u5C06default_chat_model\u6539\u4E3Aspark_chat_model
        const response = await fetch(default_chat_model, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }).catch(e => {
            console.error(e);
            assistantResponse.innerHTML = "There may be some errors."
            set_send_btn(btn_status.availiable)
        });

        ///////////////
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let haveResponse = true
        while (true) {
            const { value, done } = await reader.read();
            // console.log(value)
            if (done) {
                // console.log("Stream done");
                if (assistantMsg.content == "") {
                    haveResponse = false;
                    console.log("\u65E0\u6CD5\u83B7\u53D6\u6A21\u578B\u8F93\u51FA");
                }
                break;
            }
            assistantMsg.content += value;
            // Continually render the markdown => HTML
            // Do not wipe out the model display
            // console.log(assistantMsg.content)
            assistantResponse.innerHTML = md.render(assistantMsg.content);
            assistantResponse.innerHTML = text2emo(assistantResponse.innerHTML);
            // highlightCode(assistantResponse)
            historyBox.scrollTop = historyBox.scrollHeight;
            // assistantResponse.innerHTML = assistantMsg.content
        }
        /////////////////
        if (haveResponse) {
            messages.push(assistantMsg);
            storeMessages(messages);
        } else {
            assistantResponse.innerHTML = "There may be some errors."
        }
        historyBox.scrollTop = historyBox.scrollHeight;
        set_send_btn(btn_status.availiable)
    }

    const btn_status = {
        "availiable": 0,
        "busying": 1
    }
    function set_send_btn(status) {
        const btn_send = document.querySelector("#btn-send")
        switch (status) {
            case btn_status.busying:
                btn_send.disabled = true
                // btn_send.setAttribute("class","busying")
                btn_send.className = "busying"
                break
            case btn_status.availiable:
                btn_send.disabled = false
                btn_send.className = "availiable"
            // btn_send.setAttribute("class","availiable")
        }
        // console.log(btn_send.className)
    }


    function add_img() {
        document.querySelector("#img-input").click()
    }

    function handleImgChange(e) {
        let file = e.target.files[0];
        console.log(file)
    }

    localStorage.clear();
    const user_input = document.querySelector("#in");
    user_input.onkeyup = (e) => {
        var key = e.which;
        if (key == 13) {
            ask_ai()
        }
    };

    md = markdownit();
    // console.log(md)
    init_hello();

    function init_hello() {
        const chatHello = document.getElementById("chat-hello");
        chatHello.innerHTML = "";
        let assistantMsg = {
            role: "assistant", content: "\u4F60\u597D\uFF0C\u8BF7\u95EE\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u52A9\u4F60\uFF1F"
        };
        let assistantMessage = createChatMessageElement(assistantMsg);
        chatHello.prepend(assistantMessage);
    }

    function get_selected_chat_model() {
        let now_selected = localStorage.getItem("NowSelectedModel");
        if (now_selected == null) {
            localStorage.setItem("NowSelectedModel", 0)
            now_selected = 0;
        }
        return parseInt(now_selected, 10);
    }

    function change_chat_model() {
        localStorage.setItem("NowSelectedModel", (get_selected_chat_model() + 1) % TOTAL_MODEL);
        console.log(get_selected_chat_model())
        if (localStorage.getItem("NowSelectedModel") == "0") {
            document.querySelector(".response").innerHTML = "aaa";
        } else
            if (localStorage.getItem("NowSelectedModel") == "1") {
                document.querySelector(".response").innerHTML = "bbb";
            }
    }

    // let img_input = document.querySelector("#img-input")
    // img_input.onchange = function (e) {
    //     let file = e.target.files[0];
    //     console.log(file)
    // }
<\/script>

</html>
    `])))
  );
});
app.post("/api/chat", async (c) => {
  const payload = await c.req.json();
  const messages = [...payload.messages];
  messages.unshift({ role: "system", content: PROMPT });
  let eventSourceStream;
  let retryCount = 0;
  let successfulInference = false;
  let lastError;
  const MAX_RETRIES = 3;
  while (successfulInference === false && retryCount < MAX_RETRIES) {
    try {
      eventSourceStream = await c.env.AI.run(AI_MODEL_NAME, {
        messages,
        stream: true
      });
      successfulInference = true;
    } catch (err) {
      lastError = err;
      retryCount++;
      console.error(err);
      console.log(`Retrying #${retryCount}...`);
    }
  }
  if (eventSourceStream === void 0) {
    if (lastError) {
      throw lastError;
    }
    throw new Error(`Problem with model`);
  }
  const tokenStream = eventSourceStream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());
  return streamText(c, async (stream2) => {
    for await (const msg of tokenStream) {
      if (msg.data !== "[DONE]") {
        const data = JSON.parse(msg.data);
        stream2.write(data.response);
      }
    }
  });
});
var src_default = app;
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
