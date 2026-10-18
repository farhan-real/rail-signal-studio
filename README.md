# Rail Signal Studio

A standalone, offline 2D railway signal creator and interlocking simulator. Design complex modern railway signals, wire up custom physical control desks, and write signal logic using an intuitive, dedicated railway scripting language running at a fixed 20 TPS.

---

## Key Features

### 1. Modular Signal Geometry
- **Custom Shapes:** Rounded rectangular heads, circle sector caps (top/bottom semicircles), custom angle brackets, and side branches.
- **Physical Mounting:** Tubular steel masts, lattice steel towers, overhead gantry clamps, maintenance platforms, ladders, and ground dwarf bases.
- **Optical Signal Lamps:** Multi-color Fresnel lenses (Red, Yellow, Green, Lunar White, Violet) with cylindrical cutaway hoods or European square visors.
- **Junction Feathers:** Up to 3 directional route feathers on each side (positions 1 through 6), each with an integrated row of 5 white lamps.
- **Route Matrix Indicator:** 5x7 circular LED theatre route box displaying alphanumeric characters (e.g. `M`, `L`, `1`, `2`, `S`).

### 2. Interactive Interlocking Control Desk
- **Movable Controls:** Freely drag, position, and label controls across the desk surface.
- **Railway Levers:** 2-position and 3-position mechanical interlocking levers with latch animations.
- **Rotary Knobs:** Multi-position rotary selectors with automatic Enum binding and dial labels.
- **Pushbuttons:** Momentary pushbuttons and latching toggle buttons.
- **Panel LEDs:** Independent, multi-color optical indicator LEDs (Red, Yellow, Green, White, Blue) on the desk with scriptable state and blinking.
- **Track Markers:** Movable text labels and notes for control desk organization.

### 3. Railway Scripting Language
- **Visual Code Sections:** Organize complex scripts into named sections (Aspects, Interlocking, Desk LEDs) with shared variables and state.
- **Fixed 20 TPS Engine:** 50ms deterministic simulation clock decoupled from hardware-accelerated 60/120 FPS rendering.
- **Compound Boolean Logic:** `AND`, `OR`, `NOT`, and parenthetical grouping `( ... )`.
- **Variables & Enums:** Strongly-typed `int` counters, `enum` route types, and direct assignment.
- **Component Groups:** Group lamps, feathers, or signals under custom identifiers with batch `set` and `unset`.
- **Execution Flow:** `label`, `jump`, and `end` statements for structured branching.
- **Time Controls:** `delay 2s;` sequential stepping, `resume after 3s;` timed holds, and `resume onnextaction;` operator latches.
- **Deterministic Blinking:** Millisecond-accurate pulsing that never stutters or resets phase across ticks.

### 4. 100% Standalone and Offline
- Zero dependencies, zero build steps, and zero external CDNs.
- Runs directly by double-clicking `index.html` via the `file://` protocol.
- Optimized for mobile and desktop in both portrait and landscape modes with touch gestures.

---

## Quick Start

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/rail-signal-studio.git
   ```
2. Double-click `index.html` in your web browser.
3. Select a preset from the **Presets...** dropdown in the top bar to inspect pre-configured signals and scripts.

---

## Scripting Language Reference

### Aspect Definitions
```text
aspect DANGER {
    unset ALL;
    set RED;
    unset matrix;
}

aspect PROCEED {
    unset ALL;
    set GREEN;
    set matrix "M";
}
```

### Mainloop and Conditions
```text
mainloop {
    /* Stop priority */
    if MasterLever is 0 {
        aspect DANGER;
        end;
    }

    /* Checking rotary knob with enum */
    if RouteKnob is MAIN {
        aspect PROCEED;
        end;
    }

    if RouteKnob is DIVERGING AND TrackClear is 1 {
        aspect CAUTION;
        set FEATHER_L1;
        set matrix "1";
        end;
    }
}
```

### Variables and Groups
```text
int speedLimit = 45;
enum RouteType { MAIN, DIVERGING, SIDING };
RouteType activeRoute = MAIN;

group CautionLamps { YELLOW1, YELLOW2 };

