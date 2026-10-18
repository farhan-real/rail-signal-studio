(function(window) {
    'use strict';

    var SignalParser = {
        parse: function(tokens) {
            var pos = 0;
            var ast = { aspects: {}, aspectList: [], mainloops: [], timers: [], variables: {}, enums: {}, groups: {} };

            function peek() { return tokens[pos] || { type: 'EOF', line: 0 }; }
            function next() { return tokens[pos++]; }
            function match(type) { return peek().type === type ? next() : null; }

            function parsePrimary() {
                if (peek().type === 'LPAREN') { next(); var expr = parseOr(); match('RPAREN'); return expr; }
                if (peek().type === 'NOT') { next(); return { type: 'NOT', expr: parsePrimary() }; }
                var leftVal = (next() || {}).value || '';
                if (peek().type === 'GT') { next(); return { type: 'GT', left: leftVal, right: (next() || {}).value || '0' }; }
                if (peek().type === 'LT') { next(); return { type: 'LT', left: leftVal, right: (next() || {}).value || '0' }; }
                if (peek().type === 'IS') {
                    next(); var t = next();
                    if (t && t.type === 'SET') return { type: 'LAMP_SET', lamp: leftVal };
                    return { type: 'IS', left: leftVal, right: (t || {}).value || '' };
                }
                if (peek().type === 'SET') { next(); return { type: 'LAMP_SET', lamp: leftVal }; }
                return { type: 'LAMP_SET', lamp: leftVal };
            }

            function parseNot() { return peek().type === 'NOT' ? (next(), { type: 'NOT', expr: parseNot() }) : parsePrimary(); }
            function parseAnd() {
                var left = parseNot();
                while (peek().type === 'AND') { next(); left = { type: 'AND', left: left, right: parseNot() }; }
                return left;
            }
            function parseOr() {
                var left = parseAnd();
                while (peek().type === 'OR') { next(); left = { type: 'OR', left: left, right: parseAnd() }; }
                return left;
            }

            function parseStatement() {
                var tok = peek();
                if (!tok || tok.type === 'EOF' || tok.type === 'RBRACE') return null;

                if (tok.type === 'LABEL') {
                    next(); var lName = (next() || {}).value; match('SEMI');
                    return { op: 'label', name: lName, line: tok.line };
                }
                if (tok.type === 'END') {
                    next(); match('SEMI');
                    return { op: 'end', line: tok.line };
                }
                if (tok.type === 'IF') {
                    var ifTok = next(), expr = parseOr(), actions = [];
                    if (peek().type === 'COMMA') {
                        next(); var sAct = parseStatement();
                        if (sAct) actions.push(sAct);
                    } else if (peek().type === 'LBRACE') {
                        match('LBRACE');
                        while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                            if (peek().type === 'SEMI') { next(); continue; }
                            var bAct = parseStatement();
                            if (bAct) actions.push(bAct);
                        }
                        match('RBRACE');
                    }
                    match('SEMI');
                    return { op: 'if', expr: expr, actions: actions, line: ifTok.line };
                }
                if (tok.type === 'DELAY') {
                    next(); var dTok = next();
                    var dur = dTok ? (dTok.value.indexOf('s') !== -1 ? parseFloat(dTok.value) * 1000 : parseInt(dTok.value, 10)) : 1000;
                    match('SEMI');
                    return { op: 'delay', duration: dur, line: tok.line };
                }
                if (tok.type === 'RESUME') {
                    next();
                    if (peek().type === 'AFTER') {
                        next(); var rTok = next();
                        var rDur = rTok ? (rTok.value.indexOf('s') !== -1 ? parseFloat(rTok.value) * 1000 : parseInt(rTok.value, 10)) : 1000;
                        match('SEMI');
                        return { op: 'resume_after', duration: rDur, line: tok.line };
                    }
                    if (peek().type === 'ONNEXTACTION') {
                        next(); match('SEMI');
                        return { op: 'resume_onnextaction', line: tok.line };
                    }
                    match('SEMI');
                    return null;
                }
                if (tok.type === 'ASPECT') {
                    next(); var asp = (next() || {}).value || ''; match('SEMI');
                    return { op: 'aspect', target: asp, line: tok.line };
                }
                if (tok.type === 'SET') {
                    next(); var sLamp = next();
                    if (sLamp && sLamp.type === 'MATRIX') {
                        match('EQUALS'); var mText = (next() || {}).value || ''; match('SEMI');
                        return { op: 'matrix', text: mText, line: tok.line };
                    }
                    match('SEMI');
                    return { op: 'set', target: (sLamp || {}).value || '', line: tok.line };
                }
                if (tok.type === 'UNSET') {
                    next(); var uLamp = next();
                    if (uLamp && uLamp.type === 'MATRIX') {
                        match('SEMI');
                        return { op: 'matrix', text: '', line: tok.line };
                    }
                    match('SEMI');
                    return { op: 'unset', target: (uLamp || {}).value || '', line: tok.line };
                }
                if (tok.type === 'MATRIX') {
                    next(); match('EQUALS'); var matText = (next() || {}).value || ''; match('SEMI');
                    return { op: 'matrix', text: matText, line: tok.line };
                }
                if (tok.type === 'BLINK') {
                    next(); var bLamp = next(), bRate = next(); match('SEMI');
                    return { op: 'blink', target: (bLamp || {}).value || '', rate: parseInt((bRate || {}).value, 10) || 500, line: tok.line };
                }
                if (tok.type === 'JUMP' || tok.type === 'GOTO') {
                    next(); var jTarget = (next() || {}).value || ''; match('SEMI');
                    return { op: 'jump', target: jTarget, line: tok.line };
                }
                if (tok.type === 'IDENT' && tokens[pos + 1] && tokens[pos + 1].type === 'EQUALS') {
                    var varId = next().value; next();
                    var varVal = (next() || {}).value || '0'; match('SEMI');
                    return { op: 'assign', target: varId, value: varVal, line: tok.line };
                }
                next(); match('SEMI');
                return null;
            }

            while (pos < tokens.length && peek().type !== 'EOF') {
                var tok = peek();
                if (tok.type === 'SEMI') {
                    next();
                } else if (tok.type === 'SECTION') {
                    next(); if (peek().type === 'STRING' || peek().type === 'IDENT') next(); match('SEMI');
                } else if (tok.type === 'INT') {
                    next(); var iName = next(); match('EQUALS'); ast.variables[iName.value] = parseInt((next() || {}).value, 10) || 0; match('SEMI');
                } else if (tok.type === 'ENUM') {
                    next(); var eName = next(); var members = []; match('LBRACE');
                    while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                        var mem = next(); if (mem.type === 'IDENT') members.push(mem.value); match('COMMA');
                    }
                    match('RBRACE'); match('SEMI'); ast.enums[eName.value] = members;
                } else if (tok.type === 'GROUP') {
                    next(); var gName = next(); var gItems = []; match('LBRACE');
                    while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                        var it = next(); if (it.type === 'IDENT') gItems.push(it.value); match('COMMA');
                    }
                    match('RBRACE'); match('SEMI'); ast.groups[gName.value] = gItems;
                } else if (ast.enums[tok.value]) {
                    next(); var vName = next(); match('EQUALS'); ast.variables[vName.value] = (next() || {}).value; match('SEMI');
                } else if (tok.type === 'ASPECT') {
                    next(); var aspName = (next() || {}).value || 'UNNAMED';
                    var aspectDef = { name: aspName, line: tok.line, sets: [], unsets: [], matrix: undefined };
                    match('LBRACE');
                    while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                        var bTok = next();
                        if (bTok.type === 'SET') {
                            var lTok = next();
                            if (lTok && lTok.type === 'MATRIX') { match('EQUALS'); aspectDef.matrix = (next() || {}).value || ''; }
                            else if (lTok) aspectDef.sets.push(lTok.value);
                        } else if (bTok.type === 'UNSET') {
                            var uTok = next();
                            if (uTok && uTok.type === 'MATRIX') aspectDef.matrix = '';
                            else if (uTok) aspectDef.unsets.push(uTok.value);
                        }
                        match('SEMI');
                    }
                    match('RBRACE'); ast.aspects[aspName] = aspectDef; ast.aspectList.push(aspName);
                } else if (tok.type === 'MAINLOOP' || tok.type === 'LOOP') {
                    next(); var loopBlock = { line: tok.line, statements: [] }; match('LBRACE');
                    while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                        if (peek().type === 'SEMI') { next(); continue; }
                        var stmt = parseStatement();
                        if (stmt) loopBlock.statements.push(stmt);
                    }
                    match('RBRACE'); ast.mainloops.push(loopBlock);
                } else if (tok.type === 'TIMER') {
                    next(); var tDur = next(); var dur = tDur ? (tDur.value.indexOf('s') !== -1 ? parseFloat(tDur.value) * 1000 : parseInt(tDur.value, 10)) : 5000;
                    var timerDef = { duration: dur, action: 'next', line: tok.line }; match('LBRACE');
                    while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                        var tAct = next();
                        if (tAct.type === 'NEXT' || tAct.type === 'PREV') timerDef.action = tAct.type.toLowerCase();
                        else if (tAct.type === 'JUMP') timerDef.action = (next() || {}).value || 'next';
                        match('SEMI');
                    }
                    match('RBRACE'); ast.timers.push(timerDef);
                } else next();
            }
            return ast;
        }
    };

    window.SignalParser = SignalParser;
})(window);