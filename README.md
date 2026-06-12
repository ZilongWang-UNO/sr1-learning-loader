# Learning Garden Discovery

A school-style educational loading screen for K-12 STEM lessons.

[Live demo](https://zilongwang-uno.github.io/learning-garden-loader/)

![Learning Garden Discovery preview](preview.png)

While a video loads for 20 seconds, the page selects one short discovery from
a small reviewed knowledge library. A friendly illustration, three captions,
and browser narration explain the idea together.

## Included discoveries

- Why leaves look green
- Why programmers use loops
- How coordinates help a robot find a point

Use the **Show me another** button to move through all three examples.

## How the dynamic system works

The JavaScript is intentionally simple:

1. `topics` stores each title, three captions, takeaway, and visual function.
2. `showTopic()` places the selected content on the page.
3. `setStep()` highlights one caption and changes the illustration state.
4. `updateTimer()` advances the three steps and completes loading at 20 seconds.
5. `speak()` reads the current caption with the Web Speech API.

To add another discovery, add one object to `topics` and one small visual
function. The page layout and loading behavior do not need to change.

## Accessibility

- Narration can be turned off at any time.
- Every spoken sentence is also visible as text.
- All controls are native keyboard-accessible buttons.
- The progress bar exposes its current value to assistive technology.
- The page supports reduced-motion preferences.
- Text, numbers, shapes, and motion reinforce color changes.

## Technology

- Plain HTML
- Plain CSS
- Plain JavaScript
- Inline SVG illustrations
- No packages, build step, external fonts, images, or network requests

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

For design review, a specific example can be opened with:

```text
?topic=leaves
?topic=loops
?topic=coordinates
```
