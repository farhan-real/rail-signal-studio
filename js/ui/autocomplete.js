(function(window) {
    'use strict';

    var SignalAutocomplete = {
        textarea: null,
        popup: null,
        selectedIndex: 0,
        matches: [],
        currentWord: '',
        wordStart: 0,

        keywords: [
            'aspect', 'set', 'unset', 'matrix', 'mainloop', 'loop', 'if', 'elif',
            'else', 'is', 'blink', 'timer', 'next', 'prev', 'jump', 'label', 'int',
            'enum', 'group', 'end', 'resume', 'after', 'onnextaction', 'delay', 'AND', 'OR', 'NOT'
        ],

        init: function(textarea) {
            this.textarea = textarea;
            this.popup = document.createElement('div');
            this.popup.className = 'autocomplete-popup';
            this.popup.style.display = 'none';
            var editorArea = document.getElementById('editorArea');
            if (editorArea) editorArea.appendChild(this.popup);

            var self = this;
            this.textarea.addEventListener('input', this.onInput.bind(this));
            this.textarea.addEventListener('scroll', function() { self.close(); });
            window.addEventListener('pointerdown', function(e) {
                if (self.popup && !self.popup.contains(e.target) && e.target !== self.textarea) self.close();
            });
        },

        collectCandidates: function() {
            var items = [];
            this.keywords.forEach(function(k) { items.push({ word: k, kind: 'keyword' }); });
            items.push({ word: 'ALL', kind: 'builtin' });
            items.push({ word: 'FEATHERS', kind: 'builtin' });
            items.push({ word: 'MATRIX', kind: 'builtin' });

            SignalState.lamps.forEach(function(l) { items.push({ word: l.id, kind: 'lamp' }); });
            SignalState.feathers.forEach(function(f) { items.push({ word: f.id, kind: 'feather' }); });
            SignalState.controls.forEach(function(c) {
                items.push({ word: c.id, kind: c.type || 'control' });
                if (c.label && c.label !== c.id) items.push({ word: c.label.replace(/\s+/g, '_'), kind: 'label' });
            });

            var text = this.textarea ? this.textarea.value : '';
            var aspRegex = /aspect\s+([A-Za-z0-9_]+)/g, m;
            while ((m = aspRegex.exec(text)) !== null) items.push({ word: m[1], kind: 'aspect' });
            var varRegex = /(?:int|enum|group)\s+([A-Za-z0-9_]+)/g, v;
            while ((v = varRegex.exec(text)) !== null) items.push({ word: v[1], kind: 'var' });
            var lblRegex = /label\s+([A-Za-z0-9_]+)/g, lb;
            while ((lb = lblRegex.exec(text)) !== null) items.push({ word: lb[1], kind: 'label' });

            return items;
        },

        onInput: function() {
            var ta = this.textarea;
            if (!ta) return;
            var pos = ta.selectionStart;
            var val = ta.value;
            var leftText = val.substring(0, pos);
            var match = leftText.match(/([A-Za-z0-9_]+)$/);

            if (!match || match[0].length < 1) { this.close(); return; }
            this.currentWord = match[0];
            this.wordStart = pos - this.currentWord.length;

            var candidates = this.collectCandidates();
            var uWord = this.currentWord.toUpperCase();
            var seen = {};

            this.matches = candidates.filter(function(c) {
                var wordU = c.word.toUpperCase();
                if (wordU === uWord || seen[wordU]) return false;
                seen[wordU] = true;
                return wordU.indexOf(uWord) === 0 || (wordU.indexOf(uWord) !== -1 && c.kind !== 'keyword');
            }).slice(0, 8);

            if (this.matches.length === 0) { this.close(); return; }
            this.selectedIndex = 0;
            this.renderPopup();
            this.positionPopup();
        },

        renderPopup: function() {
            var html = '';
            for (var i = 0; i < this.matches.length; i++) {
                var item = this.matches[i];
                var activeCls = (i === this.selectedIndex) ? ' active' : '';
                html += '<div class="autocomplete-item' + activeCls + '" data-idx="' + i + '">';
                html += '  <span class="autocomplete-word">' + item.word + '</span>';
                html += '  <span class="autocomplete-kind">' + item.kind + '</span>';
                html += '</div>';
            }
            this.popup.innerHTML = html;
            this.popup.style.display = 'block';

            var self = this;
            var els = this.popup.querySelectorAll('.autocomplete-item');
            for (var j = 0; j < els.length; j++) {
                els[j].addEventListener('click', function(e) {
                    e.stopPropagation();
                    self.selectedIndex = parseInt(this.getAttribute('data-idx'), 10);
                    self.apply();
                });
            }
        },

        positionPopup: function() {
            var ta = this.textarea;
            var pos = ta.selectionStart;
            var lines = ta.value.substring(0, pos).split('\n');
            var lineIdx = lines.length - 1;
            var colIdx = lines[lineIdx].length;

            var top = (lineIdx + 1) * 20 + 10 - ta.scrollTop;
            var left = Math.min(220, Math.max(10, colIdx * 7.2 - ta.scrollLeft));

            this.popup.style.top = top + 'px';
            this.popup.style.left = left + 'px';
        },

        handleKeyDown: function(e) {
            if (this.popup.style.display === 'none' || this.matches.length === 0) return false;

            if (e.key === 'Tab') {
                e.preventDefault();
                var dir = e.shiftKey ? -1 : 1;
                this.selectedIndex = (this.selectedIndex + dir + this.matches.length) % this.matches.length;
                this.renderPopup();
                return true;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                this.apply();
                return true;
            }

            if (e.key.indexOf('Arrow') === 0 || e.key === 'Escape') {
                this.close();
                return false;
            }

            return false;
        },

        apply: function() {
            if (this.selectedIndex < 0 || this.selectedIndex >= this.matches.length) { this.close(); return; }
            var chosen = this.matches[this.selectedIndex].word;
            var ta = this.textarea;
            var before = ta.value.substring(0, this.wordStart);
            var after = ta.value.substring(ta.selectionEnd);

            ta.value = before + chosen + after;
            var newPos = this.wordStart + chosen.length;
            ta.selectionStart = newPos;
            ta.selectionEnd = newPos;
            this.close();
            ta.focus();

            if (window.EditorUI && window.EditorUI.onInput) window.EditorUI.onInput();
        },

        close: function() {
            if (this.popup) this.popup.style.display = 'none';
            this.matches = [];
            this.selectedIndex = 0;
        }
    };

    window.SignalAutocomplete = SignalAutocomplete;
})(window);