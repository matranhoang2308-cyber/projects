# Design Decisions Log - Research Backing

**📍 Location:** `03_DECISIONS_LOG/design-decisions-with-research-backing.md`

**🎯 Purpose:** Track every design decision + which research insight(s) support it. This creates **traceability**: Anyone can ask "Why did we decide X?" and see the research evidence.

**⏰ Update:** Every time a design decision is made (or when reviewing past decisions)

---

## 📋 Format

For each design decision, document:

```
Decision: [What decision?]
Insight(s): [Which research finding supports it?]
Evidence: [Quantified data from that research]
Owner: [Who made this decision?]
Date: [When decided?]
Status: [Pending / In Development / Shipped / Rolled Back]
Result: [Metrics after shipping - if applicable]
```

---

## 📌 Decision Log Entries

---

### Decision 1: Add Guest Checkout Feature

```
DECISION:
--------
Build guest checkout flow that allows users to complete booking 
without creating an account. Default to guest flow, account creation optional.

SUPPORTING RESEARCH:
--------------------
Primary Insight:
"Users abandon checkout because forced account creation feels unnecessary"

Evidence:
- Interview Study (2026-05): 7/8 users (87.5%) mentioned account friction
- Session Recording Analysis: 65% bounce rate at account creation step
- Survey (Q2 2026): 76% prefer guest checkout option
- Competitive: 5/5 major competitors offer guest checkout

Confidence: 🟢 HIGH
Sources:
  ✅ Checkout User Behavior Study (8 interviews)
  ✅ Guest Experience Survey Q2 (247 responses)
  ✅ Session Recording Analysis
  ✅ Competitive Pricing Analysis

DECISION DETAILS:
-----------------
Owner: Tran Vy (Product Manager)
Date Decided: 2026-05-20
Approval: [CEO name], [Design lead name]

IMPLEMENTATION:
---------------
Status: ✅ SHIPPED
Release Date: 2026-06-01
Time to Build: 2 sprints
Team: 1 designer + 2 engineers

RESULTS (Post-launch):
---------------------
Metric: Checkout Completion Rate
  Before: 42%
  After: 51%
  Lift: +9 percentage points ✅ exceeded 15-20% expectation (Conversion rate)

Metric: Account Creation Rate
  Before: 78% of checkouts created account
  After: 42% create account (rest use guest)
  Insight: Majority prefer guest flow (validates assumption)

Metric: Repeat Booking Rate
  Before: 18% of guests booked again within 3 months
  After: 22%
  Insight: Easier onboarding → more repeat bookings

Unexpected Finding:
  Guest checkout users were MORE likely to create account on 2nd booking
  (34% account adoption on repeat vs 22% abandonment)
  → Insight for future: Friction reduction builds trust for later monetization

DECISION IMPACT:
---------------
✅ Shipped successfully
✅ Exceeded expectations on conversion
✅ Provided downstream insight for repeat booking strategy
→ Featured in company blog post
→ Used in investor pitch

RELATED INSIGHTS:
-----------------
See Notion database:
- Insight: "Users abandon checkout due to account creation"
- Insight: "Mobile UX causes checkout friction"
- Related decision: Mobile Checkout Optimization (next)

RETROSPECTIVE NOTES:
--------------------
"This was a high-confidence decision backed by strong research.
The data clearly showed the problem. Implementation was straightforward.
Result validated the research perfectly. This is a case study in
evidence-based product decisions." - Tran Vy
```

---

### Decision 2: Mobile Checkout Optimization Sprint

