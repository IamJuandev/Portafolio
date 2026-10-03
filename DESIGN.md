---
name: Juan Gabriel Alfonso Rojas — Portafolio
description: A professional profile issued as a validated pre-printed fiscal form.
colors:
  form: "#2340c8"
  form-deep: "#1a2f96"
  form-wash: "#e4e9f8"
  ink: "#111315"
  ink-soft: "#2b2f34"
  valid: "#0e7a4f"
  paper: "#f4f6f3"
  paper-hi: "#fbfcfa"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3rem, 7.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.2rem, 4.8vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 75"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.35rem, 2vw, 1.75rem)"
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 82"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.06em"
  data:
    fontFamily: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 3vw, 32px)"
  pad: "clamp(14px, 1.6vw, 22px)"
  sheet-max: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper-hi}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.form-deep}"
    textColor: "{colors.paper-hi}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.form}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  button-ghost-hover:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper-hi}"
  section-bar:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper-hi}"
    typography: "{typography.label}"
    padding: "9px clamp(16px, 3vw, 32px)"
  field-label:
    textColor: "{colors.form}"
    typography: "{typography.label}"
  field-value:
    textColor: "{colors.ink}"
  status:
    backgroundColor: "transparent"
    textColor: "{colors.form}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
  status-live:
    textColor: "{colors.valid}"
  chip-suggest:
    backgroundColor: "transparent"
    textColor: "{colors.form-deep}"
    rounded: "{rounded.none}"
    padding: "7px 10px"
  chip-suggest-hover:
    backgroundColor: "{colors.form-wash}"
  chat-input:
    backgroundColor: "{colors.paper-hi}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
---

# Design System: Juan Gabriel Alfonso Rojas — Portafolio

## Overview

**Creative North Star: "The Pre-Printed Fiscal Form"**

The profile is issued as a validated electronic document, the graphic representation of a Colombian factura electrónica. Two inks carry the whole system: everything the form prints in advance (labels, rules, field boxes, section bands, numbering) is form blue; everything filled in (his name, roles, facts, project names) is black. A single cool-white sheet sits on a full-bleed blue desk, and hierarchy comes from rule weight and field-box structure, not from tinted surfaces or gray steps.

Density is that of a real form: tightly ruled cells, small uppercase mono labels tucked into the top-left of each box, numbered casillas counting up through the whole sheet, numbered item lines, a project table with status cells, a totals strip, and a signature line. The one signal color is validation green, reserved for things that are actually live, and it arrives as a rubber stamp.

Motion is the act of filling in the form: on load the head's data clips in field by field, and when a live project scrolls into view its green stamp lands. Nothing else animates beyond small press and hover feedback.

**Key Characteristics:**
- Two inks (form blue for the printed form, black for filled data) plus one signal green.
- Square corners everywhere; structure from 0.5 / 1 / 2px blue rules.
- Every value lives in a field or box with a numbered mono label.
- Display in condensed Archivo, data and labels in tabular Azeret Mono.
- Signature motion: type-in fill on load, stamp landing on live states.

## Colors

A blue-ink form printed on cool white paper, filled in black, validated in green.

### Primary
- **Form Blue** (form): every pre-printed element — field and box labels, all rules and box borders, section bars, line and casilla numbers, the top bar, the desk behind the sheet, primary button fill, user chat bubbles, text selection and focus rings.
- **Deep Form Blue** (form-deep): hover state for primary actions, tech-stack line under the title, secondary links (certificate verify links, chat links), inline code text, scrollbar thumb.
- **Form Wash** (form-wash): the only tint; inline code background, suggestion-chip hover, disabled send button. Never a panel or card fill.

### Secondary
- **Validation Green** (valid): only on states that are genuinely live or validated — the `status-live` stamp and the live count in the totals strip.

### Neutral
- **Filled-in Ink** (ink): all filled data — names, titles, values, body copy; the chat launcher fill; the `-80 %` metric badge border and gate-node borders.
- **Soft Ink** (ink-soft): secondary filled data — lede, descriptions, project tech columns, struck-through "before" metrics, hash strings. A near-black ink, not a gray step.
- **Sheet** (paper): the document sheet, chat panel, diagram nodes.
- **Bright Paper** (paper-hi): text on blue, the QR plate, flow-diagram canvas, bot bubbles, chips, input field.

