# Findings Synthesis Template

**📝 Dùng template này để write detailed findings document**

**File name:** `findings-[topic]-[date].md`  
**Location:** `01_SYNTHESIZED_INSIGHTS/key-findings/`  
**Time to complete:** 2-3 hours  
**Deadline:** Within 48 hours of research completion

---

## 📋 Header

```markdown
# Findings: [Study Name]

**Study Date:** [Start] → [End date]  
**Research Method:** [Interview / Survey / Usability Test / etc.]  
**Participants:** [Number]  
**Conducted By:** [Name]  
**Synthesized By:** [Name]  
**Date Synthesized:** [Date]  
**Status:** 🔄 In Review / ✅ Final  

**Key Quote:**
> "[Most impactful quote from study]"
> — User #, [Date]

**TLDR (30 seconds):**
[Write 2-3 sentences covering the main finding and implication]

---
```

---

## 🎯 Section 1: Research Overview

### Objective
```
What question were we trying to answer?

Example:
"Why do users abandon checkout? What's the biggest friction point?"
```

### Method
```
How did we collect data?

Example:
- 1-on-1 interviews (30 min each)
- 8 participants (mix of budget & luxury travelers)
- Semi-structured interview guide
- Recorded + transcribed
```

### Participants
```
Who did we talk to?

Example:
- Participant 1: Budget traveler, age 28, first-time guest
- Participant 2: Repeat booker, luxury preferences, age 42
- Participant 3: Business traveler, books weekly, age 35
- ... (and 5 more)

Segmentation:
- Budget travelers: 4 participants
- Luxury seekers: 3 participants
- Business travelers: 1 participant
```

### Sample Size & Confidence
```
How many is enough?

- Total sample: 8 participants
- Enough for qualitative insights? YES (6-8 is sweet spot for interviews)
- Expected confidence: Medium-High (depending on validation)
```

---

## 🔍 Section 2: Key Findings (Thematic)

**Break findings into 3-5 major themes. For each theme:**

### Theme 1: [Theme Name]

**Finding:**
```
State the insight clearly and specifically.

Template:
"[User segment] [action] because [reason] and [impact]"

Example:
"Users abandon checkout during account creation because they see it 
as unnecessary friction, and it increases abandonment rate by 65%"
```

**Evidence (Quantified):**
```
How many users mentioned this? What metrics support it?

Example:
- Interview mentions: 7 out of 8 users (87.5%)
- Session recording data: 65% bounce rate at account creation step
- Survey validation: 76% agree "I prefer guest checkout"
- Competitive research: 5/5 competitors offer guest checkout
- Time cost: Average 2.3 minutes to create account vs 0.5 min guest flow

Confidence: 🟢 HIGH
(Multiple sources, consistent signal, quantified)
```

**Supporting Quotes:**
```
Direct quotes from users (verbatim):

"I really don't want to create an account just for a one-night stay."
— User 5, Interview 2026-05-12

"The account creation step almost made me cancel my booking."
— User 3, Interview 2026-05-11

"Why do I need to create an account if I'm never staying again?"
— User 7, Interview 2026-05-14
```

**Segments Affected:**
```
Does this apply to everyone or specific segments?

Example:
- Budget travelers: 4/4 mentioned (100%)
- Luxury seekers: 2/3 mentioned (67%)
- Business travelers: 1/1 mentioned (100%)

Insight: Affects all segments, but especially budget travelers
```

**Related Findings:**
```
Does this connect to other findings?

Example:
→ Related to "Mobile UX friction" (account form hard to fill on mobile)
→ Related to "Trust issues" (users want transparent pricing first)
→ Opposite to "Repeat bookers value saved payment methods"
```

**Design Implication:**
```
If we act on this finding, what should we do?

Example:
"Should offer guest checkout option without forcing account creation.
This could increase conversion rate by 15-20% based on similar products."
```

---

### Theme 2: [Theme Name]
[Repeat above structure]

### Theme 3: [Theme Name]
[Repeat above structure]

### Theme 4: [Theme Name]
[Repeat above structure]

---

## 📊 Section 3: Data Summary Table

**Quick reference for all findings:**

| Theme | Finding | Evidence | Confidence | Segments | Status |
|-------|---------|----------|-----------|----------|--------|
| Account Creation | Forced account creation causes abandonment | 7/8 users, 65% bounce rate, 76% survey | 🟢 High | All | Pending implementation |
| Mobile UX | Mobile checkout form too complex | 5/8 users, 23s avg fill time vs 8s on desktop | 🟡 Medium | All | Pending validation |
| Price Transparency | Users want clear final price upfront | 6/8 users, 89% survey agree | 🟢 High | Luxury, Budget | Pending |
| Payment Security | Users concerned about payment safety | 4/8 users, 60% survey worried | 🟡 Medium | Older demographic | In validation |

---

## 🎓 Section 4: Key Learnings

### What Did We Learn?
```
Synthesize the top 3 learnings in plain language:

1. [Learning 1]
2. [Learning 2]
3. [Learning 3]
```

### Surprising Findings
```
What was unexpected?

Example:
- Luxury travelers ALSO want guest checkout (we assumed they'd want account benefits)
- Mobile experience was more painful than expected (not just layout, but form complexity)
- Repeat bookers most frustrated (they value saved payments but hate re-creating accounts)
```

### Validation Needed
```
What still needs testing/confirmation?

Example:
- [ ] Does guest checkout actually increase conversion? (A/B test)
- [ ] How much do saved payment methods matter vs no account? (Survey)
- [ ] Mobile form: Is it layout or form field complexity? (Usability test)
```

