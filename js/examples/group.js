(function(window) {
    'use strict';

    var ExampleGroup = {
        name: 'Example: Groups and Enum Variables',
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
            { id: 'FEATHER_L1', position: 'left1', x: -28, y: -140, lamps: 5 },
            { id: 'FEATHER_R1', position: 'right1', x: 28, y: -140, lamps: 5 }
        ],
        matrix: { enabled: true, id: 'ROUTE_BOX', x: 0, y: -258, text: '' },
        controls: [
            { id: 'MasterLever', type: 'lever', label: 'Signal', color: '#d92525', positions: 3, defaultValue: 2, x: 20, y: 20 },
            { id: 'RouteKnob', type: 'knob', label: 'Route', states: ['MAIN', 'DIVERGE_LEFT', 'DIVERGE_RIGHT'], mode: 'half', defaultValue: 0, x: 140, y: 20 }
        ],
        script: [
            '%% Route Type and Lamp Groups',
            'enum RouteType { MAIN, DIVERGE_LEFT, DIVERGE_RIGHT };',
            'RouteType selectedRoute = MAIN;',
            '',
            'group CautionLamps { YELLOW1, YELLOW2 };',
            'group AllFeathers { FEATHER_L1, FEATHER_R1 };',
            '',
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
            '    set CautionLamps;',
            '}',
            '',
            'aspect PROCEED {',
            '    unset ALL;',
            '    set GREEN;',
            '}',
            '',
            '%% Route Interlocking',
            'mainloop {',
            '    if MasterLever is 0 {',
            '        aspect DANGER;',
            '    } elif MasterLever is 1 {',
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
            '        selectedRoute = MAIN;',
            '        matrix = "M";',
            '        unset AllFeathers;',
            '    } elif RouteKnob is DIVERGE_LEFT {',
            '        selectedRoute = DIVERGE_LEFT;',
            '        matrix = "1";',
            '        set FEATHER_L1;',
            '    } else {',
            '        selectedRoute = DIVERGE_RIGHT;',
            '        matrix = "2";',
            '        set FEATHER_R1;',
            '    }',
            '',
            '    if RED set {',
            '        unset matrix;',
            '    } else {',
            '        set matrix;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleGroup = ExampleGroup;
})(window);