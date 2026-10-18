(function(window) {
    'use strict';

    var ExampleJump = {
        name: 'Example: Jumps and Variables',
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
            { id: 'EmergencySwitch', type: 'switch', label: 'E-Stop', defaultValue: 0, x: 20, y: 15 },
            { id: 'SpeedKnob', type: 'knob', label: 'Speed Limit', states: ['20', '45', '80'], defaultValue: 1, x: 110, y: 15 }
        ],
        script: [
            'int speed = 45;',
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
            'mainloop {',
            '    if EmergencySwitch is 1 {',
            '        jump TriggerStop;',
            '    }',
            '',
            '    if SpeedKnob is 0, speed = 20;',
            '    if SpeedKnob is 1, speed = 45;',
            '    if SpeedKnob is 2, speed = 80;',
            '',
            '    if speed > 60 {',
            '        aspect PROCEED;',
            '        end;',
            '    }',
            '',
            '    aspect CAUTION;',
            '    if speed < 30 {',
            '        blink YELLOW 350ms;',
            '    }',
            '    end;',
            '',
            '    label TriggerStop;',
            '    aspect DANGER;',
            '}'
        ].join('\n')
    };

    window.ExampleJump = ExampleJump;
})(window);
