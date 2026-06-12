# Submission Explanation

## Links

- [Live prototype](https://zilongwang-uno.github.io/learning-garden-loader/)
- [GitHub repository](https://github.com/ZilongWang-UNO/learning-garden-loader)

## Concept

**Learning Garden Discovery** turns a 20-second wait into a short narrated STEM
story. The student does not need to complete a quiz or game. They can simply
watch one useful idea unfold, and the experience can end naturally as soon as
the lesson is ready.

## Design choices

- **Feels like school.** The interface resembles an open activity book with
  paper texture, classroom doodles, a teacher voice note, and hand-drawn
  educational diagrams.
- **Cute, not preschool.** Friendly characters and bright colors welcome
  younger students, while real STEM ideas and an editorial layout remain
  appropriate for older learners.
- **One idea at a time.** Each discovery uses three short sentences and one
  visual cause-and-effect model.
- **Dynamic content.** The same interface supports biology, programming, and
  math. `Show me another` swaps the title, narration, captions, illustration,
  animation, and takeaway.
- **The lesson stays primary.** There are no scores, rewards, or unfinished
  tasks. At 20 seconds the narration stops and the lesson-ready card appears.

## Accessibility

Narration is optional, and every spoken sentence is shown as a caption.
Controls use semantic buttons and visible focus states. Loading progress is
available to assistive technology, color is not the only state cue, the layout
is responsive, and reduced-motion preferences are respected.

## Technical implementation

The prototype uses one HTML file, one CSS file, and one JavaScript file. A small
array acts as the reviewed knowledge library. Simple functions render each SVG
diagram, synchronize three visual steps with the captions, use the Web Speech
API for narration, and finish the experience after 20 seconds. It has no
dependencies or build step.
