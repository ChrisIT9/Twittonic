"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors_anywhere_1 = __importDefault(require("cors-anywhere"));
// Listen on a specific host via the HOST environment variable
var host = '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = 8080;
cors_anywhere_1.default.createServer({
    originWhitelist: [], // Allow all origins
}).listen(port, host, function () {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
