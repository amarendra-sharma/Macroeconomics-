/* ============================================================================
   ma-generators-g.js  —  WRITTEN (free-response) items, chapters 10–18.

   Part two of the written bank; see ma-generators-f.js for the design notes on
   how these are graded (kind:"short" routes to ma-ai-grade, which marks against
   the RUBRIC and refuses any item whose rubric is under 40 characters).

   Safari-safe: var, function declarations, string concatenation only.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register) {
    throw new Error("ma-generators-g.js: load ma-generators.js first");
  }

  var W = [

  /* ===================== CHAPTER 10 ===================== */
  { id: "ch10_w_saving_identity", chapter: 10, difficulty: "med", points: 5,
    concept: "national saving identity",
    prompt: "“The government deficit is financed by borrowing from abroad, so it does not " +
      "reduce domestic investment.” In 5–8 sentences, use the national saving identity " +
      "to evaluate this claim for a closed economy and then for an open one.",
    rubric: "5 marks total. 1 mark: states the closed-economy identity S = I, with national " +
      "saving the sum of private and public saving. 1 mark: shows that in a closed economy a " +
      "larger deficit reduces public saving, hence national saving, hence investment one for one " +
      "unless private saving rises. 1 mark: states the open-economy identity S − I = NX, or " +
      "equivalently that the deficit can be financed by foreign capital inflow. 1 mark: concedes " +
      "that the claim has partial validity in an open economy — inflows do cushion domestic " +
      "investment. 1 mark: identifies the cost that remains — the capital inflow appreciates " +
      "the currency and reduces net exports, and the borrowing must be serviced out of future " +
      "output, so the burden is shifted rather than avoided.",
    modelAnswer: "In a closed economy the identity is S = I, where national saving is private " +
      "saving plus public saving. A larger deficit is negative public saving, so unless households " +
      "offset it by saving more, national saving falls and investment falls with it — the " +
      "claim is simply false there, and this is the crowding-out channel. Opening the economy " +
      "changes the arithmetic: the identity becomes S − I = NX, so domestic investment can " +
      "exceed domestic saving if foreigners supply the difference. To that extent the claim has " +
      "force; capital inflows genuinely do cushion investment, which is why large deficits in the " +
      "United States have coexisted with substantial investment. But nothing is free. The inflow " +
      "requires foreigners to acquire domestic assets, which raises demand for the currency, " +
      "appreciates the real exchange rate and reduces net exports — so the crowding out lands " +
      "on the tradable sector instead of on investment. And the borrowing is a claim on future " +
      "output: the interest is paid abroad out of future national income. The deficit's cost is " +
      "relocated, not eliminated." },

  { id: "ch10_w_hard_crowding_conditions", chapter: 10, difficulty: "hard", points: 6,
    concept: "when crowding out binds",
    prompt: "Two economists agree on the mechanics of crowding out but disagree sharply about " +
      "whether a stimulus package in a deep recession will crowd out private investment. In " +
      "6–10 sentences, set out the conditions under which crowding out is severe and those " +
      "under which it is minimal, and explain what the disagreement really turns on.",
    rubric: "6 marks total. 1 mark: states the mechanism — government borrowing raises demand " +
      "for loanable funds and the real interest rate, deterring interest-sensitive private " +
      "spending. 1 mark: severe case — at or near full employment, where resources are " +
      "already fully used, so public spending must displace private. 1 mark: minimal case — " +
      "deep recession with idle resources and spare capacity, where output can rise without " +
      "bidding resources away. 1 mark: identifies the monetary policy regime as decisive — at " +
      "the zero lower bound the central bank is not raising rates, so the interest-rate channel is " +
      "largely absent. 1 mark: notes the open-economy channel — inflows moderate the rate " +
      "rise but appreciate the currency and crowd out net exports instead. 1 mark: identifies what " +
      "the disagreement actually turns on — an empirical judgment about how much slack exists " +
      "and how the central bank will respond, not a theoretical dispute. The final mark requires " +
      "that framing explicitly.",
    modelAnswer: "The mechanism is not in dispute: deficit financing adds the government to the " +
      "demand for loanable funds, pushing up the real interest rate and deterring investment and " +
      "housing. What varies is how much of that happens. Crowding out is severe near full " +
      "employment, because the economy's resources are already in use and anything the government " +
      "buys must be bid away from a private buyer; the interest rate rise is then the mechanism " +
      "by which that reallocation occurs. It is minimal in a deep recession with idle capacity and " +
      "unemployed workers, because output can expand to meet the new demand without displacing " +
      "anything. The monetary regime is usually decisive. If the central bank is holding rates at " +
      "the effective lower bound and has committed to keeping them there, the interest-rate " +
      "channel barely operates and the multiplier is correspondingly large; if the bank is " +
      "targeting inflation and will raise rates in response to fiscal expansion, it will offset " +
      "much of the stimulus deliberately. In an open economy there is a further channel: capital " +
      "inflows moderate the rate rise but appreciate the currency, so crowding out appears in net " +
      "exports rather than investment. The disagreement between the two economists is therefore " +
      "not theoretical at all. It is an empirical judgment about how much slack the economy " +
      "actually has and how the central bank will react — which is why estimates of the " +
      "fiscal multiplier range from well below one to above two depending on the episode studied." },

  { id: "ch10_w_interest_rate_signal", chapter: 10, difficulty: "easy", points: 4,
    concept: "the real interest rate as a price",
    prompt: "In 4–6 sentences, explain what the real interest rate is the price OF, who " +
      "supplies and who demands in the loanable funds market, and what happens in that market when " +
      "households become more pessimistic about the future and save more.",
    rubric: "4 marks total. 1 mark: identifies the real interest rate as the price of borrowing, " +
      "or equivalently the return to saving — the price that allocates funds between present " +
      "and future use. 1 mark: identifies savers as the suppliers of loanable funds. 1 mark: " +
      "identifies borrowers, principally firms financing investment and governments financing " +
      "deficits, as the demanders. 1 mark: works out the comparative static — more saving " +
      "shifts supply right, lowering the real interest rate and raising the equilibrium quantity " +
      "of investment.",
    modelAnswer: "The real interest rate is the price of borrowing, and equivalently the reward " +
      "for saving — it is what allocates resources between consumption now and consumption " +
      "later. The supply of loanable funds comes from savers: households putting money aside, plus " +
      "public saving when the government runs a surplus. The demand comes from borrowers, chiefly " +
      "firms financing new plant and equipment and governments financing deficits. If households " +
      "turn pessimistic and save more at every interest rate, the supply curve shifts right. The " +
      "equilibrium real interest rate falls and the quantity of funds borrowed and invested rises " +
      "— which is the market doing exactly what it is supposed to do, converting the extra " +
      "saving into extra investment, though the fall in consumption that produced the extra saving " +
      "may itself weaken demand in the short run." },

  { id: "ch10_w_financial_intermediation", chapter: 10, difficulty: "med", points: 4,
    concept: "the role of financial intermediaries",
    prompt: "In 4–7 sentences, explain the specific economic problems a bank solves that a " +
      "saver lending directly to a borrower would struggle with, and explain why this makes banks " +
      "structurally fragile.",
    rubric: "4 marks total. 2 marks for any two of: screening and monitoring borrowers at scale " +
      "(overcoming asymmetric information); diversification of risk across many loans; maturity " +
      "transformation — turning short-term deposits into long-term loans; liquidity provision " +
      "— depositors can withdraw on demand while the loans cannot be called. 1 mark: " +
      "identifies maturity transformation specifically as the source of fragility. 1 mark: explains " +
      "the run mechanism — because assets are illiquid and liabilities are payable on demand, " +
      "a belief that others will withdraw makes withdrawal rational, so a solvent bank can fail on " +
      "expectations alone.",
    modelAnswer: "A bank solves problems an individual saver cannot. It screens and monitors " +
      "borrowers at a scale that makes the information worth gathering, which an individual " +
      "lending to one firm could never justify. It pools many loans, so a saver bears the average " +
      "risk rather than the fate of a single borrower. And it performs maturity transformation: " +
      "depositors want their money available at any moment, while firms want to borrow for years, " +
      "and the bank bridges that mismatch. That last service is also the source of the fragility. " +
      "The bank's liabilities are payable on demand while its assets cannot be liquidated quickly " +
      "without large losses, so if enough depositors try to withdraw at once the bank cannot pay " +
      "even when every loan it holds is sound. Because each depositor's best move depends on what " +
      "the others do, the belief that a run is coming makes running rational — a " +
      "self-fulfilling equilibrium, and the reason deposit insurance and a lender of last resort " +
      "exist." },

  /* ===================== CHAPTER 11 ===================== */
  { id: "ch11_w_money_functions", chapter: 11, difficulty: "easy", points: 4,
    concept: "the functions of money",
    prompt: "In 4–7 sentences, explain the three functions of money, and explain which of the " +
      "three fails first during a hyperinflation and what people do in response.",
    rubric: "4 marks total. 1 mark: medium of exchange — accepted in trade, which removes the " +
      "need for a double coincidence of wants. 1 mark: unit of account — the yardstick in " +
      "which prices and contracts are quoted. 1 mark: store of value — purchasing power " +
      "carried into the future. 1 mark: identifies store of value as the first to fail under " +
      "hyperinflation, and describes the response — people spend immediately, hold foreign " +
      "currency or goods, and eventually price in a foreign unit, so the unit-of-account function " +
      "goes next. Credit the ordering specifically; a list of three functions alone earns 3.",
    modelAnswer: "Money works as a medium of exchange, meaning it is accepted in trade so no one " +
      "needs to find a partner who both has what they want and wants what they have. It works as " +
      "a unit of account, the common yardstick in which prices, wages and debts are quoted. And it " +
      "works as a store of value, carrying purchasing power from today into the future. Under " +
      "hyperinflation the store-of-value function collapses first and fastest, because money loses " +
      "value by the hour. People respond by spending wages the moment they receive them, holding " +
      "dollars or goods instead, and shortening every contract. The unit-of-account function fails " +
      "next, as shops begin quoting prices in a stable foreign currency even while still accepting " +
      "local notes — and once that happens the currency is usually finished, because the " +
      "medium-of-exchange function is the last thin thread holding it up." },

  { id: "ch11_w_hard_money_creation", chapter: 11, difficulty: "hard", points: 6,
    concept: "money creation and its limits",
    prompt: "Central banks expanded the monetary base enormously after 2008, yet inflation stayed " +
      "low for years. In 6–10 sentences, explain why the simple money multiplier failed to " +
      "predict this, and explain what actually determines the broad money supply.",
    rubric: "6 marks total. 1 mark: states the textbook multiplier — broad money is a " +
      "multiple of base money determined by the reserve ratio. 1 mark: identifies the first " +
      "failure — banks held the new reserves as EXCESS reserves rather than lending them out, " +
      "so the multiplier collapsed. 1 mark: explains why — weak loan demand, damaged bank " +
      "balance sheets, tighter regulatory capital requirements, and interest paid on reserves " +
      "making holding them attractive. 1 mark: states the deeper correction — lending is " +
      "constrained by capital and by creditworthy demand, not by reserves, so causation runs from " +
      "lending to deposits rather than from reserves to lending. 1 mark: connects to the quantity " +
      "equation — velocity fell sharply, offsetting the rise in M. 1 mark: draws the " +
      "appropriate conclusion — the multiplier is a description of a ratio, not a mechanism, " +
      "and treating it as causal produced a decade of wrong inflation forecasts.",
    modelAnswer: "The textbook story says broad money is base money times a multiplier set by the " +
      "reserve ratio, so a tenfold rise in the base should produce a proportionate rise in money " +
      "and, through the quantity equation, in prices. What happened instead is that banks simply " +
      "held the new reserves. Excess reserves ballooned because loan demand was weak, bank balance " +
      "sheets were impaired, new regulatory capital requirements bound, and the central bank was " +
      "paying interest on reserves, which made holding them a perfectly reasonable asset choice. " +
      "The multiplier is a ratio computed after the fact, not a mechanism, and when the behaviour " +
      "underlying it changes the ratio changes. The deeper correction is about causation: in a " +
      "modern system banks do not lend out reserves, they create deposits when they lend, and " +
      "their constraint is capital and the availability of creditworthy borrowers rather than " +
      "reserves. Reserves follow lending rather than driving it. In quantity-equation terms, M " +
      "rose but V fell roughly as much, so PY was little affected. The episode is a good lesson in " +
      "the difference between an accounting identity and a causal model — the identity held " +
      "throughout, and the forecasts built on treating it as a mechanism were wrong for the better " +
      "part of a decade." },

  { id: "ch11_w_central_bank_tools", chapter: 11, difficulty: "med", points: 5,
    concept: "monetary policy instruments",
    prompt: "In 5–8 sentences, explain how an open market purchase of government bonds is " +
      "supposed to affect the economy, tracing the chain from the purchase through to output, and " +
      "identify the two links in that chain most likely to break.",
    rubric: "5 marks total. 1 mark: the purchase pays for bonds with newly created reserves, " +
      "raising the monetary base and bank reserves. 1 mark: increased reserves push the policy " +
      "interest rate down. 1 mark: lower rates stimulate interest-sensitive spending — " +
      "investment, housing, consumer durables — and depreciate the currency, raising net " +
      "exports. 1 mark: aggregate demand rises, raising output in the short run. 2 marks are " +
      "available for the final element but capped at 1 for this item: identifies a plausible " +
      "broken link, such as the zero lower bound preventing further rate falls, or weak investment " +
      "response when firms face weak demand or impaired balance sheets.",
    modelAnswer: "The central bank buys government bonds from banks and pays by crediting their " +
      "reserve accounts with money it creates, so the monetary base and bank reserves rise. With " +
      "more reserves in the system, the rate at which banks lend to each other falls, and the " +
      "central bank's policy rate is achieved. Lower short-term rates feed into borrowing costs " +
      "across the economy, which stimulates the interest-sensitive components of spending — " +
      "business investment, housing, car purchases — and tends to depreciate the currency, " +
      "which raises net exports. Aggregate demand rises and, with prices sticky in the short run, " +
      "so does output. Two links are fragile. The first is the rate link: once the policy rate is " +
      "already at zero, buying more bonds cannot lower it further, which is why quantitative " +
      "easing had to work through longer-term yields and expectations instead. The second is the " +
      "spending link: if firms are not investing because they expect weak demand, or because their " +
      "balance sheets are impaired, cheaper credit does not produce more investment — the " +
      "cost of funds was not the binding constraint." },

  { id: "ch11_w_independence", chapter: 11, difficulty: "med", points: 5,
    concept: "central bank independence",
    prompt: "In 5–8 sentences, set out the argument for central bank independence, then give " +
      "the strongest argument against it, and state the condition on which your own view would " +
      "turn.",
    rubric: "5 marks total. 1 mark: states the time-inconsistency problem — a government has " +
      "a standing incentive to generate surprise inflation for short-run output or to erode debt. " +
      "1 mark: explains that anticipation of this raises inflation expectations, delivering higher " +
      "inflation with no output gain, so the ability to commit is itself valuable. 1 mark: cites " +
      "the empirical association between independence and lower average inflation without a growth " +
      "penalty. 1 mark: gives a genuine counter-argument — democratic accountability for " +
      "decisions with large distributional effects, or the fact that post-2008 central banks took " +
      "quasi-fiscal actions that were never put to voters. 1 mark: names a condition that would " +
      "settle it — for example whether the mandate is narrow enough to be technical, or how " +
      "credible the fiscal authority's own commitment is. Full marks require a genuine " +
      "counter-argument, not a token one.",
    modelAnswer: "The case rests on time inconsistency. A government always has a short-run " +
      "incentive to generate unexpected inflation — it raises output temporarily and erodes " +
      "the real value of nominal debt — but because the public anticipates this, expectations " +
      "adjust and the economy ends up with higher inflation and no lasting output gain. Delegating " +
      "to an institution that will not exercise the temptation is a commitment device, and the " +
      "cross-country evidence associates independence with lower average inflation and no " +
      "measurable cost in growth. The strongest objection is democratic rather than technical. " +
      "Monetary policy has large distributional consequences — between debtors and creditors, " +
      "asset-holders and wage-earners — and after 2008 central banks moved into asset " +
      "purchases and credit allocation that look quasi-fiscal, choosing which markets to support, " +
      "without anyone having voted for the choices. My own view turns on whether the mandate can " +
      "be kept narrow. Independence to pursue a numerical inflation target is a technical " +
      "delegation of means toward an end that elected politicians set. Independence to decide " +
      "which sectors receive support is a delegation of ends, and that should sit with people who " +
      "face an election." },

  /* ===================== CHAPTER 12 ===================== */
  { id: "ch12_w_inflation_costs", chapter: 12, difficulty: "med", points: 5,
    concept: "the costs of inflation",
    prompt: "“If everyone's wages and prices rise together, inflation costs nothing.” In " +
      "5–9 sentences, evaluate this, distinguishing carefully between anticipated and " +
      "unanticipated inflation.",
    rubric: "5 marks total. 1 mark: grants the partial truth — perfectly anticipated and " +
      "uniform inflation would have modest costs. 1 mark: names costs that survive even when " +
      "anticipated — shoeleather costs, menu costs, tax distortions on nominal capital gains " +
      "and interest, relative-price noise. 1 mark: identifies the main cost of UNANTICIPATED " +
      "inflation — arbitrary redistribution between debtors and creditors. 1 mark: explains " +
      "WHY the uniformity premise fails — prices and wages adjust at different times and " +
      "rates, so relative prices move and some are worse off. 1 mark: notes that high inflation is " +
      "also volatile and unpredictable inflation, which degrades the information content of prices " +
      "and shortens contracting horizons.",
    modelAnswer: "There is something in the claim: if inflation were perfectly steady and " +
      "perfectly anticipated, and every price and wage rose in lockstep, the costs would be " +
      "comparatively small. But several survive even then. Holding cash becomes expensive, so " +
      "people make more trips to the bank — the shoeleather cost. Firms must repeatedly " +
      "reprint and re-quote — menu costs. Tax systems defined in nominal terms tax purely " +
      "inflationary capital gains and interest as though they were real income, which distorts " +
      "saving. The larger costs come from the premise failing. Inflation is never perfectly " +
      "anticipated, and unanticipated inflation redistributes arbitrarily: it transfers wealth " +
      "from lenders to borrowers, since debts fixed in nominal terms are repaid in cheaper money, " +
      "and it falls hardest on anyone whose income is fixed in nominal terms. Nor does everything " +
      "move together: wages are renegotiated annually and prices change at different frequencies, " +
      "so relative prices drift for reasons that have nothing to do with scarcity, which is noise " +
      "in the signal the price system is supposed to carry. And high inflation is empirically " +
      "volatile inflation, which shortens contracts and makes long-horizon investment harder to " +
      "evaluate." },

  { id: "ch12_w_hard_hyperinflation", chapter: 12, difficulty: "hard", points: 6,
    concept: "hyperinflation",
    prompt: "Hyperinflations are almost always ended by a package rather than by a single measure. " +
      "In 6–10 sentences, explain the fiscal origin of hyperinflation, explain why simply " +
      "announcing that the central bank will stop printing is rarely enough, and set out what a " +
      "credible stabilisation requires.",
    rubric: "6 marks total. 1 mark: identifies the fiscal root — a government that cannot tax " +
      "or borrow enough finances its deficit by printing, so seigniorage is the driver. 1 mark: " +
      "explains the accelerating dynamic — as inflation rises, real money demand and real tax " +
      "revenue both fall (the Olivera-Tanzi effect), so still more printing is needed. 1 mark: " +
      "explains why an announcement alone fails — it is not credible while the deficit " +
      "remains, since the public can see the government will have to print again. 1 mark: states " +
      "that the fiscal deficit must actually be closed, by spending cuts or genuine tax reform. " +
      "1 mark: names a further credibility device — central bank independence, an exchange " +
      "rate anchor or currency board, external support, sometimes a new currency. 1 mark: notes " +
      "that successful stabilisations can be surprisingly cheap in output terms because " +
      "expectations shift at once when the package is believed, which contrasts sharply with the " +
      "cost of ordinary disinflation.",
    modelAnswer: "Hyperinflation is a fiscal phenomenon before it is a monetary one. A government " +
      "that cannot raise enough in taxes and can no longer borrow turns to the printing press, and " +
      "seigniorage becomes a revenue source. The dynamic then accelerates on its own: as inflation " +
      "rises, people hold less real money, so each unit of revenue requires more printing, and " +
      "because taxes are assessed and collected with a lag, real tax revenue collapses as well " +
      "— the Olivera-Tanzi effect — widening the very deficit that caused the problem. " +
      "Announcing that the central bank will stop is not credible against that background, because " +
      "everyone can see the government still has bills it cannot otherwise pay, and will have to " +
      "resume. Expectations do not move, so prices do not stop. A credible stabilisation therefore " +
      "has to close the fiscal gap for real, through spending cuts or genuine tax reform, and then " +
      "add visible devices that make reversal costly: statutory central bank independence, an " +
      "exchange-rate anchor or currency board, external financial support, often a new currency to " +
      "mark the break. What is striking is that when the package is believed, stabilisation can be " +
      "remarkably cheap in lost output — expectations adjust immediately rather than " +
      "gradually, which is precisely the opposite of the slow, costly disinflation a moderate " +
      "inflation requires." },

  { id: "ch12_w_classical_dichotomy", chapter: 12, difficulty: "med", points: 4,
    concept: "money neutrality",
    prompt: "In 4–7 sentences, explain what is meant by the classical dichotomy and the " +
      "neutrality of money, and explain why accepting both is compatible with believing that " +
      "monetary policy matters a great deal.",
    rubric: "4 marks total. 1 mark: defines the classical dichotomy — the theoretical " +
      "separation of real variables from nominal ones. 1 mark: defines neutrality — a change " +
      "in the money supply changes nominal variables proportionally and leaves real variables " +
      "unchanged. 1 mark: states that neutrality is a LONG-RUN proposition. 1 mark: explains the " +
      "reconciliation — prices and wages are sticky in the short run, so monetary changes move " +
      "real output and employment before they move prices, which is the whole basis for " +
      "stabilisation policy.",
    modelAnswer: "The classical dichotomy is the theoretical separation of real variables " +
      "— output, employment, relative prices — from nominal ones such as the price level " +
      "and the money stock. Neutrality of money is the accompanying claim that changing the money " +
      "supply changes all nominal magnitudes proportionally and leaves every real magnitude " +
      "untouched: double the money and you double prices, with the same goods produced. The " +
      "crucial qualifier is that this is a long-run proposition, resting on prices and wages " +
      "having had time to adjust fully. In the short run they have not: wage contracts run for " +
      "years, menu costs and coordination problems slow price changes, so a monetary expansion " +
      "initially raises real spending and real output rather than just prices. That is exactly why " +
      "monetary policy matters — the short run is where stabilisation happens, and accepting " +
      "long-run neutrality simply means accepting that the effect is temporary and that trying to " +
      "hold output above potential permanently buys inflation and nothing else." },

  { id: "ch12_w_inflation_tax", chapter: 12, difficulty: "med", points: 4,
    concept: "seigniorage",
    prompt: "In 4–7 sentences, explain in what sense inflation is a tax, identify who pays it " +
      "and who collects it, and explain why it is sometimes described as the most regressive tax " +
      "available.",
    rubric: "4 marks total. 1 mark: identifies the base — holdings of nominal money and " +
      "nominal assets, whose real value is eroded. 1 mark: identifies the collector — the " +
      "government, which obtains real resources by issuing money (seigniorage), and nominal " +
      "debtors generally. 1 mark: identifies who pays — holders of cash and nominal claims. " +
      "1 mark: explains the regressivity — poorer households hold a larger share of their " +
      "wealth in cash and bank deposits and have least access to inflation-protected assets, " +
      "whereas the wealthy hold equities, property and indexed instruments.",
    modelAnswer: "Inflation works like a tax on holdings of money and of nominal claims: as prices " +
      "rise, the real purchasing power of each unit held falls, and the holder has lost real " +
      "resources without any explicit levy. The government is the counterpart beneficiary, because " +
      "issuing new money buys real goods and services — that revenue is seigniorage — " +
      "and because its own nominal debt is eroded in real terms. Nominal debtors in general gain " +
      "for the same reason. It is called regressive because of the composition of wealth: poorer " +
      "households hold a far larger share of what they have in cash and ordinary bank deposits, " +
      "which bear little or no interest and are fully exposed, while wealthier households hold " +
      "equities, property and index-linked instruments that broadly keep pace. The tax is also " +
      "invisible and requires no legislation, which is both why governments under fiscal stress " +
      "reach for it and why it is harder to hold anyone accountable for." },

  /* ===================== CHAPTER 13 ===================== */
  { id: "ch13_w_exchange_rate_effects", chapter: 13, difficulty: "med", points: 5,
    concept: "exchange rates and net exports",
    prompt: "A country's currency appreciates sharply. In 5–8 sentences, trace the effects on " +
      "exporters, importers, consumers and the trade balance, and explain why the trade balance " +
      "may initially move in the “wrong” direction.",
    rubric: "5 marks total. 1 mark: exporters are hurt — their goods are dearer abroad, so " +
      "foreign sales fall. 1 mark: importers and import-using firms benefit — foreign goods " +
      "and inputs are cheaper. 1 mark: consumers gain through lower import prices, which also " +
      "dampens inflation. 1 mark: the trade balance eventually worsens as export volumes fall and " +
      "import volumes rise. 1 mark: explains the J-curve — quantities take time to adjust " +
      "because contracts are fixed and buyers slow to switch, so initially the VALUE effect " +
      "dominates and the balance can move the other way first.",
    modelAnswer: "An appreciation makes domestic goods more expensive in foreign currency and " +
      "foreign goods cheaper at home. Exporters are hurt directly: their prices abroad rise, " +
      "foreign buyers switch away, and margins compress for those who absorb the change instead. " +
      "Importers and any firm using imported inputs gain, since their costs fall. Consumers gain " +
      "through cheaper imported goods, and the appreciation dampens measured inflation, which is " +
      "why central banks watch it closely. Over time export volumes fall and import volumes rise, " +
      "so the trade balance deteriorates. But the first move can go the other way, which is the " +
      "J-curve. Quantities are slow to respond — contracts are already signed, supply chains " +
      "are not rearranged in a quarter, and buyers take time to switch — so initially the " +
      "volumes are roughly fixed while the prices have changed, and the value effect dominates. " +
      "Only once quantities adjust does the balance move in the direction the textbook predicts." },

  { id: "ch13_w_hard_ppp_failure", chapter: 13, difficulty: "hard", points: 5,
    concept: "purchasing power parity",
    prompt: "Purchasing power parity predicts that exchange rates should equalise the price of " +
      "identical goods across countries, yet the Big Mac index shows persistent deviations of 30% " +
      "or more. In 6–9 sentences, explain the logic of PPP, explain why it fails in the short " +
      "run and systematically across income levels, and state what PPP is still good for.",
    rubric: "5 marks total. 1 mark: states the arbitrage logic behind PPP. 1 mark: identifies " +
      "non-tradable inputs — rent, local labour, utilities — which cannot be arbitraged " +
      "and make up much of the price. 1 mark: identifies other short-run frictions — " +
      "transport costs, tariffs, local taxes, differentiated products, and capital flows that move " +
      "exchange rates far faster than goods prices. 1 mark: identifies the systematic pattern " +
      "— price levels are lower in poorer countries (Balassa-Samuelson), because lower " +
      "productivity in non-tradables permits lower wages and so lower non-tradable prices. 1 mark: " +
      "states what PPP remains useful for — a long-run anchor for real exchange rates, and " +
      "the correct basis for comparing living standards across countries.",
    modelAnswer: "PPP rests on arbitrage: if a basket costs much less in one country, goods should " +
      "flow toward the expensive market until prices and the exchange rate adjust. The failure has " +
      "two different parts. In the short run the arbitrage is weak because much of what you pay " +
      "for in a Big Mac is not tradable at all — the rent on the restaurant, the wages of " +
      "the staff, local utilities and taxes — and nobody can ship those. Add transport costs, " +
      "tariffs and the fact that the products are not quite identical, and the law of one price " +
      "has little bite. Meanwhile exchange rates are set in asset markets and move far faster than " +
      "goods prices do, so deviations open quickly and close slowly. The systematic part is " +
      "different and more interesting: price levels are reliably LOWER in poorer countries, which " +
      "is the Balassa-Samuelson effect. Productivity differences between rich and poor countries " +
      "are large in tradables and small in services like haircuts, so wages, which are tied to " +
      "tradable-sector productivity, are low in poor countries and that makes their non-tradables " +
      "cheap. PPP is still valuable for two things: as a long-run anchor, since real exchange " +
      "rates do revert toward it over long horizons, and as the right basis for comparing living " +
      "standards, which is why income comparisons are made at PPP rather than market rates." },

  { id: "ch13_w_current_account", chapter: 13, difficulty: "med", points: 5,
    concept: "current account deficits",
    prompt: "“A current account deficit means a country is living beyond its means and is " +
      "always a warning sign.” In 5–8 sentences, evaluate this, giving a case where a " +
      "deficit is benign and a case where it is dangerous, and state what distinguishes them.",
    rubric: "5 marks total. 1 mark: states the identity — a current account deficit is " +
      "matched by a capital inflow; the country is a net borrower from abroad. 1 mark: gives a " +
      "benign case — borrowing to finance productive investment whose return exceeds the cost " +
      "of the borrowing, as with a fast-growing economy importing capital goods. 1 mark: gives a " +
      "dangerous case — borrowing to finance consumption, an asset bubble, or an overvalued " +
      "fixed exchange rate, especially in foreign currency and at short maturity. 1 mark: " +
      "identifies the distinguishing factor — what the borrowed funds are USED for, and " +
      "whether the resulting liabilities can be serviced. 1 mark: names a secondary risk factor " +
      "— currency denomination, maturity structure, or the volatility of the financing (hot " +
      "money versus FDI).",
    modelAnswer: "A current account deficit is, by the balance of payments identity, a net capital " +
      "inflow: the country is importing more than it exports and borrowing from the rest of the " +
      "world, or selling assets, to cover the difference. Whether that is a problem depends " +
      "entirely on what the borrowing finances. A fast-growing economy importing machinery and " +
      "infrastructure, funded by foreign direct investment, is borrowing to build productive " +
      "capacity whose return exceeds the cost of the funds — South Korea ran sustained " +
      "deficits through its industrialisation, and servicing them was never in doubt. The " +
      "dangerous case is a deficit financing consumption or a property bubble, especially when the " +
      "borrowing is short-term, denominated in foreign currency and supplied by portfolio " +
      "investors who can leave at any moment. Then the country accumulates liabilities with no " +
      "corresponding earning capacity, and the financing can stop abruptly, which is the anatomy " +
      "of the 1997 Asian crisis and of Greece before 2010. What distinguishes them is the use of " +
      "the funds and the fragility of the financing, not the headline number." },

  { id: "ch13_w_capital_flight", chapter: 13, difficulty: "hard", points: 5,
    concept: "capital flight",
    prompt: "A country experiences sudden capital flight. In 5–9 sentences, trace the effects " +
      "through the loanable funds market and the foreign exchange market simultaneously, and " +
      "explain why a government with large foreign-currency debt finds this especially damaging.",
    rubric: "5 marks total. 1 mark: capital flight raises net capital outflow at every interest " +
      "rate, reducing the supply of loanable funds available domestically. 1 mark: the domestic " +
      "real interest rate RISES, depressing investment. 1 mark: in the currency market, demand for " +
      "the domestic currency falls, so it DEPRECIATES. 1 mark: notes the partially offsetting " +
      "effect — depreciation raises net exports. 1 mark: explains the foreign-currency debt " +
      "problem — depreciation raises the domestic-currency value of the debt, worsening the " +
      "fiscal position precisely when borrowing costs have risen, which can become self-reinforcing " +
      "(original sin / balance-sheet effect).",
    modelAnswer: "Capital flight means residents and foreigners both want to hold assets " +
      "elsewhere, so net capital outflow rises at every interest rate. In the loanable funds " +
      "market that reduces the supply of funds available domestically, and the real interest rate " +
      "rises — which depresses domestic investment just when confidence is already weak. In " +
      "the foreign exchange market the same behaviour shows up as reduced demand for the domestic " +
      "currency, so it depreciates. The depreciation is not all bad: it makes exports more " +
      "competitive and raises net exports, which is the economy's automatic shock absorber. The " +
      "trouble is what it does to balance sheets. A government that borrowed in dollars now owes " +
      "the same dollars but earns taxes in a currency worth much less, so the debt-to-GDP ratio " +
      "jumps without a cent of new borrowing, at exactly the moment its interest costs have risen " +
      "and its economy is contracting. That combination is self-reinforcing — the worsening " +
      "fiscal position triggers further flight — and it is why borrowing in a currency you " +
      "cannot print has been the common thread in emerging-market crises for forty years." },

  /* ===================== CHAPTER 14 ===================== */
  { id: "ch14_w_unemployment_measurement", chapter: 14, difficulty: "easy", points: 4,
    concept: "measuring unemployment",
    prompt: "The unemployment rate falls from 6% to 5%, but the number of people employed has not " +
      "changed. In 4–6 sentences, explain how this is possible, and state whether it is good " +
      "news.",
    rubric: "4 marks total. 1 mark: states the definition — unemployed means without work, " +
      "available, AND actively searching. 1 mark: explains the mechanism — people who stop " +
      "searching leave the labour force, so both the numerator and the denominator fall and the " +
      "rate falls without any job being created. 1 mark: names the phenomenon — discouraged " +
      "workers, falling participation. 1 mark: concludes that it is not good news, and names a " +
      "better indicator — the employment-to-population ratio, the participation rate, or a " +
      "broader measure such as U-6.",
    modelAnswer: "To be counted as unemployed a person must be out of work, available to work and " +
      "actively looking. Someone who gives up searching is no longer unemployed by that definition " +
      "— they have left the labour force entirely. Because they drop out of both the " +
      "numerator and the denominator, the measured unemployment rate falls even though exactly the " +
      "same number of people are working. These are discouraged workers, and a falling " +
      "participation rate is the signature. It is not good news: the economy has not created a " +
      "single job, and the people concerned are worse off than when they were counted, since " +
      "long spells out of the labour force erode skills and employability. The " +
      "employment-to-population ratio, which has no such denominator problem, or a broader measure " +
      "like U-6 that includes discouraged and involuntarily part-time workers, gives a far more " +
      "honest picture." },

  { id: "ch14_w_hard_natural_rate", chapter: 14, difficulty: "hard", points: 6,
    concept: "the natural rate of unemployment",
    prompt: "In 6–10 sentences, explain what the natural rate of unemployment is, explain why " +
      "it is not zero even in a well-functioning economy, and explain why a central bank that " +
      "mis-estimates it can do real damage in either direction.",
    rubric: "6 marks total. 1 mark: defines the natural rate as the rate prevailing when the " +
      "economy is at potential — the rate toward which unemployment gravitates once cyclical " +
      "factors are absent. 1 mark: frictional unemployment — search and matching take time, " +
      "and some of this is efficient. 1 mark: structural unemployment — a mismatch of skills " +
      "or location, plus institutional factors such as minimum wages, unions, benefit generosity " +
      "and hiring regulation. 1 mark: explains that it is unobservable and estimated with " +
      "considerable error, and that it moves over time with demography and institutions. 1 mark: " +
      "over-estimation — the bank tightens too soon, holding unemployment needlessly high and " +
      "forgoing output and wage growth for workers at the margin. 1 mark: under-estimation — " +
      "the bank runs the economy too hot for too long, allowing inflation and expectations to rise " +
      "and requiring a costlier disinflation later.",
    modelAnswer: "The natural rate is the unemployment rate the economy settles at when it is " +
      "operating at potential — what remains once the cyclical component is stripped out. It " +
      "is not zero, and should not be, for two reasons. Some unemployment is frictional: workers " +
      "and jobs are heterogeneous, matching takes time, and a worker searching for a job that fits " +
      "is doing something economically useful, so a dynamic economy with people moving between " +
      "jobs necessarily shows positive unemployment. Some is structural: skills or locations do " +
      "not match available vacancies, and institutional features — minimum wages, union " +
      "bargaining, benefit generosity and duration, hiring and firing regulation — shift the " +
      "level at which the labour market settles. The practical difficulty is that the natural rate " +
      "cannot be observed. It must be inferred from the behaviour of inflation, it is estimated " +
      "with wide error bands, and it drifts with demography and institutions. Both errors are " +
      "costly. Over-estimate it and the bank tightens prematurely, holding unemployment above what " +
      "is necessary and denying wage gains to exactly the workers at the margin of the labour " +
      "market — roughly the mistake made in the United States in the mid-1990s, before it " +
      "became clear the economy could run hotter without inflation. Under-estimate it and policy " +
      "stays loose too long, inflation expectations drift upward, and the eventual disinflation " +
      "costs far more unemployment than was ever gained — the 1970s." },

  { id: "ch14_w_efficiency_wages", chapter: 14, difficulty: "med", points: 5,
    concept: "why wages do not clear the market",
    prompt: "In 5–8 sentences, explain why profit-maximising firms sometimes pay more than " +
      "the market-clearing wage, giving at least two distinct mechanisms, and explain what this " +
      "implies for unemployment.",
    rubric: "5 marks total. 2 marks for any two distinct efficiency-wage mechanisms, one mark " +
      "each: reduced turnover and lower hiring and training costs; improved worker effort because " +
      "job loss becomes costly (shirking model); better applicant quality through self-selection " +
      "(adverse selection); improved health and productivity in low-income settings. 1 mark: " +
      "states that the higher wage is profit-maximising, not altruistic — productivity rises " +
      "by more than the wage bill. 1 mark: draws the labour-market implication — quantity " +
      "supplied exceeds quantity demanded at that wage. 1 mark: concludes that the resulting " +
      "unemployment is involuntary and persistent, since firms will not cut the wage even with " +
      "queues of applicants.",
    modelAnswer: "A firm may find that paying above the market-clearing wage raises profit, " +
      "because the wage affects productivity rather than just costing money. One channel is " +
      "turnover: a better-paid worker is less likely to leave, and the firm saves repeatedly on " +
      "recruitment and training. Another is effort — if the job pays more than the next-best " +
      "alternative, being dismissed is genuinely costly, so workers work harder when monitoring is " +
      "imperfect. A third is selection: a higher offer attracts a stronger applicant pool when the " +
      "firm cannot observe quality directly. None of this is generosity; the wage is set where the " +
      "productivity gain just offsets the extra cost. The labour-market consequence is that the " +
      "wage sits above the level at which supply equals demand, so more people want these jobs " +
      "than there are jobs. That unemployment is involuntary in the strict sense — the " +
      "workers would gladly take the job at the going wage — and it is persistent, because " +
      "the firm has no interest in cutting the wage even with applicants queuing, since cutting it " +
      "would destroy the productivity advantage it was paying for." },

  { id: "ch14_w_hysteresis", chapter: 14, difficulty: "hard", points: 5,
    concept: "hysteresis",
    prompt: "In 5–9 sentences, explain the hysteresis hypothesis in the labour market, give " +
      "two mechanisms that could generate it, and explain what it implies for how quickly policy " +
      "should respond to a recession.",
    rubric: "5 marks total. 1 mark: defines hysteresis — a temporary shock permanently raises " +
      "the natural rate, so the economy does not return to its previous path. 2 marks for any two " +
      "mechanisms, one each: skill atrophy during long unemployment spells; employer screening that " +
      "discriminates against the long-term unemployed; detachment from the labour force and lost " +
      "job-search networks; insider-outsider bargaining in which employed insiders set wages " +
      "without regard to the unemployed; reduced capital stock lowering labour demand. 1 mark: " +
      "states the policy implication — the cost of a slow response is permanent rather than " +
      "temporary. 1 mark: draws the asymmetry — this argues for responding fast and " +
      "forcefully early, since waiting to see converts a cyclical problem into a structural one.",
    modelAnswer: "Hysteresis is the hypothesis that a temporary shock leaves a permanent mark " +
      "— that a deep recession raises the natural rate of unemployment itself, so the economy " +
      "never returns to its old path even after demand recovers. Two mechanisms are well " +
      "documented. The first is skill atrophy: during a long spell out of work, skills decay, " +
      "professional networks dissolve, and familiarity with current practice is lost, so the worker " +
      "is genuinely less employable than before. The second is screening: employers treat a long " +
      "unemployment spell as a negative signal and filter those applications out, which makes the " +
      "signal self-fulfilling regardless of the individual's actual quality. Either way a worker " +
      "who was cyclically unemployed becomes structurally unemployed. The policy implication is " +
      "sharp. If recessions are purely cyclical, a slow policy response costs some temporary " +
      "output that is eventually recovered. If hysteresis operates, the same delay converts a " +
      "recoverable loss into a permanent reduction in the economy's productive capacity. That " +
      "asymmetry argues for responding early and forcefully rather than waiting for confirmation, " +
      "because the cost of acting too strongly is temporary inflation that can be unwound, while " +
      "the cost of acting too late cannot be." },

  /* ===================== CHAPTER 15 ===================== */
  { id: "ch15_w_srasvslras", chapter: 15, difficulty: "med", points: 5,
    concept: "short-run and long-run aggregate supply",
    prompt: "In 5–8 sentences, explain why the short-run aggregate supply curve slopes upward " +
      "while the long-run curve is vertical, and explain what economic assumption the difference " +
      "rests on.",
    rubric: "5 marks total. 1 mark: states that SRAS slopes up — a higher price level is " +
      "associated with higher output in the short run. 1 mark: gives a mechanism — sticky " +
      "wages, sticky prices, or misperceptions, any one correctly explained. 1 mark: states that " +
      "LRAS is vertical at potential output. 1 mark: explains why — in the long run output is " +
      "determined by resources and technology, not by the price level, so nominal changes cannot " +
      "move it. 1 mark: identifies the underlying assumption — the SPEED of nominal " +
      "adjustment, with the short run defined as the period before wages and prices have fully " +
      "adjusted.",
    modelAnswer: "SRAS slopes upward because a higher price level is, in the short run, associated " +
      "with greater output. The usual mechanism is sticky nominal wages: wage contracts are fixed " +
      "in advance, so when the price level rises the real wage falls, labour becomes cheaper for " +
      "firms, and they hire and produce more. Sticky prices and misperceptions about relative " +
      "versus general price movements generate the same slope by different routes. LRAS is " +
      "vertical at potential output because, once contracts have been renegotiated and " +
      "expectations have caught up, output is determined entirely by the real things — the " +
      "capital stock, the labour force, technology and institutions — none of which depends " +
      "on the price level. Doubling every price and every wage leaves the real economy exactly " +
      "where it was. The entire difference between the two curves therefore rests on one " +
      "assumption: how fast nominal variables adjust. The short run simply IS the period before " +
      "that adjustment is complete, which is why the length of the short run is an empirical " +
      "question rather than a fixed horizon." },

  { id: "ch15_w_hard_supply_shock", chapter: 15, difficulty: "hard", points: 6,
    concept: "stagflation and the policy dilemma",
    prompt: "A large and persistent rise in oil prices hits an economy at full employment. In " +
      "6–10 sentences, use AD–AS to explain what happens to output and the price level, " +
      "explain why this presents the central bank with a genuine dilemma that a demand shock does " +
      "not, and state what consideration should decide the response.",
    rubric: "6 marks total. 1 mark: identifies an adverse supply shock shifting SRAS LEFT. 1 mark: " +
      "states the result — output falls and the price level rises simultaneously, i.e. " +
      "stagflation. 1 mark: explains why this is a dilemma — the bank's two objectives point " +
      "in opposite directions, unlike a demand shock where both call for the same action. 1 mark: " +
      "describes the consequence of accommodating — restoring output but validating the price " +
      "rise and risking an expectations spiral. 1 mark: describes the consequence of tightening " +
      "— containing inflation at the cost of deepening the recession. 1 mark: names the " +
      "deciding consideration — whether inflation expectations remain anchored, and whether " +
      "the shock is one-off (a level change in relative prices) or feeding into wages; a " +
      "well-anchored expectation permits looking through it.",
    modelAnswer: "An oil shock raises production costs across the economy, shifting short-run " +
      "aggregate supply to the left. The new short-run equilibrium has lower output and a higher " +
      "price level at once — stagflation. That combination is what makes it hard. After a " +
      "demand shock, output and inflation move together, so the central bank's two objectives " +
      "point the same way and the right action is obvious. Here they point in opposite directions: " +
      "whichever problem the bank addresses, it makes the other worse. If it accommodates, " +
      "expanding demand to restore output, it validates the higher price level and risks the " +
      "increase passing into wage demands and then into expectations, at which point a one-off " +
      "relative price change becomes sustained inflation — the 1970s error. If it tightens, " +
      "it contains inflation but deepens the recession in an economy already contracting, which is " +
      "the Volcker route and was extremely costly in unemployment. The deciding consideration is " +
      "the state of inflation expectations. If they are firmly anchored, the bank can look through " +
      "a one-off supply shock, treating it as a change in relative prices that will wash out, and " +
      "should avoid compounding the output loss. If expectations are drifting or wages are already " +
      "indexing to the shock, looking through it is how a temporary shock becomes a permanent " +
      "inflation, and the bank must act even though output is falling." },

  { id: "ch15_w_demand_shock_adjustment", chapter: 15, difficulty: "med", points: 5,
    concept: "self-correction",
    prompt: "An economy falls into recession after a collapse in business confidence, and the " +
      "government does nothing. In 5–8 sentences, describe how the AD–AS model says the " +
      "economy returns to potential on its own, and explain the strongest argument for not waiting.",
    rubric: "5 marks total. 1 mark: identifies the shock — AD shifts left, so output falls " +
      "below potential and the price level falls. 1 mark: describes the adjustment mechanism " +
      "— with unemployment high, nominal wages and prices eventually fall. 1 mark: explains " +
      "that falling costs shift SRAS right, restoring output to potential at a lower price level. " +
      "1 mark: identifies that the mechanism relies on downward nominal flexibility, which is " +
      "empirically weak — wages are notably rigid downward. 1 mark: gives the argument for " +
      "acting — the adjustment may take many years, the output and employment lost in the " +
      "meantime is real and may be permanent through hysteresis, and deflation raises real debt " +
      "burdens.",
    modelAnswer: "The confidence collapse shifts aggregate demand left, so output falls below " +
      "potential and the price level falls. The self-correcting mechanism runs through the labour " +
      "market: with unemployment high and sales weak, workers eventually accept lower nominal " +
      "wages and firms cut prices. Lower costs shift short-run aggregate supply to the right, and " +
      "the economy returns to potential output, now at a lower price level. The model is coherent, " +
      "and the mechanism is real. The problem is the assumption it leans on. Nominal wages are " +
      "strongly rigid downward — firms lay workers off rather than cut pay, for reasons of " +
      "morale and contracts — so the adjustment that the diagram completes in one step can " +
      "take many years in practice. In the meantime the lost output and employment are real, and " +
      "if hysteresis operates some of the loss never comes back. Worse, falling prices raise the " +
      "real burden of existing nominal debts, which can weaken demand further and offset the " +
      "mechanism that is meant to be restoring equilibrium. Keynes's observation that in the long " +
      "run we are all dead was a point about the length of this adjustment, not a dismissal of the " +
      "theory." },

  { id: "ch15_w_potential_output", chapter: 15, difficulty: "med", points: 4,
    concept: "potential output",
    prompt: "In 4–7 sentences, explain what potential output means, explain why an economy " +
      "can produce above it temporarily, and explain why doing so is not sustainable.",
    rubric: "4 marks total. 1 mark: defines potential output as the level the economy produces " +
      "when unemployment is at its natural rate and resources are used at normal intensity — " +
      "not a physical maximum. 1 mark: explains how output can exceed it — overtime, extra " +
      "shifts, deferred maintenance, drawing in workers who would otherwise not be in the labour " +
      "force. 1 mark: explains the consequence — tight labour and product markets bid up " +
      "wages and prices. 1 mark: explains the return — rising costs shift SRAS left and " +
      "output returns to potential at a higher price level, so the gain is temporary and the " +
      "inflation is not.",
    modelAnswer: "Potential output is the level of production an economy sustains when " +
      "unemployment sits at its natural rate and capital is used at normal intensity. It is not a " +
      "physical ceiling, which is why output can exceed it: firms run overtime and extra shifts, " +
      "defer maintenance, and draw in workers who would not normally be in the labour force. That " +
      "is genuinely more output, for a while. What makes it unsustainable is what tight markets do " +
      "to costs. With unemployment below its natural rate, workers have bargaining power and " +
      "nominal wages rise; with capacity strained, input prices rise too. Those rising costs shift " +
      "short-run aggregate supply leftward, and output returns to potential — but at a " +
      "permanently higher price level. The extra output was temporary and the inflation it " +
      "generated was not, which is precisely the trade a central bank refuses when it tightens " +
      "into a boom." },

  /* ===================== CHAPTER 16 ===================== */
  { id: "ch16_w_islm_logic", chapter: 16, difficulty: "med", points: 5,
    concept: "the IS and LM curves",
    prompt: "In 5–8 sentences, explain what the IS curve and the LM curve each represent, why " +
      "IS slopes downward and LM upward, and what the intersection determines.",
    rubric: "5 marks total. 1 mark: IS represents combinations of interest rate and output at " +
      "which the goods market is in equilibrium (planned spending equals output). 1 mark: explains " +
      "the downward slope — a lower interest rate raises investment and hence equilibrium " +
      "output. 1 mark: LM represents combinations at which the money market is in equilibrium " +
      "(money demand equals money supply). 1 mark: explains the upward slope — higher output " +
      "raises money demand, which with a fixed money supply requires a higher interest rate to " +
      "restore equilibrium. 1 mark: states that the intersection determines the interest rate and " +
      "output at which BOTH markets clear simultaneously.",
    modelAnswer: "The IS curve traces every combination of interest rate and output at which the " +
      "goods market clears — where planned spending equals output produced. It slopes " +
      "downward because a lower interest rate makes investment cheaper, which raises planned " +
      "spending and therefore the equilibrium level of output; lower rates and higher output go " +
      "together. The LM curve traces every combination at which the money market clears, with the " +
      "demand for real balances equal to the supply. It slopes upward because higher output means " +
      "more transactions and so greater money demand, and with the money supply fixed the interest " +
      "rate must rise to persuade people to hold the same quantity of money. Each curve alone " +
      "describes one market and leaves the other undetermined. Their intersection pins down the " +
      "unique pair of interest rate and output at which both the goods market and the money market " +
      "are simultaneously in equilibrium, which is what makes the diagram a model rather than two " +
      "separate observations." },

  { id: "ch16_w_hard_liquidity_trap", chapter: 16, difficulty: "hard", points: 6,
    concept: "the liquidity trap",
    prompt: "In 6–10 sentences, explain what a liquidity trap is in IS–LM terms, explain " +
      "why conventional monetary policy becomes ineffective there, and set out two policies that " +
      "could still work and why.",
    rubric: "6 marks total. 1 mark: describes the trap — the LM curve becomes flat (horizontal) " +
      "at a near-zero interest rate. 1 mark: explains why — at near-zero rates money and " +
      "bonds are near-perfect substitutes, so additional money is absorbed into idle balances " +
      "rather than bidding rates down. 1 mark: explains the consequence — shifting LM right " +
      "moves the intersection very little, so output barely responds to monetary expansion. " +
      "1 mark: notes that fiscal policy is correspondingly MORE effective, since a rightward IS " +
      "shift along a flat LM raises output with no offsetting rise in the interest rate, meaning " +
      "no crowding out. 2 marks: names two further policies with a reason each — for example " +
      "raising inflation expectations to lower the REAL rate while the nominal rate is stuck; " +
      "forward guidance committing to keep rates low after recovery; quantitative easing to " +
      "compress long-term yields; currency depreciation to raise net exports.",
    modelAnswer: "A liquidity trap is the region where the LM curve becomes horizontal, which " +
      "happens when the nominal interest rate has reached its effective floor near zero. At that " +
      "point money and short-term bonds are nearly perfect substitutes — bonds pay almost " +
      "nothing, so holding money costs almost nothing — and any additional money the central " +
      "bank supplies is simply absorbed into idle balances rather than bidding interest rates " +
      "lower. Conventional monetary policy therefore stops working: shifting the LM curve to the " +
      "right along its flat portion moves the intersection with IS hardly at all, so output barely " +
      "changes. The mirror image is that fiscal policy becomes unusually powerful, because " +
      "shifting IS right along a horizontal LM raises output with no rise in the interest rate at " +
      "all, which means no crowding out — the multiplier is close to its textbook value, " +
      "which is why the estimated multiplier was large after 2008. Two other routes remain. " +
      "Raising expected inflation lowers the REAL interest rate even while the nominal rate is " +
      "pinned at zero, which is the logic behind a higher inflation target or a commitment to " +
      "overshoot. And forward guidance — a credible promise to keep rates low even after " +
      "recovery begins — works on long rates today by changing expectations of future short " +
      "rates, which is why the credibility of the promise is the whole of its value." },

  { id: "ch16_w_policy_mix", chapter: 16, difficulty: "med", points: 5,
    concept: "the monetary-fiscal mix",
    prompt: "Two different policy combinations can deliver the same level of output: tight money " +
      "with loose fiscal policy, or loose money with tight fiscal policy. In 5–8 sentences, " +
      "use IS–LM to explain how, and explain why the choice between them still matters a " +
      "great deal.",
    rubric: "5 marks total. 1 mark: explains that a fiscal expansion shifts IS right and a " +
      "monetary contraction shifts LM left, with output effects that can offset. 1 mark: explains " +
      "the mirror case — fiscal contraction shifts IS left, monetary expansion shifts LM " +
      "right. 1 mark: states that the two mixes reach similar output at very DIFFERENT interest " +
      "rates. 1 mark: explains the composition consequence — high rates crowd out investment " +
      "and favour consumption and government spending; low rates favour investment and " +
      "interest-sensitive sectors. 1 mark: draws the long-run implication — the mix " +
      "determines the capital stock the economy accumulates, and hence future output, even where " +
      "today's output is identical.",
    modelAnswer: "A fiscal expansion shifts the IS curve to the right, raising both output and the " +
      "interest rate. A monetary contraction shifts the LM curve left, lowering output and raising " +
      "the interest rate. Combine them and the output effects can be made to cancel while the " +
      "interest-rate effects reinforce, leaving output unchanged at a much higher interest rate. " +
      "The opposite mix — fiscal tightening with monetary easing — also leaves output " +
      "unchanged, but at a much lower interest rate. So the same output is reachable from either " +
      "direction, and the level of output does not reveal which mix produced it. What differs is " +
      "the COMPOSITION of that output. High interest rates crowd out business investment and " +
      "housing, so the economy's output is weighted toward consumption and government purchases; " +
      "low rates do the reverse and favour investment. That composition choice is not neutral over " +
      "time, because investment today is the capital stock tomorrow. Two economies with identical " +
      "GDP this year, one produced by the tight-money mix and one by the loose-money mix, will " +
      "have different productive capacity a decade later — which is why the policy mix is a " +
      "long-run growth question disguised as a short-run stabilisation question." },

  { id: "ch16_w_islm_limits", chapter: 16, difficulty: "hard", points: 5,
    concept: "limitations of IS-LM",
    prompt: "In 5–9 sentences, identify three significant limitations of the IS–LM " +
      "framework, and explain why it nonetheless remains the standard teaching model for " +
      "short-run fluctuations.",
    rubric: "5 marks total. 3 marks for any three limitations, one mark each: the price level is " +
      "fixed, so it cannot address inflation; expectations are absent or static, though they drive " +
      "actual policy transmission; it treats the money supply as the policy instrument while " +
      "central banks target an interest rate; it lacks microfoundations, so it is vulnerable to " +
      "the Lucas critique; it is static, with no treatment of dynamics or of the path over time. " +
      "1 mark: states a genuine defence — it captures the interaction of the goods and money " +
      "markets with two curves, which is remarkably economical. 1 mark: adds that its predictions " +
      "about the direction of policy effects survive in richer New Keynesian models, so it is a " +
      "reliable first approximation rather than a discarded one.",
    modelAnswer: "Three limitations stand out. The price level is held fixed, so the framework " +
      "cannot say anything about inflation — which is most of what monetary policy is about. " +
      "Expectations are essentially absent, yet the expected path of future policy is the main " +
      "channel through which central banks now operate, as forward guidance makes obvious. And it " +
      "takes the money supply as the policy instrument, when in practice every major central bank " +
      "sets an interest rate and lets the quantity of money be whatever it turns out to be, which " +
      "makes the LM curve's role somewhat artificial. One could add the Lucas critique: the " +
      "relationships are not derived from optimising behaviour, so they may not be stable under " +
      "the policy changes one wants to use them to analyse. It survives anyway because of what it " +
      "buys for the price. Two curves capture the interaction between the goods market and the " +
      "money market, deliver the direction of every major policy effect, and make the logic of " +
      "crowding out and of the liquidity trap visible in a way no system of equations does for a " +
      "student seeing it for the first time. Its directional predictions largely agree with the " +
      "New Keynesian models that superseded it, which is the test that matters: it is a reliable " +
      "first approximation, and it is taught as one rather than as the frontier." },

  /* ===================== CHAPTER 17 ===================== */
  { id: "ch17_w_rules_vs_discretion", chapter: 17, difficulty: "hard", points: 6,
    concept: "rules versus discretion",
    prompt: "In 6–10 sentences, set out the case for conducting monetary policy by a rule such " +
      "as the Taylor rule, the case for discretion, and explain how inflation targeting attempts " +
      "to resolve the tension.",
    rubric: "6 marks total. 1 mark: the case for rules begins with time inconsistency — " +
      "discretion invites surprise inflation, which the public anticipates. 1 mark: rules deliver " +
      "predictability, so private agents can plan and expectations stay anchored. 1 mark: the case " +
      "for discretion — no rule anticipates every shock, and a financial crisis or pandemic " +
      "requires responses no formula contains. 1 mark: notes that a rule depends on unobservable " +
      "inputs — potential output and the natural rate — so mechanical application can " +
      "itself be a source of error. 1 mark: explains inflation targeting as constrained discretion " +
      "— a fixed, publicly announced objective with freedom over the means and the horizon. " +
      "1 mark: identifies the mechanism that makes it work — transparency and accountability " +
      "substitute for mechanical commitment, so expectations stay anchored while the bank retains " +
      "flexibility.",
    modelAnswer: "The case for rules starts from time inconsistency. A bank with full discretion " +
      "always has a short-run incentive to deliver a little surprise inflation for a little extra " +
      "output, the public anticipates this, and the economy ends up with higher inflation and no " +
      "output gain. A rule removes the temptation, and the predictability it buys is valuable in " +
      "itself: firms and households can plan, and inflation expectations stay anchored, which " +
      "makes the bank's job easier in every subsequent period. The case for discretion is that no " +
      "formula anticipates the world. A financial system seizing up in 2008 or an economy closing " +
      "in 2020 calls for responses no Taylor rule contains, and a bank bound to the rule would " +
      "have been dangerously passive. There is also a quieter problem: the rule's inputs — " +
      "potential output and the neutral real rate — are unobservable and estimated with large " +
      "error, so mechanically following it can inject error rather than remove it. Inflation " +
      "targeting is the compromise, and it works by fixing the end while freeing the means. The " +
      "target is public, numerical and politically sanctioned, which is what anchors expectations; " +
      "the bank chooses how and over what horizon to get there, which is what preserves the " +
      "flexibility to handle shocks the target's authors never imagined. Accountability replaces " +
      "mechanical commitment: the bank must explain deviations publicly, and the cost of an " +
      "unconvincing explanation is what disciplines it. That is why the arrangement is usually " +
      "called constrained discretion rather than a rule." },

  { id: "ch17_w_transmission_lags", chapter: 17, difficulty: "med", points: 5,
    concept: "policy lags",
    prompt: "In 5–8 sentences, identify the distinct lags between an economic shock and the " +
      "full effect of the monetary policy response, and explain why these lags make " +
      "fine-tuning dangerous.",
    rubric: "5 marks total. 1 mark: recognition lag — data arrive with a delay and are " +
      "revised, so the shock is identified late. 1 mark: decision or implementation lag — " +
      "committees meet on a schedule, though this is short for monetary policy. 1 mark: " +
      "transmission or impact lag — the famous long and variable lag of roughly a year to " +
      "eighteen months before the main effect on output and inflation. 1 mark: explains the " +
      "consequence — policy aimed at today's conditions lands on an economy that has already " +
      "moved. 1 mark: states the specific danger — policy can become procyclical, amplifying " +
      "the cycle it was meant to damp, which is the core argument for rules or for forecast-based " +
      "policy rather than reacting to current data.",
    modelAnswer: "There are three. The recognition lag comes first: GDP data appear with a " +
      "quarter's delay and are substantially revised afterwards, so a turning point is often " +
      "identified months after it occurred — recessions have repeatedly been dated only in " +
      "retrospect. The decision lag follows, though for monetary policy it is short, since " +
      "committees meet every few weeks and can act between meetings. The transmission lag is the " +
      "serious one: a rate change works through borrowing costs, investment decisions, housing and " +
      "the exchange rate, and the bulk of its effect on output and inflation arrives roughly a " +
      "year to eighteen months later, with considerable variation. The consequence is that policy " +
      "set in response to current conditions lands on an economy that has already changed. If a " +
      "bank tightens into a slowdown it has not yet recognised, the tightening arrives as the " +
      "economy is already contracting, deepening the downturn rather than damping it. Policy " +
      "becomes procyclical — a source of fluctuations instead of a cure — which is the " +
      "strongest practical argument for acting on forecasts rather than current data, and for " +
      "being wary of fine-tuning at all." },

  { id: "ch17_w_zero_lower_bound", chapter: 17, difficulty: "med", points: 5,
    concept: "unconventional monetary policy",
    prompt: "In 5–8 sentences, explain what constrains a central bank at the zero lower bound, " +
      "and explain how quantitative easing and forward guidance are each supposed to work around " +
      "it.",
    rubric: "5 marks total. 1 mark: explains the constraint — nominal rates cannot fall far " +
      "below zero because holding cash is an alternative that pays zero. 1 mark: notes that the " +
      "real rate may still be too high if inflation is low or negative, so policy is tighter than " +
      "intended exactly when ease is needed. 1 mark: explains QE — buying longer-term assets " +
      "to compress long-term yields and term premia when the short rate can go no lower. 1 mark: " +
      "explains forward guidance — committing to keep short rates low for longer, which " +
      "lowers today's long rates because long rates reflect expected future short rates. 1 mark: " +
      "identifies the credibility problem common to both — guidance works only if the promise " +
      "is believed, and the bank will be tempted to renege once recovery arrives.",
    modelAnswer: "The constraint is that nominal interest rates cannot be pushed far below zero, " +
      "because anyone facing a sufficiently negative rate can hold physical cash instead, which " +
      "pays zero. The bind is worse than it looks, because what matters for spending is the real " +
      "rate: if inflation is near zero or negative, the real rate is stuck at a positive level " +
      "even with the nominal rate at the floor, so policy is effectively tight precisely when the " +
      "economy most needs ease. Quantitative easing works around the short rate by operating on " +
      "longer maturities: the bank buys long-term government bonds and other assets, bidding up " +
      "their prices and compressing yields and term premia, which lowers the borrowing costs that " +
      "actually govern mortgages and corporate investment. Forward guidance works on expectations " +
      "instead. A long rate is approximately the average of expected future short rates, so a " +
      "credible commitment to keep rates low well into the recovery lowers long rates today " +
      "without any purchase at all. Both depend on credibility, and forward guidance depends on it " +
      "entirely — the promise is to do something the bank will want to break once inflation " +
      "returns, and everyone knows it, which is why banks tie guidance to explicit thresholds " +
      "rather than dates." },

  { id: "ch17_w_inflation_target_level", chapter: 17, difficulty: "hard", points: 5,
    concept: "the choice of inflation target",
    prompt: "Most central banks target 2% inflation rather than zero. In 5–9 sentences, give " +
      "the reasons for a positive target, and give the argument that it should now be higher.",
    rubric: "5 marks total. 1 mark: measurement bias — indices overstate inflation, so " +
      "measured 2% is nearer true price stability. 1 mark: downward nominal wage rigidity — " +
      "positive inflation allows real wages to adjust downward without nominal cuts, greasing the " +
      "labour market. 1 mark: room above the zero lower bound — a positive target means " +
      "higher average nominal rates, leaving more room to cut in a recession. 1 mark: deflation " +
      "insurance — a buffer against falling into a deflationary spiral where real debt " +
      "burdens rise. 1 mark: the argument for raising it — the neutral real rate has fallen " +
      "substantially, so a 2% target leaves too little conventional policy space, and a 3–4% " +
      "target would restore it; credit a mention of the cost, namely that moving the target risks " +
      "the credibility that anchors expectations.",
    modelAnswer: "Four reasons support a positive target. Price indices overstate true inflation " +
      "by perhaps half a point to a point, so measured 2% is closer to genuine price stability " +
      "than zero would be. Nominal wages are rigid downward, and mild inflation lets real wages " +
      "fall where they need to without any employer having to cut a nominal wage, which " +
      "substantially eases labour-market adjustment. A positive target means higher average " +
      "nominal interest rates, which leaves the central bank more room to cut before hitting the " +
      "zero bound. And it provides insurance against deflation, which is dangerous because falling " +
      "prices raise the real value of debts and can become self-reinforcing. The case for raising " +
      "the target rests on the first of those reasons having weakened. The neutral real interest " +
      "rate has fallen by several points over three decades, so the average nominal rate under a " +
      "2% target is now low enough that recessions regularly drive policy to the floor — " +
      "which is exactly what happened after 2008 and again in 2020. A 3 or 4% target would restore " +
      "the conventional policy space that 2% used to provide. The objection is not economic but " +
      "institutional: the target's power comes from being believed, and a bank that raises its " +
      "target when it finds the current one inconvenient invites the question of what it will do " +
      "next time." },

  /* ===================== CHAPTER 18 ===================== */
  { id: "ch18_w_automatic_stabilizers", chapter: 18, difficulty: "med", points: 5,
    concept: "automatic stabilisers",
    prompt: "In 5–8 sentences, explain what automatic stabilisers are, give two examples and " +
      "how each works, and explain why many economists prefer them to discretionary stimulus.",
    rubric: "5 marks total. 1 mark: defines automatic stabilisers as features of the budget that " +
      "move countercyclically without any new decision. 2 marks for two examples with mechanisms, " +
      "one each: progressive income tax (liabilities fall more than proportionally in a downturn, " +
      "cushioning disposable income); unemployment insurance (payments rise automatically as " +
      "joblessness rises, supporting spending); means-tested transfers; corporate taxes on profits. " +
      "1 mark: identifies the timing advantage — no recognition, legislative or " +
      "implementation lag, so support arrives immediately. 1 mark: identifies a second advantage " +
      "— they are symmetric and self-reversing, withdrawing support automatically as the " +
      "economy recovers, so they do not leave a structural deficit behind, and they are free of " +
      "political bargaining.",
    modelAnswer: "Automatic stabilisers are features of the tax and transfer system that damp the " +
      "business cycle without anyone deciding anything. A progressive income tax is the clearest " +
      "case: when incomes fall in a recession, tax liabilities fall more than proportionally, so " +
      "disposable income falls by less than pre-tax income and consumption is cushioned. " +
      "Unemployment insurance is the other standard example: payments rise automatically as " +
      "joblessness rises, putting money into the hands of exactly the households most likely to " +
      "spend it. The preference for them over discretionary packages rests on two things. First, " +
      "timing: they have no recognition lag, no legislative lag and no implementation lag, so " +
      "support arrives at the moment incomes fall rather than a year later when the recession may " +
      "be over. Second, symmetry: they withdraw themselves automatically as the economy recovers, " +
      "so they do not leave a structural deficit behind and do not require a second political " +
      "fight to unwind. They are also immune to the bargaining that attaches unrelated spending to " +
      "a stimulus bill. The limitation is that they damp the cycle rather than reversing it, so a " +
      "sufficiently deep recession still calls for discretionary action." },

  { id: "ch18_w_hard_debt_sustainability", chapter: 18, difficulty: "hard", points: 6,
    concept: "debt sustainability",
    prompt: "“Government debt above 90% of GDP is dangerous.” In 6–10 sentences, " +
      "explain what actually determines whether a debt level is sustainable, and explain why a " +
      "single threshold is the wrong way to think about it.",
    rubric: "6 marks total. 1 mark: states the key relationship — the debt ratio's dynamics " +
      "depend on the gap between the interest rate on the debt and the growth rate of GDP (r − " +
      "g), together with the primary balance. 1 mark: explains that when g exceeds r, the ratio " +
      "falls even with a primary deficit. 1 mark: identifies currency denomination as decisive " +
      "— a government borrowing in its own currency cannot be forced into involuntary " +
      "default, unlike one borrowing in foreign currency or within a currency union. 1 mark: " +
      "identifies maturity structure and the investor base — long maturities and domestic " +
      "holders reduce rollover risk. 1 mark: notes institutional credibility and the capacity to " +
      "raise taxes. 1 mark: explains why a threshold misleads — Japan sustains well over " +
      "200% while others have defaulted below 60%; and the famous 90% result did not survive " +
      "scrutiny, with the causal direction plausibly running from slow growth to high debt.",
    modelAnswer: "What governs a debt ratio is not its level but its dynamics, and those turn on " +
      "the gap between the average interest rate on the debt and the growth rate of nominal GDP. " +
      "When growth exceeds the interest rate, the ratio declines on its own even if the government " +
      "runs a modest primary deficit, because the denominator grows faster than the numerator; " +
      "when the interest rate exceeds growth, stabilising the ratio requires a primary surplus, " +
      "and a larger one the higher the debt. Several structural features then decide how much risk " +
      "accompanies any given level. Currency denomination matters most: a government that borrows " +
      "in a currency it issues can always meet nominal obligations, so its risk is inflation " +
      "rather than default, whereas one borrowing in foreign currency or inside a currency union " +
      "genuinely can be forced to default — which is the difference between Japan and Greece. " +
      "Maturity structure and the investor base matter too: long average maturities and " +
      "predominantly domestic holders reduce the risk of a failed rollover. So does the credibility " +
      "of the institutions and the demonstrated ability to raise taxes when needed. A single " +
      "threshold ignores all of this. Japan has carried well over 200% of GDP for years at " +
      "negligible interest cost, while emerging markets have defaulted below 60%. The specific 90% " +
      "figure came from a study whose result did not survive replication, and even on its own " +
      "terms the correlation it reported is at least as consistent with slow growth causing high " +
      "debt as the reverse." },

  { id: "ch18_w_multiplier_variation", chapter: 18, difficulty: "hard", points: 5,
    concept: "the size of the fiscal multiplier",
    prompt: "Empirical estimates of the fiscal multiplier range from below 0.5 to above 2. In " +
      "5–9 sentences, explain what conditions push it toward the low end and what push it " +
      "toward the high end, and explain why this makes a single “correct” multiplier the " +
      "wrong thing to look for.",
    rubric: "5 marks total. 2 marks for low-end conditions, one each from: economy near full " +
      "employment, so resources are bid away; a central bank that offsets the stimulus by raising " +
      "rates; a small open economy where much of the spending leaks into imports; high public debt " +
      "prompting Ricardian saving behaviour; tax cuts to high-income households with low marginal " +
      "propensity to consume. 2 marks for high-end conditions, one each from: deep recession with " +
      "idle resources; policy rate at the zero lower bound so no monetary offset; spending " +
      "targeted at liquidity-constrained households; direct government purchases rather than tax " +
      "cuts. 1 mark: draws the conclusion — the multiplier is a state-dependent parameter, " +
      "not a constant, so the right question is what it is in THESE circumstances.",
    modelAnswer: "The multiplier is small when the economy has little slack, because public " +
      "spending then has to bid resources away from private users rather than draw idle ones into " +
      "use; when the central bank responds by raising interest rates, since it is deliberately " +
      "offsetting the stimulus; and when the economy is small and open, so a large share of the " +
      "new spending leaks abroad as imports and stimulates someone else's economy. Tax cuts " +
      "directed at high-income households are also weak, because their marginal propensity to " +
      "consume is low and much of the cut is saved. It is large in the opposite configuration: a " +
      "deep recession with unemployed workers and idle capacity, a central bank pinned at the zero " +
      "lower bound so that no monetary offset occurs, and spending directed at " +
      "liquidity-constrained households who spend essentially all of it. Direct government " +
      "purchases beat tax cuts for the same reason — none of the first round is saved. The " +
      "range in the literature is therefore not a sign that economists cannot measure the thing; " +
      "it is the finding. The multiplier is state-dependent, and asking for its true value is like " +
      "asking for the true elasticity of demand without naming a good or a horizon. The useful " +
      "question is always what it is in these circumstances, with this monetary regime and this " +
      "much slack." },

  { id: "ch18_w_fiscal_timing", chapter: 18, difficulty: "med", points: 4,
    concept: "the practical difficulty of fiscal stimulus",
    prompt: "In 4–7 sentences, explain why discretionary fiscal stimulus is harder to time " +
      "well than monetary policy, and explain what kind of spending is least affected by that " +
      "problem.",
    rubric: "4 marks total. 1 mark: identifies the legislative lag — fiscal policy requires " +
      "passing a law, which involves negotiation and delay a central bank does not face. 1 mark: " +
      "identifies the implementation lag — infrastructure in particular takes years from " +
      "authorisation to spending, so money arrives after the recession. 1 mark: notes the " +
      "political-economy problem — stimulus bills accumulate unrelated spending, and " +
      "programmes are hard to withdraw once the recovery arrives. 1 mark: identifies what avoids " +
      "the problem — transfers through existing channels (unemployment insurance extensions, " +
      "direct payments) and automatic stabilisers, because the delivery machinery already exists.",
    modelAnswer: "Monetary policy can change at a meeting; fiscal policy requires legislation, and " +
      "that means negotiation, amendment and delay before anything is authorised at all. Then " +
      "comes the implementation lag, which for capital spending is severe — infrastructure " +
      "projects need design, permitting and procurement, so money authorised during a recession is " +
      "frequently disbursed during the recovery, when it is procyclical rather than stabilising. " +
      "There is also a political-economy problem in both directions: stimulus bills attract " +
      "unrelated spending because they are vehicles that will pass, and programmes created in a " +
      "downturn acquire constituencies that resist their withdrawal afterwards. What largely " +
      "escapes these problems is spending that flows through machinery already built — " +
      "extending unemployment insurance, increasing existing transfer payments, or sending direct " +
      "payments through the tax system, all of which can reach households within weeks. That is " +
      "the same reasoning that favours automatic stabilisers, which have no lag at all because no " +
      "decision is required." }

  ];

  var out = [];
  for (var i = 0; i < W.length; i++) {
    var w = W[i];
    if (!w.rubric || w.rubric.length < 60) {
      throw new Error("ma-generators-g.js: " + w.id + " has no usable rubric");
    }
    out.push({
      id: w.id, chapter: w.chapter, kind: "short", render: "text",
      difficulty: w.difficulty, concept: w.concept, points: w.points,
      prompt: w.prompt, rubric: w.rubric, modelAnswer: w.modelAnswer,
      rationale: w.modelAnswer
    });
  }

  var conflicts = MA.register(null, out);
  if (conflicts && conflicts.length) {
    throw new Error("ma-generators-g.js: duplicate ids: " + conflicts.join(", "));
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
