"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/v1/sync/route";
exports.ids = ["app/api/v1/sync/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fv1%2Fsync%2Froute&page=%2Fapi%2Fv1%2Fsync%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fv1%2Fsync%2Froute.ts&appDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fv1%2Fsync%2Froute&page=%2Fapi%2Fv1%2Fsync%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fv1%2Fsync%2Froute.ts&appDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_rafae_codes_Portal_do_Cliente_src_app_api_v1_sync_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/v1/sync/route.ts */ \"(rsc)/./src/app/api/v1/sync/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/v1/sync/route\",\n        pathname: \"/api/v1/sync\",\n        filename: \"route\",\n        bundlePath: \"app/api/v1/sync/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\rafae\\\\codes\\\\Portal-do-Cliente\\\\src\\\\app\\\\api\\\\v1\\\\sync\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_rafae_codes_Portal_do_Cliente_src_app_api_v1_sync_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/v1/sync/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ2MSUyRnN5bmMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnYxJTJGc3luYyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnYxJTJGc3luYyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNyYWZhZSU1Q2NvZGVzJTVDUG9ydGFsLWRvLUNsaWVudGUlNUNzcmMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q3JhZmFlJTVDY29kZXMlNUNQb3J0YWwtZG8tQ2xpZW50ZSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQzZCO0FBQzFHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb25lLWZpbmFuY2UtcG9ydGFsLz8zY2UyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXHJhZmFlXFxcXGNvZGVzXFxcXFBvcnRhbC1kby1DbGllbnRlXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHYxXFxcXHN5bmNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwic3RhbmRhbG9uZVwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS92MS9zeW5jL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvdjEvc3luY1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdjEvc3luYy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXHJhZmFlXFxcXGNvZGVzXFxcXFBvcnRhbC1kby1DbGllbnRlXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHYxXFxcXHN5bmNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3YxL3N5bmMvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fv1%2Fsync%2Froute&page=%2Fapi%2Fv1%2Fsync%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fv1%2Fsync%2Froute.ts&appDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/v1/sync/route.ts":
/*!**************************************!*\
  !*** ./src/app/api/v1/sync/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_rbac__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/rbac */ \"(rsc)/./src/lib/rbac.ts\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./src/lib/db.ts\");\n\n\n\nconst STATUS_EM_ABERTO = [\n    \"pendente\",\n    \"em_andamento\"\n];\nasync function POST(req) {\n    const sessao = await (0,_lib_rbac__WEBPACK_IMPORTED_MODULE_1__.getSessaoOuNull)();\n    if (!sessao) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"N\\xe3o autenticado\"\n    }, {\n        status: 401\n    });\n    const body = await req.json().catch(()=>({}));\n    const empresaId = body?.clienteId;\n    if (!empresaId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Par\\xe2metro clienteId obrigat\\xf3rio\"\n        }, {\n            status: 400\n        });\n    }\n    if (!(0,_lib_rbac__WEBPACK_IMPORTED_MODULE_1__.podeAcessarCliente)(sessao, empresaId)) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Sem acesso a este cliente\"\n        }, {\n            status: 403\n        });\n    }\n    const existente = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.db.syncSolicitacao.findFirst({\n        where: {\n            empresaId,\n            status: {\n                in: STATUS_EM_ABERTO\n            }\n        },\n        orderBy: {\n            solicitadoEm: \"desc\"\n        }\n    });\n    if (existente) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(existente, {\n            status: 202\n        });\n    }\n    const solicitacao = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.db.syncSolicitacao.create({\n        data: {\n            empresaId,\n            solicitadoPor: sessao.id,\n            status: \"pendente\"\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(solicitacao, {\n        status: 202\n    });\n}\nasync function GET(req) {\n    const sessao = await (0,_lib_rbac__WEBPACK_IMPORTED_MODULE_1__.getSessaoOuNull)();\n    if (!sessao) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"N\\xe3o autenticado\"\n    }, {\n        status: 401\n    });\n    const { searchParams } = new URL(req.url);\n    const empresaId = searchParams.get(\"clienteId\");\n    if (!empresaId) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Par\\xe2metro clienteId obrigat\\xf3rio\"\n        }, {\n            status: 400\n        });\n    }\n    if (!(0,_lib_rbac__WEBPACK_IMPORTED_MODULE_1__.podeAcessarCliente)(sessao, empresaId)) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Sem acesso a este cliente\"\n        }, {\n            status: 403\n        });\n    }\n    const ultima = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.db.syncSolicitacao.findFirst({\n        where: {\n            empresaId\n        },\n        orderBy: {\n            solicitadoEm: \"desc\"\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(ultima ?? null);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS92MS9zeW5jL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQXdEO0FBQ1M7QUFDbkM7QUFHOUIsTUFBTUksbUJBQW1CO0lBQUM7SUFBWTtDQUFlO0FBRTlDLGVBQWVDLEtBQUtDLEdBQWdCO0lBQ3pDLE1BQU1DLFNBQVMsTUFBTU4sMERBQWVBO0lBQ3BDLElBQUksQ0FBQ00sUUFBUSxPQUFPUCxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBa0IsR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFFbEYsTUFBTUMsT0FBTyxNQUFNTCxJQUFJRSxJQUFJLEdBQUdJLEtBQUssQ0FBQyxJQUFPLEVBQUM7SUFDNUMsTUFBTUMsWUFBWUYsTUFBTUc7SUFDeEIsSUFBSSxDQUFDRCxXQUFXO1FBQ2QsT0FBT2IscURBQVlBLENBQUNRLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQWtDLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ3ZGO0lBQ0EsSUFBSSxDQUFDUiw2REFBa0JBLENBQUNLLFFBQVFNLFlBQVk7UUFDMUMsT0FBT2IscURBQVlBLENBQUNRLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQTRCLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ2pGO0lBRUEsTUFBTUssWUFBWSxNQUFNWix1Q0FBRUEsQ0FBQ2EsZUFBZSxDQUFDQyxTQUFTLENBQUM7UUFDbkRDLE9BQU87WUFBRUw7WUFBV0gsUUFBUTtnQkFBRVMsSUFBSWY7WUFBaUI7UUFBRTtRQUNyRGdCLFNBQVM7WUFBRUMsY0FBYztRQUFPO0lBQ2xDO0lBQ0EsSUFBSU4sV0FBVztRQUNiLE9BQU9mLHFEQUFZQSxDQUFDUSxJQUFJLENBQUNPLFdBQVc7WUFBRUwsUUFBUTtRQUFJO0lBQ3BEO0lBRUEsTUFBTVksY0FBYyxNQUFNbkIsdUNBQUVBLENBQUNhLGVBQWUsQ0FBQ08sTUFBTSxDQUFDO1FBQ2xEQyxNQUFNO1lBQUVYO1lBQVdZLGVBQWVsQixPQUFPbUIsRUFBRTtZQUFFaEIsUUFBUTtRQUFXO0lBQ2xFO0lBRUEsT0FBT1YscURBQVlBLENBQUNRLElBQUksQ0FBQ2MsYUFBYTtRQUFFWixRQUFRO0lBQUk7QUFDdEQ7QUFFTyxlQUFlaUIsSUFBSXJCLEdBQWdCO0lBQ3hDLE1BQU1DLFNBQVMsTUFBTU4sMERBQWVBO0lBQ3BDLElBQUksQ0FBQ00sUUFBUSxPQUFPUCxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBa0IsR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFFbEYsTUFBTSxFQUFFa0IsWUFBWSxFQUFFLEdBQUcsSUFBSUMsSUFBSXZCLElBQUl3QixHQUFHO0lBQ3hDLE1BQU1qQixZQUFZZSxhQUFhRyxHQUFHLENBQUM7SUFDbkMsSUFBSSxDQUFDbEIsV0FBVztRQUNkLE9BQU9iLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFrQyxHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN2RjtJQUNBLElBQUksQ0FBQ1IsNkRBQWtCQSxDQUFDSyxRQUFRTSxZQUFZO1FBQzFDLE9BQU9iLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUE0QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNqRjtJQUVBLE1BQU1zQixTQUFTLE1BQU03Qix1Q0FBRUEsQ0FBQ2EsZUFBZSxDQUFDQyxTQUFTLENBQUM7UUFDaERDLE9BQU87WUFBRUw7UUFBVTtRQUNuQk8sU0FBUztZQUFFQyxjQUFjO1FBQU87SUFDbEM7SUFFQSxPQUFPckIscURBQVlBLENBQUNRLElBQUksQ0FBQ3dCLFVBQVU7QUFDckMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vbmUtZmluYW5jZS1wb3J0YWwvLi9zcmMvYXBwL2FwaS92MS9zeW5jL3JvdXRlLnRzPzVjZjciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcclxuaW1wb3J0IHsgZ2V0U2Vzc2FvT3VOdWxsLCBwb2RlQWNlc3NhckNsaWVudGUgfSBmcm9tICdAL2xpYi9yYmFjJztcclxuaW1wb3J0IHsgZGIgfSBmcm9tICdAL2xpYi9kYic7XHJcblxyXG5cclxuY29uc3QgU1RBVFVTX0VNX0FCRVJUTyA9IFsncGVuZGVudGUnLCAnZW1fYW5kYW1lbnRvJ107XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IE5leHRSZXF1ZXN0KSB7XHJcbiAgY29uc3Qgc2Vzc2FvID0gYXdhaXQgZ2V0U2Vzc2FvT3VOdWxsKCk7XHJcbiAgaWYgKCFzZXNzYW8pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTsOjbyBhdXRlbnRpY2FkbycgfSwgeyBzdGF0dXM6IDQwMSB9KTtcclxuXHJcbiAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgY29uc3QgZW1wcmVzYUlkID0gYm9keT8uY2xpZW50ZUlkO1xyXG4gIGlmICghZW1wcmVzYUlkKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1BhcsOibWV0cm8gY2xpZW50ZUlkIG9icmlnYXTDs3JpbycgfSwgeyBzdGF0dXM6IDQwMCB9KTtcclxuICB9XHJcbiAgaWYgKCFwb2RlQWNlc3NhckNsaWVudGUoc2Vzc2FvLCBlbXByZXNhSWQpKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1NlbSBhY2Vzc28gYSBlc3RlIGNsaWVudGUnIH0sIHsgc3RhdHVzOiA0MDMgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBleGlzdGVudGUgPSBhd2FpdCBkYi5zeW5jU29saWNpdGFjYW8uZmluZEZpcnN0KHtcclxuICAgIHdoZXJlOiB7IGVtcHJlc2FJZCwgc3RhdHVzOiB7IGluOiBTVEFUVVNfRU1fQUJFUlRPIH0gfSxcclxuICAgIG9yZGVyQnk6IHsgc29saWNpdGFkb0VtOiAnZGVzYycgfSxcclxuICB9KTtcclxuICBpZiAoZXhpc3RlbnRlKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oZXhpc3RlbnRlLCB7IHN0YXR1czogMjAyIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc29saWNpdGFjYW8gPSBhd2FpdCBkYi5zeW5jU29saWNpdGFjYW8uY3JlYXRlKHtcclxuICAgIGRhdGE6IHsgZW1wcmVzYUlkLCBzb2xpY2l0YWRvUG9yOiBzZXNzYW8uaWQsIHN0YXR1czogJ3BlbmRlbnRlJyB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oc29saWNpdGFjYW8sIHsgc3RhdHVzOiAyMDIgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxOiBOZXh0UmVxdWVzdCkge1xyXG4gIGNvbnN0IHNlc3NhbyA9IGF3YWl0IGdldFNlc3Nhb091TnVsbCgpO1xyXG4gIGlmICghc2Vzc2FvKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ07Do28gYXV0ZW50aWNhZG8nIH0sIHsgc3RhdHVzOiA0MDEgfSk7XHJcblxyXG4gIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xyXG4gIGNvbnN0IGVtcHJlc2FJZCA9IHNlYXJjaFBhcmFtcy5nZXQoJ2NsaWVudGVJZCcpO1xyXG4gIGlmICghZW1wcmVzYUlkKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1BhcsOibWV0cm8gY2xpZW50ZUlkIG9icmlnYXTDs3JpbycgfSwgeyBzdGF0dXM6IDQwMCB9KTtcclxuICB9XHJcbiAgaWYgKCFwb2RlQWNlc3NhckNsaWVudGUoc2Vzc2FvLCBlbXByZXNhSWQpKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1NlbSBhY2Vzc28gYSBlc3RlIGNsaWVudGUnIH0sIHsgc3RhdHVzOiA0MDMgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB1bHRpbWEgPSBhd2FpdCBkYi5zeW5jU29saWNpdGFjYW8uZmluZEZpcnN0KHtcclxuICAgIHdoZXJlOiB7IGVtcHJlc2FJZCB9LFxyXG4gICAgb3JkZXJCeTogeyBzb2xpY2l0YWRvRW06ICdkZXNjJyB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24odWx0aW1hID8/IG51bGwpO1xyXG59Il0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlc3Nhb091TnVsbCIsInBvZGVBY2Vzc2FyQ2xpZW50ZSIsImRiIiwiU1RBVFVTX0VNX0FCRVJUTyIsIlBPU1QiLCJyZXEiLCJzZXNzYW8iLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJib2R5IiwiY2F0Y2giLCJlbXByZXNhSWQiLCJjbGllbnRlSWQiLCJleGlzdGVudGUiLCJzeW5jU29saWNpdGFjYW8iLCJmaW5kRmlyc3QiLCJ3aGVyZSIsImluIiwib3JkZXJCeSIsInNvbGljaXRhZG9FbSIsInNvbGljaXRhY2FvIiwiY3JlYXRlIiwiZGF0YSIsInNvbGljaXRhZG9Qb3IiLCJpZCIsIkdFVCIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsImdldCIsInVsdGltYSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/v1/sync/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./src/lib/db.ts\");\n\n\n\nconst authOptions = {\n    session: {\n        strategy: \"jwt\",\n        maxAge: 20 * 60\n    },\n    pages: {\n        signIn: \"/login\"\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"E-mail\",\n                    type: \"email\"\n                },\n                senha: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                console.log(\"[DEBUG] credentials recebidos:\", JSON.stringify(credentials));\n                if (!credentials?.email || !credentials?.senha) {\n                    console.log(\"[DEBUG] faltou email ou senha no payload recebido\");\n                    return null;\n                }\n                const usuario = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.db.usuario.findUnique({\n                    where: {\n                        email: credentials.email.trim().toLowerCase()\n                    },\n                    include: {\n                        acessos: {\n                            select: {\n                                empresaId: true\n                            }\n                        }\n                    }\n                });\n                if (!usuario || !usuario.ativo) {\n                    console.log(\"[DEBUG] usuario nulo ou inativo:\", usuario?.email, usuario?.ativo);\n                    return null;\n                }\n                console.log(\"[DEBUG] hash do banco:\", JSON.stringify(usuario.senhaHash), \"tamanho:\", usuario.senhaHash.length);\n                const senhaOk = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().compare(credentials.senha, usuario.senhaHash);\n                console.log(\"[DEBUG] resultado bcrypt.compare:\", senhaOk);\n                if (!senhaOk) return null;\n                await _lib_db__WEBPACK_IMPORTED_MODULE_2__.db.usuario.update({\n                    where: {\n                        id: usuario.id\n                    },\n                    data: {\n                        ultimoLogin: new Date()\n                    }\n                });\n                await _lib_db__WEBPACK_IMPORTED_MODULE_2__.db.logAtividade.create({\n                    data: {\n                        usuarioId: usuario.id,\n                        categoria: \"login\",\n                        acao: \"Login bem-sucedido\",\n                        detalhe: usuario.email\n                    }\n                });\n                return {\n                    id: usuario.id,\n                    name: usuario.nome,\n                    email: usuario.email,\n                    role: usuario.role,\n                    acessos: usuario.acessos.map((a)=>a.empresaId)\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.acessos = user.acessos;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.role = token.role;\n                session.user.acessos = token.acessos;\n                session.user.id = token.sub;\n            }\n            return session;\n        }\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxDQUFTMUIsT0FBTyxHQUFHeUIsTUFBTXpCLE9BQU87Z0JBQzVDdkIsUUFBUWlELElBQUksQ0FBU2pCLEVBQUUsR0FBR2dCLE1BQU1FLEdBQUc7WUFDdEM7WUFDQSxPQUFPbEQ7UUFDVDtJQUNGO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL29uZS1maW5hbmNlLXBvcnRhbC8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJztcclxuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFscyc7XHJcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xyXG5pbXBvcnQgeyBkYiB9IGZyb20gJ0AvbGliL2RiJztcclxuXHJcbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xyXG4gIHNlc3Npb246IHsgc3RyYXRlZ3k6ICdqd3QnLCBtYXhBZ2U6IDIwICogNjAgfSxcclxuICBwYWdlczogeyBzaWduSW46ICcvbG9naW4nIH0sXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcclxuICAgICAgbmFtZTogJ2NyZWRlbnRpYWxzJyxcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBlbWFpbDogeyBsYWJlbDogJ0UtbWFpbCcsIHR5cGU6ICdlbWFpbCcgfSxcclxuICAgICAgICBzZW5oYTogeyBsYWJlbDogJ1NlbmhhJywgdHlwZTogJ3Bhc3N3b3JkJyB9LFxyXG4gICAgICB9LFxyXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHXSBjcmVkZW50aWFscyByZWNlYmlkb3M6JywgSlNPTi5zdHJpbmdpZnkoY3JlZGVudGlhbHMpKTtcclxuXHJcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5zZW5oYSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1tERUJVR10gZmFsdG91IGVtYWlsIG91IHNlbmhhIG5vIHBheWxvYWQgcmVjZWJpZG8nKTtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXN1YXJpbyA9IGF3YWl0IGRiLnVzdWFyaW8uZmluZFVuaXF1ZSh7XHJcbiAgICAgICAgICB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwudHJpbSgpLnRvTG93ZXJDYXNlKCkgfSxcclxuICAgICAgICAgIGluY2x1ZGU6IHsgYWNlc3NvczogeyBzZWxlY3Q6IHsgZW1wcmVzYUlkOiB0cnVlIH0gfSB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXVzdWFyaW8gfHwgIXVzdWFyaW8uYXRpdm8pIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUddIHVzdWFyaW8gbnVsbyBvdSBpbmF0aXZvOicsIHVzdWFyaW8/LmVtYWlsLCB1c3VhcmlvPy5hdGl2byk7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUddIGhhc2ggZG8gYmFuY286JywgSlNPTi5zdHJpbmdpZnkodXN1YXJpby5zZW5oYUhhc2gpLCAndGFtYW5obzonLCB1c3VhcmlvLnNlbmhhSGFzaC5sZW5ndGgpO1xyXG5cclxuICAgICAgICBjb25zdCBzZW5oYU9rID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3JlZGVudGlhbHMuc2VuaGEsIHVzdWFyaW8uc2VuaGFIYXNoKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHXSByZXN1bHRhZG8gYmNyeXB0LmNvbXBhcmU6Jywgc2VuaGFPayk7XHJcblxyXG4gICAgICAgIGlmICghc2VuaGFPaykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGF3YWl0IGRiLnVzdWFyaW8udXBkYXRlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGlkOiB1c3VhcmlvLmlkIH0sXHJcbiAgICAgICAgICBkYXRhOiB7IHVsdGltb0xvZ2luOiBuZXcgRGF0ZSgpIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGRiLmxvZ0F0aXZpZGFkZS5jcmVhdGUoe1xyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICB1c3VhcmlvSWQ6IHVzdWFyaW8uaWQsXHJcbiAgICAgICAgICAgIGNhdGVnb3JpYTogJ2xvZ2luJyxcclxuICAgICAgICAgICAgYWNhbzogJ0xvZ2luIGJlbS1zdWNlZGlkbycsXHJcbiAgICAgICAgICAgIGRldGFsaGU6IHVzdWFyaW8uZW1haWwsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaWQ6IHVzdWFyaW8uaWQsXHJcbiAgICAgICAgICBuYW1lOiB1c3VhcmlvLm5vbWUsXHJcbiAgICAgICAgICBlbWFpbDogdXN1YXJpby5lbWFpbCxcclxuICAgICAgICAgIHJvbGU6IHVzdWFyaW8ucm9sZSxcclxuICAgICAgICAgIGFjZXNzb3M6IHVzdWFyaW8uYWNlc3Nvcy5tYXAoKGEpID0+IGEuZW1wcmVzYUlkKSxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxuICBjYWxsYmFja3M6IHtcclxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcclxuICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICB0b2tlbi5yb2xlID0gKHVzZXIgYXMgYW55KS5yb2xlO1xyXG4gICAgICAgIHRva2VuLmFjZXNzb3MgPSAodXNlciBhcyBhbnkpLmFjZXNzb3M7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9KSB7XHJcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcclxuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkucm9sZSA9IHRva2VuLnJvbGU7XHJcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLmFjZXNzb3MgPSB0b2tlbi5hY2Vzc29zO1xyXG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5pZCA9IHRva2VuLnN1YjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc2Vzc2lvbjtcclxuICAgIH0sXHJcbiAgfSxcclxufTsiXSwibmFtZXMiOlsiQ3JlZGVudGlhbHNQcm92aWRlciIsImJjcnlwdCIsImRiIiwiYXV0aE9wdGlvbnMiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJtYXhBZ2UiLCJwYWdlcyIsInNpZ25JbiIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwic2VuaGEiLCJhdXRob3JpemUiLCJjb25zb2xlIiwibG9nIiwiSlNPTiIsInN0cmluZ2lmeSIsInVzdWFyaW8iLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlIiwiYWNlc3NvcyIsInNlbGVjdCIsImVtcHJlc2FJZCIsImF0aXZvIiwic2VuaGFIYXNoIiwibGVuZ3RoIiwic2VuaGFPayIsImNvbXBhcmUiLCJ1cGRhdGUiLCJpZCIsImRhdGEiLCJ1bHRpbW9Mb2dpbiIsIkRhdGUiLCJsb2dBdGl2aWRhZGUiLCJjcmVhdGUiLCJ1c3VhcmlvSWQiLCJjYXRlZ29yaWEiLCJhY2FvIiwiZGV0YWxoZSIsIm5vbWUiLCJyb2xlIiwibWFwIiwiYSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwidXNlciIsInN1YiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/db.ts":
/*!***********************!*\
  !*** ./src/lib/db.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   db: () => (/* binding */ db)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst db = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        \"query\",\n        \"error\",\n        \"warn\"\n    ] : 0\n});\nif (true) {\n    globalForPrisma.prisma = db;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2RiLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBRWpCLE1BQU1DLEtBQ1RGLGdCQUFnQkcsTUFBTSxJQUN0QixJQUFJSix3REFBWUEsQ0FBQztJQUNiSyxLQUFLQyxLQUF5QixHQUFnQjtRQUFDO1FBQVM7UUFBUztLQUFPLEdBQUcsQ0FBUztBQUN4RixHQUFHO0FBRVAsSUFBSUEsSUFBeUIsRUFBYztJQUN2Q0wsZ0JBQWdCRyxNQUFNLEdBQUdEO0FBQzdCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb25lLWZpbmFuY2UtcG9ydGFsLy4vc3JjL2xpYi9kYi50cz85ZTRmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50JztcclxuXHJcbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7IHByaXNtYTogUHJpc21hQ2xpZW50IH07XHJcblxyXG5leHBvcnQgY29uc3QgZGIgPVxyXG4gICAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xyXG4gICAgbmV3IFByaXNtYUNsaWVudCh7XHJcbiAgICAgICAgbG9nOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IFsncXVlcnknLCAnZXJyb3InLCAnd2FybiddIDogWydlcnJvciddLFxyXG4gICAgfSk7XHJcblxyXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG4gICAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IGRiO1xyXG59Il0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJkYiIsInByaXNtYSIsImxvZyIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/db.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/rbac.ts":
