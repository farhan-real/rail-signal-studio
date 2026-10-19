(function(window) {
    'use strict';

    var ExampleSections = {
        name: 'Example: Visual Code Sections',
        mast: { type: 'tubular', height: 450, x: 0, y: -30, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -28, y: -160, width: 56, height: 212, corners: [28, 28, 28, 28], fill: '#0a0c10', stroke: '#2e3444', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 36, x: 0, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW1', color: 'yellow', diameter: 36, x: 0, y: -75, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 36, x: 0, y: -25, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW2', color: 'yellow', diameter: 36, x: 0, y: 25, hood: 'round', brightness: 1.0 }
        ],
        feathers: [
            { id: 'FEATHER_L1', position: 'left1', x: -28, y: -140, lamps: 5 }
        ],
        matrix: { enabled: true, id: 'ROUTE_BOX', x: 0, y: -258, text: '' },
        controls: [
            { id: 'Lever1', type: 'lever', label: 'Signal Lever', color: '#d92525', positions: 3, defaultValue: 0, x: 20, y: 20 },
            { id: 'RouteKnob', type: 'knob', label: 'Route', states: ['MAIN', 'LOOP'], mode: 'half', defaultValue: 0, x: 140, y: 20 },
            { id: 'StopLed', type: 'led', label: 'Stop Rep', colorKey: 'red', x: 320, y: 20 },
            { id: 'ClearLed', type: 'led', label: 'Clear Rep', colorKey: 'green', x: 420, y: 20 }
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
            '%% Route Interlocking',
            'enum RouteType { MAIN, LOOP };',
            '',
            'mainloop {',
            '    if Lever1 is 0 {',
            '        aspect DANGER;',
            '    } elif Lever1 is 1 {',
            '        aspect CAUTION;',
            '    } else {',
            '        if RouteKnob is MAIN {',
            '            aspect PROCEED;',
            '        } else {',
            '            aspect ATTENTION;',
            '        }',
            '    }',
            '',
            '    if RouteKnob is MAIN {',
            '        matrix = "M";',
            '        unset FEATHER_L1;',
            '    } else {',
            '        matrix = "1";',
            '        set FEATHER_L1;',
            '    }',
            '',
            '    if RED set {',
            '        unset matrix;',
            '    } else {',
            '        set matrix;',
            '    }',
            '}',
            '',
            '%% Desk Indicator LEDs',
            'mainloop {',
            '    if RED set {',
            '        set StopLed;',
            '        unset ClearLed;',
            '    } elif GREEN set {',
            '        unset StopLed;',
            '        set ClearLed;',
            '    } else {',
            '        unset StopLed;',
            '        unset ClearLed;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleSections = ExampleSections;
})(window);