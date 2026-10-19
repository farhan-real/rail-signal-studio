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

            if (window.SignalAutocomplete) SignalAutocomplete.init(this.textarea);

            SignalEvents.on('state:loaded', this.loadFromState.bind(this));
            SignalEvents.on('runtime:line', this.highlightLine.bind(this));
            SignalEvents.on('aspect:changed', this.updateBadge.bind(this));
            SignalEvents.on('runtime:status', this.updateRunStatus.bind(this));
        },

        toggle: function() { this.drawer.classList.toggle('open'); },
        close: function() { this.drawer.classList.remove('open'); },

        loadFromState: function() {
            var raw = SignalState.script || '';
            this.textarea.value = raw.replace(/^\s*section\s+(?:"([^"]*)"|([A-Za-z0-9_]+))\s*;?/gim, function(m, p1, p2) {
                return '%% ' + (p1 || p2 || 'Section');
            });
            this.onInput();
            this.compile();
        },

        onInput: function() {
            this.syncState();
            this.renderGutterAndSeparators();
            this.runLinter();
        },

        onScroll: function() {
            var st = this.textarea.scrollTop, sl = this.textarea.scrollLeft;
            this.gutterNumbers.style.transform = 'translateY(' + (-st) + 'px)';
            this.backdropContent.style.transform = 'translate(' + (-sl) + 'px, ' + (-st) + 'px)';
            if (this.gutterHighlight.style.display !== 'none') {
                this.gutterHighlight.style.top = ((this.activeLine - 1) * 20 + 8 - st) + 'px';
            }
        },

        runLinter: function() {
            if (!window.SignalLinter) return;
            var res = SignalLinter.lint(this.textarea.value);
            var errMap = {};
            res.errors.forEach(function(e) { errMap[e.line] = e.message; });

            var nums = this.gutterNumbers.querySelectorAll('.gutter-num');
            for (var i = 0; i < nums.length; i++) {
                var l = i + 1;
                nums[i].classList.toggle('has-error', !!errMap[l]);
            }

            if (res.valid) {
                var secCount = (this.textarea.value.match(/^\s*%%/gm) || []).length;
                var aspCount = (SignalRuntime.ast && SignalRuntime.ast.aspectList) ? SignalRuntime.ast.aspectList.length : 0;
                this.status.textContent = 'Syntax Valid. Sections: ' + secCount + ' | Aspects: ' + aspCount;
                this.status.style.color = '#8c97ad';
            } else {
                var first = res.errors[0];
                this.status.textContent = 'Line ' + first.line + ': ' + first.message;
                this.status.style.color = '#ff5555';
            }
        },

        renderGutterAndSeparators: function() {
            var val = this.textarea.value, lines = val.split(/\r?\n/);
            var numHtml = '', sepHtml = '';
            for (var i = 0; i < lines.length; i++) {
                var isSec = /^\s*%%/.test(lines[i]);
                numHtml += '<div class="' + (isSec ? 'gutter-num is-section' : 'gutter-num') + '">' + (i + 1) + '</div>';
                if (isSec) sepHtml += '<div class="section-separator-line" style="top:' + (i * 20) + 'px;"></div>';
            }
            this.gutterNumbers.innerHTML = numHtml;
            this.backdropContent.innerHTML = sepHtml;
            this.onScroll();
        },

        onAddSectionClick: function() {
            var ta = this.textarea; if (!ta) return;
            var val = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
            var secNum = (val.match(/^\s*%%/gm) || []).length + 1;
            var prefix = (s > 0 && val.charAt(s - 1) !== '\n') ? '\n\n' : (s > 0 ? '\n' : '');
            var ins = prefix + '%% Section ' + secNum + '\n';
            ta.value = val.substring(0, s) + ins + val.substring(e);
            ta.selectionStart = ta.selectionEnd = s + ins.length;
            ta.focus();
            this.onInput();
        },

        autoFormatSemicolons: function(text) {
            var lines = text.split('\n');
            var needsSemiRegex = /^(?:set\s|unset\s|aspect\s+[A-Za-z0-9_]+$|matrix\s*=|matrix\s*$|blink\s|delay\s|resume\s|jump\s|goto\s|end$|int\s|[A-Za-z0-9_]+\s*=)/i;

            for (var i = 0; i < lines.length; i++) {
                var trimmed = lines[i].trim();
                if (needsSemiRegex.test(trimmed)) {
                    if (!/[;{},]$/.test(trimmed) && !/^(?:%%|\/\/|\/\*)/.test(trimmed)) {
                        lines[i] = lines[i].replace(/\s*$/, ';');
                    }
                }
            }
            return lines.join('\n');
        },

        setupQoL: function(el) {
            var pairs = { '{': '}', '(': ')', '[': ']', '"': '"' };
            var self = this;

            el.addEventListener('keydown', function(e) {
                if (window.SignalAutocomplete && window.SignalAutocomplete.handleKeyDown(e)) return;

                var start = el.selectionStart, end = el.selectionEnd, val = el.value;
                if (pairs[e.key]) {
                    e.preventDefault();
                    var close = pairs[e.key];
                    el.value = val.substring(0, start) + (start !== end ? e.key + val.substring(start, end) + close : e.key + close) + val.substring(end);
                    el.selectionStart = el.selectionEnd = start + 1;
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
                    self.onInput();
                    return;
                }
                if (e.key === 'Enter') {
                    var lStart = val.lastIndexOf('\n', start - 1) + 1;
                    var lineSoFar = val.substring(lStart, start);
                    var trimmed = lineSoFar.trim();
                    var semiInsert = '';

                    var needsSemi = /^(?:set\s|unset\s|aspect\s+[A-Za-z0-9_]+$|matrix\s*=|matrix\s*$|blink\s|delay\s|resume\s|jump\s|goto\s|end$|int\s|[A-Za-z0-9_]+\s*=)/i.test(trimmed);
                    if (needsSemi && !/[;{},]$/.test(trimmed) && !/^(?:%%|\/\/|\/\*)/.test(trimmed)) {
                        semiInsert = ';';
                    }

                    var indentMatch = lineSoFar.match(/^(\s+)/);
                    var indent = indentMatch ? indentMatch[1] : '';
                    if (val.charAt(start - 1) === '{' && val.charAt(start) === '}') {
                        e.preventDefault();
                        el.value = val.substring(0, start) + '\n' + indent + '    \n' + indent + val.substring(end);
                        el.selectionStart = el.selectionEnd = start + indent.length + 5;
                        self.onInput();
                        return;
                    }

                    if (val.charAt(start - 1) === '{') indent += '    ';
                    if (semiInsert) {
                        e.preventDefault();
                        el.value = val.substring(0, start) + semiInsert + '\n' + indent + val.substring(end);
                        el.selectionStart = el.selectionEnd = start + 1 + indent.length + 1;
                        self.onInput();
                    }
                }
            });
        },

        syncState: function() {
            SignalState.script = this.textarea.value;
            SignalEvents.emit('state:persist');
        },

        compile: function() {
            var formatted = this.autoFormatSemicolons(this.textarea.value);
            if (formatted !== this.textarea.value) {
                var pos = this.textarea.selectionStart;
                this.textarea.value = formatted;
                this.textarea.selectionStart = this.textarea.selectionEnd = pos;
            }
            this.syncState();

            try {
                var tokens = SignalLexer.tokenize(SignalState.script);
                var ast = SignalParser.parse(tokens);
                SignalRuntime.loadAst(ast);
                this.runLinter();
            } catch (err) {
                this.status.textContent = 'Error: ' + err.message;
                this.status.style.color = '#ff4444';
            }
        },

        highlightLine: function(lineNum) {
            this.activeLine = lineNum;
            if (!this.gutterHighlight) return;
            var st = this.textarea.scrollTop;
            this.gutterHighlight.style.top = ((lineNum - 1) * 20 + 8 - st) + 'px';
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
                if (cur && cur !== 'UNSET') this.updateBadge(cur);
                else if (SignalRuntime.ast && SignalRuntime.ast.aspectList.length > 0) this.updateBadge(SignalRuntime.ast.aspectList[0]);
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