# Plain Language Editor

```
npx skills add marketingskills/plain-language-editor
```

An open-source AI skill that turns **LLM-sounding content into plain, human, low-reading-age copy** that a smart teenager could follow on the first read. The benchmark is the way Richard Feynman explained hard ideas: the true thing, in the simplest words that still carry the full meaning.

It was built from one piece of real editorial feedback that kept recurring on AI drafts:

> *"It's really hard to follow. It looks entirely AI-generated, there are so many meta-comments, insubstantial claims, and odd formatting choices. I can't see the structure or the main points."*

This skill is built to fix exactly that.

## How it's different from a generic "humanizer"

A humanizer removes surface AI-tells: em dashes, words like "delve", the rule of three, curly quotes. Useful, but clean-of-tells writing can still be unreadable: vague, padded, meta, untrue, and twice as long as it needs to be.

This skill attacks *that* layer. It works on **comprehension, substance, truth, and length**, the things that actually make AI writing hard to follow and hard to trust.

## The seven moves

The skill edits in a fixed order, two document-level moves first, then five at the sentence level:

1. **Find the spine, then cut to it** — outline the one main point and the 3-5 points holding it up, in plain dot points, before touching a sentence. Assume the piece should be half or a quarter its current length.
2. **Kill every meta-comment** — notes to the reader, meta-headings that *describe* the content instead of *being* it ("The headline finding" → state the finding), and "the real question is" throat-clearing.
3. **Make every sentence have a clear who and a clear does-what** — demand a real subject and a true verb; no floating nouns or mismatched verbs.
4. **Define the jargon or delete it** — every undefined term of art gets pinned down in plain words or replaced.
5. **Read every sentence aloud and fix what doesn't parse** — catch sentences that have the shape of English but break when read; ask, don't guess, when meaning is unrecoverable.
6. **Audit every claim for truth and overclaim** — scale claims to what was actually done; name sources or drop them; make numbers say exactly what they count.
7. **Check the document doesn't contradict itself** — hold each claim in memory across the whole piece and surface every contradiction.

Plus a **plain-word swap table** (utilize → use, facilitate → help), **sentence-rhythm guidance** (~15-20 words, one idea per sentence, active voice), and a hard rule to **never use em dashes**.

## A second pass, after the seven moves

The seven moves run first and do the real work: comprehension, subject/verb clarity, jargon, truth, consistency. Once a draft passes those, the skill runs a second, lighter pass folded in from [no-ai-slop](https://github.com/petergyang/no-ai-slop) to catch the word choices and sentence tics that still read as machine-written:

- **A banned-word list** (delve, leverage, utilize, robust, paradigm shift, tapestry, and 20 more) plus often-empty adverbs and phrases to cut.
- **Named AI-slop patterns** to strip: binary contrasts, throat-clearing openers, faux-insight setups, colon reveals, superficial `-ing` analysis, importance puffery, weasel attribution, fake-strong verbs, synonym cycling, negative listing, dramatic fragmentation, robotic rhythm, rhetorical setups, fake-profound kickers, summary-recap endings, and formatting slop.
- **A voice guardrail** that runs alongside this pass: keep the minimum effective edit, and preserve vocabulary, cadence, bluntness, humor, and digressions that are genuinely the writer's, even where they bend a rule above.
- **Detect mode.** Ask the skill to audit a draft without rewriting it, and it names each pattern found, quotes the line, and gives a short fix.

## What's inside

| File | Purpose |
|------|---------|
| `SKILL.md` | The full skill: the seven moves, voice preservation, AI-slop patterns, word swaps, rhythm rules, process, output format, and a worked example |
| `LICENSE` | MIT |

## Output it gives you

For any text you feed it, the skill returns, in order:

1. **The spine** — the main point in one sentence, plus 3-5 dot points (or an honest "there's no spine yet").
2. **Length call** — current length vs. what it should be.
3. **The rewrite** — the plain-language version.
4. **Claims to check** — every statement it couldn't verify or that looked like an overclaim.
5. **Contradictions found** — anything the document said two incompatible ways.
6. **What it cut** — the meta-comments, padding, and sections removed, so nothing vanishes silently.

## How to use

This skill works with AI agent platforms (Claude Code, Codex, Gemini, Opencode, and others).

1. **Install** — copy the repo into your agent's skill directory, e.g. `~/.claude/skills/plain-language-editor/`.
2. **Invoke** — point it at the text you want fixed: *"Use the plain-language-editor skill on this draft."* In Claude Code you can run `/plain-language-editor`.
3. **Iterate** — review the spine and the claims-to-check list, answer its questions, and let it finalise.

It pairs well with a humanizer pass: run the humanizer for surface AI vocabulary and style tells, run this for whether the writing can actually be understood and trusted.

## License

MIT. Use freely, modify, redistribute. A community skill for the marketing skills ecosystem. Voice-preservation and AI-slop-pattern content adapted from [no-ai-slop](https://github.com/petergyang/no-ai-slop) by Peter Yang, also MIT.
