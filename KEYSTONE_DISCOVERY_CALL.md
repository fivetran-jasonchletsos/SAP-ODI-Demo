# Keystone discovery — question bank

Use before the demo. Structure follows Cohan's *Doing Discovery* — the
goal is to surface the prospect's specific situation, identify the
business outcome they're chasing, and confirm before showing anything.

## Step 1 — Situation (their world)

- "Walk me through how SAP fits in your stack today. Which modules,
  which release, what edition?"
- "Who currently builds and owns the analytical layer on top of SAP?
  Is that BW, Datasphere, a third-party warehouse, or some
  combination?"
- "What does the path from an SAP table to a BI dashboard look like
  today? How many systems does the data touch?"

## Step 2 — Aware of the policy?

- "Did your team see the SAP API policy change from earlier this year?"
- "If yes: what's been the internal reaction? Are you using ODP RFC
  anywhere in your current pipelines?"
- "If no: hand them the Taylor Brown article. Wait 60 seconds.
  Then ask: what does this change for your roadmap?"

## Step 3 — AI strategy (the real driver)

- "Where is your AI strategy today — pilot, production, board-level?"
- "What's the business outcome you're being measured on? Agent assist?
  Forecast accuracy? Anomaly detection? Workflow automation?"
- "Have any of your AI use cases needed SAP data so far? How did you
  get it?"

## Step 4 — Pain (Problem)

Listen for one of these — note which one and quote it back later:

- **Cost** — "Our SAP analytics stack is getting expensive."
- **Time-to-data** — "Every new dashboard is a six-week SAP project."
- **AI velocity** — "We can't ship our agents fast enough because the
  SAP data path is bottlenecked."
- **Lock-in fear** — "Every SAP commercial decision affects our entire
  data strategy."
- **Architectural conviction** — "We've already moved to open table
  formats elsewhere. SAP is the holdout."

## Step 5 — Confirm before demo

- "If I showed you a working example of an SAP source landing in your
  own Iceberg lake, with dbt building the marts, and an AI agent
  reading the lake directly — would that be a useful 10 minutes?"
- "What would you need to see in that example for it to be credible
  for your environment?"

If the answer to the first question is yes and the second question
gets specific feedback, you have permission to demo. If not, dig
deeper — they're not ready.

## Step 6 — After-demo close

- "What about that resonated?"
- "What would you want to validate in your own environment as a
  next step?"
- "Who else inside should see this before we set up a POC?"

## Anti-patterns to avoid

- Don't lead with Fivetran feature lists. Lead with their situation.
- Don't demo until they've described the problem in their own words.
- Don't promise specifics about their SAP edition until you've checked
  the support matrix. Capture the version in the call, follow up after.
- Don't compare prices. Compare optionality and time-to-AI.

## When to NOT demo

- They're not running SAP. (You're at the wrong meeting.)
- They've already committed to SAP Datasphere as the strategic stack.
  (Demo is unlikely to flip them; pivot to a coexistence story or
  exit gracefully.)
- They're in active negotiation with SAP on a renewal — wait until
  they're past the renewal cycle. The policy framing will land
  harder once the commercial pressure subsides.
