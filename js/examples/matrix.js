(function(window) {
    'use strict';

    var ExampleMatrix = {
        name: 'Example: Feathers and Route Matrix',
        mast: { type: 'tubular', height: 420, x: 0, y: -30, platform: false, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -28, y: -150, width: 56, height: 140, corners: [28, 28, 28, 28], fill: '#0a0c10', stroke: '#2e3547', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -120, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW', color: 'yellow', diameter: 34, x: 0, y: -80, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -40, hood: 'round', brightness: 1.0 }
        ],
        feathers: [
            { id: 'FEATHER_L1', position: 'left1', lamps: 5 },
            { id: 'FEATHER_R1', position: 'right1', lamps: 5 }
        ],
        matrix: { enabled: true, id: 'ROUTE_BOX', x: 0, y: -202, text: 'M' },
        controls: [
            { id: 'MasterLever', type: 'lever', label: 'Signal', color: '#d92525', positions: 3, defaultValue: 2, x: 20, y: 15 },
            { id: 'TrackSelector', type: 'knob', label: 'Platform', states: ['MAIN', 'PLATFORM_1', 'PLATFORM_2'], defaultValue: 0, x: 110, y: 15 }
        ],
        script: [
            'enum Track { MAIN, PLATFORM_1, PLATFORM_2 };',
            '',
            'aspect DANGER {',
            '    unset ALL;',
            '    set RED;',
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
            '        end;',
            '    }',
            '',
            '    aspect PROCEED;',
            '',
            '    if TrackSelector is MAIN {',
            '        set matrix "M";',
            '        unset FEATHERS;',
            '        end;',
            '    }',
            '',
            '    if TrackSelector is PLATFORM_1 {',
            '        set matrix "1";',
            '        set FEATHER_L1;',
            '        end;',
            '    }',
            '',
            '    if TrackSelector is PLATFORM_2 {',
            '        set matrix "2";',
            '        set FEATHER_R1;',
            '        end;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleMatrix = ExampleMatrix;
})(window);