# Code Annotation Tool

A tool to annotate code for [code reading clubs](https://code-reading.org).

[Check it out](https://crc-annotations.netlify.app)

## Running

```shell
npm install
npm run dev
```

## Deploying

`npm run build` will build the site in `dist/`. It's currently deployed on
Netlify.

## Missing features

- Bug: Can't remove markers in Chromium !important
- Bug: Can't mark entire row
- Bug: lines are clipped when exporting to pdf
- Bug: no default background/text color (on Katja's computer, where she has a
  default gray backgorund color)
- Add more colors and allow custom color options
- Bug: zoom causes markers to drift from the text
- Handle arrows that span multiple viewports (i.e., scroll when drag is stalling
  near the top/bottom)
- Footer with link to github and a "try your own code" button
- Share links (needs hosting :((( )

### Lower priority

- Smooth arrows
- Optimize undo/redo (right now it duplicates state. it can be more efficient to
  save diffs. this should only be done if it proves to be a problem for actual
  people)
- Change the color of an existing marker
- Support dark mode
