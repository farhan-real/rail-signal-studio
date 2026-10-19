(function(window) {
    'use strict';

    var ExampleKnob = {
        name: 'Example: Knobs with Enum',
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
            { id: 'SignalLever', type: 'lever', label: 'Signal', color: '#d92525', positions: 2, defaultValue: 1, x: 20, y: 20 },
            { id: 'RouteKnob', type: 'knob', label: 'Route', states: ['MAIN', 'BRANCH', 'SIDING'], mode: 'half', defaultValue: 0, x: 140, y: 20 }
        ],
        script: [
            '%% Route Enumeration and Aspects',
            'enum Route { MAIN, BRANCH, SIDING };',
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
            '%% Control Logic',
            'mainloop {',
            '    if SignalLever is 0 {',
            '        aspect DANGER;',
            '    } else {',
            '        if RouteKnob is MAIN {',
            '            aspect PROCEED;',
            '        } elif RouteKnob is BRANCH {',
            '            aspect CAUTION;',
            '        } else {',
            '            aspect CAUTION;',
            '            blink YELLOW 450ms;',
            '        }',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleKnob = ExampleKnob;
})(window);