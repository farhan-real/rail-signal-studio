(function(window) {
    'use strict';

    var EditorUI = {
        drawer: null,
        sectionsContainer: null,
        status: null,
        badge: null,
        sections: [],
        nextSectionId: 1,

        init: function() {
            this.drawer = document.getElementById('editorDrawer');
            this.sectionsContainer = document.getElementById('sectionsContainer');
            this.status = document.getElementById('editorStatus');
            this.badge = document.getElementById('currentAspectBadge');

            document.getElementById('btnToggleEditor').addEventListener('click', this.toggle.bind(this));
            document.getElementById('btnCloseEditor').addEventListener('click', this.close.bind(this));
            document.getElementById('btnCompileScript').addEventListener('click', this.compile.bind(this));
            document.getElementById('btnAddSection').addEventListener('click', this.onAddSectionClick.bind(this));

            document.getElementById('btnRunScript').addEventListener('click', function() { SignalRuntime.resume(); });
            document.getElementById('btnPauseScript').addEventListener('click', function() { SignalRuntime.pause(); });
            var btnPrev = document.getElementById('btnPrevScript');
            if (btnPrev) btnPrev.addEventListener('click', function() { SignalRuntime.stepPrev(); });
            document.getElementById('btnStepScript').addEventListener('click', function() { SignalRuntime.stepNext(); });

            SignalEvents.on('state:loaded', this.loadFromState.bind(this));
            SignalEvents.on('runtime:line', this.highlightLine.bind(this));
            SignalEvents.on('aspect:changed', this.updateBadge.bind(this));
            SignalEvents.on('runtime:status', this.updateRunStatus.bind(this));
        },

        toggle: function() { this.drawer.classList.toggle('open'); },
        close: function() { this.drawer.classList.remove('open'); },

        onAddSectionClick: function() {
            var newTitle = 'Section ' + (this.sections.length + 1);
            this.sections.push({ id: this.nextSectionId++, title: newTitle, code: '' });
            this.renderSections();
        },

        loadFromState: function() {
            var raw = SignalState.script || '';
            this.sections = [];
            var lines = raw.split(/\r?\n/);
            var curTitle = 'Main';
            var curLines = [];

            for (var i = 0; i < lines.length; i++) {
                var m = lines[i].match(/^\s*section\s+(?:"([^"]*)"|([A-Za-z0-9_]+))\s*;?/i);
                if (m) {
                    if (curLines.length > 0 || this.sections.length > 0) {
                        var codeStr = curLines.join('\n').trim();
                        if (codeStr || this.sections.length > 0) {
                            this.sections.push({ id: this.nextSectionId++, title: curTitle, code: codeStr });
                        }
                        curLines = [];
                    }
                    curTitle = m[1] || m[2] || 'Section';
                } else {
                    curLines.push(lines[i]);
                }
            }
            var lastCode = curLines.join('\n').trim();
            if (lastCode || this.sections.length === 0) {
                this.sections.push({ id: this.nextSectionId++, title: curTitle, code: lastCode });
            }
            this.renderSections();
            this.compile();
        },

        renderSections: function() {
            var self = this;
            this.sectionsContainer.innerHTML = '';

            for (var i = 0; i < this.sections.length; i++) {
                (function(sec, idx) {
                    var card = document.createElement('div');
                    card.className = 'section-card';
                    card.setAttribute('data-sec-id', sec.id);

                    var head = document.createElement('div');
                    head.className = 'section-card-head';
                    head.innerHTML = [
                        '<input type="text" class="section-title-input" value="' + sec.title + '" />',
                        self.sections.length > 1 ? '<button class="btn-del-section" title="Remove Section">&times;</button>' : ''
                    ].join('');

                    var titleInp = head.querySelector('.section-title-input');
                    titleInp.addEventListener('change', function() { sec.title = this.value; self.syncState(); });

                    var delBtn = head.querySelector('.btn-del-section');
                    if (delBtn) {
                        delBtn.addEventListener('click', function() {
                            self.sections.splice(idx, 1);
                            self.renderSections();
                            self.syncState();
                        });
                    }

                    var body = document.createElement('div');
                    body.className = 'section-body';
                    body.innerHTML = [
                        '<div class="line-tracker"></div>',
                        '<textarea class="script-editor" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>'
                    ].join('');

                    var ta = body.querySelector('.script-editor');
                    ta.value = sec.code;
                    ta.addEventListener('input', function() { sec.code = this.value; self.syncState(); });
                    self.setupQoL(ta);

                    card.appendChild(head);
                    card.appendChild(body);
                    self.sectionsContainer.appendChild(card);
                })(this.sections[i], i);
            }
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

        getCombinedScript: function() {
            var parts = [];
            for (var i = 0; i < this.sections.length; i++) {
                var sec = this.sections[i];
                if (this.sections.length === 1 && sec.title === 'Main') {
                    parts.push(sec.code);
                } else {
                    parts.push('section "' + sec.title + '";\n' + sec.code);
                }
            }
            return parts.join('\n\n');
        },

        syncState: function() {
            SignalState.script = this.getCombinedScript();
            SignalEvents.emit('state:persist');
        },

        compile: function() {
            this.syncState();
            try {
                var tokens = SignalLexer.tokenize(SignalState.script);
                var ast = SignalParser.parse(tokens);
                SignalRuntime.loadAst(ast);
                this.status.textContent = 'Syntax Valid. Sections: ' + this.sections.length + ' | Aspects: ' + ast.aspectList.length;
                this.status.style.color = '#8c97ad';
            } catch (err) {
                this.status.textContent = 'Error: ' + err.message;
                this.status.style.color = '#ff4444';
            }
        },

        highlightLine: function(globalLine) {
            var accum = 0;
            var cards = this.sectionsContainer.querySelectorAll('.section-card');
            for (var i = 0; i < this.sections.length; i++) {
                var secLines = ('section "' + this.sections[i].title + '";\n' + this.sections[i].code).split(/\r?\n/).length;
                var tracker = cards[i] ? cards[i].querySelector('.line-tracker') : null;
                if (!tracker) continue;
                tracker.innerHTML = '';
                if (globalLine > accum && globalLine <= accum + secLines) {
                    var localLine = globalLine - accum - 1;
                    var top = Math.max(0, (localLine - 1) * 20 + 8);
                    tracker.innerHTML = '<div class="line-highlight-bar" style="top:' + top + 'px; height:20px"></div>';
                }
                accum += secLines + 1;
            }
        },

        updateBadge: function(aspectName) {
            var badge = document.getElementById('currentAspectBadge') || this.badge;
            if (badge && aspectName && aspectName !== 'UNSET') {
                badge.textContent = aspectName;
                badge.classList.add('active');
            }
        },

        updateRunStatus: function(status) {
            var btnRun = document.getElementById('btnRunScript');
            var btnPause = document.getElementById('btnPauseScript');
            var badge = document.getElementById('currentAspectBadge') || this.badge;
            if (status.running) {
                if (btnRun) btnRun.style.borderColor = '#00ee44';
                if (btnPause) btnPause.style.borderColor = '';
                var cur = SignalState.currentAspect;
                if (cur && cur !== 'UNSET') {
                    this.updateBadge(cur);
                } else if (SignalRuntime.ast && SignalRuntime.ast.aspectList.length > 0) {
                    this.updateBadge(SignalRuntime.ast.aspectList[0]);
                }
            } else {
                if (btnRun) btnRun.style.borderColor = '';
                if (btnPause) btnPause.style.borderColor = '#f59e0b';
                if (badge) {
                    badge.textContent = 'PAUSED';
                    badge.classList.remove('active');
                }
            }
        }
    };

    window.EditorUI = EditorUI;
})(window);