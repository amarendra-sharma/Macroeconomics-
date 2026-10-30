/* ============================================================================
   ma-generators-f.js  —  WRITTEN (free-response) items for the Applied
   Macroeconomics exam bank.

   WHY THIS FILE EXISTS
   The 204 original generators held 23 written items — about one per chapter,
   not enough to set an essay section without repeating across a midterm and a
   final. This file adds four per chapter.

   HOW WRITTEN ITEMS ARE GRADED
   MAGenerators.grade() returns { needsAI: true } for kind:"short" — there is no
   seed-computable answer — and the ma-ai-grade edge function then scores the
   submission against this item's RUBRIC and hands the instructor a proposed
   mark and comment to accept or override. That function REFUSES to grade an
   item whose rubric is under 40 characters, on the reasoning that a score with
   nothing to score against is invented. So every rubric here is written as a
   real marking scheme: the specific things an answer must contain, worth
   specific marks, in the order an examiner would look for them.

   The `modelAnswer` field is for the instructor's eye and for the Grade Written
   panel. It is deliberately NOT what the AI marks against — a model answer
   invites marking by similarity, which punishes a different but correct route
   through the question. The rubric names the economics; the model answer shows
   one way of getting there.

   These are STATIC items: a written prompt does not benefit from being
   re-randomised, and a fixed prompt is what makes a rubric defensible.

   Safari-safe: var, function declarations, string concatenation only.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register) {
    throw new Error("ma-generators-f.js: load ma-generators.js first");
  }

  /* Each row: [id, chapter, difficulty, points, concept, prompt, rubric, modelAnswer] */
  var W = [

  /* ===================== CHAPTER 1 ===================== */
  { id: "ch1_w_scarcity_choice", chapter: 1, difficulty: "easy", points: 4,
    concept: "scarcity and trade-offs",
    prompt: "A university announces that parking on campus will now be free for all staff and " +
      "students. In 4–6 sentences, explain why this does not eliminate the cost of parking, " +
      "and identify who ends up paying it and in what form.",
    rubric: "4 marks total. 1 mark: states that free-at-the-point-of-use does not remove scarcity " +
      "— spaces remain limited. 1 mark: identifies that price is no longer doing the " +
      "rationing, so some other mechanism must (queueing, circling, arriving early, permits, " +
      "congestion). 1 mark: names the real cost borne by users — time spent searching, which " +
      "is an opportunity cost rather than a money cost. 1 mark: identifies who else pays — the " +
      "university bears construction and maintenance, funded from fees or other budget lines, so " +
      "the cost is shifted rather than removed. Do not award credit for merely asserting “there " +
      "is no free lunch” without naming a mechanism.",
    modelAnswer: "Spaces are scarce whether or not a price is charged, so the question is only how " +
      "they are rationed. With a zero price, quantity demanded exceeds the number of spaces and " +
      "rationing shifts from money to time: drivers circle, arrive earlier than they would like, " +
      "or walk from further away. That time is a genuine opportunity cost, and unlike a parking " +
      "fee it generates no revenue for anyone — it is dissipated. Meanwhile the university " +
      "still pays to build, light and maintain the lots, funded out of fees or forgone spending " +
      "elsewhere. The policy therefore changes who pays and in what currency, not whether the " +
      "cost exists." },

  { id: "ch1_w_marginal_thinking", chapter: 1, difficulty: "med", points: 5,
    concept: "marginal analysis",
    prompt: "An airline has sold 180 of the 200 seats on a flight that is about to depart. The " +
      "average cost per passenger, calculated by dividing the flight's total cost by 180, is " +
      "$240. A standby passenger offers $90. In 5–8 sentences, explain whether the airline " +
      "should accept, and explain what is wrong with the reasoning that “$90 is below our " +
      "$240 cost”.",
    rubric: "5 marks total. 1 mark: identifies that the decision is marginal, not average. 1 mark: " +
      "identifies the relevant marginal cost — the extra fuel, meal and handling for one more " +
      "passenger, typically a few dollars — because the aircraft, crew and gate are already " +
      "committed. 1 mark: concludes the airline should accept, since $90 exceeds that marginal " +
      "cost. 1 mark: diagnoses the error — the $240 average includes costs that are sunk and " +
      "therefore irrelevant to this decision. 1 mark: notes a sensible limit — the logic " +
      "applies to the last seat at departure, not as a pricing policy, since selling every seat " +
      "this way would not cover the committed costs and would also cannibalise full-fare demand. " +
      "Award the fifth mark only for a stated limit, not for repeating the main argument.",
    modelAnswer: "The costs in the $240 figure are almost entirely committed: the aircraft will " +
      "fly, the crew is paid and the gate is booked whether or not the standby passenger boards. " +
      "The right comparison is the revenue against the MARGINAL cost of carrying one more person " +
      "— a little extra fuel for the added weight, a meal, some handling — which is on " +
      "the order of a few dollars. Since $90 comfortably exceeds that, accepting raises profit by " +
      "roughly $85. The $240 reasoning commits the sunk-cost fallacy: it averages in costs that " +
      "cannot be changed by this decision and so should not influence it. The limit matters " +
      "though. This is an argument about the last seat minutes before departure, not a pricing " +
      "rule; if the airline advertised $90 fares it would not recover its committed costs, and " +
      "passengers who would have paid full fare would simply wait for the cheap seat." },

  { id: "ch1_w_hard_incentive_backfire", chapter: 1, difficulty: "hard", points: 6,
    concept: "unintended consequences of incentives",
    prompt: "A city, wanting to reduce the number of rats, offers a bounty for every rat tail " +
      "handed in. Within a year the rat population has grown. In 6–10 sentences, explain the " +
      "mechanism, identify the general principle it illustrates, and propose a policy design that " +
      "would not fail in the same way.",
    rubric: "6 marks total. 2 marks: explains the mechanism — the bounty rewards the " +
      "PRODUCTION of tails, not the reduction of rats, so people breed rats, or dock tails and " +
      "release the animal to breed again. 1 mark: names the general principle — people " +
      "respond to the incentive as written rather than the outcome intended; a proxy that can be " +
      "manufactured will be. 1 mark: connects to the measurement problem — the policy pays on " +
      "an indicator rather than the objective (Goodhart's law, or equivalent in the student's own " +
      "words; the name is not required). 2 marks: proposes a design that resists gaming and says " +
      "WHY — for example paying for verified whole carcasses, paying contractors on audited " +
      "population surveys, or attacking the cause by funding refuse containment, with a sentence " +
      "on why that target is harder to manufacture. Do not award the final 2 marks for a proposal " +
      "stated without justification.",
    modelAnswer: "The bounty pays for tails, and a tail is not a dead rat. Residents quickly " +
      "noticed that a live rat produces one tail now and more rats later, so the profitable " +
      "strategy was to dock tails and release the animals, or to breed rats deliberately. The " +
      "policy therefore subsidised exactly the activity it meant to suppress. The general " +
      "principle is that incentives attach to the measured proxy, not to the objective: once a " +
      "measure becomes a target it stops being a good measure, because effort flows into " +
      "producing the measure. A better design makes the proxy expensive to manufacture or removes " +
      "the proxy altogether. Paying only for verified whole carcasses raises the cost of faking " +
      "but still rewards breeding. Contracting pest-control firms against independently audited " +
      "population surveys ties payment to the outcome itself. Best of all is attacking the " +
      "binding constraint — funding sealed refuse containers removes the food supply, and " +
      "nobody can manufacture a reduction in the food supply for private gain." },

  { id: "ch1_w_hard_models", chapter: 1, difficulty: "hard", points: 5,
    concept: "the role of assumptions in models",
    prompt: "“Economic models assume people are rational and perfectly informed, which is " +
      "obviously false, so the models are worthless.” In 6–9 sentences, evaluate this " +
      "claim. Your answer should take the objection seriously rather than dismiss it.",
    rubric: "5 marks total. 1 mark: accepts the factual premise — the assumptions are indeed " +
      "literally false. 1 mark: explains what assumptions are FOR — a model is a deliberate " +
      "simplification, and a map that reproduced every detail would be useless. 1 mark: states the " +
      "right test — whether the model predicts and explains well for the question at hand, " +
      "not whether its assumptions are realistic. 1 mark: concedes the objection has force where " +
      "it has force — names at least one domain where the rationality assumption measurably " +
      "fails and changes the conclusion (retirement saving, default options, addiction, asset " +
      "bubbles). 1 mark: reaches a proportionate conclusion — the assumption is a tool to be " +
      "tested question by question, not a creed to defend or discard wholesale. Full marks require " +
      "the concession; an answer that only defends models earns at most 3.",
    modelAnswer: "The premise is correct: nobody is perfectly informed and real choices depart " +
      "systematically from the textbook optimum. But the inference does not follow, because " +
      "assumptions in a model are not claims about the world, they are simplifications chosen to " +
      "isolate a mechanism. A map that showed every pebble would be unusable; the question is " +
      "whether it gets you where you are going. The right test of a model is therefore predictive " +
      "and explanatory performance on the question asked. For many questions — how a tax " +
      "changes quantities, how firms respond to input prices — the rationality assumption is " +
      "close enough that the predictions hold up well. For others it clearly is not: default " +
      "enrolment transforms retirement saving in a way no fully informed optimiser would allow, " +
      "and asset bubbles are hard to tell as a story about perfectly informed agents. The honest " +
      "position is that the assumption earns its place question by question. Behavioural " +
      "economics did not refute the framework; it mapped where the approximation breaks and " +
      "supplied better assumptions there." },

  /* ===================== CHAPTER 2 ===================== */
  { id: "ch2_w_positive_normative", chapter: 2, difficulty: "easy", points: 4,
    concept: "positive versus normative",
    prompt: "Classify each statement as positive or normative, and justify each classification in " +
      "one sentence. (a) “A $15 minimum wage would reduce teenage employment by about 2%.” " +
      "(b) “The minimum wage ought to be set high enough to live on.” (c) “Inflation " +
      "last year was 3.1%.” (d) “Reducing inflation matters more than reducing " +
      "unemployment.”",
    rubric: "4 marks, one per statement, awarded only when the classification AND a correct " +
      "justification are both present. (a) positive — a testable claim about what would " +
      "happen, true or false independently of anyone's values. (b) normative — contains " +
      "“ought”, prescribes a goal, cannot be settled by data. (c) positive — a " +
      "statement of measured fact. (d) normative — ranks two objectives, which requires a " +
      "value judgment about whose welfare counts and how much. Award no mark where the label is " +
      "right but the justification merely restates the statement.",
    modelAnswer: "(a) Positive. It predicts a magnitude that evidence could confirm or refute, " +
      "whatever one thinks of the policy. (b) Normative. “Ought” prescribes a goal, and " +
      "no amount of data settles whether that goal should be pursued. (c) Positive. It reports a " +
      "measurement, and disagreement about it is disagreement about facts or method. (d) " +
      "Normative. Ranking inflation against unemployment requires a judgment about whose losses " +
      "matter more — savers and creditors against the unemployed — which is a question " +
      "of values, even though the trade-off itself is a positive matter." },

  { id: "ch2_w_correlation_causation", chapter: 2, difficulty: "med", points: 5,
    concept: "causal inference",
    prompt: "A study finds that cities with more police officers per resident have higher crime " +
      "rates. A commentator concludes that hiring police causes crime. In 5–8 sentences, " +
      "explain what is wrong with the inference and describe one research design that would give " +
      "a more credible answer.",
    rubric: "5 marks total. 1 mark: identifies reverse causation — cities hire more police " +
      "BECAUSE crime is high. 1 mark: identifies omitted variables — population density, " +
      "poverty, age structure drive both. 1 mark: states the counterfactual explicitly — the " +
      "question is what crime in a given city would have been with fewer officers, which the " +
      "cross-city comparison does not answer. 2 marks: describes a design that addresses it and " +
      "says why — for example exploiting a policing surge driven by something unrelated to " +
      "local crime (a terror alert, a federal grant formula, an election-timed hiring rule), a " +
      "difference-in-differences comparison, or a randomised patrol experiment, with a sentence on " +
      "why that source of variation is plausibly independent of local crime. A named method " +
      "without that sentence earns 1 of the 2.",
    modelAnswer: "The correlation is real but the causal arrow is almost certainly reversed: city " +
      "councils respond to crime by hiring officers, so high-crime cities end up with large " +
      "forces. On top of that, both variables are driven by common factors — density, " +
      "poverty, the share of young men — which no simple cross-city comparison holds fixed. " +
      "The question we actually want answered is counterfactual: given this city, with these " +
      "conditions, what would crime have been with fewer officers? Comparing different cities " +
      "cannot answer it. A credible design needs variation in police numbers that is unrelated to " +
      "local crime conditions. One well-known approach uses terror-alert levels that move police " +
      "deployment in a city for reasons having nothing to do with ordinary crime, and compares " +
      "crime on high-alert and normal days. A randomised experiment assigning extra patrols to " +
      "some beats and not others is cleaner still, because assignment is independent of local " +
      "conditions by construction." },

  { id: "ch2_w_hard_disagreement", chapter: 2, difficulty: "hard", points: 5,
    concept: "why economists disagree",
    prompt: "Two economists with the same data disagree about whether a carbon tax should be " +
      "raised. In 6–9 sentences, set out the distinct kinds of disagreement that could be " +
      "producing this, and explain which kinds evidence could in principle resolve and which it " +
      "could not.",
    rubric: "5 marks total. 1 mark: positive disagreement about magnitudes — the elasticity " +
      "of emissions to price, the damage function, the pass-through to households. 1 mark: " +
      "disagreement about the model itself, not just its parameters — competing theories " +
      "that fit the same data. 1 mark: normative disagreement about values — how to weigh " +
      "future generations against the present (the discount rate), or domestic costs against " +
      "global benefits. 1 mark: distinguishes which kinds evidence can settle — the positive " +
      "ones in principle, given enough data and identification; the normative ones not at all. " +
      "1 mark: makes the sharper point that the discount rate is partly an ethical parameter " +
      "dressed as a technical one, so a dispute that looks empirical can be normative underneath. " +
      "The fifth mark is for that observation specifically.",
    modelAnswer: "Three different things could be going on. First, they may disagree about " +
      "magnitudes within a shared framework: how much emissions fall per dollar of tax, how large " +
      "the damages from a tonne of carbon are, how much of the tax lands on low-income households. " +
      "These are positive questions, and better data and better identification can in principle " +
      "narrow them, though the damage estimates run out a century and resist clean measurement. " +
      "Second, they may hold different models — one treating technological response as " +
      "strongly price-elastic, the other not — and the available data may be consistent with " +
      "both. Third, and least tractable, they may differ on values: how much weight the welfare of " +
      "people a century from now should carry against costs borne today. Evidence cannot settle " +
      "that, because it is not a claim about the world. The subtle point is that the third " +
      "disagreement often hides inside the first. The discount rate enters the calculation as a " +
      "technical parameter, but choosing it is substantially an ethical act, which is why the " +
      "Stern and Nordhaus estimates differ so sharply while agreeing on much of the science." },

  { id: "ch2_w_data_claim", chapter: 2, difficulty: "med", points: 4,
    concept: "reading an empirical claim",
    prompt: "A newspaper reports: “Countries that adopted austerity after 2010 grew more " +
      "slowly, proving austerity does not work.” In 4–7 sentences, identify the three " +
      "weakest links in this claim as evidence, without taking a position on austerity itself.",
    rubric: "4 marks total. 1 mark: selection — countries adopted austerity BECAUSE they were " +
      "in fiscal trouble, so the treated group was already in worse shape. 1 mark: no " +
      "counterfactual — the comparison needs what those countries would have done otherwise, " +
      "not what other countries did. 1 mark: definition and measurement — “austere” " +
      "is not a sharp category, and results depend heavily on whether it is measured by spending " +
      "cuts, tax rises or the cyclically adjusted balance. 1 mark: maintains the requested " +
      "neutrality — the answer criticises the inference, not the policy. An answer that " +
      "argues against austerity on the merits forfeits this mark however well argued.",
    modelAnswer: "First, selection: the countries that turned to austerity were overwhelmingly the " +
      "ones already facing debt crises and collapsing output, so the comparison group was never " +
      "comparable. Second, the absent counterfactual: the claim needs an estimate of what those " +
      "same economies would have done under a different fiscal path, and the growth of unlike " +
      "countries is a poor stand-in. Third, measurement: “austerity” is not a crisp " +
      "treatment, and conclusions shift depending on whether it is measured by headline spending " +
      "cuts, by tax increases, or by the change in the cyclically adjusted primary balance — " +
      "a distinction that has driven much of the published disagreement. None of this shows " +
      "austerity worked; it shows this particular comparison cannot establish that it did not." },

  /* ===================== CHAPTER 3 ===================== */
  { id: "ch3_w_comparative_advantage", chapter: 3, difficulty: "easy", points: 4,
    concept: "comparative advantage",
    prompt: "A surgeon is also the fastest typist in her town. In 4–6 sentences, explain why " +
      "she should still hire a secretary, and state precisely which kind of advantage decides the " +
      "question.",
    rubric: "4 marks total. 1 mark: identifies that she has an ABSOLUTE advantage in both tasks. " +
      "1 mark: identifies that COMPARATIVE advantage — lower opportunity cost — is what " +
      "governs specialisation. 1 mark: states her opportunity cost of typing correctly — the " +
      "surgery forgone during that hour, which is very large. 1 mark: concludes that the secretary " +
      "has the lower opportunity cost of typing and so should type, and that both parties are " +
      "better off. Award no credit for “she is too busy” without the opportunity-cost " +
      "reasoning behind it.",
    modelAnswer: "She has an absolute advantage in both activities — she is better at surgery " +
      "and better at typing — but absolute advantage is not what decides who should do what. " +
      "What matters is opportunity cost. An hour she spends typing is an hour not spent operating, " +
      "and the value of the forgone surgery is enormous. The secretary gives up far less valuable " +
      "alternative work to type the same hour, so the secretary is the lower-opportunity-cost " +
      "typist and should do the typing. Both are better off: she buys back her most valuable hours " +
      "and the secretary earns more than their next-best alternative. The same logic is why a " +
      "country that is more productive at everything still gains from importing." },

  { id: "ch3_w_trade_losers", chapter: 3, difficulty: "med", points: 5,
    concept: "distribution of gains from trade",
    prompt: "“If trade makes a country better off overall, anyone who opposes it must be " +
      "mistaken about the economics.” In 5–8 sentences, explain why this does not follow, " +
      "and what the correct response to trade-related losses is.",
    rubric: "5 marks total. 1 mark: distinguishes aggregate gains from the distribution of them. " +
      "1 mark: states that the standard result is that winners' gains exceed losers' losses, not " +
      "that there are no losers. 1 mark: identifies the asymmetry that drives the politics — " +
      "concentrated losses, dispersed gains. 1 mark: notes that compensation is theoretically " +
      "available but in practice usually not paid, so the potential Pareto improvement does not " +
      "become an actual one. 1 mark: draws the right conclusion — opposition can be entirely " +
      "rational for those bearing the losses, so the policy question is adjustment and " +
      "compensation rather than whether the losers have misunderstood.",
    modelAnswer: "The aggregate result and the distributional one are different claims. Trade " +
      "raises total surplus, which means the gains to winners exceed the losses to losers — " +
      "it does not mean nobody loses. Workers and firms in import-competing industries face real, " +
      "concentrated, often permanent losses, particularly where the skills are specific and the " +
      "region has few alternative employers. The gains, by contrast, are spread thinly across " +
      "millions of consumers paying a little less. That asymmetry explains the politics " +
      "completely: the losers know who they are and organise, while most winners never notice. " +
      "Compensation would in principle let the winners pay the losers and leave everyone better " +
      "off, but in practice adjustment assistance has been small and poorly targeted, so the " +
      "potential improvement stays potential. Someone whose plant closed is not confused about the " +
      "economics; they are correctly describing their own position, and the right response is to " +
      "make the compensation real rather than to explain the aggregate to them again." },

  { id: "ch3_w_hard_tariff_welfare", chapter: 3, difficulty: "hard", points: 6,
    concept: "tariff welfare analysis",
    prompt: "A country imposes a tariff on imported steel. In 6–10 sentences, trace the effect " +
      "on domestic steel producers, steel-using manufacturers, consumers and the government, and " +
      "explain where the deadweight loss comes from. Then explain why the policy may still be " +
      "adopted.",
    rubric: "6 marks total. 1 mark: domestic steel producers gain — higher price, higher " +
      "output, higher producer surplus. 1 mark: government gains tariff revenue on the remaining " +
      "imports. 1 mark: consumers and steel-USING manufacturers lose — and the answer must " +
      "note that downstream industries employ far more workers than steelmaking. 1 mark: identifies " +
      "the two deadweight loss triangles and what each represents — production distortion " +
      "(domestic output produced at higher cost than the import price) and consumption distortion " +
      "(trades that no longer happen). 1 mark: states that losses exceed gains, so total surplus " +
      "falls. 1 mark: explains adoption politically — concentrated, visible, geographically " +
      "organised gains against dispersed losses, even though the loss count is larger.",
    modelAnswer: "The tariff raises the domestic price toward the world price plus the duty. " +
      "Domestic steel producers gain: they sell more at a higher price, so producer surplus rises. " +
      "The government collects revenue on whatever imports remain. Consumers lose through higher " +
      "prices, and so do the far larger set of manufacturers that BUY steel — carmakers, " +
      "appliance firms, construction — whose costs rise and whose own competitiveness falls; " +
      "steel-using industries employ many times more workers than steelmaking does. The consumer " +
      "loss exceeds the producer gain plus the revenue, and the difference is two deadweight loss " +
      "triangles. The first is a production distortion: the extra domestic tonnes are produced at " +
      "a resource cost above the world price, so society spends more to get the same steel. The " +
      "second is a consumption distortion: trades that were worth making at the world price no " +
      "longer happen. Total surplus therefore falls. It is adopted anyway because the gains are " +
      "concentrated in a few firms and identifiable towns that lobby and vote as a bloc, while the " +
      "losses are spread across every buyer of a steel-containing product and are small enough " +
      "individually that almost nobody organises against them." },

  { id: "ch3_w_offshoring", chapter: 3, difficulty: "med", points: 5,
    concept: "trade and labour markets",
    prompt: "Evidence on the “China shock” finds large, persistent employment losses in " +
      "affected US local labour markets. In 5–8 sentences, explain how this finding can be " +
      "true at the same time as the standard result that trade raises aggregate welfare.",
    rubric: "5 marks total. 1 mark: states that the two claims operate at different levels " +
      "— local labour market versus national aggregate. 1 mark: identifies the mechanism " +
      "behind persistence — workers did not move or retrain as the simple model assumes; " +
      "adjustment was slow and incomplete. 1 mark: identifies the aggregate gains that still " +
      "occurred — lower consumer prices, cheaper inputs, export growth elsewhere. 1 mark: " +
      "states the implication for the model — the standard result assumes costless " +
      "reallocation, and the finding is evidence against that assumption, not against the gains " +
      "themselves. 1 mark: draws a policy conclusion that follows from the diagnosis rather than a " +
      "generic one — place-based assistance, portable benefits, or faster retraining, tied to " +
      "the immobility that caused the persistence.",
    modelAnswer: "The two findings describe different levels of aggregation. Nationally, import " +
      "competition lowered prices for consumers, cut input costs for downstream firms, and " +
      "supported employment in exporting sectors; those gains are real but diffuse. Locally, in " +
      "commuting zones concentrated in furniture, textiles or electronics assembly, the losses " +
      "were severe and did not reverse. What makes them persistent is the assumption the textbook " +
      "model quietly makes and reality violated: that displaced workers move smoothly to other " +
      "regions and sectors. In fact mobility was low, housing in growing areas expensive, skills " +
      "industry-specific, and many workers exited the labour force or moved onto disability rolls " +
      "rather than relocating. So the evidence is not a refutation of the gains from trade; it is " +
      "a refutation of costless reallocation. The policy implication follows directly from that " +
      "diagnosis: assistance should target the barrier that actually bound, which was place and " +
      "mobility, not simply more generic retraining." },

  /* ===================== CHAPTER 4 ===================== */
  { id: "ch4_w_shift_vs_move", chapter: 4, difficulty: "easy", points: 4,
    concept: "shifts versus movements",
    prompt: "“The price of coffee rose, so demand for coffee fell, which pushed the price back " +
      "down.” In 4–6 sentences, identify the error in this reasoning and state the " +
      "correct account.",
    rubric: "4 marks total. 1 mark: identifies the confusion between a change in QUANTITY DEMANDED " +
      "(a movement along the curve) and a change in DEMAND (a shift of the curve). 1 mark: states " +
      "that a price change caused by a supply shift moves the economy along a fixed demand curve. " +
      "1 mark: explains that this is not a shift and so does not push the price back down. " +
      "1 mark: names what WOULD shift demand — income, the price of a substitute or " +
      "complement, tastes, expectations, the number of buyers. Award the first mark only where the " +
      "distinction is named, not merely implied.",
    modelAnswer: "The reasoning confuses two different things. A rise in the price of coffee, " +
      "caused for instance by a frost reducing supply, produces a movement ALONG the demand curve: " +
      "quantity demanded falls, but demand itself — the whole schedule relating price to " +
      "quantity — has not moved. Because the curve has not shifted, there is no second round " +
      "pushing the price back down; the market simply settles at the new intersection with a " +
      "higher price and a lower quantity. Demand would genuinely shift if incomes changed, if the " +
      "price of tea changed, if tastes changed, or if buyers expected future prices to differ " +
      "— none of which is the price of coffee itself." },

  { id: "ch4_w_two_shifts", chapter: 4, difficulty: "med", points: 5,
    concept: "simultaneous shifts",
    prompt: "In the market for new cars, a recession reduces household income at the same time as " +
      "a semiconductor shortage restricts production. In 5–8 sentences, work out what happens " +
      "to equilibrium price and quantity, and explain precisely which of the two is ambiguous and " +
      "why.",
    rubric: "5 marks total. 1 mark: recession shifts demand LEFT (cars are a normal good). 1 mark: " +
      "chip shortage shifts supply LEFT. 1 mark: concludes quantity unambiguously FALLS, since " +
      "both shifts reduce it. 1 mark: concludes price is AMBIGUOUS, because the demand shift pushes " +
      "it down and the supply shift pushes it up. 1 mark: states what resolves the ambiguity " +
      "— the relative SIZE of the two shifts, with a correct statement of which dominates in " +
      "each direction. An answer asserting a definite price direction without that conditional " +
      "loses both of the last two marks.",
    modelAnswer: "Cars are a normal good, so falling income shifts the demand curve left. The chip " +
      "shortage raises the cost of producing each car and limits output, shifting the supply curve " +
      "left as well. Both shifts reduce the equilibrium quantity, so quantity unambiguously falls " +
      "— fewer cars are made and sold. Price is a different matter. The leftward demand shift " +
      "pushes price down, while the leftward supply shift pushes it up, so the two effects work " +
      "against each other and the direction depends entirely on which shift is larger. If the " +
      "supply contraction dominates, prices rise; if the demand collapse dominates, they fall. " +
      "This is the general rule for two shifts: the variable both shifts push the same way is " +
      "determined, and the other is ambiguous without information on magnitudes. In the 2021 " +
      "episode the supply effect clearly dominated, and used car prices rose sharply." },

  { id: "ch4_w_hard_price_ceiling", chapter: 4, difficulty: "hard", points: 6,
    concept: "price controls",
    prompt: "A city imposes a binding rent ceiling. In 6–10 sentences, describe the short-run " +
      "and long-run effects, explain why the long-run effects are larger, and identify who among " +
      "renters gains and who loses.",
    rubric: "6 marks total. 1 mark: short run — a shortage appears, since quantity demanded " +
      "exceeds quantity supplied at the capped rent. 1 mark: short-run supply is inelastic, so the " +
      "shortage is initially modest. 1 mark: long run — both curves are more elastic, so the " +
      "shortage grows: landlords convert, sell or under-maintain, and new construction falls. " +
      "1 mark: identifies non-price rationing — queues, waiting lists, key money, " +
      "discrimination by landlords who can now choose among many applicants. 1 mark: identifies " +
      "the winners — sitting tenants who keep their units, who gain substantially. 1 mark: " +
      "identifies the losers — newcomers, young households and movers, who face a market with " +
      "no vacancies, plus reduced mobility for incumbents who cannot afford to give up a " +
      "controlled unit. A complete answer must name both groups.",
    modelAnswer: "A binding ceiling sits below the market rent, so quantity demanded exceeds " +
      "quantity supplied and a shortage opens immediately. In the short run the effect is modest, " +
      "because the stock of housing is nearly fixed and the demand response takes time. Over " +
      "years both sides become much more elastic and the shortage widens: landlords defer " +
      "maintenance since units let themselves regardless, convert rentals to condominiums or " +
      "other uses, and developers build less because the return on new rental housing has fallen. " +
      "With rent no longer clearing the market, something else rations the units — waiting " +
      "lists, personal connections, key money, and landlord discretion that often shades into " +
      "discrimination, since an excess queue lets them pick. The distributional outcome is sharply " +
      "split. Sitting tenants in controlled units gain a large, durable transfer and tend to stay " +
      "put, which is why these policies are politically durable. Everyone else loses: newcomers, " +
      "young households and anyone whose job or family requires a move faces a market with almost " +
      "no vacancies, and incumbents become locked in place because giving up the unit means losing " +
      "the subsidy, which damages labour-market mobility across the whole city." },

  { id: "ch4_w_equilibrium_meaning", chapter: 4, difficulty: "med", points: 4,
    concept: "what equilibrium means",
    prompt: "In 4–7 sentences, explain what it means to say a market is “in " +
      "equilibrium”, and explain why equilibrium is not the same thing as a good or fair " +
      "outcome.",
    rubric: "4 marks total. 1 mark: defines equilibrium as the price at which quantity supplied " +
      "equals quantity demanded, so no participant has an unexploited reason to change behaviour. " +
      "1 mark: explains the stabilising mechanism — surpluses push price down, shortages push " +
      "it up. 1 mark: states clearly that equilibrium is a positive description, not a normative " +
      "endorsement. 1 mark: gives a concrete case where the equilibrium is undesirable — a " +
      "market with pollution, with severe inequality of purchasing power, or for a good whose " +
      "price excludes people from a necessity. A general assertion that “equilibrium is not " +
      "fair” without an example earns no mark for the last point.",
    modelAnswer: "A market is in equilibrium at the price where the quantity buyers wish to buy " +
      "equals the quantity sellers wish to sell, so no one has an unexploited incentive to change " +
      "what they are doing. It is a resting point rather than a goal: above it, unsold stock " +
      "pushes sellers to cut prices; below it, queues let sellers raise them. That is a purely " +
      "descriptive statement about where the market settles, and it carries no implication that " +
      "the result is desirable. A market for a good whose production pollutes reaches equilibrium " +
      "at a quantity that is too high, because the damage falls on third parties who are not in " +
      "the market. A market for insulin reaches equilibrium at a price that excludes some people " +
      "who need it, and the market registers their willingness to pay rather than their need. " +
      "Equilibrium answers where the market goes, not whether it should be left there." },

  /* ===================== CHAPTER 5 ===================== */
  { id: "ch5_w_elasticity_determinants", chapter: 5, difficulty: "easy", points: 4,
    concept: "determinants of elasticity",
    prompt: "Rank these goods from most to least price-elastic in demand, and justify the ranking: " +
      "(a) insulin for a diabetic, (b) Coca-Cola specifically, (c) soft drinks as a category, " +
      "(d) petrol over five years.",
    rubric: "4 marks total. Correct ranking is (b) most elastic, then (d), then (c), then (a) " +
      "least. 1 mark for the ranking. 1 mark: explains that a narrower market definition means " +
      "more substitutes and so more elastic demand, which places Coca-Cola above soft drinks as a " +
      "category. 1 mark: explains that a longer time horizon raises elasticity, which is why " +
      "five-year petrol demand is elastic even though it is inelastic within a month. 1 mark: " +
      "explains that necessity with no substitute makes insulin almost perfectly inelastic. " +
      "Accept (c) and (d) transposed with a well-argued justification.",
    modelAnswer: "Most to least elastic: Coca-Cola, petrol over five years, soft drinks as a " +
      "category, insulin. Coca-Cola is the most elastic because the market is defined narrowly " +
      "— Pepsi and every other cola sit right next to it, so a price rise sends buyers " +
      "elsewhere at almost no cost. Soft drinks as a whole are less elastic, because the category " +
      "as a category has fewer close substitutes; this is the general principle that narrowing the " +
      "market definition raises elasticity. Petrol over five years is quite elastic because time " +
      "is itself a determinant: given five years people buy more efficient cars, move closer to " +
      "work and shift to transit, none of which is possible within a month, which is why short-run " +
      "petrol demand is famously inelastic. Insulin is the extreme case — a necessity with no " +
      "substitute and a life-threatening consequence of going without — so quantity barely " +
      "responds at any price, which is exactly why its pricing is a policy question rather than a " +
      "market one." },

  { id: "ch5_w_hard_farm_paradox", chapter: 5, difficulty: "hard", points: 5,
    concept: "elasticity and revenue",
    prompt: "A technological improvement raises crop yields across the whole farming sector, and " +
      "farmers' total revenue falls. In 5–8 sentences, explain the mechanism, and explain why " +
      "an individual farmer still adopts the technology even though the sector loses.",
    rubric: "5 marks total. 1 mark: the innovation shifts market supply RIGHT, lowering the price. " +
      "1 mark: identifies that demand for food staples is inelastic. 1 mark: concludes that the " +
      "proportional price fall exceeds the proportional quantity rise, so revenue falls. 2 marks: " +
      "explains the individual-versus-collective split — a single farmer is a price taker, so " +
      "for her the price is fixed and higher yield simply means more revenue; the price fall is " +
      "caused by everyone adopting, and refusing to adopt would leave her with low yields at the " +
      "low price, which is worse. Award both marks only where the price-taking assumption is " +
      "explicit.",
    modelAnswer: "Better yields shift the market supply curve to the right, which lowers the " +
      "equilibrium price. Demand for staple foods is inelastic — people do not eat much more " +
      "wheat because wheat got cheaper — so the quantity sold rises proportionally less than " +
      "the price falls. Revenue is price times quantity, so revenue falls for the sector as a " +
      "whole. The reason each farmer adopts anyway is that she is a price taker: her own harvest " +
      "is far too small to move the market price, so from where she stands the price is simply " +
      "given and a higher yield is unambiguously more revenue. The price collapse is a " +
      "consequence of all farmers adopting together, which no individual chooses or controls. " +
      "Worse, once others have adopted the price has already fallen, so the holdout gets the low " +
      "price AND the low yield. Adoption is individually rational at every point and collectively " +
      "self-defeating — which is the structural reason agricultural policy in most rich " +
      "countries has involved supply management or price support for a century." },

  { id: "ch5_w_income_elasticity", chapter: 5, difficulty: "med", points: 4,
    concept: "income elasticity",
    prompt: "A study finds the income elasticity of demand for restaurant meals is +1.6 and for " +
      "bus travel is −0.4. In 4–7 sentences, interpret both numbers precisely and " +
      "explain what each implies for these industries during a recession.",
    rubric: "4 marks total. 1 mark: interprets +1.6 correctly — a 1% rise in income raises " +
      "restaurant demand by 1.6%, a normal good and specifically a luxury since the elasticity " +
      "exceeds 1. 1 mark: interprets −0.4 correctly — a 1% rise in income LOWERS bus " +
      "demand by 0.4%, which makes bus travel an inferior good. 1 mark: recession implication for " +
      "restaurants — demand falls proportionally more than income, so the sector contracts " +
      "sharply. 1 mark: recession implication for buses — demand RISES as income falls, so " +
      "ridership is countercyclical.",
    modelAnswer: "An income elasticity of +1.6 means a 1% rise in income raises the quantity of " +
      "restaurant meals demanded by 1.6%. The sign makes restaurant meals a normal good, and the " +
      "magnitude above one makes them a luxury: spending on them grows faster than income, so " +
      "they take a rising share of the budget as people get richer. An elasticity of −0.4 " +
      "means a 1% rise in income LOWERS bus travel by 0.4%, which is the definition of an inferior " +
      "good — as people get richer they substitute toward cars and taxis. In a recession the " +
      "two industries therefore move in opposite directions. Restaurants are hit harder than the " +
      "fall in income itself, which is why the sector is among the first to contract and among the " +
      "most volatile. Bus ridership rises as incomes fall, making it countercyclical, which has " +
      "the awkward consequence that demand on transit systems peaks exactly when the tax revenue " +
      "funding them is weakest." },

  { id: "ch5_w_hard_elasticity_pricing", chapter: 5, difficulty: "hard", points: 5,
    concept: "applying elasticity to a decision",
    prompt: "A transit authority facing a deficit proposes a 20% fare increase, projecting a 20% " +
      "revenue gain. In 6–9 sentences, explain what is wrong with the projection, what " +
      "information is needed to do it properly, and why the correct answer may differ between the " +
      "first month and the third year.",
    rubric: "5 marks total. 1 mark: identifies the error — the projection implicitly assumes " +
      "ridership does not fall, i.e. perfectly inelastic demand. 1 mark: states the needed " +
      "information — the price elasticity of demand for transit at the current fare. 1 mark: " +
      "states the decision rule correctly — revenue rises only if demand is inelastic " +
      "(|E| < 1), and the revenue gain is smaller than 20% in any case. 1 mark: explains the " +
      "time dimension — short-run demand is inelastic because commuters are locked into jobs " +
      "and housing, so first-month revenue may rise close to projection. 1 mark: explains the " +
      "long-run divergence — given years riders buy cars, change jobs or move, so elasticity " +
      "rises and the revenue gain erodes or reverses, possibly leaving the authority worse off " +
      "with fewer riders and a weaker political case for subsidy.",
    modelAnswer: "The projection assumes every current rider keeps riding — that is, it " +
      "treats demand as perfectly inelastic, which no transit system faces. To do the calculation " +
      "properly the authority needs the price elasticity of demand for its service at the current " +
      "fare. The rule is that a fare rise increases revenue only when demand is inelastic, and " +
      "even then the gain is less than 20% because some riders leave; if demand is elastic, " +
      "revenue falls outright. The time horizon then matters more than anything else. Within a " +
      "month, commuters are locked into jobs, housing and car ownership decisions, so measured " +
      "elasticity is low — perhaps −0.3 — and revenue does rise, which makes the " +
      "policy look successful in the first quarterly report. Over three years the same riders buy " +
      "cars, change jobs, move house or shift to cycling, and the elasticity roughly doubles. The " +
      "revenue gain erodes, and the authority can end up with both lower ridership and a weaker " +
      "claim on public subsidy, having made its own long-run position worse in order to close a " +
      "short-run gap." },

  /* ===================== CHAPTER 6 ===================== */
  { id: "ch6_w_tax_incidence", chapter: 6, difficulty: "med", points: 5,
    concept: "tax incidence",
    prompt: "A government levies a payroll tax, writing the law so that employers pay half and " +
      "employees pay half. In 5–8 sentences, explain why this legal split tells you almost " +
      "nothing about who actually bears the tax, and state what does determine it.",
    rubric: "5 marks total. 1 mark: states that statutory incidence and economic incidence are " +
      "different things. 1 mark: explains the mechanism — the employer's share is passed into " +
      "lower wages, so the wage adjusts until the market clears regardless of who remits. 1 mark: " +
      "states the determining factor — the relative elasticity of labour supply and labour " +
      "demand. 1 mark: states the direction — the less elastic side bears more. 1 mark: " +
      "applies it — labour supply is empirically quite inelastic for prime-age workers, so " +
      "most of the payroll tax lands on wages regardless of the statutory split.",
    modelAnswer: "Who writes the cheque and who bears the burden are separate questions. When the " +
      "employer's half is imposed, the employer's cost of hiring rises, and the wage offered " +
      "adjusts downward until the labour market clears again — so part or all of the " +
      "“employer” share comes out of the worker's pay. The law can specify who remits; " +
      "it cannot specify where the market settles. What determines the real split is the relative " +
      "elasticity of labour supply and labour demand: the side less able to change its quantity in " +
      "response to the price is the side that absorbs the tax, because it has the weakest " +
      "alternative. Empirically, prime-age labour supply is quite inelastic — most people " +
      "work roughly full time or not at all, and do not leave the workforce over a few percentage " +
      "points — while labour demand is more responsive. The consequence is that the great " +
      "majority of the payroll tax is borne by workers in the form of lower wages, whatever the " +
      "statute says, which is why economists treat the 50-50 framing as a presentational device " +
      "rather than an economic fact." },

  { id: "ch6_w_hard_externality", chapter: 6, difficulty: "hard", points: 6,
    concept: "externalities and policy instruments",
    prompt: "Compare a carbon tax and a cap-and-trade system as responses to emissions. In " +
      "6–10 sentences, explain what each fixes and how, state the key difference in what each " +
      "makes certain, and explain the circumstance that should decide which to prefer.",
    rubric: "6 marks total. 1 mark: states the underlying problem — emissions impose a cost " +
      "on third parties that the emitter does not pay, so the market quantity exceeds the " +
      "efficient one. 1 mark: explains the tax — sets the price of emitting and lets the " +
      "quantity adjust. 1 mark: explains cap-and-trade — sets the quantity and lets the " +
      "market determine the price of a permit. 1 mark: states the central trade-off — the tax " +
      "gives price certainty and quantity uncertainty; the cap gives quantity certainty and price " +
      "uncertainty. 1 mark: states that both achieve abatement at least cost by equalising " +
      "marginal abatement cost across emitters, which a command-and-control standard does not. " +
      "1 mark: identifies what should decide — the relative slopes of the marginal damage and " +
      "marginal abatement cost curves: a steeply rising damage function favours certainty about " +
      "quantity, a flat one favours certainty about price.",
    modelAnswer: "Emissions impose costs on people outside the transaction, so the emitter faces " +
      "only private cost and the market settles at a quantity above the efficient one. Both " +
      "instruments close that wedge, but from opposite ends. A carbon tax sets the price of a " +
      "tonne directly and lets emitters decide how much to abate; the quantity of emissions is " +
      "then whatever that price delivers. Cap-and-trade sets the total quantity by issuing a fixed " +
      "number of permits and lets trading determine the price. Both are efficient in the sense " +
      "that matters: because every emitter faces the same price per tonne, each abates up to the " +
      "point where its own marginal abatement cost equals that price, so the total reduction is " +
      "achieved at the lowest aggregate cost — which a uniform technology mandate cannot do, " +
      "since it ignores the enormous variation in abatement costs across firms. The real " +
      "difference is which variable is certain. The tax pins down the price and leaves emissions " +
      "uncertain; the cap pins down emissions and leaves the price uncertain, which can be " +
      "volatile enough to disrupt investment planning. What should decide is the shape of the " +
      "damage function. If damages rise steeply past a threshold — a tipping point — " +
      "certainty about quantity is worth more, favouring the cap. If marginal damages are roughly " +
      "flat over the relevant range while abatement costs are uncertain, price certainty is worth " +
      "more, favouring the tax." },

  { id: "ch6_w_subsidy_incidence", chapter: 6, difficulty: "med", points: 4,
    concept: "who captures a subsidy",
    prompt: "A government introduces a generous subsidy for first-time home buyers in a city where " +
      "new construction is tightly restricted by zoning. In 4–7 sentences, predict who " +
      "actually captures most of the subsidy, and explain the mechanism.",
    rubric: "4 marks total. 1 mark: identifies that restricted construction makes housing supply " +
      "highly inelastic in that city. 1 mark: states that the subsidy raises buyers' willingness " +
      "to pay, shifting demand right. 1 mark: concludes that with near-vertical supply the effect " +
      "is almost entirely a higher price rather than more housing, so existing OWNERS and sellers " +
      "capture the subsidy. 1 mark: draws the correct policy inference — the binding " +
      "constraint is supply, so the subsidy cannot achieve its aim without zoning reform. An " +
      "answer concluding that buyers benefit most earns at most 1 mark.",
    modelAnswer: "Zoning restrictions make the supply of housing in that city highly inelastic " +
      "— close to vertical over the relevant range, because the quantity cannot respond to " +
      "price however profitable building becomes. The subsidy raises what buyers can afford to " +
      "offer, which shifts demand to the right. With supply nearly fixed, a rightward demand shift " +
      "produces almost entirely a higher price and almost no additional housing. The subsidy " +
      "therefore passes through into property values and is captured by existing owners and " +
      "sellers rather than by the first-time buyers it names. Those buyers end up with the same " +
      "houses at higher prices and larger mortgages. The lesson is that a demand-side subsidy " +
      "cannot fix a supply-side constraint; without zoning reform the policy transfers money to " +
      "incumbent owners while leaving affordability unchanged or worse." },

  { id: "ch6_w_deadweight_intuition", chapter: 6, difficulty: "easy", points: 4,
    concept: "deadweight loss",
    prompt: "In 4–6 sentences, explain in plain language what a deadweight loss IS — not " +
      "how to find the triangle on a diagram, but what real thing it measures — and why a tax " +
      "that raises a great deal of revenue may nonetheless have a small deadweight loss.",
    rubric: "4 marks total. 1 mark: defines deadweight loss as the value of mutually beneficial " +
      "trades that no longer take place. 1 mark: stresses that it is value destroyed, not value " +
      "transferred — nobody receives it, unlike the revenue. 1 mark: explains that the size " +
      "depends on how much the tax changes the QUANTITY traded. 1 mark: concludes that a tax on an " +
      "inelastically demanded or supplied good raises revenue while barely changing quantity, so " +
      "the loss is small — which is the efficiency case for taxing land or inelastic goods. " +
      "An answer that only describes the triangle geometrically earns at most 2.",
    modelAnswer: "A deadweight loss is the value of the trades that would have made both parties " +
      "better off but no longer happen because the tax has driven a wedge between what buyers pay " +
      "and what sellers receive. The crucial point is that this value is not transferred to " +
      "anyone — the government does not collect it and no participant receives it; it simply " +
      "disappears, which is what distinguishes it from the revenue, which is a transfer. Its size " +
      "depends on how much the tax shrinks the quantity traded, not on how much money is raised. " +
      "So a tax on something whose quantity hardly responds to price — land, or a good with " +
      "no substitutes — can raise a great deal of revenue while destroying very few trades, " +
      "and therefore carries a small deadweight loss. That asymmetry is the whole efficiency " +
      "argument for taxing inelastic bases, and it sits in tension with fairness, since inelastic " +
      "demand often means a necessity." },

  /* ===================== CHAPTER 7 ===================== */
  { id: "ch7_w_gdp_limits", chapter: 7, difficulty: "med", points: 5,
    concept: "what GDP omits",
    prompt: "In 5–8 sentences, identify four things GDP fails to capture about a country's " +
      "wellbeing, and then explain why economists continue to use it despite knowing all four.",
    rubric: "5 marks total. 1 mark each for any four of: non-market production (household work, " +
      "care, subsistence); the distribution of income; environmental degradation and resource " +
      "depletion; leisure; health and life expectancy; the quality or composition of output " +
      "(disaster repair and prison construction add to GDP). Maximum 4 marks for the list. 1 mark: " +
      "explains the defence — GDP is consistently measured, available quickly and " +
      "comparably across countries and time, and correlates strongly with most things we do care " +
      "about, so it is a useful indicator provided it is not mistaken for the objective itself.",
    modelAnswer: "GDP leaves out a great deal. It misses non-market production entirely, so a " +
      "parent caring for a child at home contributes nothing while the same care purchased counts " +
      "fully — which also makes international comparisons misleading where subsistence " +
      "activity is large. It says nothing about distribution: the same GDP per head is consistent " +
      "with broad prosperity or with a tiny elite and widespread poverty. It treats environmental " +
      "destruction and the depletion of natural capital as free, so an economy can raise measured " +
      "output by liquidating its forests. And it ignores leisure, so a country working far longer " +
      "hours for the same output appears to be doing equally well. It also counts spending " +
      "indiscriminately: rebuilding after a hurricane adds to GDP. Economists keep using it anyway " +
      "because it is measured consistently, published quickly, comparable across countries and " +
      "decades, and correlated strongly with literacy, life expectancy and almost every direct " +
      "wellbeing measure we have. It is a good indicator and a bad objective, and the error lies " +
      "in confusing the two." },

  { id: "ch7_w_hard_double_counting", chapter: 7, difficulty: "hard", points: 5,
    concept: "value added and double counting",
    prompt: "Explain why GDP counts only final goods, using a specific supply chain of your own " +
      "choosing. Then explain how the value-added method arrives at the same total, and why " +
      "statistical agencies use it in practice. 6–9 sentences.",
    rubric: "5 marks total. 1 mark: states the double-counting problem — summing every " +
      "transaction counts intermediate goods repeatedly. 1 mark: gives a concrete chain with " +
      "numbers through at least three stages. 1 mark: defines value added as sales minus the cost " +
      "of purchased inputs at each stage. 1 mark: demonstrates that the sum of value added equals " +
      "the final sale price. 1 mark: explains the practical reason agencies use the value-added " +
      "method — firms' accounts record their own sales and input purchases, so value added is " +
      "directly observable, whereas identifying which sales are final is not, and the method also " +
      "allows output to be attributed to industries.",
    modelAnswer: "If we added up every transaction in an economy we would count the same steel " +
      "many times — once when the mill sells it, again inside the price of the engine, again " +
      "inside the price of the car — and the total would be meaningless. Take a chain: a " +
      "farmer sells wheat to a miller for $60, the miller sells flour to a baker for $95, and the " +
      "baker sells bread to households for $150. Summing all three gives $305, but only $150 of " +
      "final output exists; the wheat and the flour are intermediate goods that have been " +
      "absorbed. The value-added method solves this by counting, at each stage, only the " +
      "difference between a firm's sales and the inputs it bought: $60 for the farmer, $35 for the " +
      "miller, $55 for the baker, which sums to exactly $150. The identity is not a coincidence " +
      "— every intermediate sale appears once as revenue and once as a cost, so the " +
      "intermediate stages cancel. Agencies prefer this method because it is what the data " +
      "actually contain: a firm's accounts record its own sales and its own input purchases, " +
      "whereas no firm knows whether its buyer is a final consumer, and it has the further " +
      "advantage of attributing output to the industry that created it." },

  { id: "ch7_w_investment_meaning", chapter: 7, difficulty: "easy", points: 4,
    concept: "investment in the national accounts",
    prompt: "A student says “I invested $5,000 in shares this year, so I contributed $5,000 " +
      "to investment in GDP.” In 4–6 sentences, explain the error and state what the " +
      "national accounts mean by investment.",
    rubric: "4 marks total. 1 mark: identifies that buying shares is a transfer of ownership of an " +
      "existing asset, not production of anything new. 1 mark: defines investment in the accounts " +
      "as the purchase of newly produced capital — structures, equipment, intellectual " +
      "property — plus changes in inventories. 1 mark: explains that GDP counts PRODUCTION, " +
      "so a transaction producing no new good or service cannot add to it. 1 mark: notes the " +
      "correct connection — the purchase is saving, which finances investment via financial " +
      "markets, and it would count if the funds financed a firm's new plant, which is the part " +
      "that gets produced. Accept new-issue shares as a nuance if correctly explained.",
    modelAnswer: "Buying shares on an exchange transfers ownership of an asset that already " +
      "exists; nothing new is produced, so nothing can be added to a measure of production. In the " +
      "national accounts, investment means the purchase of newly produced capital goods — " +
      "factories, machinery, software, housing — together with changes in business " +
      "inventories. The student's $5,000 is SAVING: it supplies funds to financial markets, where " +
      "it may finance a firm's new equipment, and it is that equipment purchase, when it happens, " +
      "that enters GDP as investment. The everyday use of the word and the accounting use genuinely " +
      "differ, which is the source of the confusion rather than any error of reasoning." },

  { id: "ch7_w_gdp_components", chapter: 7, difficulty: "med", points: 4,
    concept: "classifying expenditure",
    prompt: "For each item, state which component of GDP it enters (C, I, G, NX) or state that it " +
      "does not enter GDP at all, and justify briefly: (a) a household buys an imported washing " +
      "machine; (b) a company builds a new warehouse; (c) the government pays state pensions; " +
      "(d) a firm's unsold inventory rises by $2m.",
    rubric: "4 marks, one per item, each requiring the classification AND a correct justification. " +
      "(a) C rises and NX falls by the same amount through imports, so the net contribution to " +
      "domestic GDP is zero — full credit requires both halves. (b) I, as newly produced " +
      "structures. (c) Not in GDP — a transfer payment, since nothing is produced in exchange; " +
      "it enters GDP later when the pensioner spends it, as C. (d) I, as a change in inventories; " +
      "the goods were produced this period and so count as investment by the firm in itself.",
    modelAnswer: "(a) Consumption rises by the purchase price, but because the machine was made " +
      "abroad, imports rise by the same amount and net exports fall correspondingly, so domestic " +
      "GDP is unchanged — the import subtraction exists precisely to cancel foreign " +
      "production out of a domestic measure. (b) Investment: a warehouse is newly produced " +
      "structure. (c) Nothing. A pension is a transfer payment, and the government receives no " +
      "good or service for it, so it is not part of government PURCHASES; it enters GDP only when " +
      "the recipient spends it, and then as consumption. (d) Investment, as a change in " +
      "inventories. The goods were produced this period, so they must be counted somewhere, and " +
      "the convention treats the firm as having purchased them from itself." },

  /* ===================== CHAPTER 8 ===================== */
  { id: "ch8_w_cpi_biases", chapter: 8, difficulty: "med", points: 5,
    concept: "CPI measurement bias",
    prompt: "Explain the three main sources of upward bias in the consumer price index, and " +
      "explain in concrete terms why a persistent bias of even half a percentage point a year is " +
      "consequential. 5–8 sentences.",
    rubric: "5 marks total. 1 mark: substitution bias — the fixed basket does not let " +
      "consumers switch toward goods whose relative prices fell. 1 mark: quality-change bias " +
      "— a price rise accompanying a better product is partly payment for more, not " +
      "inflation, and quality adjustment is incomplete. 1 mark: new-goods bias — new products " +
      "enter the basket only after their steep early price falls have already happened. 1 mark: " +
      "states that all three push the measure UPWARD, overstating inflation. 1 mark: gives a " +
      "concrete consequence — indexed benefits and tax brackets grow faster than true cost of " +
      "living, compounding over decades into large fiscal sums, and measured real wage growth is " +
      "understated. Generic “it adds up” earns nothing.",
    modelAnswer: "The first source is substitution bias: the index prices a fixed basket, but when " +
      "beef gets expensive people buy chicken, so the measured cost of living rises faster than " +
      "the cost of maintaining the same satisfaction. The second is unmeasured quality change " +
      "— a car that costs 5% more but is safer and more efficient is not 5% more expensive in " +
      "any meaningful sense, and statistical agencies adjust for this only imperfectly. The third " +
      "is new goods: products enter the basket years after introduction, by which time the steep " +
      "early price declines that characterise new technologies have already occurred and are " +
      "simply missed. All three push in the same direction, so the index overstates true " +
      "inflation, by roughly half a point to a point a year in the Boskin Commission's estimate. " +
      "That matters because enormous sums are indexed to it. Social Security benefits and tax " +
      "brackets rise with the CPI, so a persistent half-point overstatement compounds into " +
      "hundreds of billions over decades, and it simultaneously makes measured real wage growth " +
      "look worse than it was — which distorts the political argument about stagnation as " +
      "well as the fiscal arithmetic." },

  { id: "ch8_w_real_vs_nominal_wage", chapter: 8, difficulty: "easy", points: 4,
    concept: "real versus nominal",
    prompt: "A worker's wage rose from $50,000 to $53,000 while the CPI rose from 240 to 252. In " +
      "4–6 sentences, calculate whether the worker is better off, show your reasoning, and " +
      "state the general principle.",
    rubric: "4 marks total. 1 mark: computes nominal wage growth of 6%. 1 mark: computes inflation " +
      "of 5% ((252−240)/240). 1 mark: concludes real wage rose by approximately 1%, so the " +
      "worker is slightly better off. 1 mark: states the general principle — only the real " +
      "wage, the nominal wage deflated by the price level, measures purchasing power, so a raise " +
      "below the inflation rate is a real pay cut. Accept exact deflation (53000/2.52 against " +
      "50000/2.40) in place of the approximation.",
    modelAnswer: "The nominal wage rose by 3,000 on 50,000, which is 6%. The price level rose from " +
      "240 to 252, an increase of 12 on 240, which is 5%. Real wage growth is approximately the " +
      "difference, so about 1% — the worker is slightly better off. Doing it exactly: real " +
      "pay was 50,000/2.40 = 20,833 in base-year dollars and is now 53,000/2.52 = 21,032, a rise " +
      "of 0.95%. The general principle is that only the real wage measures purchasing power, so " +
      "any raise below the inflation rate is a pay cut in real terms however it looks on the " +
      "payslip — which is why periods of high inflation produce falling living standards " +
      "alongside rising nominal wages, and why workers experience that as the economy going wrong " +
      "even as nominal figures rise." },

  { id: "ch8_w_hard_indexation", chapter: 8, difficulty: "hard", points: 5,
    concept: "indexation and its consequences",
    prompt: "A country responds to persistent inflation by indexing wages, pensions and tax " +
      "brackets to the CPI. In 6–9 sentences, explain what this protects against, and explain " +
      "the serious cost it introduces for disinflation.",
    rubric: "5 marks total. 1 mark: explains what indexation protects — the arbitrary " +
      "redistribution inflation causes between those on fixed nominal incomes and others, and " +
      "bracket creep. 1 mark: explains that it removes the inflation TAX on nominal wage earners " +
      "and stabilises real incomes. 1 mark: identifies the cost — indexation builds inflation " +
      "into next period's wages automatically, making it persistent. 1 mark: explains the " +
      "mechanism precisely — a price shock passes into wages, which passes into prices, so a " +
      "one-off shock becomes an ongoing spiral and inflation expectations become self-fulfilling. " +
      "1 mark: states the policy consequence — disinflation then requires a far deeper " +
      "recession for any given reduction in inflation, i.e. a higher sacrifice ratio. The fifth " +
      "mark requires that explicit link to the cost of disinflation.",
    modelAnswer: "Indexation addresses a real injustice. Unanticipated inflation redistributes " +
      "arbitrarily — away from pensioners and workers on fixed nominal contracts, toward " +
      "borrowers and the government — and in an unindexed tax system it pushes people into " +
      "higher brackets without any rise in real income. Tying nominal values to the CPI removes " +
      "both effects and stabilises real incomes against price shocks, which is why it is popular " +
      "and why most rich countries index pensions and brackets. The cost appears when inflation " +
      "must be brought down. Indexation hard-wires last period's price increase into this " +
      "period's wages, which firms pass into prices, which indexation then feeds back into wages " +
      "again. A one-off shock, such as an oil price spike, stops being one-off and becomes a " +
      "self-sustaining spiral, and expectations of continued inflation become self-fulfilling " +
      "because the contracts enforce them. The policy consequence is severe: breaking the spiral " +
      "requires the central bank to overcome a mechanism that automatically regenerates inflation, " +
      "so the sacrifice ratio rises and far more unemployment is needed per point of disinflation. " +
      "Brazil and Israel in the 1980s are the standard illustrations, and their stabilisations " +
      "required dismantling indexation itself rather than merely tightening money." },

  { id: "ch8_w_cpi_vs_deflator", chapter: 8, difficulty: "med", points: 4,
    concept: "comparing price indices",
    prompt: "In 4–7 sentences, set out the differences between the CPI and the GDP deflator, " +
      "and state which you would use to adjust a pension for cost of living and which to deflate " +
      "national output, justifying both choices.",
    rubric: "4 marks total. 1 mark: coverage difference — CPI prices a consumer basket " +
      "including imports; the deflator prices all domestic production including investment and " +
      "government, excluding imports. 1 mark: weighting difference — the CPI holds its basket " +
      "fixed (Laspeyres) while the deflator reweights with current output (Paasche), which gives " +
      "the CPI a substitution bias. 1 mark: pension indexed to the CPI, justified because it " +
      "tracks what households actually buy. 1 mark: output deflated by the GDP deflator, justified " +
      "because it covers exactly the goods in GDP. Both justifications required for those marks.",
    modelAnswer: "The two differ in coverage and in weighting. The CPI prices the basket a typical " +
      "household buys, imported goods included, while the GDP deflator prices everything produced " +
      "domestically — investment goods and government purchases as well as consumption " +
      "— and excludes imports entirely. On weighting, the CPI holds a fixed basket and is " +
      "updated only periodically, whereas the deflator reweights automatically with the current " +
      "composition of output; that is why the CPI carries a substitution bias the deflator does " +
      "not. For adjusting a pension, the CPI is the right choice, because the question is what has " +
      "happened to the cost of the things the pensioner actually buys, imports included. For " +
      "converting nominal GDP to real GDP, the deflator is correct by construction, since it " +
      "covers precisely the set of goods GDP measures and nothing else." },

  /* ===================== CHAPTER 9 ===================== */
  { id: "ch9_w_growth_compounding", chapter: 9, difficulty: "easy", points: 4,
    concept: "the power of compound growth",
    prompt: "Country A grows at 1% a year and Country B at 3% a year, both starting from the same " +
      "income per head. In 4–6 sentences, explain roughly how long each takes to double, and " +
      "explain why economists treat a difference of two percentage points in the growth rate as " +
      "enormously important.",
    rubric: "4 marks total. 1 mark: applies the rule of 70 correctly to A — about 70 years. " +
      "1 mark: applies it to B — about 23 years. 1 mark: notes that over a long horizon, say " +
      "a century, the gap compounds into a very large ratio in living standards. 1 mark: draws the " +
      "right implication — small, sustained differences in growth dominate any plausible " +
      "one-off level effect, which is why the determinants of growth matter more than almost any " +
      "other question in economics.",
    modelAnswer: "The rule of 70 says a quantity growing at g% doubles in roughly 70/g years. " +
      "Country A therefore doubles its income per head in about 70 years — roughly once in a " +
      "working lifetime — while Country B doubles in about 23 years, three times over the " +
      "same period. Starting level and all, after a century A is around 2.7 times richer than it " +
      "began and B around 19 times. A two-point difference that is invisible in any single year " +
      "produces a sevenfold gap in living standards within a lifetime. That is why growth " +
      "dominates: no plausible one-off policy that raises the LEVEL of income by a few percent " +
      "competes with a sustained change in the RATE, and it is why the determinants of long-run " +
      "growth attract attention out of all proportion to how undramatic they look year by year." },

  { id: "ch9_w_hard_convergence", chapter: 9, difficulty: "hard", points: 6,
    concept: "convergence and its failures",
    prompt: "The Solow model predicts that poor countries should grow faster than rich ones and " +
      "catch up. Many have not. In 6–10 sentences, explain the mechanism behind the " +
      "prediction, explain conditional convergence, and set out what the failures of convergence " +
      "tell us about what the model leaves out.",
    rubric: "6 marks total. 1 mark: states the mechanism — diminishing returns to capital " +
      "means the marginal product of capital is higher where capital is scarce, so investment " +
      "yields more growth. 1 mark: states the unconditional prediction — poor countries grow " +
      "faster toward a common steady state. 1 mark: defines conditional convergence — " +
      "countries converge to THEIR OWN steady state, determined by their saving rate, population " +
      "growth and technology, so convergence appears once those are controlled for. 1 mark: states " +
      "the empirical pattern — conditional convergence holds reasonably well, unconditional " +
      "convergence does not. 2 marks: identifies what the model treats as exogenous and what the " +
      "failures implicate — institutions, property rights, rule of law, human capital, " +
      "political stability, with at least one sentence on why these determine the steady state " +
      "rather than the speed of approach to it.",
    modelAnswer: "The prediction rests on diminishing returns to capital. Where capital per worker " +
      "is low its marginal product is high, so each unit of investment adds more output than it " +
      "would in a capital-rich country; poor countries should therefore grow faster and close the " +
      "gap. Unconditionally, this is simply false in the data — the dispersion of income " +
      "across countries has widened rather than narrowed over the past century. What does hold is " +
      "conditional convergence: countries converge toward their OWN steady state, which depends on " +
      "their saving and investment rate, population growth and access to technology, and once " +
      "those are held constant poorer countries do grow faster. The failures are therefore not " +
      "failures of the convergence mechanism but evidence that steady states differ enormously, " +
      "and the model takes the determinants of the steady state as given. What fills that gap is " +
      "largely institutional: secure property rights, enforceable contracts, a state that can tax " +
      "and provide public goods without expropriating, political stability, and the human capital " +
      "to use frontier technology. Capital does not flow to poor countries in anything like the " +
      "volume the marginal-product argument predicts — the Lucas paradox — precisely " +
      "because the expected return is not the physical marginal product when expropriation risk " +
      "and contract enforcement are factored in. The model is right about the mechanics of capital " +
      "accumulation and silent about what determines whether accumulation happens at all." },

  { id: "ch9_w_productivity_sources", chapter: 9, difficulty: "med", points: 5,
    concept: "determinants of productivity",
    prompt: "A finance minister proposes to raise long-run growth by subsidising business purchases " +
      "of machinery. In 5–8 sentences, explain what the Solow model predicts about this " +
      "policy's long-run effect on the growth RATE as distinct from the LEVEL of income, and " +
      "explain what would be needed to raise the growth rate itself.",
    rubric: "5 marks total. 1 mark: identifies the policy as raising the investment rate. 1 mark: " +
      "states that this raises the steady-state LEVEL of income per worker. 1 mark: states that it " +
      "does NOT raise the long-run growth RATE, because diminishing returns eventually halt " +
      "further accumulation. 1 mark: notes the transition — growth is temporarily faster " +
      "while the economy moves to the new steady state, which can last decades and is not " +
      "trivial. 1 mark: identifies what does raise the long-run rate — technological progress " +
      "and human capital, so policies on research, education and diffusion, rather than capital " +
      "subsidies.",
    modelAnswer: "Subsidising machinery raises the economy's investment rate, and in the Solow " +
      "model that unambiguously raises the steady-state level of capital and output per worker. " +
      "What it does not do is raise the long-run growth rate. Because capital has diminishing " +
      "returns, each additional unit adds less output, and depreciation on a larger capital stock " +
      "eventually absorbs all the extra investment; the economy settles at a higher level and then " +
      "grows at the same rate as before. The transition is worth taking seriously nonetheless " +
      "— growth is genuinely faster while the economy moves between steady states, and for a " +
      "large change in the investment rate that transition can run for decades, which is most of a " +
      "political career. But a permanently higher growth rate requires the one thing that is not " +
      "subject to diminishing returns in the model: technological progress, together with the " +
      "human capital needed to adopt it. That points to a different policy menu — research " +
      "funding, education, openness to foreign technology and competition that forces diffusion " +
      "— rather than to capital subsidies." },

  { id: "ch9_w_natural_resources", chapter: 9, difficulty: "med", points: 4,
    concept: "resources and growth",
    prompt: "Resource-rich countries have on average grown more slowly than resource-poor ones. In " +
      "4–7 sentences, give two distinct mechanisms that could produce this “resource " +
      "curse”, and name one country that appears to have avoided it and why.",
    rubric: "4 marks total. 2 marks for any two distinct mechanisms, one mark each: Dutch disease " +
      "(resource exports appreciate the currency and crowd out manufacturing); rent-seeking and " +
      "corruption (a concentrated, seizable revenue stream distorts politics); weak state capacity " +
      "(resource revenue removes the need to tax, and so the need to bargain with citizens); " +
      "volatility of commodity prices; reduced incentive to invest in education. 1 mark: names a " +
      "plausible counterexample — Norway, Botswana, Chile, Australia. 1 mark: explains WHY it " +
      "escaped, with a mechanism — e.g. Norway's sovereign wealth fund sterilising the " +
      "revenue and strong pre-existing institutions. The final mark requires the mechanism, not " +
      "just the name.",
    modelAnswer: "One mechanism is Dutch disease: resource exports drive up demand for the " +
      "currency, the real exchange rate appreciates, and manufacturing and other tradable sectors " +
      "become uncompetitive — so the economy loses precisely the sectors associated with " +
      "learning-by-doing and productivity growth. A second is political: resource rents are " +
      "concentrated, geographically fixed and easy to seize, which rewards capturing the state " +
      "rather than building a business, and it frees governments from having to tax citizens, " +
      "weakening the bargain that historically produced accountable institutions. Norway is the " +
      "clearest escape. It had strong institutions and a capable bureaucracy before the oil came, " +
      "and it channels petroleum revenue into a sovereign wealth fund invested entirely abroad, " +
      "spending only the real return. That keeps the revenue out of the domestic economy and off " +
      "the exchange rate, neutralising the Dutch disease channel, while the fiscal rule removes " +
      "the annual political fight over the windfall. The resource curse is clearly conditional on " +
      "institutions rather than mechanical." }

  ];

  /* Shape each row into the STATIC item format the registry expects. A written
     item has no computable answer: grade() returns { needsAI: true } and
     ma-ai-grade marks the submission against `rubric`. */
  var out = [];
  for (var i = 0; i < W.length; i++) {
    var w = W[i];
    if (!w.rubric || w.rubric.length < 60) {
      throw new Error("ma-generators-f.js: " + w.id + " has no usable rubric");
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
    throw new Error("ma-generators-f.js: duplicate ids: " + conflicts.join(", "));
  }

  /* See the DEPLOYMENT note at the foot of ma-generators-e.js — this file must
     also be copied into the ma-grade-attempt and ma-grade function folders and
     imported there, or these items reach the AI grader with no rubric and it
     correctly refuses to score them. */
})(typeof globalThis !== "undefined" ? globalThis : this);
