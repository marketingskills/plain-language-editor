# Plain Language Editor

> Part of [Marketing Skills](https://marketingskills.net/skills/plain-language-editor/) — open-source marketing operators for AI agents.

```
npx skills add marketingskills/plain-language-editor
```

An open-source AI skill that turns **LLM-sounding content into plain, human, low-reading-age copy** that a smart teenager could follow on the first read. The benchmark is the way Richard Feynman explained hard ideas: the true thing, in the simplest words that still carry the full meaning.

It was built from one piece of real editorial feedback that kept recurring on AI drafts:

> *"It's really hard to follow. It looks entirely AI-generated, there are so many meta-comments, insubstantial claims, and odd formatting choices. I can't see the structure or the main points."*

This skill is built to fix exactly that.

## How it's different from a generic "humanizer"

A humanizer removes surface AI-tells: em dashes, words like "delve", the rule of three, curly quotes. Useful, but clean-of-tells writing can still be unreadable: vague, padded, meta, untrue, and twice as long as it needs to be.

This skill attacks *that* layer. It works on **comprehension, substance, truth, and length**, the things that make AI writing hard to follow and hard to trust.

## The seven moves

The skill edits in a fixed order, two document-level moves first, then five at the sentence level:

1. **Find the spine, then cut to it**: outline the one main point and the 3-5 points holding it up, in plain dot points, before touching a sentence. Assume the piece should be half or a quarter its current length.
2. **Kill every meta-comment**: notes to the reader, meta-headings that *describe* the content instead of *being* it ("The headline finding" → state the finding), and "the real question is" throat-clearing.
3. **Make every sentence have a clear who and a clear does-what**: demand a real subject and a true verb; no floating nouns or mismatched verbs.
4. **Define the jargon or delete it**: every undefined term of art gets pinned down in plain words or replaced.
5. **Read every sentence aloud and fix what doesn't parse**: catch sentences that have the shape of English but break when read; ask, don't guess, when meaning is unrecoverable.
6. **Audit every claim for truth and overclaim**: scale claims to what was actually done; name sources or drop them; make numbers say exactly what they count.
7. **Check the document doesn't contradict itself**: hold each claim in memory across the whole piece and surface every contradiction.

Plus a **plain-word swap table** (utilize → use, facilitate → help), **sentence-rhythm guidance** (~15-20 words, one idea per sentence, active voice), and a hard rule to **never use em dashes**.

## A second pass: systematic, not mechanical

After the seven moves, the editor audits against **120 named patterns in nine categories**, adapted from [FeedHive's MIT-licensed AI Slop Detector](https://github.com/FeedHive/ai-slop-detector). Patterns have stable IDs, a description and concrete before/after guidance. The full catalogue is data in [patterns/ai-slop.json](patterns/ai-slop.json); the readable [pattern reference](references/ai-slop-patterns.md) is generated from that source.

The second pass catches chatbot residue, stock phrases, artificial rhythm, LinkedIn formulas, formatting habits and unsupported claims. But it is **not an AI-authorship detector**. An isolated metaphor or rhetorical question is often good writing. The editor prioritises repeated problems and protects the writer's voice and factual precision.

There are two distinct ways to use it:

- **Edit (default):** perform the seven moves first, then improve distracting patterns, return the rewrite and flag any factual uncertainties.
- **Detect only:** quote exact offending text with pattern IDs, distinguish clear defects from contextual suggestions, and explain fixes without rewriting or assigning a score.

### Optional command-line preflight

The dependency-free Node.js checker finds only a conservative subset of patterns that can be matched safely. It is **not** a replacement for the full 120-pattern editorial audit.

```sh
node scripts/audit.mjs draft.md
node scripts/audit.mjs draft.md --json
cat draft.md | node scripts/audit.mjs --stdin
```

This reports exact line numbers, excerpts, pattern IDs and clusters of multiple findings in one paragraph. It never estimates whether AI wrote the text.

### Maintaining the catalogue

```sh
node scripts/build-references.mjs
node scripts/build-references.mjs --check
node --test
```

The generator validates the source data (unique IDs, valid categories and examples). CI checks the generated reference and runs regression tests, including false-positive examples. Source attribution, pinned upstream commit and license live in [patterns/SOURCE.md](patterns/SOURCE.md).

## What's inside

| File | Purpose |
|------|---------|
| `SKILL.md` | The seven editorial moves, voice protection, when to consult the full reference, edit/detect modes and examples |
| `patterns/ai-slop.json` | FeedHive's structured, attributed 120-pattern source |
| `references/ai-slop-patterns.md` | Generated complete editorial checklist |
| `scripts/build-references.mjs` | Schema validation and reproducible reference generation |
| `scripts/audit.mjs` | Optional conservative line-level preflight with JSON output |
| `tests/` and `.github/workflows/quality.yml` | Node regression tests and CI |
| `LICENSE`, `third_party/FeedHive-LICENSE` | Project and upstream MIT license notices |

## Output it gives you

For any text you feed it, the skill returns, in order:

1. **The spine**: the main point in one sentence, plus 3-5 dot points (or an honest "there's no spine yet").
2. **Length call**: current length vs. what it should be.
3. **The rewrite**: the plain-language version.
4. **Claims to check**: every statement it couldn't verify or that looked like an overclaim.
5. **Contradictions found**: anything the document said two incompatible ways.
6. **What it cut**: the meta-comments, padding, and sections removed, so nothing vanishes silently.

## How to use

This skill works with AI agent platforms (Claude Code, Codex, Gemini, Opencode, and others).

1. **Install**: copy the repo into your agent's skill directory, e.g. `~/.claude/skills/plain-language-editor/`.
2. **Invoke**: point it at the text you want fixed: *"Use the plain-language-editor skill on this draft."* In Claude Code you can run `/plain-language-editor`.
3. **Iterate**: review the spine and the claims-to-check list, answer its questions, and let it finalise.

It pairs well with a humanizer pass: run the humanizer for surface AI vocabulary and style tells, run this for whether the writing can actually be understood and trusted.

## License

MIT. Use freely, modify, redistribute. A community skill for the marketing skills ecosystem. Existing voice-preservation guidance drew from [no-ai-slop](https://github.com/petergyang/no-ai-slop) by Peter Yang (MIT). The new 120-pattern catalogue comes from [FeedHive/ai-slop-detector](https://github.com/FeedHive/ai-slop-detector) (MIT); see [its license and provenance](patterns/SOURCE.md).
