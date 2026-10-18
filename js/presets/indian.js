(function(window) {
    'use strict';

    var PresetIndian = {
        name: 'Indian Railways 4-Aspect MACLS',
        mast: { type: 'tubular', height: 420, x: 0, y: -40, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -28, y: -160, width: 56, height: 180, corners: [28, 28, 28, 28], fill: '#0c0d12', stroke: '#2e3444', strokeWidth: 2.5 },
            { type: 'rounded-rect', x: -20, y: 55, width: 40, height: 40, corners: [6, 6, 6, 6], fill: '#0c0d12', stroke: '#2e3444', strokeWidth: 2 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW1', color: 'yellow', diameter: 34, x: 0, y: -85, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -45, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW2', color: 'yellow', diameter: 34, x: 0, y: -5, hood: 'round', brightness: 1.0 },
            { id: 'SHUNT_WHITE1', color: 'white', diameter: 14, x: -10, y: 75, hood: 'none', brightness: 0.9 },
            { id: 'SHUNT_WHITE2', color: 'white', diameter: 14, x: 10, y: 75, hood: 'none', brightness: 0.9 }
        ],
        feathers: [
            { id: 'FEATHER_L1', position: 'left1', x: -18, y: -160, lamps: 5 },
            { id: 'FEATHER_L2', position: 'left2', x: -26, y: -150, lamps: 5 },
            { id: 'FEATHER_R1', position: 'right1', x: 18, y: -160, lamps: 5 }
        ],
        matrix: { enabled: true, id: 'ROUTE_BOX', x: 0, y: -205, text: '' },
        controls: [
            { id: 'Lever1', type: 'lever', label: 'Signal Lever', color: '#d92525', positions: 3, defaultValue: 0, x: 20, y: 15 },
            { id: 'RouteSelector', type: 'knob', label: 'Route', states: ['Main', 'Loop1', 'Loop2'], defaultValue: 0, x: 110, y: 15 },
            { id: 'ShuntSwitch', type: 'switch', label: 'Shunt', defaultValue: 0, x: 200, y: 15 }
        ],
        script: [
            'aspect DANGER {',
            '    unset ALL;',
            '    set RED;',
            '}',
            '',
            'aspect CAUTION {',
            '    unset ALL;',
            '    set YELLOW1;',
            '}',
            '',
            'aspect ATTENTION {',
            '    unset ALL;',
            '    set YELLOW1;',
            '    set YELLOW2;',
            '}',
            '',
            'aspect PROCEED {',
            '    unset ALL;',
            '    set GREEN;',
            '}',
            '',
            'mainloop {',
            '    if Lever1 is 0 {',
            '        aspect DANGER;',
            '    }',
            '    if Lever1 is 1 AND RouteSelector is 0 {',
            '        aspect CAUTION;',
            '    }',
            '    if Lever1 is 1 AND (RouteSelector is 1 OR RouteSelector is 2) {',
            '        aspect ATTENTION;',
            '    }',
            '    if Lever1 is 2 {',
            '        aspect PROCEED;',
            '    }',
            '    if RouteSelector is 1 {',
            '        set FEATHER_L1;',
            '        set matrix "1";',
            '    }',
            '    if RouteSelector is 2 {',
            '        set FEATHER_L2;',
            '        set matrix "2";',
            '    }',
            '    if RouteSelector is 0 {',
            '        unset matrix;',
            '    }',
            '    if ShuntSwitch is 1 {',
            '        set SHUNT_WHITE1;',
            '        set SHUNT_WHITE2;',
            '    }',
            '    if ShuntSwitch is 0 {',
            '        unset SHUNT_WHITE1;',
            '        unset SHUNT_WHITE2;',
            '    }',
            '}'
        ].join('\n')
    };

    window.PresetIndian = PresetIndian;
})(window);