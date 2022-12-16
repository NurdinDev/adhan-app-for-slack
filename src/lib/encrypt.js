"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Encrypted_password, _Encrypted_salt, _Encrypted_secret;
exports.__esModule = true;
exports.Encrypted = void 0;
var crypto = require("crypto");
var env = require("env-var");
var Encrypted = /** @class */ (function () {
    function Encrypted() {
        var _this = this;
        this.algorithm = 'aes-256-cbc';
        _Encrypted_password.set(this, env.get('CRYPTO_SECRET').required().asString());
        _Encrypted_salt.set(this, env.get('CRYPTO_SALT').required().asString());
        _Encrypted_secret.set(this, env.get('CRYPTO_SECRET').required().asString());
        this.generateRandomString = function (length) {
            return crypto
                .randomBytes(length)
                .reduce(function (p, i) { return p + (i % 36).toString(36); }, '');
        };
        this.encodeInformation = function (info) {
            var envelop = { data: info, secret: _this.secret };
            var cipher = crypto.createCipheriv(_this.algorithm, _this.key, _this.iv); // 暗号用インスタンス
            var cipheredData = cipher.update(JSON.stringify(envelop), 'utf8', 'hex') +
                cipher.final('hex');
            return cipheredData;
        };
        this.decodeInformation = function (cipheredData) {
            var decipher = crypto.createDecipheriv(_this.algorithm, _this.key, _this.iv); // 復号用インスタンス
            var decipheredDataJson = decipher.update(cipheredData, 'hex', 'utf8') + decipher.final('utf8');
            var decipheredData = JSON.parse(decipheredDataJson);
            if (decipheredData.secret === _this.secret) {
                decipheredData.secret = undefined;
                return decipheredData.data;
            }
            else {
                console.log('!!!!!!!!!!! secret is not match !!!!!!!!!!!');
                return null;
            }
        };
        this.password = __classPrivateFieldGet(this, _Encrypted_password, "f");
        this.salt = __classPrivateFieldGet(this, _Encrypted_salt, "f");
        this.secret = __classPrivateFieldGet(this, _Encrypted_secret, "f");
        this.key = crypto.scryptSync(this.password, this.salt, 32);
        // this.iv = params.iv || crypto.randomBytes(16);
        this.iv = Buffer.from([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        ]);
    }
    return Encrypted;
}());
exports.Encrypted = Encrypted;
_Encrypted_password = new WeakMap(), _Encrypted_salt = new WeakMap(), _Encrypted_secret = new WeakMap();