### Named Rules
**The Two Inks Rule.** Printed form = blue, filled-in data = black. If an element is something a form would pre-print, it is blue; if it is his information, it is ink. No mid-grays carry hierarchy.

**The One Signal Rule.** Green appears only where something is in production, online, or validated. It is never decorative, never a hover, never a link color.

## Typography

**Display Font:** Archivo variable (with Helvetica Neue, Arial), width axis 62–125%
**Body Font:** Archivo at normal width
**Label/Mono Font:** Azeret Mono (with ui-monospace, SFMono-Regular, Menlo)

**Character:** A sharp condensed grotesk fills the form by hand; a tabular mono is the form's own pre-printed voice and the machine voice of codes, numbers and dates.

### Hierarchy
- **Display** (800, clamp(3rem, 7.4vw, 6rem), 0.9, width 72%, uppercase): the issuer's name in the EMISOR box only.
- **Headline** (800, clamp(2.2rem, 4.8vw, 4rem), 0.95, width 75%): the closing call to contact. The hero title sits between (700, clamp(1.5rem, 2.6vw, 2.25rem), width 88%).
- **Title** (750, clamp(1.35rem, 2vw, 1.75rem), 1.05, width 82–85%): item-line heads, job titles, project names, certificate block head.
- **Body** (400, 16px / 15px in tables, 1.5–1.6): prose capped at 54–72ch.
- **Label** (500, 12px mono, 0.06em, uppercase): field and box labels, table heads, node keys. Section bars use 600 at 0.1em.
- **Data** (mono, tabular numerals): document numbers, dates, line numbers, hashes, metrics, edge labels.

### Named Rules
**The Mono Is Printed Rule.** Uppercase mono labels are the form's casillas and only ever sit attached to a field, box, bar or table head; they are never free-floating above a heading.

**The Condensed Fill Rule.** Display and title weights narrow the width axis (72–88%) as they grow; body copy stays at 100%.

## Layout

One sheet, max 1280px, centered on the blue desk with a clamp(24px, 4vw, 56px) bottom margin. Inside, spacing runs on two tokens: `gutter` (clamp(16px, 3vw, 32px)) between blocks and around the sheet's inner edge, `pad` (clamp(14px, 1.6vw, 22px)) inside cells. Each section is a full-width blue bar followed by a ruled block (1px top rule).

The document head is a four-cell meta strip, then an issuer row of three boxes (EMISOR, FOTOGRAFÍA, QR), then a three-cell ADQUIRENTE row attached under it. Item lines are a 56px number column plus head and detail cells; the project table is 56px number, main, tech, 150px state. The sheet closes with a five-cell totals strip and a signature line.

Breakpoints: at 1120px the photo box drops and job lists go single-column; at 960px the nav collapses to a menu, meta and buyer rows go two-up, item lines and table rows fold the number column into a row span and hide the tech column; at 680px everything stacks to one column, the QR sits beside its hint, table heads hide, flow lanes turn vertical, and the skills table becomes blocks. Scroll padding is 76px for the sticky bar.

## Elevation & Depth

The sheet is flat paper on a desk. Inside the sheet there is no elevation at all; depth is drawn with rules. Only things that physically sit above the page cast a soft ambient shadow.