mainloop {
    if activeRoute is DIVERGING {
        set CautionLamps;
        if speedLimit < 30 {
            blink YELLOW1 400ms;
        }
    }
}
```

### Timed Delays and Emergency Recovery
```text
mainloop {
    /* Momentary button locks emergency state for 3 seconds */
    if EStopBtn is 1 {
        aspect DANGER;
        blink YELLOW1 350ms;
        resume after 3s;
        end;
    }

    /* Sequential caution delay before clearing to green */
    if MasterLever is 2 {
        aspect CAUTION;
        delay 2s;
        aspect PROCEED;
        end;
    }
}
```

---

## Syntax Overview

| Keyword / Symbol | Purpose | Example |
| :--- | :--- | :--- |
| `aspect <NAME> { ... }` | Defines signal aspect lamp states | `aspect CAUTION { set YELLOW; }` |
| `set <ID>` | Illuminates a lamp, feather, LED, or group | `set RED;` / `set CautionLamps;` |
| `unset <ID>` | Extinguishes a lamp, feather, LED, or group | `unset GREEN;` |
| `unset ALL` | Extinguishes all lamps, feathers, and LEDs | `unset ALL;` |
| `set matrix "<TEXT>"` | Displays alphanumeric route stencil | `set matrix "M";` |
| `unset matrix` | Blanks out the route stencil | `unset matrix;` |
| `mainloop { ... }` | 20 TPS continuous evaluation block | `mainloop { ... }` |
| `section "<TITLE>";` | Visual divider dividing code into cards | `section "Route Logic";` |
| `if <EXPR> { ... }` | Conditional block with boolean logic | `if Lever1 is 1 AND SwitchA is 1 { ... }` |
| `if <EXPR>, <ACTION>;` | Single-line shorthand action | `if Lever1 is 0, aspect DANGER;` |
| `int <NAME> = <NUM>;` | Declares an integer variable | `int speed = 60;` |
| `enum <NAME> { ... };` | Declares an enumerated type | `enum Route { MAIN, SIDING };` |
| `group <NAME> { ... };` | Defines a batch lamp or feather group | `group Feathers { FEATHER_L1, FEATHER_L2 };` |
| `blink <ID> <TIME>ms;` | Pulses a lamp, LED, or group | `blink YELLOW 450ms;` |
| `delay <TIME>;` | Pauses sequence execution non-blockingly | `delay 2s;` |
| `resume after <TIME>;` | Latches state for a duration after trigger | `resume after 3s;` |
| `resume onnextaction;` | Latches state until next control moves | `resume onnextaction;` |
| `label <NAME>;` | Marks a jump destination | `label FastPath;` |
| `jump <NAME>;` | Branches execution to a label | `jump FastPath;` |
| `end;` | Halts execution for the current 50ms tick | `end;` |
| `timer <TIME> { ... }` | Periodic simulation step timer | `timer 4s { next; }` |

---

## Included Presets & Examples

- **Indian MACLS + Feathers + Shunt:** 4-aspect signal with 3 directional feathers, alphanumeric matrix box, and mast-mounted position-light shunt signal.
- **French SNCF Combined Panel:** Complex combined target board featuring Carré, Sémaphore, Avertissement, and Voie Libre.
- **British 4-Aspect + Theatre Matrix:** Modern UK 4-aspect head with 5x7 LED stencil route indicator.
- **Ground Dwarf Shunt:** Compact ground-mounted position-light shunting disc signal.
- **Example: Visual Code Sections:** Demonstrates organizing complex interlocking into visual cards with shared scope.
- **Example: Groups & Enum Variables:** Demonstrates batch lamp groups and typed enum variables.
- **Example: Delay & Sequencing:** Demonstrates non-blocking aspect transition stepping via `delay 2s;`.
- **Example: If & Conditions:** Demonstrates compound conditions with `AND`, `OR`, `NOT`, and `()`.
- **Example: Knobs with Enum:** Demonstrates mapping rotary desk switches directly to named enum states.
- **Example: Buttons & Panel LEDs:** Demonstrates momentary buttons, toggle buttons, and desk indicator LEDs.

---

## Project Structure

```text
rail-signal-studio/
├── index.html                  # Main application container & viewports
├── css/
│   ├── main.css                # Base layout & dark theme variables
│   ├── canvas.css              # Viewport canvas & optical SVG styling
│   └── panels.css              # Control desk, drawers, and modal styling
├── icons/                      # Clean SVG vector UI icons
│   ├── play.svg
│   ├── pause.svg
│   ├── step.svg
│   ├── plus.svg
│   ├── code.svg
│   └── gear.svg
├── js/
│   ├── app.js                  # Application bootstrap & coordinator
│   ├── storage.js              # LocalStorage library & JSON export/import
│   ├── core/                   # Event bus and reactive signal state
│   ├── render/                 # SVG renderers (shapes, lamps, feathers, matrix, mast)
│   ├── parser/                 # Lexer, AST parser, and 20 TPS runtime engine
│   ├── controls/               # Hardware controls (levers, knobs, buttons, LEDs)
│   ├── ui/                     # UI viewports, inspector, console desk, and code editor
│   ├── presets/                # Main signal presets (Indian, French, British, Dwarf)
│   └── examples/               # Targeted syntax and feature example presets
└── README.md
```

---

## License

This project is licensed under the MIT License.