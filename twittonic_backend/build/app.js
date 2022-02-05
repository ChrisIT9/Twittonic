"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.twitterEndpoint = void 0;
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var Auth_1 = __importDefault(require("./Routes/Auth"));
var Users_1 = __importDefault(require("./Routes/Users"));
exports.twitterEndpoint = "https://api.twitter.com/2";
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/2/oauth2", Auth_1.default);
app.use("/2/users", Users_1.default);
app.listen(3001, function () { return console.log("Server up on 3001"); });
