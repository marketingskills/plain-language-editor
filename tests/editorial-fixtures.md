# Manual editorial regression examples

These examples cover judgment calls that **cannot** be safely checked with regular expressions. When changing `SKILL.md`, test each prompt in edit and detect-only modes. Every rewrite must preserve meaning, scope and voice.

| Input | Expected outcome | Risk to avoid |
| --- | --- | --- |
| "The bank used leverage to buy the factory." | Keep the financial term if correct. | Blanket prohibition on "leverage". |
| "What happens if the power fails? The battery takes over." | Keep the question when it helps readers follow a real answer. | Treating every question/answer as slop. |
| "The forecast shows 2.1 m waves tomorrow." | Keep the number, its units and its timing. | Replacing concrete figures with vague adjectives. |
| "A study of 53 customers found 11 wanted refunds." | Keep the sample and count; verify the source if absent. | Transforming a sample result into a universal claim. |
| "Our product is secure." | Ask what measurable protection is meant. | Inventing encryption, certification or access controls. |
| "I think it's too expensive, honestly." | Keep the candid uncertainty if it is the author's voice. | Flattening all informal language into corporate prose. |
| "The clinic lists an email address and has a separate booking portal." | Retain the distinction without inventing how the email is used. | Turning an unknown purpose into "general enquiries only". |
| "He left after the first vote" and later "He left before the vote". | Flag the conflict for the author; do not choose. | Silent fact edits to reconcile a contradiction. |
| One em dash used for emphasis. | Follow the existing no-em-dash house style in the rewrite. | Claiming the dash proves AI authorship. |
| Five identical one-sentence paragraphs. | Suggest grouping if they feel formulaic; preserve effective emphasis. | Blanket ban on short paragraphs. |
| A source marker attached to a numeric claim. | Flag the residue; verify that claim before removing the citation. | Dropping support for an assertion while polishing. |
| A draft with two unrelated points and no main message. | Report the missing spine before line-level polish. | Pretending surface pattern fixes repair structure. |

The CLI tests check only a conservative subset of the above. These manual examples are intentional acceptance criteria for the agent, not proof that all 120 patterns can be identified mechanically.
