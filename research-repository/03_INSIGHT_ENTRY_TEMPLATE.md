# Insight Entry Template

**⏱️ Sử dụng template này trong vòng 48 giờ sau khi research kết thúc**

---

## 📋 Basic Info

**Research Study Name:** 
[VD: Checkout User Behavior Study 2026-05]

**Study Date:** 
[VD: 2026-05-10 → 2026-05-15]

**Research Conducted By:** 
[Tên người]

**Study Link (to detailed findings):** 
[Link tới file trong 01_SYNTHESIZED_INSIGHTS/]

---

## 💡 Insight Statement

**Viết 1 câu rõ ràng, specific, action-focused:**

```
[KHÔNG] "Users have problems with checkout"
[CÓ] "Users abandon checkout because the forced account creation feels unnecessary and adds friction"
```

**Template:**
```
Users [ACTION] because [REASON] 
and [IMPACT/CONSEQUENCE]
```

**Viết ở đây:**

---

## 📊 Evidence

**Quantified data. Cần SỐ LƯỢNG, %, hoặc frequency:**

```
❌ "Many users mentioned they didn't like account creation"
✅ "7/8 users (87%) mentioned forced account creation during interviews"
✅ "Session recordings show 65% bounce rate at account creation step"
✅ "Survey: 76% prefer guest checkout option"
```

**Cách đếm evidence sources:**
- 1 user mention = 1 source point
- 1 metric (bounce rate, conversion drop) = 1 source point
- 1 survey response pattern = counts as multiple if quantified

**Viết ở đây:**

```
- [Source type]: [Specific evidence]
  Number/Percentage: [QUANTIFY]
  
- [Source type]: [Specific evidence]
  Number/Percentage: [QUANTIFY]
  
- [Source type]: [Specific evidence]
  Number/Percentage: [QUANTIFY]
```

**Example:**
```
- User interviews: 7/8 users mentioned friction with account creation requirement
  Percentage: 87.5%
  
- Session recordings: Significant pause and hesitation at account creation screen
  Bounce rate: 65% (calculated from Hotjar)
  
- Survey: "I prefer to checkout as guest without creating an account"
  Percentage: 76% of respondents agreed
  
- A/B test: Guest checkout vs forced account
  Conversion lift: +18% (test ran 2026-05-01 → 2026-05-10)
```

---

## 🎯 Confidence Level

**Hỏi: Bạn confident bao nhiêu trên scale 1-3?**

### 🔴 Low Confidence (1-2 sources)
- Chỉ 1-2 users mentioned
- Single data point
- Anecdotal evidence
- Cần validation thêm

**Use case:** Interesting hypothesis, nhưng cần research thêm trước implement

### 🟡 Medium Confidence (3-4 sources)
- 3-4 users mentioned / sources
- Một vài data points từ khác nhau
- Starting to see pattern
- Reasonable để pilot/test

**Use case:** Confident enough để prioritize, nhưng validate bằng A/B test

### 🟢 High Confidence (5+ sources)
- 5+ users mentioned / sources
- Multiple data points aligned
- Clear pattern visible
- Validated across methods

**Use case:** Ready để implement với confidence cao

**Mình chọn:**
- [ ] 🔴 Low
- [ ] 🟡 Medium
- [ ] 🟢 High

**Giải thích:**
[VD: High confidence vì có interview (7 users), session recordings (65% bounce), survey (76%), và emerging A/B test data]

---

## 🏷️ Research Type

**Loại research nào được dùng?** (Tick tất cả relevant)

- [ ] Interview (qualitative)
- [ ] Survey (quantitative)
- [ ] Usability Test
- [ ] Session Recording / Heatmap
- [ ] Competitive Analysis
- [ ] Market Research / Desk Research
- [ ] A/B Test / Experiment
- [ ] Support Tickets / Customer Feedback
- [ ] Other: ___________

---

## 🔑 Keywords

**Viết 5-7 keywords để search after:**

```
checkout, account creation, friction, guest checkout, abandonment, 
conversion rate, user experience
```

**Tips:**
- Include primary keyword first
- Include persona if specific (e.g., "budget travelers")
- Include pain point area (e.g., "checkout", "booking")
- Include metric if applicable (e.g., "conversion", "bounce rate")

---

## 📌 Status

**Current status:**

