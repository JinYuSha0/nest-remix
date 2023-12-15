"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deferred = exports.noop = void 0;
function noop() { }
exports.noop = noop;
function deferred() {
    let resolve = noop;
    let reject = noop;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve,
        reject,
    };
}
exports.deferred = deferred;
//# sourceMappingURL=helper.js.map