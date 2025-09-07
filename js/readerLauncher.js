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
        var j = {
            unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
            okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i
        };
        function F(D) {
            return (!D.style || D.style.display != "none") && !D.hasAttribute("hidden") && (!D.hasAttribute("aria-hidden") || D.getAttribute("aria-hidden") != "true" || D.className && D.className.indexOf && D.className.indexOf("fallback-image") !== -1);
        }
        function l(D, h = {}) {
            if (typeof h == "function") h = {
                visibilityChecker: h
            };
            var z = {
                minScore: 20,
                minContentLength: 140,
                visibilityChecker: F
            };
            h = Object.assign(z, h);
            var l = D.querySelectorAll("p, pre, article"), Z = D.querySelectorAll("div > br");
            if (Z.length) {
                var A = new Set(l);
                [].forEach.call(Z, (function(D) {
                    A.add(D.parentNode);
                })), l = Array.from(A);
            }
            var q = 0;
            return [].some.call(l, (function(D) {
                if (!h.visibilityChecker(D)) return false;
                var z = D.className + " " + D.id;
                if (j.unlikelyCandidates.test(z) && !j.okMaybeItsACandidate.test(z)) return false;
                if (D.matches("li p")) return false;
                var F = D.textContent.trim().length;
                if (F < h.minContentLength) return false;
                if (q += Math.sqrt(F - h.minContentLength), q > h.minScore) return true;
                return false;
            }));
        }
        if (typeof h === "object") h.exports = l;
    }, {} ],
    2: [ function(D, h, z) {
        "use strict";
        function j(D, h) {
            if (h && h.documentElement) D = h, h = arguments[2]; else if (!D || !D.documentElement) throw new Error("First argument to Readability constructor should be a document object.");
            if (h = h || {}, this._doc = D, this._docJSDOMParser = this._doc.firstChild.__JSDOMParser__,
            this._articleTitle = null, this._articleByline = null, this._articleDir = null,
            this._articleSiteName = null, this._attempts = [], this._debug = !!h.debug, this._maxElemsToParse = h.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE,
            this._nbTopCandidates = h.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES, this._charThreshold = h.charThreshold || this.DEFAULT_CHAR_THRESHOLD,
            this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(h.classesToPreserve || []),
            this._keepClasses = !!h.keepClasses, this._serializer = h.serializer || function(D) {
                return D.innerHTML;
            }, this._disableJSONLD = !!h.disableJSONLD, this._allowedVideoRegex = h.allowedVideoRegex || this.REGEXPS.videos,
            this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY,
            this._debug) {
                let D = function(D) {
                    if (D.nodeType == D.TEXT_NODE) return `${D.nodeName} ("${D.textContent}")`;
                    let h = Array.from(D.attributes || [], (function(D) {
                        return `${D.name}="${D.value}"`;
                    })).join(" ");
                    return `<${D.localName} ${h}>`;
                };
                this.log = function() {
                    if (typeof console !== "undefined") {
                        let h = Array.from(arguments, (h => {
                            if (h && h.nodeType == this.ELEMENT_NODE) return D(h);
                            return h;
                        }));
                        h.unshift("Reader: (Readability)");
                    } else if (typeof dump !== "undefined") {
                        var h = Array.prototype.map.call(arguments, (function(h) {
                            return h && h.nodeName ? D(h) : h;
                        })).join(" ");
                        dump("Reader: (Readability) " + h + "\n");
                    }
                };
            } else this.log = function() {};
        }
        if (j.prototype = {
            FLAG_STRIP_UNLIKELYS: 1,
            FLAG_WEIGHT_CLASSES: 2,
            FLAG_CLEAN_CONDITIONALLY: 4,
            ELEMENT_NODE: 1,
            TEXT_NODE: 3,
            DEFAULT_MAX_ELEMS_TO_PARSE: 0,
            DEFAULT_N_TOP_CANDIDATES: 5,
            DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),
            DEFAULT_CHAR_THRESHOLD: 500,
            REGEXPS: {
                unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
                okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
                positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
                negative: /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,
                extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
                byline: /byline|author|dateline|writtenby|p-author/i,
                replaceFonts: /<(\/?)font[^>]*>/gi,
                normalize: /\s{2,}/g,
                videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,
                shareElements: /(\b|_)(share|sharedaddy)(\b|_)/i,
                nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
                prevLink: /(prev|earl|old|new|<|«)/i,
                tokenize: /\W+/g,
                whitespace: /^\s*$/,
                hasContent: /\S$/,
                hashUrl: /^#.+/,
                srcsetUrl: /(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,
                b64DataUrl: /^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,
                jsonLdArticleTypes: /^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/
            },
            UNLIKELY_ROLES: [ "menu", "menubar", "complementary", "navigation", "alert", "alertdialog", "dialog" ],
            DIV_TO_P_ELEMS: new Set([ "BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL" ]),
            ALTER_TO_DIV_EXCEPTIONS: [ "DIV", "ARTICLE", "SECTION", "P" ],
            PRESENTATIONAL_ATTRIBUTES: [ "align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace" ],
            DEPRECATED_SIZE_ATTRIBUTE_ELEMS: [ "TABLE", "TH", "TD", "HR", "PRE" ],
            PHRASING_ELEMS: [ "ABBR", "AUDIO", "B", "BDO", "BR", "BUTTON", "CITE", "CODE", "DATA", "DATALIST", "DFN", "EM", "EMBED", "I", "IMG", "INPUT", "KBD", "LABEL", "MARK", "MATH", "METER", "NOSCRIPT", "OBJECT", "OUTPUT", "PROGRESS", "Q", "RUBY", "SAMP", "SCRIPT", "SELECT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TEXTAREA", "TIME", "VAR", "WBR" ],
            CLASSES_TO_PRESERVE: [ "page" ],
            HTML_ESCAPE_MAP: {
                lt: "<",
                gt: ">",
                amp: "&",
                quot: '"',
                apos: "'"
            },
            _postProcessContent: function(D) {
                if (this._fixRelativeUris(D), this._simplifyNestedElements(D), !this._keepClasses) this._cleanClasses(D);
            },
            _removeNodes: function(D, h) {
                if (this._docJSDOMParser && D._isLiveNodeList) throw new Error("Do not pass live node lists to _removeNodes");
                for (var z = D.length - 1; z >= 0; z--) {
                    var j = D[z], F = j.parentNode;
                    if (F) if (!h || h.call(this, j, z, D)) F.removeChild(j);
                }
            },
            _replaceNodeTags: function(D, h) {
                if (this._docJSDOMParser && D._isLiveNodeList) throw new Error("Do not pass live node lists to _replaceNodeTags");
                for (const z of D) this._setNodeTag(z, h);
            },
            _forEachNode: function(D, h) {
                Array.prototype.forEach.call(D, h, this);
            },
            _findNode: function(D, h) {
                return Array.prototype.find.call(D, h, this);
            },
            _someNode: function(D, h) {
                return Array.prototype.some.call(D, h, this);
            },
            _everyNode: function(D, h) {
                return Array.prototype.every.call(D, h, this);
            },
            _concatNodeLists: function() {
                var D = Array.prototype.slice, h = D.call(arguments), z = h.map((function(h) {
                    return D.call(h);
                }));
                return Array.prototype.concat.apply([], z);
            },
            _getAllNodesWithTag: function(D, h) {
                if (D.querySelectorAll) return D.querySelectorAll(h.join(","));
                return [].concat.apply([], h.map((function(h) {
                    var z = D.getElementsByTagName(h);
                    return Array.isArray(z) ? z : Array.from(z);
                })));
            },
            _cleanClasses: function(D) {
                var h = this._classesToPreserve, z = (D.getAttribute("class") || "").split(/\s+/).filter((function(D) {
                    return h.indexOf(D) != -1;
                })).join(" ");
                if (z) D.setAttribute("class", z); else D.removeAttribute("class");
                for (D = D.firstElementChild; D; D = D.nextElementSibling) this._cleanClasses(D);
            },
            _fixRelativeUris: function(D) {
                var h = this._doc.baseURI, z = this._doc.documentURI;
                function j(D) {
                    if (h == z && D.charAt(0) == "#") return D;
                    try {
                        return new URL(D, h).href;
                    } catch (D) {}
                    return D;
                }
                var F = this._getAllNodesWithTag(D, [ "a" ]);
                this._forEachNode(F, (function(D) {
                    var h = D.getAttribute("href");
                    if (h) if (h.indexOf("javascript:") === 0) if (D.childNodes.length === 1 && D.childNodes[0].nodeType === this.TEXT_NODE) {
                        var z = this._doc.createTextNode(D.textContent);
                        D.parentNode.replaceChild(z, D);
                    } else {
                        var F = this._doc.createElement("span");
                        while (D.firstChild) F.appendChild(D.firstChild);
                        D.parentNode.replaceChild(F, D);
                    } else D.setAttribute("href", j(h));
                }));
                var l = this._getAllNodesWithTag(D, [ "img", "picture", "figure", "video", "audio", "source" ]);
                this._forEachNode(l, (function(D) {
                    var h = D.getAttribute("src"), z = D.getAttribute("poster"), F = D.getAttribute("srcset");
                    if (h) D.setAttribute("src", j(h));
                    if (z) D.setAttribute("poster", j(z));
                    if (F) {
                        var l = F.replace(this.REGEXPS.srcsetUrl, (function(D, h, z, F) {
                            return j(h) + (z || "") + F;
                        }));
                        D.setAttribute("srcset", l);
                    }
                }));
            },
            _simplifyNestedElements: function(D) {
                var h = D;
                while (h) {
                    if (h.parentNode && [ "DIV", "SECTION" ].includes(h.tagName) && !(h.id && h.id.startsWith("readability"))) if (this._isElementWithoutContent(h)) {
                        h = this._removeAndGetNext(h);
                        continue;
                    } else if (this._hasSingleTagInsideElement(h, "DIV") || this._hasSingleTagInsideElement(h, "SECTION")) {
                        for (var z = h.children[0], j = 0; j < h.attributes.length; j++) z.setAttribute(h.attributes[j].name, h.attributes[j].value);
                        h.parentNode.replaceChild(z, h), h = z;
                        continue;
                    }
                    h = this._getNextNode(h);
                }
            },
            _getArticleTitle: function() {
                var D = this._doc, h = "", z = "";
                try {
                    if (h = z = D.title.trim(), typeof h !== "string") h = z = this._getInnerText(D.getElementsByTagName("title")[0]);
                } catch (D) {}
                var j = false;
                function F(D) {
                    return D.split(/\s+/).length;
                }
                if (/ [\|\-\\\/>»] /.test(h)) {
                    if (j = / [\\\/>»] /.test(h), h = z.replace(/(.*)[\|\-\\\/>»] .*/gi, "$1"), F(h) < 3) h = z.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi, "$1");
                } else if (h.indexOf(": ") !== -1) {
                    var l = this._concatNodeLists(D.getElementsByTagName("h1"), D.getElementsByTagName("h2")), Z = h.trim(), A = this._someNode(l, (function(D) {
                        return D.textContent.trim() === Z;
                    }));
                    if (!A) if (h = z.substring(z.lastIndexOf(":") + 1), F(h) < 3) h = z.substring(z.indexOf(":") + 1); else if (F(z.substr(0, z.indexOf(":"))) > 5) h = z;
                } else if (h.length > 150 || h.length < 15) {
                    var q = D.getElementsByTagName("h1");
                    if (q.length === 1) h = this._getInnerText(q[0]);
                }
                h = h.trim().replace(this.REGEXPS.normalize, " ");
                var Q = F(h);
                if (Q <= 4 && (!j || Q != F(z.replace(/[\|\-\\\/>»]+/g, "")) - 1)) h = z;
                return h;
            },
            _prepDocument: function() {
                var D = this._doc;
                if (this._removeNodes(this._getAllNodesWithTag(D, [ "style" ])), D.body) this._replaceBrs(D.body);
                this._replaceNodeTags(this._getAllNodesWithTag(D, [ "font" ]), "SPAN");
            },
            _nextNode: function(D) {
                var h = D;
                while (h && h.nodeType != this.ELEMENT_NODE && this.REGEXPS.whitespace.test(h.textContent)) h = h.nextSibling;
                return h;
            },
            _replaceBrs: function(D) {
                this._forEachNode(this._getAllNodesWithTag(D, [ "br" ]), (function(D) {
                    var h = D.nextSibling, z = false;
                    while ((h = this._nextNode(h)) && h.tagName == "BR") {
                        z = true;
                        var j = h.nextSibling;
                        h.parentNode.removeChild(h), h = j;
                    }
                    if (z) {
                        var F = this._doc.createElement("p");
                        D.parentNode.replaceChild(F, D), h = F.nextSibling;
                        while (h) {
                            if (h.tagName == "BR") {
                                var l = this._nextNode(h.nextSibling);
                                if (l && l.tagName == "BR") break;
                            }
                            if (!this._isPhrasingContent(h)) break;
                            var Z = h.nextSibling;
                            F.appendChild(h), h = Z;
                        }
                        while (F.lastChild && this._isWhitespace(F.lastChild)) F.removeChild(F.lastChild);
                        if (F.parentNode.tagName === "P") this._setNodeTag(F.parentNode, "DIV");
                    }
                }));
            },
            _setNodeTag: function(D, h) {
                if (this.log("_setNodeTag", D, h), this._docJSDOMParser) return D.localName = h.toLowerCase(),
                D.tagName = h.toUpperCase(), D;
                var z = D.ownerDocument.createElement(h);
                while (D.firstChild) z.appendChild(D.firstChild);
                if (D.parentNode.replaceChild(z, D), D.readability) z.readability = D.readability;
                for (var j = 0; j < D.attributes.length; j++) try {
                    z.setAttribute(D.attributes[j].name, D.attributes[j].value);
                } catch (D) {}
                return z;
            },
            _prepArticle: function(D) {
                this._cleanStyles(D), this._markDataTables(D), this._fixLazyImages(D), this._cleanConditionally(D, "form"),
                this._cleanConditionally(D, "fieldset"), this._clean(D, "object"), this._clean(D, "embed"),
                this._clean(D, "footer"), this._clean(D, "link"), this._clean(D, "aside");
                var h = this.DEFAULT_CHAR_THRESHOLD;
                this._forEachNode(D.children, (function(D) {
                    this._cleanMatchedNodes(D, (function(D, z) {
                        return this.REGEXPS.shareElements.test(z) && D.textContent.length < h;
                    }));
                })), this._clean(D, "iframe"), this._clean(D, "input"), this._clean(D, "textarea"),
                this._clean(D, "select"), this._clean(D, "button"), this._cleanHeaders(D), this._cleanConditionally(D, "table"),
                this._cleanConditionally(D, "ul"), this._cleanConditionally(D, "div"), this._replaceNodeTags(this._getAllNodesWithTag(D, [ "h1" ]), "h2"),
                this._removeNodes(this._getAllNodesWithTag(D, [ "p" ]), (function(D) {
                    var h = D.getElementsByTagName("img").length, z = D.getElementsByTagName("embed").length, j = D.getElementsByTagName("object").length, F = D.getElementsByTagName("iframe").length, l = h + z + j + F;
                    return l === 0 && !this._getInnerText(D, false);
                })), this._forEachNode(this._getAllNodesWithTag(D, [ "br" ]), (function(D) {
                    var h = this._nextNode(D.nextSibling);
                    if (h && h.tagName == "P") D.parentNode.removeChild(D);
                })), this._forEachNode(this._getAllNodesWithTag(D, [ "table" ]), (function(D) {
                    var h = this._hasSingleTagInsideElement(D, "TBODY") ? D.firstElementChild : D;
                    if (this._hasSingleTagInsideElement(h, "TR")) {
                        var z = h.firstElementChild;
                        if (this._hasSingleTagInsideElement(z, "TD")) {
                            var j = z.firstElementChild;
                            j = this._setNodeTag(j, this._everyNode(j.childNodes, this._isPhrasingContent) ? "P" : "DIV"),
                            D.parentNode.replaceChild(j, D);
                        }
                    }
                }));
            },
            _initializeNode: function(D) {
                switch (D.readability = {
                    contentScore: 0
                }, D.tagName) {
                  case "DIV":
                    D.readability.contentScore += 5;
                    break;

                  case "PRE":
                  case "TD":
                  case "BLOCKQUOTE":
                    D.readability.contentScore += 3;
                    break;

                  case "ADDRESS":
                  case "OL":
                  case "UL":
                  case "DL":
                  case "DD":
                  case "DT":
                  case "LI":
                  case "FORM":
                    D.readability.contentScore -= 3;
                    break;

                  case "H1":
                  case "H2":
                  case "H3":
                  case "H4":
                  case "H5":
                  case "H6":
                  case "TH":
                    D.readability.contentScore -= 5;
                    break;
                }
                D.readability.contentScore += this._getClassWeight(D);
            },
            _removeAndGetNext: function(D) {
                var h = this._getNextNode(D, true);
                return D.parentNode.removeChild(D), h;
            },
            _getNextNode: function(D, h) {
                if (!h && D.firstElementChild) return D.firstElementChild;
                if (D.nextElementSibling) return D.nextElementSibling;
                do {
                    D = D.parentNode;
                } while (D && !D.nextElementSibling);
                return D && D.nextElementSibling;
            },
            _textSimilarity: function(D, h) {
                var z = D.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean), j = h.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
                if (!z.length || !j.length) return 0;
                var F = j.filter((D => !z.includes(D))), l = F.join(" ").length / j.join(" ").length;
                return 1 - l;
            },
            _checkByline: function(D, h) {
                if (this._articleByline) return false;
                if (D.getAttribute !== void 0) var z = D.getAttribute("rel"), j = D.getAttribute("itemprop");
                if ((z === "author" || j && j.indexOf("author") !== -1 || this.REGEXPS.byline.test(h)) && this._isValidByline(D.textContent)) return this._articleByline = D.textContent.trim(),
                true;
                return false;
            },
            _getNodeAncestors: function(D, h) {
                h = h || 0;
                var z = 0, j = [];
                while (D.parentNode) {
                    if (j.push(D.parentNode), h && ++z === h) break;
                    D = D.parentNode;
                }
                return j;
            },
            _grabArticle: function(D) {
                this.log("**** grabArticle ****");
                var h = this._doc, z = D !== null;
                if (D = D ? D : this._doc.body, !D) return this.log("No body found in document. Abort."),
                null;
                var j = D.innerHTML;
                while (true) {
                    this.log("Starting grabArticle loop");
                    var F = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS), l = [], Z = this._doc.documentElement;
                    let Y = true;
                    while (Z) {
                        if (Z.tagName === "HTML") this._articleLang = Z.getAttribute("lang");
                        var A = Z.className + " " + Z.id;
                        if (!this._isProbablyVisible(Z)) {
                            this.log("Removing hidden node - " + A), Z = this._removeAndGetNext(Z);
                            continue;
                        }
                        if (Z.getAttribute("aria-modal") == "true" && Z.getAttribute("role") == "dialog") {
                            Z = this._removeAndGetNext(Z);
                            continue;
                        }
                        if (this._checkByline(Z, A)) {
                            Z = this._removeAndGetNext(Z);
                            continue;
                        }
                        if (Y && this._headerDuplicatesTitle(Z)) {
                            this.log("Removing header: ", Z.textContent.trim(), this._articleTitle.trim()),
                            Y = false, Z = this._removeAndGetNext(Z);
                            continue;
                        }
                        if (F) {
                            if (this.REGEXPS.unlikelyCandidates.test(A) && !this.REGEXPS.okMaybeItsACandidate.test(A) && !this._hasAncestorTag(Z, "table") && !this._hasAncestorTag(Z, "code") && Z.tagName !== "BODY" && Z.tagName !== "A") {
                                this.log("Removing unlikely candidate - " + A), Z = this._removeAndGetNext(Z);
                                continue;
                            }
                            if (this.UNLIKELY_ROLES.includes(Z.getAttribute("role"))) {
                                this.log("Removing content with role " + Z.getAttribute("role") + " - " + A), Z = this._removeAndGetNext(Z);
                                continue;
                            }
                        }
                        if ((Z.tagName === "DIV" || Z.tagName === "SECTION" || Z.tagName === "HEADER" || Z.tagName === "H1" || Z.tagName === "H2" || Z.tagName === "H3" || Z.tagName === "H4" || Z.tagName === "H5" || Z.tagName === "H6") && this._isElementWithoutContent(Z)) {
                            Z = this._removeAndGetNext(Z);
                            continue;
                        }
                        if (this.DEFAULT_TAGS_TO_SCORE.indexOf(Z.tagName) !== -1) l.push(Z);
                        if (Z.tagName === "DIV") {
                            var q = null, Q = Z.firstChild;
                            while (Q) {
                                var I = Q.nextSibling;
                                if (this._isPhrasingContent(Q)) {
                                    if (q !== null) q.appendChild(Q); else if (!this._isWhitespace(Q)) q = h.createElement("p"),
                                    Z.replaceChild(q, Q), q.appendChild(Q);
                                } else if (q !== null) {
                                    while (q.lastChild && this._isWhitespace(q.lastChild)) q.removeChild(q.lastChild);
                                    q = null;
                                }
                                Q = I;
                            }
                            if (this._hasSingleTagInsideElement(Z, "P") && this._getLinkDensity(Z) < .25) {
                                var E = Z.children[0];
                                Z.parentNode.replaceChild(E, Z), Z = E, l.push(Z);
                            } else if (!this._hasChildBlockElement(Z)) Z = this._setNodeTag(Z, "P"), l.push(Z);
                        }
                        Z = this._getNextNode(Z);
                    }
                    var X = [];
                    this._forEachNode(l, (function(D) {
                        if (!D.parentNode || typeof D.parentNode.tagName === "undefined") return;
                        var h = this._getInnerText(D);
                        if (h.length < 25) return;
                        var z = this._getNodeAncestors(D, 5);
                        if (z.length === 0) return;
                        var j = 0;
                        j += 1, j += h.split(",").length, j += Math.min(Math.floor(h.length / 100), 3),
                        this._forEachNode(z, (function(D, h) {
                            if (!D.tagName || !D.parentNode || typeof D.parentNode.tagName === "undefined") return;
                            if (typeof D.readability === "undefined") this._initializeNode(D), X.push(D);
                            if (h === 0) var z = 1; else if (h === 1) z = 2; else z = h * 3;
                            D.readability.contentScore += j / z;
                        }));
                    }));
                    for (var f = [], s = 0, L = X.length; s < L; s += 1) {
                        var P = X[s], x = P.readability.contentScore * (1 - this._getLinkDensity(P));
                        P.readability.contentScore = x, this.log("Candidate:", P, "with score " + x);
                        for (var n = 0; n < this._nbTopCandidates; n++) {
                            var w = f[n];
                            if (!w || x > w.readability.contentScore) {
                                if (f.splice(n, 0, P), f.length > this._nbTopCandidates) f.pop();
                                break;
                            }
                        }
                    }
                    var J = f[0] || null, a = false, d;
                    if (J === null || J.tagName === "BODY") {
                        J = h.createElement("DIV"), a = true;
                        while (D.firstChild) this.log("Moving child out:", D.firstChild), J.appendChild(D.firstChild);
                        D.appendChild(J), this._initializeNode(J);
                    } else if (J) {
                        for (var H = [], K = 1; K < f.length; K++) if (f[K].readability.contentScore / J.readability.contentScore >= .75) H.push(this._getNodeAncestors(f[K]));
                        var c = 3;
                        if (H.length >= c) {
                            d = J.parentNode;
                            while (d.tagName !== "BODY") {
                                for (var M = 0, S = 0; S < H.length && M < c; S++) M += Number(H[S].includes(d));
                                if (M >= c) {
                                    J = d;
                                    break;
                                }
                                d = d.parentNode;
                            }
                        }
                        if (!J.readability) this._initializeNode(J);
                        d = J.parentNode;
                        var T = J.readability.contentScore, e = T / 3;
                        while (d.tagName !== "BODY") {
                            if (!d.readability) {
                                d = d.parentNode;
                                continue;
                            }
                            var v = d.readability.contentScore;
                            if (v < e) break;
                            if (v > T) {
                                J = d;
                                break;
                            }
                            T = d.readability.contentScore, d = d.parentNode;
                        }
                        d = J.parentNode;
                        while (d.tagName != "BODY" && d.children.length == 1) J = d, d = J.parentNode;
                        if (!J.readability) this._initializeNode(J);
                    }
                    var m = h.createElement("DIV");
                    if (z) m.id = "readability-content";
                    var G = Math.max(10, J.readability.contentScore * .2);
                    d = J.parentNode;
                    for (var r = d.children, t = 0, C = r.length; t < C; t++) {
                        var y = r[t], k = false;
                        if (this.log("Looking at sibling node:", y, y.readability ? "with score " + y.readability.contentScore : ""),
                        this.log("Sibling has score", y.readability ? y.readability.contentScore : "Unknown"),
                        y === J) k = true; else {
                            var W = 0;
                            if (y.className === J.className && J.className !== "") W += J.readability.contentScore * .2;
                            if (y.readability && y.readability.contentScore + W >= G) k = true; else if (y.nodeName === "P") {
                                var U = this._getLinkDensity(y), p = this._getInnerText(y), u = p.length;
                                if (u > 80 && U < .25) k = true; else if (u < 80 && u > 0 && U === 0 && p.search(/\.( |$)/) !== -1) k = true;
                            }
                        }
                        if (k) {
                            if (this.log("Appending node:", y), this.ALTER_TO_DIV_EXCEPTIONS.indexOf(y.nodeName) === -1) this.log("Altering sibling:", y, "to div."),
                            y = this._setNodeTag(y, "DIV");
                            m.appendChild(y), r = d.children, t -= 1, C -= 1;
                        }
                    }
                    if (this._debug) this.log("Article content pre-prep: " + m.innerHTML);
                    if (this._prepArticle(m), this._debug) this.log("Article content post-prep: " + m.innerHTML);
                    if (a) J.id = "readability-page-1", J.className = "page"; else {
                        var O = h.createElement("DIV");
                        O.id = "readability-page-1", O.className = "page";
                        while (m.firstChild) O.appendChild(m.firstChild);
                        m.appendChild(O);
                    }
                    if (this._debug) this.log("Article content after paging: " + m.innerHTML);
                    var o = true, b = this._getInnerText(m, true).length;
                    if (b < this._charThreshold) if (o = false, D.innerHTML = j, this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) this._removeFlag(this.FLAG_STRIP_UNLIKELYS),
                    this._attempts.push({
                        articleContent: m,
                        textLength: b
                    }); else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) this._removeFlag(this.FLAG_WEIGHT_CLASSES),
                    this._attempts.push({
                        articleContent: m,
                        textLength: b
                    }); else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY),
                    this._attempts.push({
                        articleContent: m,
                        textLength: b
                    }); else {
                        if (this._attempts.push({
                            articleContent: m,
                            textLength: b
                        }), this._attempts.sort((function(D, h) {
                            return h.textLength - D.textLength;
                        })), !this._attempts[0].textLength) return null;
                        m = this._attempts[0].articleContent, o = true;
                    }
                    if (o) {
                        var B = [ d, J ].concat(this._getNodeAncestors(d));
                        return this._someNode(B, (function(D) {
                            if (!D.tagName) return false;
                            var h = D.getAttribute("dir");
                            if (h) return this._articleDir = h, true;
                            return false;
                        })), m;
                    }
                }
            },
            _isValidByline: function(D) {
                if (typeof D == "string" || D instanceof String) return D = D.trim(), D.length > 0 && D.length < 100;
                return false;
            },
            _unescapeHtmlEntities: function(D) {
                if (!D) return D;
                var h = this.HTML_ESCAPE_MAP;
                return D.replace(/&(quot|amp|apos|lt|gt);/g, (function(D, z) {
                    return h[z];
                })).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi, (function(D, h, z) {
                    var j = parseInt(h || z, h ? 16 : 10);
                    return String.fromCharCode(j);
                }));
            },
            _getJSONLD: function(D) {
                var h = this._getAllNodesWithTag(D, [ "script" ]), z;
                return this._forEachNode(h, (function(D) {
                    if (!z && D.getAttribute("type") === "application/ld+json") try {
                        var h = D.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, ""), j = JSON.parse(h);
                        if (!j["@context"] || !j["@context"].match(/^https?\:\/\/schema\.org$/)) return;
                        if (!j["@type"] && Array.isArray(j["@graph"])) j = j["@graph"].find((function(D) {
                            return (D["@type"] || "").match(this.REGEXPS.jsonLdArticleTypes);
                        }));
                        if (!j || !j["@type"] || !j["@type"].match(this.REGEXPS.jsonLdArticleTypes)) return;
                        if (z = {}, typeof j.name === "string" && typeof j.headline === "string" && j.name !== j.headline) {
                            var F = this._getArticleTitle(), l = this._textSimilarity(j.name, F) > .75, Z = this._textSimilarity(j.headline, F) > .75;
                            if (Z && !l) z.title = j.headline; else z.title = j.name;
                        } else if (typeof j.name === "string") z.title = j.name.trim(); else if (typeof j.headline === "string") z.title = j.headline.trim();
                        if (j.author) if (typeof j.author.name === "string") z.byline = j.author.name.trim(); else if (Array.isArray(j.author) && j.author[0] && typeof j.author[0].name === "string") z.byline = j.author.filter((function(D) {
                            return D && typeof D.name === "string";
                        })).map((function(D) {
                            return D.name.trim();
                        })).join(", ");
                        if (typeof j.description === "string") z.excerpt = j.description.trim();
                        if (j.publisher && typeof j.publisher.name === "string") z.siteName = j.publisher.name.trim();
                        return;
                    } catch (D) {
                        this.log(D.message);
                    }
                })), z ? z : {};
            },
            _getArticleMetadata: function(D) {
                var h = {}, z = {}, j = this._doc.getElementsByTagName("meta"), F = /\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title|site_name)\s*/gi, l = /^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;
                if (this._forEachNode(j, (function(D) {
                    var h = D.getAttribute("name"), j = D.getAttribute("property"), Z = D.getAttribute("content");
                    if (!Z) return;
                    var A = null, q = null;
                    if (j) if (A = j.match(F), A) q = A[0].toLowerCase().replace(/\s/g, ""), z[q] = Z.trim();
                    if (!A && h && l.test(h)) if (q = h, Z) q = q.toLowerCase().replace(/\s/g, "").replace(/\./g, ":"),
                    z[q] = Z.trim();
                })), h.title = D.title || z["dc:title"] || z["dcterm:title"] || z["og:title"] || z["weibo:article:title"] || z["weibo:webpage:title"] || z["title"] || z["twitter:title"],
                !h.title) h.title = this._getArticleTitle();
                return h.byline = D.byline || z["dc:creator"] || z["dcterm:creator"] || z["author"],
                h.excerpt = D.excerpt || z["dc:description"] || z["dcterm:description"] || z["og:description"] || z["weibo:article:description"] || z["weibo:webpage:description"] || z["description"] || z["twitter:description"],
                h.siteName = D.siteName || z["og:site_name"], h.title = this._unescapeHtmlEntities(h.title),
                h.byline = this._unescapeHtmlEntities(h.byline), h.excerpt = this._unescapeHtmlEntities(h.excerpt),
                h.siteName = this._unescapeHtmlEntities(h.siteName), h;
            },
            _isSingleImage: function(D) {
                if (D.tagName === "IMG") return true;
                if (D.children.length !== 1 || D.textContent.trim() !== "") return false;
                return this._isSingleImage(D.children[0]);
            },
            _unwrapNoscriptImages: function(D) {
                var h = Array.from(D.getElementsByTagName("img"));
                this._forEachNode(h, (function(D) {
                    for (var h = 0; h < D.attributes.length; h++) {
                        var z = D.attributes[h];
                        switch (z.name) {
                          case "src":
                          case "srcset":
                          case "data-src":
                          case "data-srcset":
                            return;
                        }
                        if (/\.(jpg|jpeg|png|webp)/i.test(z.value)) return;
                    }
                    D.parentNode.removeChild(D);
                }));
                var z = Array.from(D.getElementsByTagName("noscript"));
                this._forEachNode(z, (function(h) {
                    var z = D.createElement("div");
                    if (z.innerHTML = h.innerHTML, !this._isSingleImage(z)) return;
                    var j = h.previousElementSibling;
                    if (j && this._isSingleImage(j)) {
                        var F = j;
                        if (F.tagName !== "IMG") F = j.getElementsByTagName("img")[0];
                        for (var l = z.getElementsByTagName("img")[0], Z = 0; Z < F.attributes.length; Z++) {
                            var A = F.attributes[Z];
                            if (A.value === "") continue;
                            if (A.name === "src" || A.name === "srcset" || /\.(jpg|jpeg|png|webp)/i.test(A.value)) {
                                if (l.getAttribute(A.name) === A.value) continue;
                                var q = A.name;
                                if (l.hasAttribute(q)) q = "data-old-" + q;
                                l.setAttribute(q, A.value);
                            }
                        }
                        h.parentNode.replaceChild(z.firstElementChild, j);
                    }
                }));
            },
            _removeScripts: function(D) {
                this._removeNodes(this._getAllNodesWithTag(D, [ "script", "noscript" ]));
            },
            _hasSingleTagInsideElement: function(D, h) {
                if (D.children.length != 1 || D.children[0].tagName !== h) return false;
                return !this._someNode(D.childNodes, (function(D) {
                    return D.nodeType === this.TEXT_NODE && this.REGEXPS.hasContent.test(D.textContent);
                }));
            },
            _isElementWithoutContent: function(D) {
                return D.nodeType === this.ELEMENT_NODE && D.textContent.trim().length == 0 && (D.children.length == 0 || D.children.length == D.getElementsByTagName("br").length + D.getElementsByTagName("hr").length);
            },
            _hasChildBlockElement: function(D) {
                return this._someNode(D.childNodes, (function(D) {
                    return this.DIV_TO_P_ELEMS.has(D.tagName) || this._hasChildBlockElement(D);
                }));
            },
            _isPhrasingContent: function(D) {
                return D.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.indexOf(D.tagName) !== -1 || (D.tagName === "A" || D.tagName === "DEL" || D.tagName === "INS") && this._everyNode(D.childNodes, this._isPhrasingContent);
            },
            _isWhitespace: function(D) {
                return D.nodeType === this.TEXT_NODE && D.textContent.trim().length === 0 || D.nodeType === this.ELEMENT_NODE && D.tagName === "BR";
            },
            _getInnerText: function(D, h) {
                h = typeof h === "undefined" ? true : h;
                var z = D.textContent.trim();
                if (h) return z.replace(this.REGEXPS.normalize, " ");
                return z;
            },
            _getCharCount: function(D, h) {
                return h = h || ",", this._getInnerText(D).split(h).length - 1;
            },
            _cleanStyles: function(D) {
                if (!D || D.tagName.toLowerCase() === "svg") return;
                for (var h = 0; h < this.PRESENTATIONAL_ATTRIBUTES.length; h++) D.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[h]);
                if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(D.tagName) !== -1) D.removeAttribute("width"),
                D.removeAttribute("height");
                var z = D.firstElementChild;
                while (z !== null) this._cleanStyles(z), z = z.nextElementSibling;
            },
            _getLinkDensity: function(D) {
                var h = this._getInnerText(D).length;
                if (h === 0) return 0;
                var z = 0;
                return this._forEachNode(D.getElementsByTagName("a"), (function(D) {
                    var h = D.getAttribute("href"), j = h && this.REGEXPS.hashUrl.test(h) ? .3 : 1;
                    z += this._getInnerText(D).length * j;
                })), z / h;
            },
            _getClassWeight: function(D) {
                if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) return 0;
                var h = 0;
                if (typeof D.className === "string" && D.className !== "") {
                    if (this.REGEXPS.negative.test(D.className)) h -= 25;
                    if (this.REGEXPS.positive.test(D.className)) h += 25;
                }
                if (typeof D.id === "string" && D.id !== "") {
                    if (this.REGEXPS.negative.test(D.id)) h -= 25;
                    if (this.REGEXPS.positive.test(D.id)) h += 25;
                }
                return h;
            },
            _clean: function(D, h) {
                var z = [ "object", "embed", "iframe" ].indexOf(h) !== -1;
                this._removeNodes(this._getAllNodesWithTag(D, [ h ]), (function(D) {
                    if (z) {
                        for (var h = 0; h < D.attributes.length; h++) if (this._allowedVideoRegex.test(D.attributes[h].value)) return false;
                        if (D.tagName === "object" && this._allowedVideoRegex.test(D.innerHTML)) return false;
                    }
                    return true;
                }));
            },
            _hasAncestorTag: function(D, h, z, j) {
                z = z || 3, h = h.toUpperCase();
                var F = 0;
                while (D.parentNode) {
                    if (z > 0 && F > z) return false;
                    if (D.parentNode.tagName === h && (!j || j(D.parentNode))) return true;
                    D = D.parentNode, F++;
                }
                return false;
            },
            _getRowAndColumnCount: function(D) {
                for (var h = 0, z = 0, j = D.getElementsByTagName("tr"), F = 0; F < j.length; F++) {
                    var l = j[F].getAttribute("rowspan") || 0;
                    if (l) l = parseInt(l, 10);
                    h += l || 1;
                    for (var Z = 0, A = j[F].getElementsByTagName("td"), q = 0; q < A.length; q++) {
                        var Q = A[q].getAttribute("colspan") || 0;
                        if (Q) Q = parseInt(Q, 10);
                        Z += Q || 1;
                    }
                    z = Math.max(z, Z);
                }
                return {
                    rows: h,
                    columns: z
                };
            },
            _markDataTables: function(D) {
                for (var h = D.getElementsByTagName("table"), z = 0; z < h.length; z++) {
                    var j = h[z], F = j.getAttribute("role");
                    if (F == "presentation") {
                        j._readabilityDataTable = false;
                        continue;
                    }
                    var l = j.getAttribute("datatable");
                    if (l == "0") {
                        j._readabilityDataTable = false;
                        continue;
                    }
                    var Z = j.getAttribute("summary");
                    if (Z) {
                        j._readabilityDataTable = true;
                        continue;
                    }
                    var A = j.getElementsByTagName("caption")[0];
                    if (A && A.childNodes.length > 0) {
                        j._readabilityDataTable = true;
                        continue;
                    }
                    var q = [ "col", "colgroup", "tfoot", "thead", "th" ], Q = function(D) {
                        return !!j.getElementsByTagName(D)[0];
                    };
                    if (q.some(Q)) {
                        this.log("Data table because found data-y descendant"), j._readabilityDataTable = true;
                        continue;
                    }
                    if (j.getElementsByTagName("table")[0]) {
                        j._readabilityDataTable = false;
                        continue;
                    }
                    var I = this._getRowAndColumnCount(j);
                    if (I.rows >= 10 || I.columns > 4) {
                        j._readabilityDataTable = true;
                        continue;
                    }
                    j._readabilityDataTable = I.rows * I.columns > 10;
                }
            },
            _fixLazyImages: function(D) {
                this._forEachNode(this._getAllNodesWithTag(D, [ "img", "picture", "figure" ]), (function(D) {
                    if (D.src && this.REGEXPS.b64DataUrl.test(D.src)) {
                        var h = this.REGEXPS.b64DataUrl.exec(D.src);
                        if (h[1] === "image/svg+xml") return;
                        for (var z = false, j = 0; j < D.attributes.length; j++) {
                            var F = D.attributes[j];
                            if (F.name === "src") continue;
                            if (/\.(jpg|jpeg|png|webp)/i.test(F.value)) {
                                z = true;
                                break;
                            }
                        }
                        if (z) {
                            var l = D.src.search(/base64\s*/i) + 7, Z = D.src.length - l;
                            if (Z < 133) D.removeAttribute("src");
                        }
                    }
                    if ((D.src || D.srcset && D.srcset != "null") && D.className.toLowerCase().indexOf("lazy") === -1) return;
                    for (var A = 0; A < D.attributes.length; A++) {
                        if (F = D.attributes[A], F.name === "src" || F.name === "srcset" || F.name === "alt") continue;
                        var q = null;
                        if (/\.(jpg|jpeg|png|webp)\s+\d/.test(F.value)) q = "srcset"; else if (/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(F.value)) q = "src";
                        if (q) if (D.tagName === "IMG" || D.tagName === "PICTURE") D.setAttribute(q, F.value); else if (D.tagName === "FIGURE" && !this._getAllNodesWithTag(D, [ "img", "picture" ]).length) {
                            var Q = this._doc.createElement("img");
                            Q.setAttribute(q, F.value), D.appendChild(Q);
                        }
                    }
                }));
            },
            _getTextDensity: function(D, h) {
                var z = this._getInnerText(D, true).length;
                if (z === 0) return 0;
                var j = 0, F = this._getAllNodesWithTag(D, h);
                return this._forEachNode(F, (D => j += this._getInnerText(D, true).length)), j / z;
            },
            _cleanConditionally: function(D, h) {
                if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) return;
                this._removeNodes(this._getAllNodesWithTag(D, [ h ]), (function(D) {
                    var z = function(D) {
                        return D._readabilityDataTable;
                    }, j = h === "ul" || h === "ol";
                    if (!j) {
                        var F = 0, l = this._getAllNodesWithTag(D, [ "ul", "ol" ]);
                        this._forEachNode(l, (D => F += this._getInnerText(D).length)), j = F / this._getInnerText(D).length > .9;
                    }
                    if (h === "table" && z(D)) return false;
                    if (this._hasAncestorTag(D, "table", -1, z)) return false;
                    if (this._hasAncestorTag(D, "code")) return false;
                    var Z = this._getClassWeight(D);
                    this.log("Cleaning Conditionally", D);
                    var A = 0;
                    if (Z + A < 0) return true;
                    if (this._getCharCount(D, ",") < 10) {
                        for (var q = D.getElementsByTagName("p").length, Q = D.getElementsByTagName("img").length, I = D.getElementsByTagName("li").length - 100, E = D.getElementsByTagName("input").length, X = this._getTextDensity(D, [ "h1", "h2", "h3", "h4", "h5", "h6" ]), f = 0, s = this._getAllNodesWithTag(D, [ "object", "embed", "iframe" ]), L = 0; L < s.length; L++) {
                            for (var P = 0; P < s[L].attributes.length; P++) if (this._allowedVideoRegex.test(s[L].attributes[P].value)) return false;
                            if (s[L].tagName === "object" && this._allowedVideoRegex.test(s[L].innerHTML)) return false;
                            f++;
                        }
                        var x = this._getLinkDensity(D), n = this._getInnerText(D).length, w = Q > 1 && q / Q < .5 && !this._hasAncestorTag(D, "figure") || !j && I > q || E > Math.floor(q / 3) || !j && X < .9 && n < 25 && (Q === 0 || Q > 2) && !this._hasAncestorTag(D, "figure") || !j && Z < 25 && x > .2 || Z >= 25 && x > .5 || f === 1 && n < 75 || f > 1;
                        if (j && w) {
                            for (var J = 0; J < D.children.length; J++) {
                                let h = D.children[J];
                                if (h.children.length > 1) return w;
                            }
                            let h = D.getElementsByTagName("li").length;
                            if (Q == h) return false;
                        }
                        return w;
                    }
                    return false;
                }));
            },
            _cleanMatchedNodes: function(D, h) {
                var z = this._getNextNode(D, true), j = this._getNextNode(D);
                while (j && j != z) if (h.call(this, j, j.className + " " + j.id)) j = this._removeAndGetNext(j); else j = this._getNextNode(j);
            },
            _cleanHeaders: function(D) {
                let h = this._getAllNodesWithTag(D, [ "h1", "h2" ]);
                this._removeNodes(h, (function(D) {
                    let h = this._getClassWeight(D) < 0;
                    if (h) this.log("Removing header with low class weight:", D);
                    return h;
                }));
            },
            _headerDuplicatesTitle: function(D) {
                if (D.tagName != "H1" && D.tagName != "H2") return false;
                var h = this._getInnerText(D, false);
                return this.log("Evaluating similarity of header:", h, this._articleTitle), this._textSimilarity(this._articleTitle, h) > .75;
            },
            _flagIsActive: function(D) {
                return (this._flags & D) > 0;
            },
            _removeFlag: function(D) {
                this._flags = this._flags & ~D;
            },
            _isProbablyVisible: function(D) {
                return (!D.style || D.style.display != "none") && !D.hasAttribute("hidden") && (!D.hasAttribute("aria-hidden") || D.getAttribute("aria-hidden") != "true" || D.className && D.className.indexOf && D.className.indexOf("fallback-image") !== -1);
            },
            parse: function() {
                if (this._maxElemsToParse > 0) {
                    var D = this._doc.getElementsByTagName("*").length;
                    if (D > this._maxElemsToParse) throw new Error("Aborting parsing document; " + D + " elements found");
                }
                this._unwrapNoscriptImages(this._doc);
                var h = this._disableJSONLD ? {} : this._getJSONLD(this._doc);
                this._removeScripts(this._doc), this._prepDocument();
                var z = this._getArticleMetadata(h);
                this._articleTitle = z.title;
                var j = this._grabArticle();
                if (!j) return null;
                if (this.log("Grabbed: " + j.innerHTML), this._postProcessContent(j), !z.excerpt) {
                    var F = j.getElementsByTagName("p");
                    if (F.length > 0) z.excerpt = F[0].textContent.trim();
                }
                var l = j.textContent;
                return {
                    title: this._articleTitle,
                    byline: z.byline || this._articleByline,
                    dir: this._articleDir,
                    lang: this._articleLang,
                    content: this._serializer(j),
                    textContent: l,
                    length: l.length,
                    excerpt: z.excerpt,
                    siteName: z.siteName || this._articleSiteName
                };
            }
        }, typeof h === "object") h.exports = j;
    }, {} ],
    3: [ function(D, h, z) {
        "use strict";
        var j = D("rx"), F = D("ZA");
        h.exports = {
            Readability: j,
            isProbablyReaderable: F
        };
    }, {
        rx: 2,
        ZA: 1
    } ],
    4: [ function(D, h, z) {
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
    5: [ function(D, h, z) {
        "use strict";
        Object.defineProperty(z, "__esModule", {
            value: true
        });
        const j = D("Tb"), F = D("@mozilla/readability");
        function l() {
            F.Readability.prototype._getReadingSpeedForLanguage = function(D) {
                const h = new Map([ [ "en", {
                    cpm: 985,
                    variance: 113
                } ], [ "ar", {
                    cpm: 611,
                    variance: 85
                } ], [ "de", {
                    cpm: 922,
                    variance: 87
                } ], [ "es", {
                    cpm: 1015,
                    variance: 124
                } ], [ "he", {
                    cpm: 834,
                    variance: 130
                } ], [ "jw", {
                    cpm: 357,
                    variance: 56
                } ], [ "pl", {
                    cpm: 918,
                    variance: 126
                } ], [ "fi", {
                    cpm: 1058,
                    variance: 125
                } ], [ "it", {
                    cpm: 953,
                    variance: 140
                } ], [ "nl", {
                    cpm: 978,
                    variance: 143
                } ], [ "fr", {
                    cpm: 997,
                    variance: 126
                } ], [ "pt", {
                    cpm: 914,
                    variance: 145
                } ], [ "ru", {
                    cpm: 984,
                    variance: 175
                } ], [ "sv", {
                    cpm: 919,
                    variance: 156
                } ], [ "tr", {
                    cpm: 1044,
                    variance: 156
                } ], [ "sk", {
                    cpm: 882,
                    variance: 145
                } ], [ "zh", {
                    cpm: 259,
                    variance: 29
                } ] ]);
                return h.get(D) || h.get("en");
            }, F.Readability.prototype._getReadTime = function(D) {
                const h = this._doc.documentElement.lang || "en", z = this._getReadingSpeedForLanguage(h), j = z.cpm - z.variance, F = z.cpm + z.variance, l = D.length;
                return {
                    readingTimeMinsSlow: Math.ceil(l / j),
                    readingTimeMinsFast: Math.ceil(l / F)
                };
            };
            const D = F.Readability.prototype.parse;
            F.Readability.prototype.parse = function(...h) {
                const z = D.apply(this, h);
                return Object.assign(z, this._getReadTime(z.textContent));
            };
        }
        function Z() {
            const D = window.getSelection();
            if (D && D.rangeCount && D.toString().length > 5) {
                let h;
                if (D.getRangeAt) h = D.getRangeAt(0); else {
                    h = document.createRange();
                    const z = D.anchorNode, j = D.focusNode;
                    if (z && j) h.setStart(D.anchorNode, D.anchorOffset), h.setEnd(D.focusNode, D.focusOffset);
                }
                const z = document.implementation.createHTMLDocument(document.title), j = z.body.appendChild(z.createElement("article"));
                return j.appendChild(h.commonAncestorContainer), z;
            } else return;
        }
        function A() {
            if (F.Readability.prototype._getReadTime === void 0) l();
            const D = document.cloneNode(true), h = Z() || D, z = new F.Readability(h).parse();
            if (location.href.indexOf("://news.google.") !== -1 && location.href.indexOf("/articles/") !== -1) return; else {
                const D = {
                    action: j.MessageAction.OPEN_READER,
                    data: z
                };
                chrome.runtime.sendMessage(D);
            }
        }
        A();
    }, {
        Tb: 4,
        "@mozilla/readability": 3
    } ]
}, {}, [ 5 ]);