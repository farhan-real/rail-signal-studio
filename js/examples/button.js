(function(window) {
    'use strict';

    var ExampleButton = {
        name: 'Example: Buttons and Panel LEDs',
        mast: { type: 'tubular', height: 400, x: 0, y: -20, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -26, y: -150, width: 52, height: 158, corners: [26, 26, 26, 26], fill: '#0c0d12', stroke: '#2e3444', strokeWidth: 2.5 },
            { type: 'rounded-rect', x: -20, y: 16, width: 40, height: 40, corners: [6, 6, 6, 6], fill: '#0c0d12', stroke: '#2e3444', strokeWidth: 2 }
        ],
        lamps: [
            { id: 'RED', color: 'red', diameter: 34, x: 0, y: -115, hood: 'round', brightness: 1.0 },
            { id: 'YELLOW', color: 'yellow', diameter: 34, x: 0, y: -67, hood: 'round', brightness: 1.0 },
            { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -19, hood: 'round', brightness: 1.0 },
            { id: 'WHITE', color: 'white', diameter: 20, x: 0, y: 36, hood: 'round', brightness: 0.95 }
        ],
        feathers: [],
        matrix: { enabled: false },
        controls: [
            { id: 'EStopBtn', type: 'button', label: 'E-Stop', color: '#ff3333', isToggle: false, defaultValue: 0, x: 20, y: 20 },
            { id: 'OverrideBtn', type: 'button', label: 'Override', color: '#2e68f8', isToggle: false, defaultValue: 0, x: 120, y: 20 },
            { id: 'RouteLatchBtn', type: 'button', label: 'Route Lock', color: '#00cc44', isToggle: true, defaultValue: 0, x: 220, y: 20 },
            { id: 'AlarmLed', type: 'led', label: 'Alarm', colorKey: 'red', x: 320, y: 20 },
            { id: 'OverrideLed', type: 'led', label: 'Call-On', colorKey: 'yellow', x: 400, y: 20 },
            { id: 'RouteLed', type: 'led', label: 'Route', colorKey: 'green', x: 480, y: 20 }
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
            'aspect CALL_ON {',
            '    unset ALL;',
            '    set WHITE;',
            '}',
            '',
            '%% Button Interlocking',
            'mainloop {',
            '    if EStopBtn is 1 {',
            '        aspect DANGER;',
            '        set AlarmLed;',
            '        blink YELLOW 300ms;',
            '        resume after 3s;',
            '    } elif OverrideBtn is 1 {',
            '        aspect CALL_ON;',
            '        set OverrideLed;',
            '        resume after nextaction;',
            '    } elif RouteLatchBtn is 1 {',
            '        aspect PROCEED;',
            '        set RouteLed;',
            '    } else {',
            '        aspect DANGER;',
            '        unset AlarmLed;',
            '        unset OverrideLed;',
            '        unset RouteLed;',
            '    }',
            '}'
        ].join('\n')
    };

    window.ExampleButton = ExampleButton;
})(window);