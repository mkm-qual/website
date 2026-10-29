# Website: Connect with Adam — Meeting Synthesis

**Date:** 19 October 2026 · 38 min
**Attendees:** Mahesh Marath (design / website), Adam Walker (sales, ANZ)
**Purpose:** Understand how sales pitches Qualitia today so the website redesign reflects real buyer conversations.

> Transcript note: the auto-transcript misspells Qualitia many ways ("Kalisha", "Polisha", "Coalition", "Felicia", "Alicia", "Kaul"), and "Zero" is Xero. Some colleague names (Rahul/Ritesh, Vrushank, Southworth, Amin, Bhushan) may also be mis-transcribed — confirm before quoting.

---

## TL;DR

1. **The website brings in zero leads today.** Pipeline is entirely outreach, events, network and partners. There's no traffic analytics and no inbound lead routing by region.
2. **Buyers research on their own first.** Per Adam's reading (Challenger Sale authors' newer book), ~75% of B2B IT buyers want to self-serve via search/AI before talking to a person. The site has to do the problem-framing a seller would.
3. **The core pitch:** *you've invested in Salesforce; protect that investment with faster, but above all more accurate, releases and human-level trust in agentic delivery.* Accuracy beats speed.
4. **Messaging has to cover a "pain chain" of personas.** Test leads influence but don't buy. Quality/engineering heads, CoE leads, delivery/transformation heads and CIOs own the "why change, why now".
5. **There are three customer maturity segments.** Current site content only speaks to the first (Traditional).
6. **Under-used differentiators that belong on the site:** metadata-driven self-heal, **no execution-based pricing**, and flexible run-as-user/permission-set execution.
7. **Adam has built an ROI calculator** (not yet validated). Mahesh wants to bring it onto the site behind a "Calculate yours" CTA.

---

## Key insights

