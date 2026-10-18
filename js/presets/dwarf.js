(function(window) {
    'use strict';

    var PresetDwarf = {
        name: 'Ground Dwarf Position-Light Shunt',
        mast: { type: 'dwarf', height: 90, x: 0, y: 0, platform: false, ladder: false },
        shapes: [
            { type: 'circle-sector', x: 0, y: -45, radius: 36, percent: 100, fill: '#0a0c10', stroke: '#2e3547', strokeWidth: 2.5 }
        ],
        lamps: [
            { id: 'STOP_RED', color: 'red', diameter: 16, x: -16, y: -45, hood: 'round', brightness: 1.0 },
            { id: 'STOP_WHITE', color: 'white', diameter: 16, x: 16, y: -45, hood: 'round', brightness: 1.0 },
            { id: 'PROCEED_WHITE', color: 'white', diameter: 16, x: 12, y: -60, hood: 'round', brightness: 1.0 }
        ],
        feathers: [],
        matrix: { enabled: false },
        controls: [
            { id: 'ShuntLever', type: 'lever', label: 'Ground Lever', color: '#22252c', positions: 2, defaultValue: 0, x: 20, y: 15 }
        ],
        script: [
            'aspect STOP {',
            '    unset ALL;',
            '    set STOP_RED;',
            '    set STOP_WHITE;',
            '}',
            '',
            'aspect PROCEED {',
            '    unset ALL;',
            '    set STOP_WHITE;',
            '    set PROCEED_WHITE;',
            '}',
            '',
            'mainloop {',
            '    if ShuntLever is 0 {',
            '        aspect STOP;',
            '    }',
            '    if ShuntLever is 1 {',
            '        aspect PROCEED;',
            '    }',
            '}'
        ].join('\n')
    };

    window.PresetDwarf = PresetDwarf;
})(window);