### Shadow Vocabulary
- **Sheet on desk** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.16), 0 18px 40px -12px rgb(0 0 0 / 0.32)`): the document sheet only.
- **Floating panel** (`box-shadow: 0 24px 48px -16px rgb(0 0 0 / 0.3)`): the open chat panel.
- **Floating launcher** (`box-shadow: 0 10px 24px -8px rgb(0 0 0 / 0.3)`): the mobile chat button.

### Named Rules
**The Ruled Depth Rule.** Inside the sheet, separation is a rule, never a shadow: 0.5px between sibling cells, 1px for box and block edges, 2px for buttons, the totals strip, and the chat panel frame.

## Shapes

Every corner is square (0px). Form is built from ruled rectangles: boxes share borders (adjacent boxes drop the shared edge), cells divide with hairlines, item lines stack with no gap. Two non-rectangular marks are native to the world: the rotated validation stamp (-4deg, double ring via border plus offset outline) and the flow diagram's dashed 1px blue frame with drawn arrow edges. Bullets in item details are 8px blue dashes, not dots.

## Components

### Buttons
Printed-ink buttons, firm and square.
- **Shape:** square (0px), 2px border, 46px min height, 0 20px padding, Archivo 600 15px.
- **Primary:** form-blue fill, paper text; hover deepens fill and border to form-deep.
- **Ghost:** transparent with blue border and text; hover inverts to blue fill.
- **Press:** scale(0.97) over 160ms ease-out. Hover effects are gated to fine pointers.
- **Text link button:** blue underlined 14px with an arrow icon that nudges 3px on hover.

### Fields and Boxes
- **Field:** a cell with a 12px uppercase mono blue label above a black value; casilla numbers ("1. ", "2. "…) auto-increment across the whole sheet at 75% opacity.
- **Box:** a 1px-ruled container whose label is pinned absolutely to the top-left (8px down, `pad` in), content starting 30px down.

### Section Bar
A solid form-blue band with paper-colored 12px mono uppercase heading at 0.1em, spanning the sheet. It is the only section heading device.

### Item Lines
Identical numbered rows stacked as one ruled table: mono blue number cell, code plus condensed title, and a dash-bulleted detail list. They act as the page ruler; every work area uses the same line.

### Project Table and Status Stamp
- **Rows:** numbered, hairline-divided, mono blue head row, condensed title with soft-ink description.
- **Status:** mono 12px uppercase in a 1px blue frame for neutral states (En curso, Completado, Implementado).
- **Live stamp:** green text, 2px green border plus 1px outline offset 2px, rotated -4deg. Lands on scroll-in with a 420ms ease-out from rotate(-12deg) scale(1.45) and a slight blur; rests visible if the observer never fires.

### Flow Diagrams
Generic system diagrams on a bright-paper canvas inside a dashed blue frame. Nodes are ruled paper cells with a mono key and condensed label; the core node inverts to blue fill; gate nodes take a 2px ink border; stack nodes hold hairline chips. Edges are drawn 1.5px blue arrows with mono labels, turning vertical below 680px.

### Totals Strip
Five fields in a 2px-ruled strip at the foot of the sheet with 18px semibold values; the live count is the only green value.

### Navigation
Sticky blue top bar: square monogram mark with 1.5px frame, mono subtitle, paper-colored links with a 1.5px underline for current section, and a paper-outlined assistant button. Below 960px it becomes a 44px outlined menu toggle opening a blue drop panel.

### Chat Assistant
A paper panel framed by a 2px blue rule with a blue header band (mono uppercase title). Bot messages are ruled bright-paper cells, user messages blue blocks, pending replies a blinking mono caret. Suggestion chips are 1px-ruled form-deep text that wash on hover. The input is bright paper with a blue caret and inset focus ring; send is a solid blue square. The panel opens from bottom-right with opacity plus translate/scale over 200–220ms ease-out.

## Do's and Don'ts

### Do:
- **Do** print every label, rule, number and section band in form blue and every filled-in value in ink.
- **Do** put each piece of data in a field or box with a numbered mono label in its top-left.
- **Do** build hierarchy from rule weight (0.5 / 1 / 2px) and box structure.
- **Do** reserve validation green for live, online or validated states, delivered as the rotated stamp or the totals live count.
- **Do** use the shared item line for any list of comparable offerings, and the project table with a status cell for any list of work.
- **Do** animate with the form's own acts: clip-path fill-in (620ms, ease-in-out, 110ms stagger) and the stamp landing; disable both under reduced motion.
- **Do** narrow Archivo's width axis on large headings and set numbers in tabular mono.

### Don't:
- **Don't** round corners.
- **Don't** use green for decoration, links or hover.
- **Don't** introduce gray text or surface steps; secondary text is soft ink, the only tint is form wash.
- **Don't** add shadows inside the sheet; only the sheet and floating chat elements cast one.
- **Don't** place uppercase mono labels as kickers above headings outside a field, box, bar or table head.
- **Don't** show prices, client names or real client data in any field; diagrams stay generic.
