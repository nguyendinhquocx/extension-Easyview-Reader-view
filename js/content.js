(function() {
    function D(h, z, j) {
        function F(Z, A) {
            if (!z[Z]) {
                if (!h[Z]) {
                    var q = "function" == typeof require && require;
                    if (!A && q) return q(Z, !0);
                    if (l) return l(Z, !0);
                    var Q = new Error("Cannot find module '" + Z + "'");
                    throw Q.code = "MODULE_NOT_FOUND", Q;
                }
                var I = z[Z] = {
                    exports: {}
                };
                h[Z][0].call(I.exports, (function(D) {
                    var z = h[Z][1][D];
                    return F(z || D);
                }), I, I.exports, D, h, z, j);
            }
            return z[Z].exports;
        }
        for (var l = "function" == typeof require && require, Z = 0; Z < j.length; Z++) F(j[Z]);
        return F;
    }
    return D;
})()({
    1: [ function(D, h, z) {
        "use strict";
        var j = void 0 && (void 0).__importDefault || function(D) {
            return D && D.__esModule ? D : {
                default: D
            };
        };
        Object.defineProperty(z, "__esModule", {
            value: true
        });
        const F = j(D("rx")), l = D("ZA");
        document.addEventListener("DOMContentLoaded", (async () => {
            const D = window.location.href;
            if (!D) return;
            const h = new F.default, z = await h.getSavedSites();
            if (z[D] === 1) {
                const D = {
                    action: l.MessageAction.OPEN_ON_TAB
                };
                chrome.runtime.sendMessage(D);
            }
        }));
    }, {
        ZA: 2,
        rx: 4
    } ],
    2: [ function(D, h, z) {
        "use strict";
        var j;
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.MessageAction = void 0, function(D) {
            D["ENABLE_READER"] = "enableReader", D["CLOSE_READER"] = "closeReader", D["OPEN_READER"] = "openReader",
            D["OPEN_ON_TAB"] = "openOnTab", D["GET_ARTICLE"] = "getArticle", D["SEND_NOTIFICATION"] = "sendNotification",
            D["OPEN_URL"] = "openUrl";
        }(j = z.MessageAction || (z.MessageAction = {}));
    }, {} ],
    3: [ function(D, h, z) {
        "use strict";
        var j;
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.StorageKeys = void 0, function(D) {
            D["SETTINGS"] = "settings", D["SAVED_SITES"] = "savedSites";
        }(j = z.StorageKeys || (z.StorageKeys = {}));
    }, {} ],
    4: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        }), z.DEFAULT_SETTINGS = z.DEFAULT_VIEWER_SETTINGS = void 0;
        const j = D("ZA");
        z.DEFAULT_VIEWER_SETTINGS = {
            fontFamily: "ibm-plex-sans",
            fontSize: 17,
            pageWidth: 850,
            lineHeight: 28,
            showLinks: true,
            showImages: true,
            theme: "white"
        }, z.DEFAULT_SETTINGS = Object.assign({}, z.DEFAULT_VIEWER_SETTINGS);
        class F {
            constructor() {
                this.settings = z.DEFAULT_SETTINGS, this.savedSites = {};
            }
            static async init() {
                await chrome.storage.local.set({
                    [j.StorageKeys.SETTINGS]: z.DEFAULT_SETTINGS
                });
            }
            async load() {
                const D = await chrome.storage.local.get([ j.StorageKeys.SETTINGS, j.StorageKeys.SAVED_SITES ]), h = D[j.StorageKeys.SETTINGS], z = D[j.StorageKeys.SAVED_SITES];
                if (h) this.settings = h;
                if (z) this.savedSites = z;
            }
            async updateSettings(D) {
                await this.load(), this.settings = Object.assign(Object.assign({}, this.settings), D),
                await chrome.storage.local.set({
                    [j.StorageKeys.SETTINGS]: this.settings
                });
            }
            async getSettings() {
                return await this.load(), this.settings;
            }
            async updateSavedSites(D) {
                await this.load(), this.savedSites = Object.assign(Object.assign({}, this.savedSites), D),
                await chrome.storage.local.set({
                    [j.StorageKeys.SAVED_SITES]: this.savedSites
                });
            }
            async getSavedSites() {
                return await this.load(), this.savedSites;
            }
        }
        z.default = F;
    }, {
        ZA: 3
    } ]
}, {}, [ 1 ]);