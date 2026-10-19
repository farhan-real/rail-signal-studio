(function(window) {
    'use strict';

    var ExampleIf = {
        name: 'Example: If and Conditions',
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
            { id: 'TrackSwitch', type: 'switch', label: 'Track Clear', defaultValue: 1, x: 110, y: 15 },
            { id: 'GateSwitch', type: 'switch', label: 'Gate Closed', defaultValue: 1, x: 195, y: 15 }
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
            '    set YELLOW;',
            '}',
            '',
            'aspect PROCEED {',
            '    unset ALL;',
            '    set GREEN;',
            '}',
            '',
            '%% Interlocking Conditions',
            'mainloop {',
            '    if MasterLever is 0 OR NOT GateSwitch is 1 {',
            '        aspect DANGER;',
            '    } elif MasterLever is 1 OR TrackSwitch is 0 {',
            '        aspect CAUTION;',
            '    } else {',
            '        aspect PROCEED;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleIf = ExampleIf;
})(window);