```
DECISION:
--------
Dedicate sprint to optimize mobile checkout experience:
- Reduce form fields (from 12 to 6)
- Bigger touch targets (bigger buttons/inputs)
- Single-column layout instead of 2-column
- Auto-detect country/phone format

SUPPORTING RESEARCH:
--------------------
Primary Insight:
"Mobile checkout form too complex and hard to fill"

Evidence:
- Survey (Q2 2026): 68% report mobile difficulty
- Usability Test (2026-05): 3.5 min avg form completion on mobile vs 2 min desktop
- Session Recording: Mobile users pause >3s on 5+ form fields
- Support Tickets: 12% of mobile support requests about checkout

Confidence: 🟢 HIGH
Sources:
  ✅ Guest Experience Survey Q2 (247 responses)
  ✅ Booking Flow Usability Test (5 sessions)
  ✅ Session Recording Analysis (Hotjar)
  ✅ Support Ticket Analysis

DECISION DETAILS:
-----------------
Owner: Tran Vy (Product Manager)
Date Decided: 2026-05-25
Approval: [Design lead]

IMPLEMENTATION:
---------------
Status: 🔄 IN DEVELOPMENT
Sprint: Sprint 11-12 (2026-06-15 → 06-28)
Team: 1 designer + 2 frontend engineers
Expected ship: 2026-07-01

RESULTS (TBD):
---------------
[To be filled after launch]
Expected metrics to track:
- Form completion time (target: <2 min)
- Mobile conversion rate (target: +10-15%)
- Support tickets (target: -50%)

ASSUMPTION:
-----------
Simplified form + bigger buttons will reduce friction
Testing: A/B test simplified form vs current version (launched 2026-07-01)

DECISION RATIONALE:
------------------
Mobile is 45% of traffic but converts 20% lower than desktop.
Research clearly shows form complexity is culprit.
ROI: Low effort (1 sprint) + high impact (10-15% mobile lift)

RELATED INSIGHTS:
-----------------
See Notion database:
- Insight: "Mobile UX is main pain point"
- Insight: "Long forms cause abandonment"
- Related decision: Guest Checkout (shipped)
- Related decision: Form Simplification (pending)
```

---

### Decision 3: Limit Optional Fields in Host Listing Form

```
DECISION:
--------
Reduce host listing form from 25 fields to 12 required fields.
Move optional fields to Phase 2 (after listing published).
Add progress indicator + estimated time (2 min for MVP).

SUPPORTING RESEARCH:
--------------------
Primary Insight:
"Host listing creation has too many steps and optional fields confuse users"

Evidence:
- Interview Study (2026-03): 5/6 hosts (83%) struggled with form complexity
- Dropout metric: 40% of new hosts abandon listing creation
- Session recording: Avg 8.5 min to complete form (hosts expect 2-3 min)
- Common question: "Do I need to fill all fields?" (50% of support requests)

Confidence: 🟡 MEDIUM (6 interviews only, but strong signal)
Sources:
  ⚠️ Host Pain Points Study (6 interviews only)
  ✅ Session Recording Analysis
  ✅ Support Ticket Analysis
  ⚠️ Needs validation: A/B test or follow-up study

DECISION DETAILS:
-----------------
Owner: Minh (Product Lead - Host Experience)
Date Decided: 2026-05-28
Approval: [Design lead], [Engineering lead]

IMPLEMENTATION:
---------------
Status: 📋 PENDING
Sprint: Sprint 12-13 (2026-06-15 → 07-01)
Team: 1 designer + 2 backend engineers
Expected ship: 2026-07-15

PRE-LAUNCH VALIDATION:
---------------------
Before shipping, run follow-up usability test:
- [ ] Test simplified form with 3-5 new hosts
- [ ] Measure completion time
- [ ] Gather feedback on which fields felt optional
- [ ] Date: 2026-06-20 (before launch)

EXPECTED RESULTS:
-----------------
Metric: Form completion rate
  Target: Increase from 60% → 80%

Metric: Average time to complete
  Target: Reduce from 8.5 min → 2-3 min

Metric: New host onboarding success
  Target: Increase from 55% → 70%

ASSUMPTION TO VALIDATE:
----------------------
Assumption 1: Users find form overwhelming due to # of fields, not complexity
  Test: Compare time on simplified form vs. current
  
Assumption 2: Optional fields can wait until Phase 2
  Test: Track if hosts come back to add more info

DECISION RATIONALE:
------------------
Host onboarding is key bottleneck. Research shows clear problem.
Solution is straightforward: reduce cognitive load.
Risk is low (can always add fields back).
ROI: High (10-15% improvement in onboarding conversion).

NEXT STEPS:
-----------
1. Design simplified form (1 week)
2. Run follow-up usability test (1 week)
3. Incorporate feedback (3 days)
4. Build & ship (2 weeks)
5. Track metrics post-launch (ongoing)

RELATED INSIGHTS:
-----------------
See Notion database:
- Insight: "Listing creation form has too many steps"
- Insight: "Optional fields confuse new hosts"
- Assumption: "First-time hosts need different UX than experienced hosts"
  (needs validation via segmented analysis)

RETROSPECTIVE (TBD):
--------------------
[To be filled after launch and metrics analyzed]
```

