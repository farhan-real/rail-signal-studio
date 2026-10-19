(function(window) {
    'use strict';

    var SignalLexer = {
        tokenize: function(source) {
            var tokens = [];
            if (!source) {
                tokens.push({ type: 'EOF', value: '', line: 1 });
                return tokens;
            }

            var cleanSource = source.replace(/\/\*[\s\S]*?\*\//g, function(match) {
                return match.replace(/[^\r\n]/g, ' ');
            });

            var lines = cleanSource.split(/\r?\n/);

            for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                var lineNum = lineIdx + 1;
                var rawLine = lines[lineIdx];
                var cleanLine = rawLine.replace(/\/\/.*/g, '').trim();
                if (!cleanLine) continue;

                if (cleanLine.indexOf('%%') === 0) {
                    var secTitle = cleanLine.substring(2).trim();
                    tokens.push({ type: 'SECTION', value: secTitle, line: lineNum });
                    continue;
                }

                var regex = /"([^"]*)"|([A-Za-z0-9_]+)|([{};=(),><+\-])|([^\s]+)/g;
                var match;

                while ((match = regex.exec(cleanLine)) !== null) {
                    var val = match[0];
                    var type = 'IDENT';

                    if (match[1] !== undefined) {
                        type = 'STRING';
                        val = match[1];
                    } else if (val === '{') type = 'LBRACE';
                    else if (val === '}') type = 'RBRACE';
                    else if (val === '(') type = 'LPAREN';
                    else if (val === ')') type = 'RPAREN';
                    else if (val === ',') type = 'COMMA';
                    else if (val === ';') type = 'SEMI';
                    else if (val === '=') type = 'EQUALS';
                    else if (val === '>') type = 'GT';
                    else if (val === '<') type = 'LT';
                    else if (val === '+') type = 'PLUS';
                    else if (val === '-') type = 'MINUS';
                    else if (/^[0-9]+(ms|s)?$/.test(val)) type = 'TIME_OR_NUM';
                    else {
                        var upper = val.toUpperCase();
                        var keywords = [
                            'ASPECT', 'SET', 'UNSET', 'MATRIX', 'MAINLOOP',
                            'LOOP', 'IF', 'IS', 'BLINK', 'TIMER', 'NEXT',
                            'PREV', 'JUMP', 'GOTO', 'LABEL', 'INT', 'ENUM',
                            'GROUP', 'END', 'SECTION', 'RESUME', 'AFTER',
                            'ONNEXTACTION', 'DELAY', 'AND', 'OR', 'NOT'
                        ];
                        if (keywords.indexOf(upper) !== -1) {
                            type = upper;
                        }
                    }

                    tokens.push({ type: type, value: val, line: lineNum });
                }
            }

            tokens.push({ type: 'EOF', value: '', line: Math.max(1, lines.length) });
            return tokens;
        }
    };

    window.SignalLexer = SignalLexer;
})(window);