---
name: writing-for-humans
description: How to write technical prose that humans read quickly and clearly - feature summaries, design docs, status updates, release notes, PR descriptions. Load whenever producing a document intended specifically for humans.
---

# Writing for Humans

A human reader has limited time and attention and may disengage if bored or lost. Every choice you make serves one goal: **maximize the reader's comprehension in the shortest time possible.** This is the opposite of academic writing, where you build to a conclusion the reader is obligated to reach. Here, the reader owes you nothing - you earn each line of their attention.

This skill governs prose written *for people*: feature summaries, design docs, status updates, release notes, PR descriptions, announcements. For artifacts written for agents (AGENTS.md, skills, READMEs, task artifacts), load `authoring-context`.

---

## Lead With the Answer

State the conclusion first. The reader should grasp the point from the opening lines, before any supporting detail. A reader who reads only the first paragraph should still walk away knowing what matters.

- **Summary up top.** What is this, what changed, what should the reader do or know. Then the supporting detail, in descending order of importance.
- **Make the ask findable.** If the document drives a decision or action, the decision or action goes at the top - never buried at the end.
- **Front-load each section too.** The first sentence of a section is its thesis. The reader scanning headings and opening lines should be able to reconstruct the whole.

The failure this prevents: the reader wades through context, methodology, and caveats, hunting for the point - and gives up before finding it.

---

## Be Direct and Declarative

Say what is true. Take a position.

- **Declarative, not tentative.** "We will migrate to X". Not "we should probably consider migrating to X". If you have a recommendation, state it and say why. If you're presenting options, name the one you prefer.
- **Active voice.** The actor does the action: "The scheduler retries failed jobs". Not "Failed jobs are retried". Active voice is shorter, clearer, and names who is responsible.
- **Cut the hedging.** "may", "might", "tends to", "generally", "it's worth noting that" - these dilute. Use them only when uncertainy is real and relevant, not as a reflexive softener.

Tentative prose makes the reader do the work of figuring out what you actually mean. Directness is a gift to the reader, not arrogance.

---

## Evidence, Not Adjectives

Replace vague intensifiers with specifics.

- "73.4% of users (389 of 530) over the trailing seven days" - not "a lot of users".
- "Cut p99 latency from 800ms to 120ms" - not "significantly faster".
- "Three teams depend on this endpoint" - not "many teams".

Adverbs and adjectives like *significantly*, *substantially*, *many*, *very*, *quite* are placeholders for evidence you haven't supplied. When you reach for one, ask whether a number of concrete fact belongs there instead. If no number exists, the honest move is to say so, not to dress up the gap with an adverb.

---

## Write for a Broad Reader

Assume the reader is smart, but unfamiliar with this specific subject. Your job is to bring them up to speed, not to demonstrate expertise.

- **Define or avoid jargon.** Spell out an acronym on first use. If a term isn't necessary, drop it. Writing that only an expert can parse has failed at its job.
- **Plain words over impressive ones.** "use" not "utilize", "because" not "due to the fact that", "to" not "in order to". The goal is the reader's understanding, not the author's sophistication.
- **Explain the "why", not just the "what".** A reader who understands the reasoning can follow you into territory you didn't explicitly cover.

---

## Edit Ruthlessly

The first draft is too long. Editing is where the writing becomes good - it is not optional.

- **Cut what doesn't aid in understanding.** Detail the reader doesn't need, context that doesn't change the conclusion, the closing paragraph that restates what was already said. Cutting 30-50% of a first draft is normal.
- **Every word earns its place.** Compress fluff: "due to the fact that" -> "because"; "lacked the ability to" -> "could not"; "in the event that" -> "if"; "at this point in time" -> "now".
- **Real bullets, not buried paragraphs.** A bullet is a discrete, scannable point. If a bullet runs three sentences, it's a paragraph wearing a costume - either tighten it to a point or make it prose.
- **Weight by importance.** What matters most gets the most space and the best position. Resist giving every section equal length out of a sense of symmetry.
- **No em dashes.** Dead giveaway that something was written by AI. No em dashes allowed. Ever.

The test for any sentence: **if I deleted this, would the reader lose something they need?** If not, delete it.

---

## Structure for Scanning

Most readers scan before they read. Structure so the scan succeeds.

- **Headings that carry meaning.** A reader reading only the headings should understand the shape of the document.
- **One idea per section.** Don't spread a conclusion across three places. Keep related content together so the reader finds it once.
- **Visuals where they're faster than prose.** A table compares options better than paragraphs. A diagram shows a flow better than a description. A screenshot beats explaining a UI.
- **Match the format to the read.** A status update is scanned in thirty seconds; a design doc is read in ten minutes. Calibrate length and depth to how the reader will actually consume it.

---

## Calibration: Before and After

**Before (wordy, hedged, buries the point):**

> In order to address the various performance challenges that we have been experiencing with the current job processing system, we conducted an investigation into a number of potential approaches. After significant analysis, it became clear that there were several options worth considering. It is worth noting that the batching approach seemed to perform quite well in our testing, and we think it might be a good idea to potentially move forward with it, as it appears to offer meaningful improvements.

**After (leads with the answer, declarative, evidenced):**

> **Recommentation: switch job processing to batching.** It cut p99 latency from 800ms to 120ms in testing.
>
> We evaluated three approaches to the job-queue slowdowns. Batching won on every metric; the alternatives (sharding, priority queues) added complexity without matching the latency gain.

Same information. Half the words. The reader knows the answer in one line.
