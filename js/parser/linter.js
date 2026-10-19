(function(window) {
    'use strict';

    var SignalLinter = {
        keywords: [
            'ASPECT', 'SET', 'UNSET', 'MATRIX', 'MAINLOOP', 'LOOP', 'IF', 'ELIF',
            'ELSE', 'IS', 'BLINK', 'TIMER', 'NEXT', 'PREV', 'JUMP', 'GOTO', 'LABEL',
            'INT', 'ENUM', 'GROUP', 'END', 'SECTION', 'RESUME', 'AFTER',
            'ONNEXTACTION', 'DELAY', 'AND', 'OR', 'NOT'
        ],

        lint: function(source) {
            var errors = [];
            if (!source || !source.trim()) return { valid: true, errors: errors };

            var tokens = [];
            try {
                tokens = SignalLexer.tokenize(source);
            } catch (err) {
                errors.push({ line: 1, message: 'Lexer error: ' + err.message });
                return { valid: false, errors: errors };
            }

            var declaredAspects = {}, declaredVars = {}, declaredEnums = {}, declaredGroups = {}, declaredLabels = {};
            var openBraces = 0, braceStack = [];

            for (var t = 0; t < tokens.length; t++) {
                var tok = tokens[t];
                if (tok.type === 'LBRACE') { openBraces++; braceStack.push(tok.line); }
                else if (tok.type === 'RBRACE') {
                    openBraces--;
                    if (openBraces < 0) { errors.push({ line: tok.line, message: 'Unexpected closing brace "}"' }); openBraces = 0; }
                    else braceStack.pop();
                } else if (tok.type === 'ASPECT' && tokens[t + 1] && (tokens[t + 1].type === 'IDENT' || tokens[t + 1].type === 'STRING')) {
                    if (tokens[t + 2] && tokens[t + 2].type === 'LBRACE') declaredAspects[tokens[t + 1].value.toUpperCase()] = true;
                } else if (tok.type === 'LABEL' && tokens[t + 1]) {
                    declaredLabels[tokens[t + 1].value.toUpperCase()] = true;
                } else if (tok.type === 'INT' && tokens[t + 1]) {
                    declaredVars[tokens[t + 1].value.toUpperCase()] = true;
                } else if (tok.type === 'ENUM' && tokens[t + 1]) {
                    declaredEnums[tokens[t + 1].value.toUpperCase()] = true;
                } else if (tok.type === 'GROUP' && tokens[t + 1]) {
                    declaredGroups[tokens[t + 1].value.toUpperCase()] = true;
                }
            }

            if (openBraces > 0 && braceStack.length) {
                errors.push({ line: braceStack[braceStack.length - 1], message: 'Unclosed block "{" (missing closing "}")' });
            }

            var isKnownComponent = function(name) {
                if (!name) return false;
                var u = String(name).toUpperCase();
                if (u === 'ALL' || u === 'FEATHERS' || u === 'FEATHER' || u === 'MATRIX' || u === 'ASPECT') return true;
                if (declaredAspects[u] || declaredVars[u] || declaredEnums[u] || declaredGroups[u]) return true;
                if (SignalState.lamps.some(function(l) { return l.id.toUpperCase() === u; })) return true;
                if (SignalState.feathers.some(function(f) { return f.id.toUpperCase() === u; })) return true;
                if (SignalState.controls.some(function(c) {
                    if (c.states && c.states.some(function(st) { return String(st).toUpperCase() === u; })) return true;
                    return c.id.toUpperCase() === u || (c.label && c.label.toUpperCase() === u);
                })) return true;
                for (var en in SignalState.enums) {
                    var members = SignalState.enums[en];
                    if (members.some(function(m) { return String(m).toUpperCase() === u; })) return true;
                }
                return false;
            };

            for (var i = 0; i < tokens.length; i++) {
                var tk = tokens[i];
                if (tk.type === 'SET' || tk.type === 'UNSET') {
                    var prev = i > 0 ? tokens[i - 1] : null;
                    var prevPrev = i > 1 ? tokens[i - 2] : null;

                    if (prev && (prev.type === 'IDENT' || (prev.type === 'IS' && prevPrev && prevPrev.type === 'IDENT'))) {
                        var compTok = (prev.type === 'IS') ? prevPrev : prev;
                        if (!isKnownComponent(compTok.value)) {
                            errors.push({ line: compTok.line, message: 'Unknown component, group, or feather "' + compTok.value + '"' });
                        }
                        continue;
                    }

                    var target = tokens[i + 1];
                    if (target && target.type !== 'EOF' && target.type !== 'SEMI' && target.type !== 'LBRACE' && target.type !== 'RBRACE' && target.type !== 'OR' && target.type !== 'AND') {
                        if (!isKnownComponent(target.value)) {
                            errors.push({ line: target.line, message: 'Unknown component, group, or feather "' + target.value + '"' });
                        }
                    }
                } else if (tk.type === 'JUMP' || tk.type === 'GOTO') {
                    var lTarget = tokens[i + 1];
                    if (lTarget && lTarget.type === 'IDENT' && !declaredLabels[lTarget.value.toUpperCase()]) {
                        errors.push({ line: lTarget.line, message: 'Undefined label destination "' + lTarget.value + '"' });
                    }
                } else if (tk.type === 'IS') {
                    var left = tokens[i - 1];
                    if (left && left.type === 'IDENT' && !isKnownComponent(left.value)) {
                        errors.push({ line: left.line, message: 'Unknown variable, control, or component "' + left.value + '"' });
                    }
                }
            }

            return { valid: errors.length === 0, errors: errors };
        }
    };

    window.SignalLinter = SignalLinter;
})(window);