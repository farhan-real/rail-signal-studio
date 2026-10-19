# Rail Signal Studio

A standalone, offline 2D railway signal designer, visual layout creator, and interlocking simulator. Design complex modern railway signals, wire up custom physical control desks, and write signal logic using an intuitive, dedicated railway scripting language running on a deterministic 20 TPS execution clock.

**Live App:** [https://farhan-real.github.io/rail-signal-studio/](https://farhan-real.github.io/rail-signal-studio/)

---

## Key Features

### 1. Scripting Language and Syntax Highlighting
- **Integrated Syntax Highlighting:** Real-time token highlighting for keywords, commands, logic operators, built-in components, signal lamps, strings, numbers, and section dividers.
- **Deterministic 20 TPS Engine:** 50ms fixed-rate execution decoupled from browser frame rates.
- **Visual Code Sections:** Organize complex scripts into named sections (`%% Section Title`) with shared variables and state.
- **Context-Aware Autocompletion:** Inline suggestions for keywords, aspect names, lamps, feathers, controls, and variables.
- **State Latching and Timed Recovery:** `resume after <time>;` holds states non-blockingly and automatically restores aspect evaluation upon expiration. `resume after nextaction;` latches states until the next operator input.
- **Blinking Logic:** Millisecond-accurate pulsing that activates automatically and maintains phase across simulation ticks.

### 2. Modular Signal Geometry and Plates
- **Target Plates and Shapes:** Rounded rectangular heads, rectangular spacer boxes, circle sector caps (top and bottom semicircular hoods), and multi-directional triangle brackets.
- **Main Signal Box Designation:** Set any plate as the primary signal box to anchor junction feathers, route matrices, and service platforms so secondary brackets or spacer plates never displace mounted hardware.
- **Physical Mounting Structures:** Tubular steel masts, lattice towers, overhead gantry clamps, maintenance footplates, access ladders, and ground dwarf bases with bolted steel plates, concrete pads, or clamp footings.
- **Optical Signal Lamps:** Multi-color Fresnel lenses (Red, Yellow, Green, Lunar White, Violet, Blue) with cutaway round cowls or visorless hoods, customizable brightness, and direct or relative vertical offsets.

### 3. Junction Route Feathers
- **Standard Divergence Alignment:**
  - **Bottom Feathers:** L1 (Bottom Left, 45° down-left) and R1 (Bottom Right, 45° down-right).
  - **Middle Feathers:** L2 (Middle Left, horizontal 90°) and R2 (Middle Right, horizontal 90°).
  - **Top Feathers:** L3 (Top Left, 45° up-left) and R3 (Top Right, 45° up-right).
- **Configurable Base Hub Geometry:** Customize the hub polygon facet count (6-sided hexagon, 8-sided octagon, 10, 12, or custom 3 to 16 sides), adjust base rotation angle, and modify hub radius.
- **Mount Collar:** Adjustable connector height, customizable collar width, auto-connection to the signal head, and an optional bottom mount toggle to allow custom structural brackets.

### 4. Route Matrix Stencils
- **1x and 2x Display Options:** Choose between a standard single-cell (1x) matrix or a wide dual-cell (2x) twin matrix to display multi-character route indications such as `L1`, `L2`, `M1`, or `2A`.
- **Complete Alphanumeric Font:** Full 5x7 LED matrix representation supporting digits `0` through `9`, full alphabet `A` through `Z`, space, and common route symbols (`-`, `/`, `.`).
- **Customizable Base Bracket:** Toggleable base bracket and adjustable connector height for mounting flush on top of the feather hub or using custom angle plates.

### 5. Interactive Control Desk
- **Movable Controls:** Freely drag and position controls on a 20px grid with live coordinate snapping and responsive wrapping on smaller screens.
- **Railway Levers:** 2 to 5 position mechanical interlocking levers with quadrant notches and throw animations.
- **Rotary Selectors:** Multi-position rotary switches with radial dial labels and automatic Enum type binding.
- **Customizable Pushbuttons:** Momentary pushbuttons and latching toggle buttons featuring quick-select color swatches (Red, Yellow, Green, Blue, White, Dark), full custom hex color picker, and configurable operating modes.
- **Panel LEDs:** Independent, multi-color optical indicator LEDs (Red, Yellow, Green, White, Blue) on the desk with scriptable steady and blinking states.
- **Track Markers:** Movable text labels and notes for control desk organization.
---

## Running the Simulator

### Option 1: Live Web App
Open the simulator directly in your browser:
[https://farhan-real.github.io/rail-signal-studio/](https://farhan-real.github.io/rail-signal-studio/)

### Option 2: Run Locally
1. Clone or download this repository:
   ```bash
   git clone https://github.com/farhan-real/rail-signal-studio.git
   ```
2. Open `index.html` in any modern browser.

---

## Scripting Language Reference

### Aspect Definitions
```text
aspect DANGER {
    unset ALL;
    set RED;
    unset matrix;
}

aspect CAUTION {
    unset ALL;
    set YELLOW1;
}

aspect PROCEED {
    unset ALL;
    set GREEN;
    set matrix "M";
}
```

### Mainloop and Conditional Interlocking
```text
mainloop {
    /* Stop priority */
    if SignalLever is 0 {
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
        set matrix "L1";
        end;
    }
}
```

### Timed Latches and Emergency Override
```text
mainloop {
    /* Momentary emergency button locks warning state for 5 seconds */
    if EStopBtn is 1 {
        unset ALL;
        set AlarmLed;
        blink RED 600ms;
        resume after 5s;
    }

    /* Normal route clearing once emergency latch expires */
    if SignalLever is 1 {
        aspect PROCEED;
    } else {
        aspect DANGER;
    }
}
```

### Variables, Groups, and Blinking
```text
int speedLimit = 45;
enum RouteType { MAIN, LOOP_1, LOOP_2 };
RouteType activeRoute = MAIN;

group CautionLamps { YELLOW1, YELLOW2 };

mainloop {
    if activeRoute is LOOP_1 {
        set CautionLamps;
        if speedLimit < 30 {
            blink YELLOW1 400ms;
        }
    }
}
```

---

## Syntax Overview

| Keyword / Symbol | Purpose | Example |
| :--- | :--- | :--- |
| `aspect <NAME> { ... }` | Defines signal aspect lamp states | `aspect CAUTION { set YELLOW1; }` |
| `set <ID>` | Illuminates a lamp, feather, LED, or group | `set RED;` / `set CautionLamps;` |
| `unset <ID>` | Extinguishes a lamp, feather, LED, or group | `unset GREEN;` |
| `unset ALL` | Extinguishes all lamps, feathers, and LEDs | `unset ALL;` |
| `set matrix "<TEXT>"` | Displays alphanumeric route stencil (1x or 2x) | `set matrix "L2";` |
| `unset matrix` | Blanks out the route stencil | `unset matrix;` |
| `mainloop { ... }` | 20 TPS continuous evaluation block | `mainloop { ... }` |
| `%% <TITLE>` | Visual divider organizing code into cards | `%% Interlocking Logic` |
| `if <EXPR> { ... }` | Conditional block with boolean logic | `if Lever1 is 1 AND TrackClear is 1 { ... }` |
| `elif <EXPR> { ... }` | Alternative branch condition | `elif Lever1 is 2 { ... }` |
| `else { ... }` | Fallback branch | `else { aspect DANGER; }` |
| `int <NAME> = <NUM>;` | Declares an integer variable | `int speed = 60;` |
| `enum <NAME> { ... };` | Declares an enumerated type | `enum Route { MAIN, LOOP };` |
| `group <NAME> { ... };` | Defines a batch lamp or feather group | `group Feathers { FEATHER_L1, FEATHER_L2 };` |
| `blink <ID> <TIME>ms;` | Pulses a lamp, LED, or group | `blink YELLOW1 400ms;` |
| `delay <TIME>;` | Pauses sequence execution non-blockingly | `delay 2s;` |
| `resume after <TIME>;` | Latches state for a duration, then resumes | `resume after 5s;` |
| `resume after nextaction;` | Latches state until next control moves | `resume after nextaction;` |
| `label <NAME>;` | Marks a jump destination | `label StopPath;` |
| `jump <NAME>;` | Branches execution to a label | `jump StopPath;` |
| `end;` | Halts execution for the current 50ms tick | `end;` |
| `timer <TIME> { ... }` | Periodic simulation step timer | `timer 4s { next; }` |

---

## Included Presets & Examples

- **Indian Railways 4-Aspect MACLS:** 4-aspect head with 3 directional feathers, position-light shunt signal, and alphanumeric stencil indicator.
- **British Rail 4-Aspect with Matrix:** UK 4-aspect signal head with 5x7 LED stencil route box.
- **French SNCF Combined Target Panel:** Combined panel featuring Carré, Sémaphore, Avertissement, and Voie Libre.
- **Ground Dwarf Position-Light Shunt:** Compact ground-mounted position-light shunting disc signal.
- **Example: Visual Code Sections:** Demonstrates organizing interlocking routines into visual cards with shared scope.
- **Example: Groups and Enum Variables:** Demonstrates batch component groups and typed enum variables.
- **Example: Delay and Sequencing:** Non-blocking aspect transition stepping via `delay 2s;`.
- **Example: If and Conditions:** Compound boolean evaluations with `AND`, `OR`, `NOT`, and parenthetical grouping.
- **Example: Knobs with Enum:** Directly maps rotary desk selectors to named enum states.
- **Example: Buttons and Panel LEDs:** Demonstrates momentary buttons, latching buttons, and desk indicator LEDs.
- **Example: Feathers and Route Matrix:** Route indicators and directional junction feathers.
- **Example: Jumps and Variables:** Demonstrates variable manipulation and flow control using labels and jumps.

---

## License

This project is licensed under the MIT License.