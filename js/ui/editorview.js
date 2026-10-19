(function(window) {
    'use strict';

    var EditorUI = {
        drawer: null,
        textarea: null,
        gutterNumbers: null,
        gutterHighlight: null,
        backdropContent: null,
        status: null,
        badge: null,
        activeLine: 1,

        init: function() {
            this.drawer = document.getElementById('editorDrawer');
            this.textarea = document.getElementById('scriptTextarea');
            this.gutterNumbers = document.getElementById('gutterNumbers');
            this.gutterHighlight = document.getElementById('gutterLineHighlight');
            this.backdropContent = document.getElementById('editorBackdropContent');
            this.status = document.getElementById('editorStatus');
            this.badge = document.getElementById('currentAspectBadge');

            document.getElementById('btnToggleEditor').addEventListener('click', this.toggle.bind(this));
            document.getElementById('btnCloseEditor').addEventListener('click', this.close.bind(this));
            document.getElementById('btnCompileScript').addEventListener('click', this.compile.bind(this));
            document.getElementById('btnAddSection').addEventListener('click', this.onAddSectionClick.bind(this));

            this.textarea.addEventListener('input', this.onInput.bind(this));
            this.textarea.addEventListener('scroll', this.onScroll.bind(this));
            this.setupQoL(this.textarea);

            SignalEvents.on('state:loaded', this.loadFromState.bind(this));
            SignalEvents.on('runtime:line', this.highlightLine.bind(this));
            SignalEvents.on('aspect:changed', this.updateBadge.bind(this));
            SignalEvents.on('runtime:status', this.updateRunStatus.bind(this));
        },

        toggle: function() { this.drawer.classList.toggle('open'); },
        close: function() { this.drawer.classList.remove('open'); },

        loadFromState: function() {
            var raw = SignalState.script || '';
            var converted = raw.replace(/^\s*section\s+(?:"([^"]*)"|([A-Za-z0-9_]+))\s*;?/gim, function(m, p1, p2) {
                return '%% ' + (p1 || p2 || 'Section');
            });
            this.textarea.value = converted;
            this.onInput();
            this.compile();
        },

        onInput: function() {
            this.syncState();
            this.renderGutterAndSeparators();
        },

        onScroll: function() {
            var st = this.textarea.scrollTop;
            var sl = this.textarea.scrollLeft;
            this.gutterNumbers.style.transform = 'translateY(' + (-st) + 'px)';
            this.backdropContent.style.transform = 'translate(' + (-sl) + 'px, ' + (-st) + 'px)';
            if (this.gutterHighlight.style.display !== 'none') {
                var top = (this.activeLine - 1) * 20 + 8 - st;
                this.gutterHighlight.style.top = top + 'px';
            }
        },

        renderGutterAndSeparators: function() {
            var val = this.textarea.value;
            var lines = val.split(/\r?\n/);
            var numHtml = '';
            var sepHtml = '';
            var sectionCount = 0;

            for (var i = 0; i < lines.length; i++) {
                var lNum = i + 1;
                var lineText = lines[i];
                var isSec = /^\s*%%/.test(lineText);
                var numClass = isSec ? 'gutter-num is-section' : 'gutter-num';
                numHtml += '<div class="' + numClass + '">' + lNum + '</div>';

                if (isSec) {
                    sectionCount++;
                    var topY = i * 20;
                    sepHtml += '<div class="section-separator-line" style="top:' + topY + 'px;"></div>';
                }
            }

            this.gutterNumbers.innerHTML = numHtml;
            this.backdropContent.innerHTML = sepHtml;
            this.onScroll();
        },

        onAddSectionClick: function() {
            var ta = this.textarea;
            if (!ta) return;
            var val = ta.value;
            var selStart = ta.selectionStart;
            var selEnd = ta.selectionEnd;

            var existingMatches = val.match(/^\s*%%/gm) || [];
            var secNum = existingMatches.length + 1;
            var prefix = (selStart > 0 && val.charAt(selStart - 1) !== '\n') ? '\n\n' : (selStart > 0 ? '\n' : '');
            var insertion = prefix + '%% Section ' + secNum + '\n';

            ta.value = val.substring(0, selStart) + insertion + val.substring(selEnd);
            var newPos = selStart + insertion.length;
            ta.selectionStart = newPos;
            ta.selectionEnd = newPos;
            ta.focus();

            this.onInput();
        },

        setupQoL: function(el) {
            var pairs = { '{': '}', '(': ')', '[': ']', '"': '"' };
            el.addEventListener('keydown', function(e) {
                var start = el.selectionStart, end = el.selectionEnd, val = el.value;
                if (pairs[e.key]) {
                    e.preventDefault();
                    var close = pairs[e.key];
                    el.value = val.substring(0, start) + (start !== end ? e.key + val.substring(start, end) + close : e.key + close) + val.substring(end);
                    el.selectionStart = start + 1; el.selectionEnd = (start !== end ? end + 1 : start + 1);
                    return;
                }
                if (e.key === 'Backspace' && start === end && start > 0) {
                    if (pairs[val.charAt(start - 1)] === val.charAt(start)) {
                        e.preventDefault();
                        el.value = val.substring(0, start - 1) + val.substring(start + 1);
                        el.selectionStart = el.selectionEnd = start - 1;
                        return;
                    }
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    el.value = val.substring(0, start) + '    ' + val.substring(end);
                    el.selectionStart = el.selectionEnd = start + 4;
                    return;
                }
                if (e.key === 'Enter') {
                    var lStart = val.lastIndexOf('\n', start - 1) + 1;
                    var match = val.substring(lStart, start).match(/^(\s+)/);
                    var indent = match ? match[1] : '';
                    if (val.charAt(start - 1) === '{' && val.charAt(start) === '}') {
                        e.preventDefault();
                        el.value = val.substring(0, start) + '\n' + indent + '    \n' + indent + val.substring(end);
                        el.selectionStart = el.selectionEnd = start + indent.length + 5;
                        return;
                    }
                    if (val.charAt(start - 1) === '{') indent += '    ';
                    e.preventDefault();
                    el.value = val.substring(0, start) + '\n' + indent + val.substring(end);
                    el.selectionStart = el.selectionEnd = start + indent.length + 1;
                }
            });
        },

        syncState: function() {
            SignalState.script = this.textarea.value;
            SignalEvents.emit('state:persist');
        },

        compile: function() {
            this.syncState();
            try {
                var tokens = SignalLexer.tokenize(SignalState.script);
                var ast = SignalParser.parse(tokens);
                SignalRuntime.loadAst(ast);
                var secCount = (this.textarea.value.match(/^\s*%%/gm) || []).length;
                this.status.textContent = 'Syntax Valid. Sections: ' + secCount + ' | Aspects: ' + ast.aspectList.length;
                this.status.style.color = '#8c97ad';
            } catch (err) {
                this.status.textContent = 'Error: ' + err.message;
                this.status.style.color = '#ff4444';
            }
        },

        highlightLine: function(lineNum) {
            this.activeLine = lineNum;
            if (!this.gutterHighlight) return;
            var st = this.textarea.scrollTop;
            var top = (lineNum - 1) * 20 + 8 - st;
            this.gutterHighlight.style.top = top + 'px';
            this.gutterHighlight.style.display = 'block';
        },

        updateBadge: function(aspectName) {
            var badge = document.getElementById('currentAspectBadge') || this.badge;
            if (badge && aspectName && aspectName !== 'UNSET') {
                badge.textContent = aspectName;
                badge.classList.add('active');
            }
        },

        updateRunStatus: function(status) {
            var badge = document.getElementById('currentAspectBadge') || this.badge;
            if (status.running) {
                var cur = SignalState.currentAspect;
                if (cur && cur !== 'UNSET') {
                    this.updateBadge(cur);
                } else if (SignalRuntime.ast && SignalRuntime.ast.aspectList.length > 0) {
                    this.updateBadge(SignalRuntime.ast.aspectList[0]);
                }
            } else {
                if (badge) {
                    badge.textContent = 'PAUSED';
                    badge.classList.remove('active');
                }
            }
        }
    };

    window.EditorUI = EditorUI;
})(window);