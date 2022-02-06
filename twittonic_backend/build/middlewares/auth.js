"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthHeaders = void 0;
var checkAuthHeaders = function (req, res, next) {
    if ('authorization' in req.headers)
        return next();
    return res.status(400).json({ message: "Token is missing!" });
};
exports.checkAuthHeaders = checkAuthHeaders;
