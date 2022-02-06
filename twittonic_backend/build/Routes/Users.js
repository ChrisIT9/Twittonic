"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var app_1 = require("../app");
var auth_1 = require("../middlewares/auth");
var usersRouter = express_1.default.Router();
usersRouter.get('/me', auth_1.checkAuthHeaders, function (_a, res) {
    var Authorization = _a.headers.authorization, userFields = _a.query["user.fields"];
    return __awaiter(void 0, void 0, void 0, function () {
        var userData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(app_1.twitterEndpoint + "/users/me?user.fields=" + userFields, {
                            headers: { Authorization: Authorization }
                        })];
                case 1:
                    userData = (_b.sent()).data.data;
                    return [2 /*return*/, res.status(200).json({ data: userData })];
                case 2:
                    error_1 = _b.sent();
                    return [2 /*return*/, res.status(400).json(error_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
});
usersRouter.get('/:id/following', auth_1.checkAuthHeaders, function (_a, res) {
    var Authorization = _a.headers.authorization, id = _a.params.id, userFields = _a.query["user.fields"];
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            try {
            }
            catch (error) {
            }
            return [2 /*return*/];
        });
    });
});
usersRouter.get("/:id/tweets", auth_1.checkAuthHeaders, function (_a, res) {
    var Authorization = _a.headers.authorization, id = _a.params.id, _b = _a.query, tweetFields = _b["tweet.fields"], expansions = _b.expansions, mediaFields = _b["media.fields"], userFields = _b["user.fields"], maxResults = _b["max_results"];
    return __awaiter(void 0, void 0, void 0, function () {
        var data, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(app_1.twitterEndpoint + "/users/" + id + "/tweets?tweet.fields=" + tweetFields + "&expansions=" + expansions + "&media.fields=" + mediaFields + "&user.fields=" + userFields + "&max_results=" + maxResults, {
                            headers: { Authorization: Authorization }
                        })];
                case 1:
                    data = (_c.sent()).data;
                    return [2 /*return*/, res.status(200).json(data)];
                case 2:
                    error_2 = _c.sent();
                    return [2 /*return*/, res.status(500).json(error_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
});
exports.default = usersRouter;
