(function(window) {
    'use strict';

    var ExampleIf = {
        name: 'Example: If and Conditions',
        mast: { type: 'tubular', height: 360, x: 0, y: -20, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -26, y: -130, width: 52, height: 135, corners: [26, 26, 26, 26], fill: '#0c0d12', stroke: '#2e3444', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -105, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW', color: 'yellow', diameter: 34, x: 0, y: -65, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -25, hood: 'round', brightness: 1.0 }
        ],
        feathers: [],
        matrix: { enabled: false },
        controls: [
            { id: 'MasterLever', type: 'lever', label: 'Signal Lever', color: '#d92525', positions: 3, defaultValue: 0, x: 20, y: 15 },
            { id: 'TrackSwitch', type: 'switch', label: 'Track Clear', defaultValue: 1, x: 110, y: 15 },
            { id: 'GateSwitch', type: 'switch', label: 'Gate Closed', defaultValue: 1, x: 195, y: 15 }
        ],
        script: [
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
            '    if MasterLever is 0 OR NOT GateSwitch is 1 {',
            '        aspect DANGER;',
            '        end;',
            '    }',
            '',
            '    if MasterLever is 1 OR TrackSwitch is 0 {',
            '        aspect CAUTION;',
            '        end;',
            '    }',
            '',
            '    if MasterLever is 2 AND (TrackSwitch is 1 AND GateSwitch is 1) {',
            '        aspect PROCEED;',
            '        end;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleIf = ExampleIf;
})(window);
