(function(window) {
    'use strict';

    var PresetFrench = {
        name: 'French SNCF Combined Target Panel',
        mast: { type: 'lattice', height: 400, x: 0, y: -30, platform: true, ladder: true },
        shapes: [
            { type: 'rounded-rect', x: -44, y: -160, width: 88, height: 175, corners: [24, 24, 24, 24], fill: '#0a0c10', stroke: '#e8edf5', strokeWidth: 3 }
        ],
        lamps: [
            { id: 'CARRE_RED1', color: 'red', diameter: 30, x: -20, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'CARRE_RED2', color: 'red', diameter: 30, x: 20, y: -125, hood: 'round', brightness: 1.0 },
            { id: 'VERT', color: 'green', diameter: 30, x: 0, y: -80, hood: 'round', brightness: 1.0 },
            { id: 'JAUNE', color: 'yellow', diameter: 30, x: -20, y: -35, hood: 'round', brightness: 1.0 },
            { id: 'BLANC', color: 'white', diameter: 22, x: 20, y: -35, hood: 'round', brightness: 0.95 }
        ],
        feathers: [],
        matrix: { enabled: false },
        controls: [
            { id: 'SNCFLever', type: 'lever', label: 'Signal Carré', color: '#d92525', positions: 4, defaultValue: 0, x: 20, y: 20 },
            { id: 'ManoeuvreKnob', type: 'knob', label: 'Voie', states: ['Normal', 'Manoeuvre'], mode: 'half', defaultValue: 0, x: 140, y: 20 }
        ],
        script: [
            '%% Aspect Definitions',
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
            'aspect MANOEUVRE {',
            '    unset ALL;',
            '    set BLANC;',
            '}',
            '',
            '%% Interlocking Control',
            'mainloop {',
            '    if ManoeuvreKnob is Manoeuvre {',
            '        aspect MANOEUVRE;',
            '    } elif SNCFLever is 0 {',
            '        aspect CARRE;',
            '    } elif SNCFLever is 1 {',
            '        aspect SEMAPHORE;',
            '    } elif SNCFLever is 2 {',
            '        aspect AVERTISSEMENT;',
            '    } else {',
            '        aspect VOIE_LIBRE;',
            '    }',
            '',
            '    if JAUNE set {',
            '        blink JAUNE 700ms;',
            '    }',
            '}'
        ].join('\n')
    };

    window.PresetFrench = PresetFrench;
})(window);