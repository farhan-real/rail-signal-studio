(function(window) {
    'use strict';

    var PresetBritish = {
        name: 'British Rail 4-Aspect with Theatre Matrix',
        mast: { type: 'tubular', height: 440, x: 0, y: -30, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -26, y: -160, width: 52, height: 205, corners: [26, 26, 26, 26], fill: '#090a0f', stroke: '#2e3547', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'YELLOW_TOP', color: 'yellow', diameter: 34, x: 0, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -77, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW_BOTTOM', color: 'yellow', diameter: 34, x: 0, y: -29, hood: 'round', brightness: 1.0 },
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: 19, hood: 'round', brightness: 1.0 }
        ],
        feathers: [],
        matrix: { enabled: true, id: 'THEATRE_BOX', x: 0, y: -192, text: '' },
        controls: [
            { id: 'SignalLever', type: 'lever', label: 'Main Signal', color: '#d92525', positions: 4, defaultValue: 0, x: 20, y: 15 },
            { id: 'RouteThumb', type: 'knob', label: 'Route', states: ['Main', 'Loop', 'Siding'], defaultValue: 0, x: 110, y: 15 }
        ],
        script: [
            '%% Aspect Definitions',
            'aspect DANGER {',
            '    unset ALL;',
            '    set RED;',
            '    unset matrix;',
            '}',
            '',
            'aspect CAUTION {',
            '    unset ALL;',
            '    set YELLOW_BOTTOM;',
            '}',
            '',
            'aspect PRELIMINARY_CAUTION {',
            '    unset ALL;',
            '    set YELLOW_TOP;',
            '    set YELLOW_BOTTOM;',
            '}',
            '',
            'aspect CLEAR {',
            '    unset ALL;',
            '    set GREEN;',
            '}',
            '',
            '%% Interlocking Logic',
            'mainloop {',
            '    if SignalLever is 0 {',
            '        aspect DANGER;',
            '        unset matrix;',
            '        end;',
            '    }',
            '',
            '    if SignalLever is 1 {',
            '        aspect CAUTION;',
            '    }',
            '    if SignalLever is 2 {',
            '        aspect PRELIMINARY_CAUTION;',
            '    }',
            '    if SignalLever is 3 {',
            '        aspect CLEAR;',
            '    }',
            '',
            '    if RouteThumb is Main OR RouteThumb is 0 {',
            '        set matrix "M";',
            '    }',
            '    if RouteThumb is Loop OR RouteThumb is 1 {',
            '        set matrix "L";',
            '    }',
            '    if RouteThumb is Siding OR RouteThumb is 2 {',
            '        set matrix "S";',
            '    }',
            '}'
        ].join('\n')
    };

    window.PresetBritish = PresetBritish;
})(window);