### Lead sources & website gap
- Sources: **outreach, events, network, partners**. Adam knows of no lead that came through the website.
- No visitor statistics, so no way to follow up on anonymous interest.
- **Regional routing is missing:** the current site doesn't direct inbound leads to the right region. Mahesh's new contact/booking flow is region- and time-zone-aware (WIP; offers fixed slots, can't read rep calendars. Adam is fine with that).
- US coverage: **Amin** (Pune, US sales lead) and **Bhushan** (Deloitte partnership, US). Adam covers Australia.

### The pitch (Adam's words, condensed)
> You've invested in Salesforce. Change is accelerating and users expect innovation, but what's holding you back is the *safety* of agentic delivery: the trust that a human has checked it before it goes live. That doesn't scale at today's pace. Without that safety layer, Salesforce adoption and value drop, and the business stops trusting further investment.

- In two words: **faster + more accurate releases**, with **accuracy first** ("you stand to lose more than you gain by being fast if you're defective").
- Sales approach follows *The Challenger Sale*: share what you see in the market → reframe the problem → show the cost of inaction → best practices → *then* Qualitia.
- Reps must contextualise by **industry** (Salesforce industry clouds look and behave differently) and by the prospect's **specific problem**.

### Personas (buyer vs influencer)
| Persona | Role in deal | What they care about |
|---|---|---|
| Test team leads | **Influencer / quasi-ambassador**, not buyer | Their day-to-day pain; often "don't waste my time" after past tool pain |
| Head of Engineering Quality | Owns quality, owns "why change" | Risk, change |
| Platform leads / CoE leaders | Decision influence | Scale, standards |
| Heads of Service Delivery & Transformation | Sponsor-level | Delivery speed, transformation outcomes |
| CIO / paying sponsor | **Buyer** | ROI, protecting Salesforce investment |

Engineering head and test management are **separate personas** and need separate messaging. Adam will share a SPIN-style **pain chain** mapping each level's pain and personal impact.

### Customer maturity segments
| Segment | Who (ANZ) | Best Qualitia fit |
|---|---|---|
| **Traditional:** little/no AI, risk-averse, often manual | Banks (partly), **government (fully)** | Regression, integration, end-to-end testing |
| **AI-augmented:** some AI (Claude-generated journeys/scripts), not end-to-end; regression solved | Banks moving here | **Progression** (forward-looking, new-feature) testing |
| **AI-native / digital native:** fully agentic delivery (e.g. Xero) | Telco & high-tech (in-house Playwright, aiming for full AI in 6–12 months) | Tip-of-the-spear; less value today, needs a distinct sales journey |

- **The current site only addresses Traditional.**
- Mahesh will likely **not** use "AI-augmented / AI-native" labels on the site (terms came from the head of programme architecture, ANZ PS), but wants language that lets those buyers recognise themselves.
- Test types to reflect: component, smoke, progression, integration, regression, UAT. Mature customers "shift left" into smoke/component, which Qualitia supports (especially with MCP tooling), catching defects earlier.

### What hooks customers in first meetings
- **A deterministic source of truth** built from org metadata, instead of brittle scripts or locator-based tools.
- **Frees the key person:** the dev who gets pulled in every time a script breaks.
- **Headcount efficiency**, e.g. 20 testers down to 4–5 (~60% resource cost cut).
- Value levers: **build-effort reduction, maintenance reduction, execution-time savings**.

### Differentiators to promote (from Adam's value deck)
1. **Self-heal from the org's metadata** (move to the top of the list). Most tools decay the day after go-live because maintenance becomes its own process. Qualitia is single-click heal with impact analysis.
2. **No execution-based pricing.** Paid competitors (Tosca/Tricentis, Provar, etc.) charge as execution scales; Qualitia charges for authoring only. Also relevant against "just throw it at Claude", since token costs scale too. **Not on the website today; Adam says 100% worth stating.**
3. **Flexible run-as execution:** any user, user group or permission set. Competitors need extra scripting and tech debt, so teams test permissions crudely. A sleeper point that matters a lot to some customers.

### Coverage vs risk by vertical
- **Banking:** risk.
- **Telco:** coverage and cost (operational recovery).

### ROI calculator (Adam's prototype)
- Inputs: number of testers, salary (e.g. A$120K), % time spent testing, current regression cycle length (often 5–10 days), expected reduction. Agentic model: tests in suite (e.g. 3,000), releases/year (e.g. 26), runs per release.
- Output: net annual benefit plus combined total ROI. Good for a CIO modelling scenarios.
- **Not yet validated** by product/engineering. Adam did only a rudimentary check. Rahul (or Ritesh, the transcript is unclear) liked it but hasn't reviewed the numbers.
- Mahesh's idea: **"Calculate yours" CTA** from the sprint-savings section, plus exporting to slides so champions can reuse it internally.

### Feedback on Mahesh's website draft
- "**Miles better** than what we've got"; gets better further down the page. Liked the sprint-savings section and click-to-reveal interactions.
- **Mascot:** Adam would move away from it. Mahesh says if kept, restyle it (dev/streetwear look, not scout/scholar outfit).
- **Hero/visual section is still WIP:** hard to find an image that grabs attention. Adam suggests **motion**, and will send a **Higgsfield** graphics workflow.
- ServiceNow section not ready yet.
- Adam has seen product redesign hints (selectable Salesforce + ServiceNow object palette) in a video from Sattam and liked them.

---

## Action items

| # | Owner | Action | Status |
|---|---|---|---|
| 1 | **Adam** | Send the persona **pain chain** / messaging docs (pain and personal impact per level) | Open |
| 2 | **Adam** | Share the **Salesforce testing explainer** (maturity segments, test types, Playwright vs Qualitia by test phase) with his release notes/caveats | Shared during call; confirm received |
| 3 | **Adam** | Share the **ROI calculator** (Claude invite as editor) | Sent during call; confirm email link works |
| 4 | **Adam** | Message Mahesh the **Higgsfield** motion-graphics workflow | Open |
| 5 | **Adam** | Read the two sales books and pass on relevant takeaways | Open |
| 6 | **Mahesh** | Rework messaging to speak to **each persona** (influencer vs buyer) and to **AI-augmented / AI-native** buyers without using those labels | Open |
| 7 | **Mahesh** | Add the **pitch narrative**: Salesforce investment protection, accuracy over speed, trust in agentic delivery | Open |
| 8 | **Mahesh** | Add differentiators: **metadata self-heal (lead)**, **no execution-cost pricing**, **run-as user/permission-set flexibility** | Open |
| 9 | **Mahesh** | Introduce **progression testing** and shift-left (smoke/component) language alongside regression/integration | Open |
| 10 | **Mahesh** | Plan an **ROI calculator** on the site with a "Calculate yours" CTA (and slide export). Blocked on validation (see #11) | Open |
| 11 | **Mahesh → Product/Eng** | Get the ROI calculator's assumptions and numbers **validated** before publishing | Open |
| 12 | **Mahesh** | Finish the **region-aware contact/booking flow**, get approvals, launch | WIP |
| 13 | **Mahesh** | Decide the **mascot**: retire it or restyle it | Open |
| 14 | **Mahesh** | Explore **motion** for the hero/visual section | Open |
| 15 | **Mahesh / Marketing** | Set up **website analytics** so visits can be tracked and followed up | Open (gap raised by Adam, no owner assigned) |
| 16 | **Mahesh** | Show Adam the product design changes when ready; keep him updated on site progress | Ongoing |

## Open questions
- Who owns website analytics and traffic generation (SEO/syndication)? Adam flagged this as the root cause of zero inbound leads.
- How much of the ROI model's numbers can be stated publicly vs used only in sales conversations?
- Should the site have distinct paths per maturity segment or vertical (banking, government, telco)?
