(function(window) {
    'use strict';

    var PresetFrench = {
        name: 'French SNCF Combined Target Panel',
        mast: { type: 'lattice', height: 400, x: 0, y: -30, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -45, y: -160, width: 90, height: 180, corners: [30, 30, 30, 30], fill: '#0a0c10', stroke: '#e8edf5', strokeWidth: 3 },
            { type: 'triangle', points: [[45, -120], [75, -90], [45, -60]], fill: '#0a0c10', stroke: '#e8edf5', strokeWidth: 2 }
        ],
        lamps: [
            { id: 'CARRE_RED1', color: 'red', diameter: 32, x: -20, y: -125, hood: 'square', brightness: 1.0 },
            { id: 'CARRE_RED2', color: 'red', diameter: 32, x: 20, y: -125, hood: 'square', brightness: 1.0 },
            { id: 'VERT', color: 'green', diameter: 32, x: 0, y: -80, hood: 'square', brightness: 1.0 },
            { id: 'JAUNE', color: 'yellow', diameter: 32, x: -20, y: -35, hood: 'square', brightness: 1.0 },
            { id: 'BLANC', color: 'white', diameter: 24, x: 20, y: -35, hood: 'square', brightness: 0.9 }
        ],
        feathers: [],
        matrix: { enabled: false },
        controls: [
            { id: 'SNCFLever', type: 'lever', label: 'Signal Carré', color: '#d92525', positions: 3, defaultValue: 0, x: 20, y: 15 },
            { id: 'ManoeuvreKnob', type: 'knob', label: 'Voie', states: ['Normal', 'Manoeuvre'], defaultValue: 0, x: 110, y: 15 }
        ],
        script: [
            'aspect CARRE {',
            '    unset ALL;',
            '    set CARRE_RED1;',
            '    set CARRE_RED2;',
            '}',
            '',
            'aspect SEMAPHORE {',
            '    unset ALL;',
            '    set CARRE_RED1;',
            '}',
            '',
            'aspect AVERTISSEMENT {',
            '    unset ALL;',
            '    set JAUNE;',
            '}',
            '',
            'aspect VOIE_LIBRE {',
            '    unset ALL;',
            '    set VERT;',
            '}',
            '',
            'mainloop {',
            '    if SNCFLever is 0 {',
            '        aspect CARRE;',
            '    }',
            '    if SNCFLever is 1 {',
            '        aspect AVERTISSEMENT;',
            '    }',
            '    if SNCFLever is 2 {',
            '        aspect VOIE_LIBRE;',
            '    }',
            '    if JAUNE set {',
            '        blink JAUNE 700ms;',
            '    }',
            '}',
            '',
            'timer 5s {',
            '    next;',
            '}'
        ].join('\n')
    };

    window.PresetFrench = PresetFrench;
})(window);