- [ ] 📋 **Pending** 
  - Found but not yet acted on
  - Still gathering supporting evidence
  
- [ ] 🔄 **In Progress** 
  - Being addressed (feature in development, experiment running)
  - Assigned to team member
  
- [ ] ✅ **Addressed** 
  - Implemented / Shipped
  - Assumption validated
  - Date shipped: ___________
  
- [ ] ❌ **Invalidated** 
  - Disproven by new data
  - No longer relevant
  - Date invalidated: ___________

---

## 🔗 Related Design Decisions

**Ngay bây giờ hoặc sau:**

Design decision nào dùng insight này?

```
- Decision: Guest Checkout Feature
  Status: In development
  Expected ship: 2026-06-01
  
- Decision: [Another decision]
  Status: [Pending/In progress/Shipped]
```

**Note:** Cập nhật field này khi design decision được ship

---

## 📎 Supporting Documents

**Attach or link:**

- [ ] Interview transcripts
- [ ] Recording link (Loom, Drive, etc.)
- [ ] Survey results spreadsheet
- [ ] Session recording clips
- [ ] Detailed findings file

**Links:**
```
- Raw data: [Drive/Box link]
- Transcripts: [File location]
- Detailed findings: 01_SYNTHESIZED_INSIGHTS/findings-checkout-2026-05.md
```

---

## 💬 Direct Quotes (Optional but Recommended)

**Paste 1-3 verbatim quotes từ users:**

> "I really don't want to create an account just to buy one night stay."
> — User 5, Interview 2026-05-12

> "The account creation step made me almost cancel my booking."
> — User 7, Interview 2026-05-14

**Why include quotes?**
- Makes insight more tangible để team
- Helps convince skeptics
- Great for stakeholder presentations

---

## ⚠️ Assumptions to Validate

**Ghi ra assumptions nào liên quan mà cần validate thêm:**

```
- Assumption: All user segments equally bothered by account creation
  How to validate: Segment survey data by user type
  Priority: Medium
  
- Assumption: Guest checkout will increase conversion by 15%+
  How to validate: A/B test (planned for Q3)
  Priority: High
```

---

## 📅 Timeline

**Khi xảy ra gì?**

- Research conducted: [2026-05-10 → 2026-05-15]
- Insight synthesized: [2026-05-17]
- Insight added to repository: [2026-05-17]
- Design decision made: [2026-05-20]
- Feature shipped: [2026-06-01]
- Result tracked: [2026-06-15]

---

## 🎓 Learning & Takeaway

**Mục đích của research này là gì?**

```
Learning: User friction at account creation is major barrier to conversion
Takeaway: Removing account requirement could improve checkout completion
Application: Build guest checkout feature
```

---

## ✅ Checklist Before Submit

- [ ] Insight statement là specific, action-focused
- [ ] Evidence có quantified numbers (%, #users, metrics)
- [ ] Confidence level selected (Low/Medium/High) + explained
- [ ] Research type(s) checked
- [ ] Keywords written (5-7)
- [ ] Status selected
- [ ] Supporting documents linked
- [ ] At least 1 verbatim quote included
- [ ] Timeline noted
- [ ] Assumptions to validate listed

---

## 📤 Where to Submit

**Add entry vào:**

1. **Notion Database**: Research Insights Master
   - Copy fields từ template này
   
2. **File System**: 01_SYNTHESIZED_INSIGHTS/
   - Save template này as `[insight-topic]-[date].md`
   - VD: `findings-checkout-guest-flow-2026-05.md`

3. **Update 02_STUDIES_INDEX/studies-index.md**
   - Add entry về study này

---

## 💡 Tips

**Write like you're explaining to someone who wasn't there:**
- Assume reader hasn't seen the research
- Include enough context
- Be specific, not vague

**Confidence is not about sample size alone:**
- Multiple weak signals can = high confidence
- Single strong signal might = medium confidence
- Consistency across methods matters

**Evidence section is your credibility:**
- More specific = more credible
- Generic evidence = insight sounds weak

**Keep updating as you learn more:**
- Insight not invalidated = update evidence as you get more data
- New validation found = increase confidence level
- Related decision made = update that field

---

## 🚀 Next Steps

1. Fill this template **within 48 hours** of research completion
2. Add to Notion database
3. Save detailed version to file system
4. Share with team in weekly sync
5. Update status as design decisions are made

**Great insights come from great documentation!**
