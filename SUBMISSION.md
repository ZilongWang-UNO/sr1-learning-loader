# SR1 Educational Loading Screen

Prototype: https://zilongwang-uno.github.io/learning-garden-loader/

Repository: https://github.com/ZilongWang-UNO/learning-garden-loader

## Design explanation

This prototype turns a simulated 20-second lesson-video delay into a narrated
STEM discovery. Instead of watching a spinner, students see a short,
three-part explanation supported by synchronized captions and an animated
illustration.

The interface borrows the familiar structure of pre-video content: a header
labels the current experience as a `Quick Discovery`, while a persistent
`Up next` bar shows the lesson title and loading status. When loading finishes,
the student chooses when to start the video.

The discovery is selected from a small knowledge library. Topics appear in a
random order without repeating until every topic has been shown, after which a
new cycle begins. The system is designed so more STEM topics can be added as
data without changing the loading flow.

The implementation uses semantic HTML, responsive CSS, inline SVG animation,
the browser Speech Synthesis API, and `localStorage`. It also includes captions,
keyboard focus states, a narration mute control, readable contrast, and
reduced-motion support. Mobile learners can request a landscape view, with a
full-screen rotate-device fallback on iPhone when browser restrictions prevent
automatic orientation changes.
