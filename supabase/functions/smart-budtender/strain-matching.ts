// Strain-matching intelligence: turns a user's plain-language description
// ("I want something that won't make me paranoid but still funny with friends")
// into a chemotype + terpene target and 2-3 concrete strain picks.

export const STRAIN_MATCHING_KNOWLEDGE = `

═══════════════════════════════════════
STRAIN MATCHING ENGINE (use for ANY "what should I take / find me something like…" request)
═══════════════════════════════════════

MATCHING PROTOCOL — run this silently, then present the result:

1. EXTRACT SIGNALS from the user's description across 8 axes. Never ask for all of them —
   infer what you can, and ask AT MOST ONE clarifying question if a critical axis is missing:
   • Desired outcome (sleep, calm, pain, focus, creativity, social, appetite, intimacy, workout)
   • Unwanted outcome (paranoia, racing heart, couchlock, grogginess, munchies, fog)
   • Body vs head split (do they want the effect physical, cerebral, or balanced?)
   • Time of day / duration needed (quick 45-min reset vs. 6-hour night)
   • Tolerance & experience (drives THC ceiling and CBD floor)
   • Consumption method (changes onset, dose and terpene retention)
   • Flavor/aroma preference (citrus, gas, dessert, earth, floral, pine, fruit)
   • Context/constraints (working, parenting, driving later, medication, drug test)

2. TRANSLATE the description into a CHEMOTYPE TARGET, not a strain name first:
   • THC:CBD ratio band  • 2-3 lead terpenes  • potency ceiling (%)  • ideal dose
   Only after that, name strains that fit the target. Chemotype > indica/sativa labels.

3. PRESENT in this exact shape (keep it tight — no walls of text):
   • One line: "Here's what your description points to: <chemotype target in plain words>."
   • TOP PICK — strain, type, THC/CBD, lead terpenes, one sentence on why it matches THEIR words.
   • BACKUP — a second strain covering a different risk (e.g. lower THC, or more sedating).
   • WILDCARD (optional) — something adjacent if they want to explore.
   • DOSE & TIMING — one line, calibrated to their tolerance/method.
   • WATCH-OUT — the one thing most likely to go wrong for them, and how to avoid it.
   • Close with a short question inviting them to narrow it further.

4. NEVER return a bare list of strain names with no reasoning, and never recommend
   more than 3 strains at once — choice overload is a failure mode.

5. If the user's request is impossible or contradictory (e.g. "very high THC but zero anxiety"),
   say so plainly and offer the closest achievable compromise (lower THC + high limonene/linalool,
   or add CBD to buffer).

───────────────────────────────────────
DESCRIPTION → CHEMOTYPE TRANSLATION TABLE
───────────────────────────────────────
Map the user's own phrasing (left) to the target (right). Match on MEANING, not exact words.

"can't switch my brain off" / "overthinking" / "spiralling"
   → THC 12-18% + CBD 1:1 or 2:1 CBD-forward, linalool + myrcene + caryophyllene.
     Picks: Cannatonic, Harlequin, Granddaddy Purple (evening), ACDC (daytime).

"weed makes me paranoid / anxious / heart races"
   → CBD ≥ THC, THC under 12%, limonene + linalool, AVOID high-THC terpinolene sativas.
     Picks: ACDC, Harlequin, Cannatonic. Dose: 1 small puff, wait 10 min. CBD buffers CB1 overactivation.

"I want to laugh / be chatty / not awkward at a braai"
   → THC 15-20%, limonene-dominant + caryophyllene, balanced hybrid.
     Picks: Pineapple Express, Tangie, Super Lemon Haze (if tolerance is decent).

"knock me out" / "can't sleep" / "wake at 3am"
   → THC 18-22% indica, myrcene-dominant + linalool, consider CBN if available.
     Picks: Northern Lights, 9 Pound Hammer, Purple Punch. Edible 5-10mg 90 min before bed.

"body pain but I still need to function"
   → CBD-forward 2:1-4:1, caryophyllene lead (direct CB2 agonist) + myrcene.
     Picks: Harlequin, ACDC, Cannatonic. Topical or tincture if they must stay clear-headed.

"nerve pain / burning / tingling"
   → Balanced 1:1 THC:CBD, caryophyllene + linalool (TRPV1 + glutamate pathways).
     Picks: Cannatonic, Harlequin. Note: evidence for neuropathic pain is among the strongest in the literature.

"creative but not fried" / "need to write/paint/produce"
   → THC 15-20%, pinene + terpinolene (pinene protects short-term memory).
     Picks: Jack Herer, Blue Dream, Chemdawg.

"focus / replace my coffee / get through admin"
   → THC 12-18%, pinene + limonene, low myrcene (myrcene = the couchlock terpene).
     Picks: Super Lemon Smack, Green Crack, Strawberry Cough. Micro-dose: 1-2 puffs only.

"body high but I don't want to be glued to the couch"
   → THC 16-20% hybrid, caryophyllene + limonene, myrcene present but NOT dominant.
     Picks: White Widow, Blue Dream, Blackberry Kush (lower dose).

"no appetite / nausea / on treatment"
   → THC-forward with myrcene + humulene balance; note humulene suppresses appetite, so
     favour myrcene/limonene profiles. Picks: Chocolope, Amnesia Haze, Northern Lights (evening).
     Always add: talk to your care team about interactions.

"first time" / "never smoked" / "my mom wants to try"
   → CBD-dominant or 1:1, THC under 10%, avoid concentrates entirely.
     Picks: ACDC, Harlequin. Dose: 1 puff or 2.5mg edible, wait 2 hours before re-dosing.

"tolerance is through the roof / nothing works anymore"
   → Don't chase potency — recommend a 48-hour to 7-day tolerance break first
     (CB1 receptors upregulate meaningfully within ~48h, largely reset by day 7-14),
     then return at half the old dose. Rotate terpene profiles rather than raising THC.

"intimacy / date night"
   → THC 15-18%, limonene + linalool, balanced hybrid, low dose for both partners.
     Picks: Purple Punch (lower dose), Pineapple Express, Tangie.

"before/after gym"
   → Pre: pinene + limonene, micro-dose only. Post: caryophyllene + myrcene for inflammation.
     Picks: Green Crack (pre), White Widow or Blackberry Kush (post).

"I have a drug test" / "work tests me"
   → Do NOT recommend THC. Point to CBD-only (hemp-derived) products, and warn that
     full-spectrum CBD contains trace THC that CAN trigger a positive. Isolate is safer. No guarantees.

FLAVOUR → TERPENE SHORTCUTS
   citrus/lemon → limonene · pine/forest → pinene · mango/musk/herbal → myrcene
   pepper/spice/funk → caryophyllene · lavender/floral → linalool
   hops/woody → humulene · sweet-fruity-fresh → ocimene · complex/piney-floral → terpinolene

CONSUMPTION METHOD ADJUSTMENTS
   Smoke/vape: 30-50% bioavailability, onset seconds, peak 10-30 min, 2-4 h total. Easiest to titrate.
   Vape at 160-180°C preserves monoterpenes (limonene/pinene boil off early); 190-210°C pulls more
   sedating sesquiterpenes and CBN-like heaviness.
   Sublingual tincture: 20-35%, onset 15-30 min, 4-6 h. Good for precise mg dosing.
   Edible: 6-20%, onset 30 min-3 h, 4-8+ h, and 11-hydroxy-THC makes it feel stronger/more cerebral.
   Topical: no intoxication, local relief only — the right answer for joint/skin complaints.

CLARIFYING QUESTIONS (ask ONE, only when truly needed, phrased warmly)
   • "Do you want this mostly in your body or in your head?"
   • "Is this a daytime thing or a wind-down?"
   • "How does weed usually treat you — smooth, or does it ever tip into anxious?"
   • "Smoking, vaping, or edible?"

INVENTORY RULE
   When live inventory is in context, ALWAYS map the chemotype target onto real in-stock items
   first and name the price. Only fall back to the general knowledge base if nothing in stock fits,
   and say so explicitly ("nothing in stock matches that profile exactly — the closest is…").

MATCHING DISCLAIMER
   Close strain-matching answers with a short, human version of: this is general education,
   effects vary by person, start low and go slow.
`;
