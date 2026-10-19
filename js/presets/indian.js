(function(window) {
    'use strict';

    var PresetIndian = {
        name: 'Indian Railways 4-Aspect MACLS',
        mast: { type: 'tubular', height: 480, x: 0, y: -40, platform: false, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -28, y: -160, width: 56, height: 205, corners: [28, 28, 4, 4], fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 2.5 },
            { type: 'rounded-rect', x: -16, y: 45, width: 32, height: 24, corners: [2, 2, 2, 2], fill: '#121622', stroke: '#262d3e', strokeWidth: 1.8 },
            { type: 'rounded-rect', x: -18, y: 77, width: 36, height: 28, corners: [2, 2, 2, 2], fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 1.8, text: 'PWS\nS-8', fontSize: 9, textColor: '#ffffff' },
            { type: 'rounded-rect', x: -22, y: 115, width: 44, height: 42, corners: [6, 6, 6, 6], fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 2 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW1', color: 'yellow', diameter: 34, x: 0, y: -77, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -29, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW2', color: 'yellow', diameter: 34, x: 0, y: 19, hood: 'round', brightness: 1.0 },
            { id: 'SHUNT_WHITE1', color: 'white', diameter: 14, x: -11, y: 136, hood: 'round', brightness: 0.95 },
            { id: 'SHUNT_WHITE2', color: 'white', diameter: 14, x: 11, y: 136, hood: 'round', brightness: 0.95 }
        ],
        feathers: [
            { id: 'FEATHER_L1', position: 'left2', lamps: 5 },
            { id: 'FEATHER_L2', position: 'left1', lamps: 5 },
            { id: 'FEATHER_R1', position: 'right1', lamps: 5 }
        ],
        featherBase: {
            enabled: true,
            x: 0,
            yOffset: 0,
            posMode: 'relative',
            sides: 8,
            baseAngle: 0,
            radius: 35.5,
            collarWidth: 32,
            collarHeight: null,
            autoConnect: true
        },
        matrix: { enabled: false },
        controls: [
            { id: 'Lever1', type: 'lever', label: 'Signal Lever', color: '#d92525', positions: 4, defaultValue: 0, x: 20, y: 20 },
            { id: 'RouteSelector', type: 'knob', label: 'Route', states: ['Main', 'Left 1', 'Left 2', 'Right'], mode: 'half', defaultValue: 0, x: 140, y: 20 },
            { id: 'ShuntSwitch', type: 'switch', label: 'Shunt', defaultValue: 0, x: 320, y: 20 }
        ],
        script: [
            '%% Aspect Definitions',
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
            '%% Interlocking Control',
            'mainloop {',
            '    if Lever1 is 0 {',
            '        aspect DANGER;',
            '    } elif Lever1 is 1 {',
            '        aspect CAUTION;',
            '    } elif Lever1 is 2 {',
            '        aspect ATTENTION;',
            '    } else {',
            '        aspect PROCEED;',
            '    }',
            '',
            '    if RED set OR RouteSelector is Main {',
            '        unset FEATHERS;',
            '    } elif RouteSelector is "Left 1" {',
            '        set FEATHER_L1;',
            '    } elif RouteSelector is "Left 2" {',
            '        set FEATHER_L2;',
            '    } else {',
            '        set FEATHER_R1;',
            '    }',
            '',
            '    if ShuntSwitch is 1 {',
            '        set SHUNT_WHITE1;',
            '        set SHUNT_WHITE2;',
            '    } else {',
            '        unset SHUNT_WHITE1;',
            '        unset SHUNT_WHITE2;',
            '    }',
            '}'
        ].join('\n')
    };

    window.PresetIndian = PresetIndian;
})(window);