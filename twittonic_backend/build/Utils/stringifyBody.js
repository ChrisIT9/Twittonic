"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyBody = void 0;
var stringifyBody = function (obj) {
    return Object.entries(obj).reduce(function (acc, _a, index) {
        var key = _a[0], value = _a[1];
        return (!index ? key + "=" + value : acc + "&" + key + "=" + value);
    }, "");
};
exports.stringifyBody = stringifyBody;
