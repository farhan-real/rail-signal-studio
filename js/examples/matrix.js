(function(window) {
    'use strict';

    var ExampleMatrix = {
        name: 'Example: Feathers and Route Matrix',
        mast: { type: 'tubular', height: 420, x: 0, y: -30, platform: false, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -28, y: -160, width: 56, height: 160, corners: [28, 28, 28, 28], fill: '#0a0c10', stroke: '#2e3547', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW', color: 'yellow', diameter: 34, x: 0, y: -77, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -29, hood: 'round', brightness: 1.0 }
        ],
        feathers: [
            { id: 'FEATHER_L1', position: 'left1', lamps: 5 },
            { id: 'FEATHER_R1', position: 'right1', lamps: 5 }
        ],
        matrix: { enabled: true, id: 'ROUTE_BOX', x: 0, y: -258, text: 'M' },
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
            '        unset FEATHERS;',
            '        unset matrix;',
            '        end;',
            '    }',
            '',
            '    if MasterLever is 1 {',
            '        aspect CAUTION;',
            '    }',
            '',
            '    if MasterLever is 2 {',
            '        aspect PROCEED;',
            '    }',
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