---

### Decision 4: Price Transparency Feature (Pending Research)

```
DECISION:
--------
[PENDING - Awaiting final research findings from Competitor Pricing Analysis]

Planned Decision: Implement price breakdown showing:
- Base nightly rate
- Cleaning fee
- Service fee
- Total with taxes

Displayed BEFORE checkout (at search results step).

SUPPORTING RESEARCH (In Progress):
-----------------------------------
Preliminary Insight:
"Users want clear pricing upfront, transparency builds trust"

Evidence (Preliminary - 60% complete):
- Interview notes: 4/8 users mentioned confusing pricing
- Competitive analysis: 4/5 competitors show price breakdown early
- Support tickets: "Why is final price higher?" (common)

Confidence: 🟡 MEDIUM (incomplete study)
Sources:
  ⚠️ Checkout User Behavior Study (interview mentions, not primary focus)
  ⚠️ Competitor Pricing Analysis (in progress, 60% done)
  ⚠️ Support Ticket Analysis (qualitative only)

DECISION DETAILS:
-----------------
Owner: Minh (Product Lead)
Date Decided: [PENDING]
Status: 📋 AWAITING RESEARCH
Dependency: Competitor Pricing Analysis (due 2026-06-15)

NEXT STEPS:
-----------
1. Complete Competitor Pricing Analysis (due 2026-06-15)
2. Validate pricing sensitivity via survey (2026-06-20 → 07-05)
3. Make final decision (2026-07-10)
4. Design & develop (target ship 2026-08-15)

TIMELINE:
---------
⏳ Not yet scheduled - waiting for research validation

RELATED INSIGHTS:
-----------------
See Notion database:
- Insight: "Users want price transparency"
- Insight: "Confusing pricing causes checkout abandonment"
- Insight: "Competitor X has clear price breakdown"
```

---

### Decision 5: Segment-Specific Marketing (Validated Post-Launch)

```
DECISION:
--------
Create 2 marketing campaigns targeting different user segments:
1. Budget travelers: "Easy, quick booking - no account needed"
2. Luxury seekers: "Curated properties - top-rated hosts"

SUPPORTING RESEARCH:
--------------------
Primary Insight:
"Budget and luxury travelers have different decision drivers"

Evidence:
- Interview Study (2026-05): 
  Budget travelers (4 users): Fast, simple, price-focused
  Luxury seekers (3 users): Experience, quality, trust
- Survey data (Q2): Different features matter to each segment
- Search behavior: Different keywords, booking timeline patterns

Confidence: 🟡 MEDIUM
Sources:
  ✅ Checkout User Behavior Study (interviews segmented)
  ✅ Guest Experience Survey Q2 (segmented analysis)
  ⚠️ Needs deeper validation: Dedicated segment research

DECISION DETAILS:
-----------------
Owner: Tran Vy + Minh (Marketing)
Date Decided: 2026-05-30
Status: 🔄 IN PROGRESS (campaign creation)

IMPLEMENTATION:
---------------
Team: 2 copywriters + 1 media buyer
Timeline: 2026-06-01 → 06-20 (launch)
Media spend: $5K/month per segment

RESULTS (Post-Launch):
---------------------
Budget segment campaign:
  CTR: 2.3% (vs 1.8% control)
  Conversion: 4.1% (vs 3.2% control)
  Result: ✅ Outperforming

Luxury segment campaign:
  CTR: 1.9% (vs 1.8% control)
  Conversion: 3.8% (vs 3.2% control)
  Result: ✅ Slightly better

Learning: Budget segment messaging more effective
Insight: This validates research finding about different motivations

FOLLOW-UP RESEARCH NEEDED:
--------------------------
[ ] Why is budget segment messaging so effective?
[ ] Can we do even better segmentation (3+ segments)?
[ ] What's the ROI vs generic messaging over 12 months?

DECISION IMPACT:
---------------
✅ Shipped successfully
✅ Clear performance difference between segments
✅ Validated research assumption about segment differences
→ Informs future marketing strategy
→ Leads to new research opportunity: Deeper segment analysis

RETROSPECTIVE NOTES:
--------------------
"Segmentation decision was based on interview insights.
Post-launch results validated the research.
Segment-specific messaging clearly works.
Next: Deeper research to understand what messaging drives each segment."
```

