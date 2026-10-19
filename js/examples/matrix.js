(function(window) {
    'use strict';

    var ExampleMatrix = {
        name: 'Example: Feathers and Route Matrix',
        mast: { type: 'tubular', height: 420, x: 0, y: -30, platform: false, ladder: true },
        shapes: [
            { id: 'plate_main', name: 'Main Head Plate', isMain: true, type: 'rounded-rect', x: -28, y: -160, width: 56, height: 160, corners: [28, 28, 28, 28], fill: '#0a0c10', stroke: '#2e3547', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW', color: 'yellow', diameter: 34, x: 0, y: -77, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -29, hood: 'round', brightness: 1.0 }
        ],
        featherBase: {
            enabled: true, x: 0, yOffset: 0, posMode: 'relative', anchorShapeId: 'plate_main',
            sides: 8, baseAngle: 0, radius: 35.5, showConnector: true, collarWidth: 32, collarHeight: 10, autoConnect: true
        },
        feathers: [
            { id: 'FEATHER_L3', position: 'left3', lamps: 5 },
            { id: 'FEATHER_R3', position: 'right3', lamps: 5 }
        ],
        matrix: { enabled: true, id: 'ROUTE_BOX', size: '1x', x: 0, yOffset: 0, posMode: 'relative', showBase: true, connectorHeight: 8, text: '' },
        controls: [
            { id: 'MasterLever', type: 'lever', label: 'Signal', color: '#d92525', positions: 3, defaultValue: 2, x: 20, y: 20 },
            { id: 'TrackSelector', type: 'knob', label: 'Platform', states: ['MAIN', 'PLATFORM_1', 'PLATFORM_2'], mode: 'half', defaultValue: 0, x: 140, y: 20 }
        ],
        script: [
            '%% Route Enumeration and Aspects',
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
            '%% Route Interlocking',
            'mainloop {',
            '    if MasterLever is 0 {',
            '        aspect DANGER;',
            '    } elif MasterLever is 1 {',
            '        aspect CAUTION;',
            '    } else {',
            '        aspect PROCEED;',
            '    }',
            '',
            '    if TrackSelector is MAIN {',
            '        matrix = "M";',
            '        unset FEATHERS;',
            '    } elif TrackSelector is PLATFORM_1 {',
            '        matrix = "1";',
            '        set FEATHER_L3;',
            '    } else {',
            '        matrix = "2";',
            '        set FEATHER_R3;',
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

    window.ExampleMatrix = ExampleMatrix;
})(window);