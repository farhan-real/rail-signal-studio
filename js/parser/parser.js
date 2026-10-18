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

            function parseAction() {
                var actTok = next();
                if (!actTok) return null;
                if (actTok.type === 'END') return { op: 'end' };
                if (actTok.type === 'DELAY') {
                    var dTok = next();
                    var dur = dTok ? (dTok.value.indexOf('s') !== -1 ? parseFloat(dTok.value) * 1000 : parseInt(dTok.value, 10)) : 1000;
                    return { op: 'delay', duration: dur };
                }
                if (actTok.type === 'RESUME') {
                    if (peek().type === 'AFTER') {
                        next(); var rTok = next();
                        var rDur = rTok ? (rTok.value.indexOf('s') !== -1 ? parseFloat(rTok.value) * 1000 : parseInt(rTok.value, 10)) : 1000;
                        return { op: 'resume_after', duration: rDur };
                    }
                    if (peek().type === 'ONNEXTACTION') { next(); return { op: 'resume_onnextaction' }; }
                }
                if (actTok.type === 'ASPECT') return { op: 'aspect', target: (next() || {}).value || '' };
                if (actTok.type === 'SET') {
                    var sLamp = next();
                    if (sLamp && sLamp.type === 'MATRIX') { match('EQUALS'); return { op: 'matrix', text: (next() || {}).value || '' }; }
                    return { op: 'set', target: (sLamp || {}).value || '' };
                }
                if (actTok.type === 'UNSET') {
                    var uLamp = next();
                    if (uLamp && uLamp.type === 'MATRIX') return { op: 'matrix', text: '' };
                    return { op: 'unset', target: (uLamp || {}).value || '' };
                }
                if (actTok.type === 'MATRIX') { match('EQUALS'); return { op: 'matrix', text: (next() || {}).value || '' }; }
                if (actTok.type === 'BLINK') {
                    var bLamp = next(), bRate = next();
                    return { op: 'blink', target: (bLamp || {}).value || '', rate: parseInt((bRate || {}).value, 10) || 500 };
                }
                if (actTok.type === 'JUMP' || actTok.type === 'GOTO') return { op: 'jump', target: (next() || {}).value || '' };
                if (actTok.type === 'IDENT' && peek().type === 'EQUALS') {
                    next(); return { op: 'assign', target: actTok.value, value: (next() || {}).value || '0' };
                }
                return null;
            }

            while (pos < tokens.length && peek().type !== 'EOF') {
                var tok = peek();
                if (tok.type === 'SECTION') {
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
                        if (peek().type === 'LABEL') {
                            next(); loopBlock.statements.push({ op: 'label', name: (next() || {}).value, line: tok.line }); match('SEMI');
                        } else if (peek().type === 'END') {
                            next(); loopBlock.statements.push({ op: 'end', line: tok.line }); match('SEMI');
                        } else if (peek().type === 'DELAY') {
                            var dAct = parseAction(); if (dAct) loopBlock.statements.push(dAct); match('SEMI');
                        } else if (peek().type === 'RESUME') {
                            var rAct = parseAction(); if (rAct) loopBlock.statements.push(rAct); match('SEMI');
                        } else if (peek().type === 'JUMP' || peek().type === 'GOTO') {
                            var jAct = parseAction(); if (jAct) loopBlock.statements.push(jAct); match('SEMI');
                        } else if (peek().type === 'IF') {
                            var ifTok = next(), expr = parseOr(), actions = [];
                            if (peek().type === 'COMMA') {
                                next(); var sAct = parseAction(); if (sAct) actions.push(sAct); match('SEMI');
                            } else {
                                match('LBRACE');
                                while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
                                    var act = parseAction(); if (act) actions.push(act); match('SEMI');
                                }
                                match('RBRACE');
                            }
                            loopBlock.statements.push({ op: 'if', expr: expr, actions: actions, line: ifTok.line });
                        } else if (peek().type === 'IDENT' && tokens[pos + 1] && tokens[pos + 1].type === 'EQUALS') {
                            var asg = parseAction(); if (asg) loopBlock.statements.push(asg); match('SEMI');
                        } else next();
                        match('SEMI');
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