---

## 🚀 Section 5: Recommendations

### Immediate Actions (Sprint-Ready)
```
What can we do in next sprint?

Example:
1. Design guest checkout flow (1 designer, 1 sprint)
2. A/B test guest vs account-required flow (1 week)
3. Gather baseline metrics (CTR, bounce rate at checkout)

Expected impact: 10-20% conversion lift based on industry benchmarks
```

### Medium-Term (Next Quarter)
```
Example:
1. Expand to repeat booker journey (saved payments for guests)
2. Mobile-specific optimization (form redesign)
3. Pricing transparency feature (show final cost before checkout)
```

### Long-Term (Roadmap)
```
Example:
1. Social login integration (alternative to account creation)
2. One-click repeat booking
3. Personalized pricing for repeat guests
```

### What NOT to Do
```
Based on this research, avoid:

Example:
- Don't make account creation MORE complex (already painful)
- Don't hide pricing (transparency matters)
- Don't assume repeat bookers want account benefits (they want frictionless booking)
```

---

## 📌 Section 6: Personas Informed

**Did this research inform any personas?**

```
Persona Name: Budget Traveler
- Pain Point: Forced account creation (from this study)
- Motivation: Quick, frictionless booking
- Would value: Guest checkout, one-click booking
- Warning signs: Will abandon if account required

Persona Name: Luxury Seeker
- Pain Point: Not visible before study (assumed different)
- Finding: Also prefers guest checkout for one-off stays
- Motivation: Simplicity, not account benefits
- Would value: Speed, transparency, security

Persona Name: Repeat Booker
- Pain Point: Account friction + saved payment methods don't work for guests
- Motivation: Want speed AND payment convenience
- Would value: Guest flow with option to save payment for next time
```

---

## 🔗 Section 7: Raw Data References

**Where can team find source data?**

```
Interview recordings:
- Drive link: [Link to recording folder]
- Transcripts: research-repository/00_RAW_DATA/interviews/
- Key moments tagged: See [interview-summary.md]

Survey data:
- Full responses: research-repository/00_RAW_DATA/surveys/guest-checkout-survey.xlsx
- Summary stats: [Summary file]

Session recordings:
- Hotjar clips: research-repository/00_RAW_DATA/session-recordings/
- Timestamp notes: [Notes file with key moments]

Heatmaps:
- Checkout flow: [Hotjar link or screenshot]
- Form completion: [Screenshot]
```

---

## 📎 Section 8: Team Resources

### Appendix A: Full Interview Guide
```
[Paste your interview questions here for context]

Questions asked:
1. Tell me about your last booking experience...
2. Walk me through the checkout process...
3. What frustrates you about booking online...
4. What would make checkout easier...
```

### Appendix B: Survey Questions & Responses
```
Q: "Would you prefer guest checkout without account creation?"
A: 76% Yes, 18% No, 6% Undecided

Q: "How important is saving payment info for future bookings?"
A: Very Important: 42%, Somewhat: 35%, Not Important: 23%
```

### Appendix C: Heatmaps & Screenshots
```
[Embed or link to key visual data]
- Checkout form heatmap
- Account creation step drop-off visualization
- Mobile vs desktop comparison
```

### Appendix D: Competitive Comparison
```
| Competitor | Guest Checkout | Saved Payments | Account Required | Notes |
|------------|---|---|---|---|
| Airbnb | ✅ | ✅ | No | Industry standard |
| Booking.com | ✅ | ✅ | No | Quick guest flow |
| VRBO | ✅ | Limited | No | Account optional |
| Our Platform | ❌ | ✅ | YES | Opportunity! |
```

---

## ✅ Checklist Before Publishing

- [ ] All themes have specific insights (not vague)
- [ ] All evidence is quantified (%, #, metrics)
- [ ] At least 3 quotes per theme
- [ ] Recommendations are actionable
- [ ] Appendices linked/included
- [ ] Personas updated based on findings
- [ ] Status marked (In Review / Final)
- [ ] Shared with team
- [ ] Added to Notion database
- [ ] Added to Studies Index

---

## 📤 Distribution

**When document is ready:**

1. **Add to Repository**
   - Save to: `01_SYNTHESIZED_INSIGHTS/key-findings/`
   - Update: `02_STUDIES_INDEX/studies-index.md`

2. **Create Notion Entry**
   - Copy main findings into Notion insight entry
   - Link to this detailed document
   - Mark status + confidence

3. **Share with Team**
   - Slack: "New research complete - [link]"
   - Team sync: Present findings (10 min)
   - Email: Summary for stakeholders

4. **Tag Design Decisions**
   - If design decision made: update "Related Decisions" field
   - If no decision yet: mark as "Pending"

---

## 💡 Tips

**Make it skimmable:**
- Use headers & bullet points
- Bold key statistics
- First paragraph of each theme = TL;DR

**Make it actionable:**
- Every finding → What it means for design
- Every insight → What should we do?

**Make it credible:**
- Include raw quotes
- Show the numbers
- Explain confidence level

**Make it searchable:**
- Use consistent terminology
- Include Keywords at top
- Link to related findings

---

## 🚀 Good Luck!

This template gets you 80% of the way there. The other 20% is your context and judgment.

**Remember:** This findings document is a **permanent asset**. Someone reading it 6 months from now (maybe someone new) should understand exactly what you found and why it matters.

Make it count! 📊
