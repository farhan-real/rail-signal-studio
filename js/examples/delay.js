(function(window) {
    'use strict';

    var ExampleDelay = {
        name: 'Example: Delay and Sequencing',
        mast: { type: 'tubular', height: 380, x: 0, y: -20, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -26, y: -140, width: 52, height: 158, corners: [26, 26, 26, 26], fill: '#0c0d12', stroke: '#2e3444', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -105, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW', color: 'yellow', diameter: 34, x: 0, y: -57, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -9, hood: 'round', brightness: 1.0 }
        ],
        feathers: [],
        matrix: { enabled: false },
        controls: [
            { id: 'MasterLever', type: 'lever', label: 'Signal Lever', color: '#d92525', positions: 3, defaultValue: 0, x: 20, y: 15 },
            { id: 'SeqLed', type: 'led', label: 'Timer Active', colorKey: 'yellow', x: 110, y: 15 }
        ],
        script: [
            'aspect DANGER {',
            '    unset ALL;',
            '    set RED;',
            '}',
            '',
            'aspect CAUTION {',
            '    unset ALL;',
            '    set YELLOW;',
            '}',
            '',
            'aspect PROCEED {',
            '    unset ALL;',
            '    set GREEN;',
            '}',
            '',
            'mainloop {',
            '    if MasterLever is 0 {',
            '        aspect DANGER;',
            '        unset SeqLed;',
            '        end;',
            '    }',
            '',
            '    if MasterLever is 1 {',
            '        aspect CAUTION;',
            '        unset SeqLed;',
            '        end;',
            '    }',
            '',
            '    if MasterLever is 2 {',
            '        aspect CAUTION;',
            '        set SeqLed;',
            '        delay 2s;',
            '        aspect PROCEED;',
            '        unset SeqLed;',
            '        end;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleDelay = ExampleDelay;
})(window);