/*!*************************!*\
  !*** ./src/lib/rbac.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getSessaoOuNull: () => (/* binding */ getSessaoOuNull),\n/* harmony export */   podeAcessarCliente: () => (/* binding */ podeAcessarCliente)\n/* harmony export */ });\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\nasync function getSessaoOuNull() {\n    const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_0__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n    if (!session?.user) return null;\n    const user = session.user;\n    return {\n        id: user.id,\n        role: user.role,\n        acessos: user.acessos ?? []\n    };\n}\nfunction podeAcessarCliente(sessao, empresaId) {\n    if (sessao.role === \"ADMIN\") return true;\n    return sessao.acessos.includes(empresaId);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3JiYWMudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFrRDtBQUNUO0FBUWxDLGVBQWVFO0lBQ3BCLE1BQU1DLFVBQVUsTUFBTUgsZ0VBQWdCQSxDQUFDQyxrREFBV0E7SUFDbEQsSUFBSSxDQUFDRSxTQUFTQyxNQUFNLE9BQU87SUFDM0IsTUFBTUEsT0FBT0QsUUFBUUMsSUFBSTtJQUN6QixPQUFPO1FBQUVDLElBQUlELEtBQUtDLEVBQUU7UUFBRUMsTUFBTUYsS0FBS0UsSUFBSTtRQUFFQyxTQUFTSCxLQUFLRyxPQUFPLElBQUksRUFBRTtJQUFDO0FBQ3JFO0FBRU8sU0FBU0MsbUJBQW1CQyxNQUFxQixFQUFFQyxTQUFpQjtJQUN6RSxJQUFJRCxPQUFPSCxJQUFJLEtBQUssU0FBUyxPQUFPO0lBQ3BDLE9BQU9HLE9BQU9GLE9BQU8sQ0FBQ0ksUUFBUSxDQUFDRDtBQUNqQyIsInNvdXJjZXMiOlsid2VicGFjazovL29uZS1maW5hbmNlLXBvcnRhbC8uL3NyYy9saWIvcmJhYy50cz8zNjMxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgvbmV4dCc7XHJcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9saWIvYXV0aCc7XHJcblxyXG5leHBvcnQgdHlwZSBTZXNzYW9Vc3VhcmlvID0ge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgcm9sZTogJ0FETUlOJyB8ICdMSU1JVEFETyc7XHJcbiAgYWNlc3Nvczogc3RyaW5nW107XHJcbn07XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2Vzc2FvT3VOdWxsKCk6IFByb21pc2U8U2Vzc2FvVXN1YXJpbyB8IG51bGw+IHtcclxuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XHJcbiAgaWYgKCFzZXNzaW9uPy51c2VyKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCB1c2VyID0gc2Vzc2lvbi51c2VyIGFzIGFueTtcclxuICByZXR1cm4geyBpZDogdXNlci5pZCwgcm9sZTogdXNlci5yb2xlLCBhY2Vzc29zOiB1c2VyLmFjZXNzb3MgPz8gW10gfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBvZGVBY2Vzc2FyQ2xpZW50ZShzZXNzYW86IFNlc3Nhb1VzdWFyaW8sIGVtcHJlc2FJZDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgaWYgKHNlc3Nhby5yb2xlID09PSAnQURNSU4nKSByZXR1cm4gdHJ1ZTtcclxuICByZXR1cm4gc2Vzc2FvLmFjZXNzb3MuaW5jbHVkZXMoZW1wcmVzYUlkKTtcclxufSJdLCJuYW1lcyI6WyJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJnZXRTZXNzYW9PdU51bGwiLCJzZXNzaW9uIiwidXNlciIsImlkIiwicm9sZSIsImFjZXNzb3MiLCJwb2RlQWNlc3NhckNsaWVudGUiLCJzZXNzYW8iLCJlbXByZXNhSWQiLCJpbmNsdWRlcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/rbac.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fv1%2Fsync%2Froute&page=%2Fapi%2Fv1%2Fsync%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fv1%2Fsync%2Froute.ts&appDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Crafae%5Ccodes%5CPortal-do-Cliente&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();