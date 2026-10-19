(function(window) {
    'use strict';

    var SignalHighlighter = {
        keywords: [
            'ASPECT', 'MAINLOOP', 'LOOP', 'IF', 'ELIF', 'ELSE', 'TIMER', 'INT', 'ENUM', 'GROUP'
        ],
        commands: [
            'SET', 'UNSET', 'BLINK', 'DELAY', 'RESUME', 'AFTER', 'NEXTACTION', 'ONNEXTACTION', 'JUMP', 'GOTO', 'LABEL', 'END', 'NEXT', 'PREV'
        ],
        logic: [
            'IS', 'AND', 'OR', 'NOT'
        ],
        builtins: [
            'ALL', 'FEATHERS', 'FEATHER', 'MATRIX'
        ],
        lampColors: [
            'RED', 'YELLOW', 'GREEN', 'WHITE', 'VIOLET', 'BLUE', 'YELLOW1', 'YELLOW2',
            'YELLOW_TOP', 'YELLOW_BOTTOM', 'SHUNT_WHITE1', 'SHUNT_WHITE2', 'STOP_RED', 'STOP_WHITE', 'PROCEED_WHITE'
        ],

        escape: function(text) {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },

        highlight: function(source) {
            if (!source) return '';
            var lines = source.split(/\r?\n/);
            var inBlockComment = false;
            var out = [];

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var res = this.highlightLine(line, inBlockComment);
                inBlockComment = res.inBlockComment;
                out.push(res.html);
            }

            return out.join('\n');
        },

        highlightLine: function(line, inBlockComment) {
            if (inBlockComment) {
                var endIdx = line.indexOf('*/');
                if (endIdx === -1) {
                    return { html: '<span class="syntax-comment">' + this.escape(line) + '</span>', inBlockComment: true };
                }
                var commentPart = line.substring(0, endIdx + 2);
                var rest = line.substring(endIdx + 2);
                var restRes = this.highlightLine(rest, false);
                return {
                    html: '<span class="syntax-comment">' + this.escape(commentPart) + '</span>' + restRes.html,
                    inBlockComment: restRes.inBlockComment
                };
            }

            if (/^\s*%%/.test(line)) {
                return { html: '<span class="syntax-section">' + this.escape(line) + '</span>', inBlockComment: false };
            }

            var regex = /(\/\*[\s\S]*?\*\/)|(\/\*[\s\S]*$)|(\/\/.*$)|(".*?")|(\b\d+(?:ms|s)?\b)|(\b[A-Za-z0-9_]+\b)|([{}();=,><+\-])|(\s+)|([^A-Za-z0-9_\s{}();=,><+\-]+)/g;
            var match, html = '', prevWord = '', stillBlock = false;

            while ((match = regex.exec(line)) !== null) {
                if (match[1] !== undefined) {
                    html += '<span class="syntax-comment">' + this.escape(match[1]) + '</span>';
                } else if (match[2] !== undefined) {
                    html += '<span class="syntax-comment">' + this.escape(match[2]) + '</span>';
                    stillBlock = true;
                } else if (match[3] !== undefined) {
                    html += '<span class="syntax-comment">' + this.escape(match[3]) + '</span>';
                } else if (match[4] !== undefined) {
                    html += '<span class="syntax-string">' + this.escape(match[4]) + '</span>';
                    prevWord = 'STRING';
                } else if (match[5] !== undefined) {
                    html += '<span class="syntax-number">' + this.escape(match[5]) + '</span>';
                    prevWord = 'NUMBER';
                } else if (match[6] !== undefined) {
                    var word = match[6];
                    var u = word.toUpperCase();
                    if (prevWord === 'ASPECT') {
                        html += '<span class="syntax-aspect">' + this.escape(word) + '</span>';
                    } else if (prevWord === 'INT' || prevWord === 'ENUM' || prevWord === 'GROUP' || prevWord === 'LABEL') {
                        html += '<span class="syntax-var">' + this.escape(word) + '</span>';
                    } else if (this.keywords.indexOf(u) !== -1) {
                        html += '<span class="syntax-keyword">' + this.escape(word) + '</span>';
                    } else if (this.commands.indexOf(u) !== -1) {
                        html += '<span class="syntax-command">' + this.escape(word) + '</span>';
                    } else if (this.logic.indexOf(u) !== -1) {
                        html += '<span class="syntax-logic">' + this.escape(word) + '</span>';
                    } else if (this.builtins.indexOf(u) !== -1) {
                        html += '<span class="syntax-builtin">' + this.escape(word) + '</span>';
                    } else if (this.lampColors.indexOf(u) !== -1) {
                        html += '<span class="syntax-lamp">' + this.escape(word) + '</span>';
                    } else {
                        html += '<span class="syntax-ident">' + this.escape(word) + '</span>';
                    }
                    prevWord = u;
                } else if (match[7] !== undefined) {
                    html += '<span class="syntax-punct">' + this.escape(match[7]) + '</span>';
                    if (match[7] === ';') prevWord = '';
                } else if (match[8] !== undefined) {
                    html += this.escape(match[8]);
                } else if (match[9] !== undefined) {
                    html += this.escape(match[9]);
                }
            }

            return { html: html, inBlockComment: stillBlock };
        }
    };

    window.SignalHighlighter = SignalHighlighter;
})(window);