---

## 📊 Decision Summary Table

| Decision | Research | Confidence | Status | Impact | Date |
|----------|----------|-----------|--------|--------|------|
| Guest Checkout | Checkout Study (87.5% mention) | 🟢 High | ✅ Shipped | +9pp conversion | 2026-06-01 |
| Mobile Optimization | Mobile Survey (68% difficulty) | 🟢 High | 🔄 In Dev | Expected +10-15% | 2026-07-01 (plan) |
| Simplify Host Form | Host Study (83% struggled) | 🟡 Med | 📋 Pending | Expected +15-20% | TBD |
| Price Transparency | Competitor Analysis | 🟡 Med | 📋 Awaiting Research | TBD | TBD |
| Segment Marketing | Interview Segmentation | 🟡 Med | ✅ Shipped | +20-25% CTR | 2026-06-20 |

---

## 🎯 Decision Quality Metrics

**Every quarter, review:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| % decisions backed by research | >80% | 100% | ✅ Excellent |
| Avg confidence of decisions | >Medium | High | ✅ Strong |
| % post-launch results match prediction | >70% | 75% | ✅ Good |
| Time from research → decision | <2 weeks | 1.5 weeks | ✅ Fast |
| Decision traceability (can trace why?) | 100% | 100% | ✅ Perfect |

---

## 🔄 How to Use This Log

### When Making a Decision:
1. Identify which research insight(s) support it
2. Link to Notion insight entries
3. Document confidence level
4. Add to this log
5. Share with team

### When Reviewing Past Decision:
1. Open this log
2. Find the decision
3. See research evidence
4. Review post-launch results
5. Learn for future decisions

### When Someone Questions a Decision:
"Why did we decide X?"
→ Open this log → See research evidence → End of discussion

---

## ✅ Checklist for Adding Decision

Before adding decision to this log:

- [ ] Decision is clearly documented (1 sentence)
- [ ] Research insight(s) identified + linked
- [ ] Evidence is quantified
- [ ] Confidence level marked
- [ ] Owner assigned
- [ ] Timeline clear
- [ ] Expected metrics defined
- [ ] Assumptions listed (if any)

---

## 🚀 Make It Routine

1. **Every design decision** → Add to this log
2. **Before making decision** → Check log (avoid repeating past decisions)
3. **After shipping** → Update with results
4. **Monthly** → Review decisions + results
5. **Quarterly** → Analyze what worked, what didn't

---

## 💡 Benefits

✅ **For Product Team:**
- Know WHY every decision was made
- Learn from what worked
- Avoid repeating mistakes

✅ **For New Team Members:**
- Understand product philosophy
- See how decisions are made
- Learn from past examples

✅ **For Stakeholders:**
- See evidence behind decisions
- Trust the product strategy
- Understand expected outcomes

✅ **For Investors/Board:**
- Demonstrate data-driven approach
- Show decision quality
- Prove accountability

---

## 🎓 This is Your Decision Memory

This log becomes your team's **permanent record** of how you make product decisions.

Keep it honest. Keep it updated. Use it to get better.

Good luck! 🚀
