# 48-Hour Research Synthesis Workflow

**⏱️ Deadline: Research ends → Synthesis DONE in 48 hours**

---

## 📊 Why 48 Hours?

✅ **Benefits:**
- Insights still fresh in mind (not "cold")
- Details haven't been forgotten
- Team gets findings while momentum high
- Can answer follow-up questions immediately

❌ **If you wait >48h:**
- Details fade away
- Context gets lost
- Team moves on to next project
- Insights end up sitting in personal notes forever

---

## 🎯 The 48-Hour Timeline

### **Hour 0 (Research Ends)**
- ✅ Final participant interviewed
- ✅ Last session recorded
- ✅ Survey closed

**Action:** Create calendar event "Research Synthesis Due" 48h from now

---

### **Hour 0-2 (Immediate After Research)**

**Do this RIGHT AFTER research ends, while details are fresh:**

- [ ] **Collect all raw data**
  ```
  ✅ Recording files (video/audio)
  ✅ Transcripts (if available)
  ✅ Survey responses (export as CSV/Excel)
  ✅ Interview notes (scan/digitize if handwritten)
  ✅ Screenshots/session clips
  ✅ Metrics/logs (if tracked)
  ```

- [ ] **Create findings folder**
  ```
  research-repository/
  └── 01_SYNTHESIZED_INSIGHTS/
      └── findings-[topic]-[date].md  ← Create this
  ```

- [ ] **Do quick brain dump** (15 min)
  - Write down top 3-5 insights cảm thấy từ research
  - Jot down key quotes that stuck with you
  - Note any "aha!" moments
  - This is for yourself, doesn't need to be perfect

**Example brain dump:**
```
Top takeaways from checkout study:
1. Users HATE forced account creation - mentioned by almost everyone
2. Mobile checkout way more painful than desktop
3. Price transparency build trust
4. Recurring bookers want saved payment methods

Key quotes:
- "I almost cancelled because of account requirement"
- "On my phone, the form is impossible to fill"
- "I want to know exactly what I'm paying"

To investigate further:
- Why is mobile so painful? Layout? Performance?
- Do women vs men have different pain points?
```

**Time spent: 30 min**

---

### **Hour 2-24 (Deep Synthesis)**

**Do this the next morning/afternoon (not immediately, give brain rest):**

- [ ] **Listen/read through everything**
  - [ ] Watch/listen to 1-2 full recordings (take notes)
  - [ ] Scan through all interview notes
  - [ ] Read survey responses
  - [ ] Extract key quotes
  - [ ] Jot down patterns you see emerging

- [ ] **Identify themes**
  - Group insights into 3-5 major themes
  - Example:
    ```
    Theme 1: Account Creation Friction
    Theme 2: Mobile UX Pain Points
    Theme 3: Price Transparency
    Theme 4: Payment Security Trust
    ```

- [ ] **Quantify everything**
  - Count: How many users mentioned each theme?
  - Percentage: What % of sample size?
  - Frequency: How many times mentioned?
  
  ```
  ❌ "Many users mentioned account creation"
  ✅ "7 out of 8 users (87%) mentioned account creation as friction"
  ```

- [ ] **Write Findings Document**
  - Use template: findings-synthesis-template.md (tôi sẽ create)
  - Structure: Thematic findings + evidence + quotes
  - Save to: 01_SYNTHESIZED_INSIGHTS/findings-[topic]-[date].md

**Time spent: 3-4 hours (spread across day)**

---

### **Hour 24-48 (Final Polish & Add to Repository)**

**Due: Before end of second day (48h from research end)**

- [ ] **Add entry to Notion database**
  - [ ] Insight statement (1 sentence)
  - [ ] Evidence (quantified)
  - [ ] Confidence level
  - [ ] Research type
  - [ ] Keywords
  - [ ] Status
  - [ ] Link to detailed findings file
  
  👉 Use template: 03_INSIGHT_ENTRY_TEMPLATE.md

- [ ] **Extract empathy map** (if interviewing)
  - Create 01_SYNTHESIZED_INSIGHTS/empathy-maps/[persona]-empathy-map.md
  - Document: Wants, Pains, Gains, Jobs
  
- [ ] **Add to Studies Index**
  - Update 02_STUDIES_INDEX/studies-index.md
  - Entry: Study name, date, method, # participants, findings link

- [ ] **Create/Update Personas** (if enough data)
  - If running multiple studies, aggregate to personas
  - Save to: 01_SYNTHESIZED_INSIGHTS/personas/

- [ ] **Share with team**
  - Post in Slack/email
  - Schedule for next team sync
  - Make it visible & accessible

**Time spent: 1-2 hours**

---

## 📋 Detailed Checklist Template

**Copy this, fill in, and check off as you go:**

```
RESEARCH SYNTHESIS - 48 HOUR CHECKLIST
====================================

Study Name: [Your study name]
Study Dates: [Start date] → [End date]
Synthesis Due: [48h from end date]
Synthesized By: [Your name]

HOUR 0-2: COLLECTION
--------------------
[ ] Gather raw data
    [ ] Recordings collected
    [ ] Transcripts organized
    [ ] Survey responses exported
    [ ] Notes digitized
    [ ] Screenshots/clips saved
    
[ ] Create folder: 01_SYNTHESIZED_INSIGHTS/findings-[topic]-[date].md
[ ] Do brain dump (write top 3-5 insights + key quotes)

TIME LOGGED: ___ minutes

HOUR 2-24: SYNTHESIS
--------------------
[ ] Re-watch/read all materials
[ ] Identify 3-5 major themes
[ ] Quantify each theme
    [ ] User count for each theme
    [ ] Percentage of sample size
    [ ] Frequency of mention
[ ] Write findings document
    [ ] Thematic insights
    [ ] Supporting evidence (quantified)
    [ ] Direct quotes (3-5 best ones)
    [ ] Any patterns noticed

TIME LOGGED: ___ minutes

HOUR 24-48: REPOSITORY
----------------------
[ ] Add to Notion database
    [ ] Insight statement written
    [ ] Evidence with numbers
    [ ] Confidence selected (Low/Med/High)
    [ ] Research type checked
    [ ] Keywords added
    [ ] Status set (Pending/In Progress/etc)
    [ ] Link to detailed findings
    
[ ] Create supporting files
    [ ] Empathy map (if interviews)
    [ ] Persona (if applicable)
    [ ] Journey map (if applicable)
    
[ ] Update Studies Index
    [ ] Added study entry
    [ ] Linked to findings
    [ ] Noted method + participants
    
[ ] Share with team
    [ ] Posted in Slack
    [ ] Added to next team sync agenda
    [ ] Accessible link shared

TIME LOGGED: ___ minutes

QUALITY CHECK
-------------
[ ] Insights are specific (not vague)
[ ] Evidence is quantified (numbers/%)
[ ] Quotes are direct (verbatim)
[ ] All files properly named & organized
[ ] Links work (Notion ↔ file system)
[ ] Confidence level makes sense
[ ] Keywords are searchable

FINAL SIGN-OFF
--------------
Completed by: ________________  Date: __________
Reviewed by: ________________   Date: __________

NOTES:
```

---

## 📁 File Organization Checklist

**Verify this structure exists after synthesis:**

```
research-repository/
├── 00_RAW_DATA/
│   ├── interviews/
│   │   ├── 2026-05-[date]-[topic].md  ✅
│   │   └── recordings/ ✅
│   ├── surveys/
│   │   └── [topic]-responses.xlsx ✅
│   └── session-recordings/
│       └── [date]-hotjar-clips.md ✅
│
├── 01_SYNTHESIZED_INSIGHTS/
│   ├── empathy-maps/
│   │   └── [persona]-empathy-map.md ✅
│   ├── personas/
│   │   └── persona-[name].md ✅
│   ├── journey-maps/
│   ├── key-findings/
│   │   └── findings-[topic]-2026-05.md ✅
│   └── quotes-verbatim/
│       └── quotes-[topic].md ✅
│
├── 02_STUDIES_INDEX/
│   └── studies-index.md (UPDATED) ✅
│
└── 03_DECISIONS_LOG/
    └── (to be updated when decision made)
```

---

## ⚠️ Common Pitfalls & How to Avoid

### ❌ Pitfall 1: "I'll do it tomorrow"
**Problem:** Research ends Friday → You do it Monday → Details are fuzzy

**Solution:** 
- Do Hour 0-2 (collection + brain dump) **immediately** while fresh
- Do Hour 2-24 the next day (you'll have better context)
- Do Hour 24-48 on deadline day

---

### ❌ Pitfall 2: "This insight is obvious, I'll remember it"
**Problem:** You don't → same research gets done again next quarter

**Solution:**
- Write it down immediately
- Add to Notion even if seems obvious
- "Obvious to you now" ≠ "obvious to new team member"

---

### ❌ Pitfall 3: "I'll synthesize everything perfectly"
**Problem:** Perfectionism paralysis → never finishes

**Solution:**
- Use template (doesn't need to be perfect)
- 48h limit is hard deadline (not negotiable)
- "Good enough" synthesis > "perfect" synthesis done late

---

### ❌ Pitfall 4: "I'll add the video link later"
**Problem:** Later never comes → raw data gets lost

**Solution:**
- Add links/files **during** 48h window
- Part of checklist = must complete

---

### ❌ Pitfall 5: "Survey data speaks for itself"
**Problem:** Raw numbers are hard to understand

**Solution:**
- Add interpretation layer
- Example: "42% selected X" → What does this MEAN?
- Turn into insight: "Majority prefer X over Y because..."

---

## 🎯 Signs You're Done

✅ **Checklist complete when:**

- [ ] All raw data is organized in 00_RAW_DATA/
- [ ] Findings document written (01_SYNTHESIZED_INSIGHTS/)
- [ ] Notion entry created with 5 key fields
- [ ] Studies Index updated
- [ ] Team has been notified
- [ ] Links all work (Notion ↔ files ↔ recordings)
- [ ] Every insight has quantified evidence
- [ ] Status field is filled (not blank)

---

## 📞 Quick Questions

**Q: What if I don't have time for full synthesis?**
- A: Do Hour 0-2 immediately (collection + brain dump)
- Then minimum: 1 Notion entry + link to raw data
- Full synthesis can happen next sprint (but within repository)

**Q: Should I wait to validate before adding to Notion?**
- A: No. Add as "Pending" + note what validation is needed
- Mark as "In Progress" when validating
- Mark as "Addressed" when shipped

**Q: What if insights contradict each other?**
- A: Add both to repository
- Note confidence level (one might be Low, other High)
- Let data tell the story
- Flag "contradicting insights - need follow-up research"

**Q: Do I need to transcribe full interviews?**
- A: No. But do create:
  - Timestamp notes ("5:30 - user mentioned X")
  - Best quotes (verbatim)
  - Key themes (your synthesis)
- Full transcription = nice to have, not required

---

## 🚀 Make It Routine

**To make 48h synthesis a habit:**

1. **Add to calendar**: Recurring task "Research Synthesis Due"
   - Trigger: 48h after research ends
   - Duration: Block 6-7 hours

2. **Add to sprint**: Research synthesis = part of sprint scope
   - Don't treat as "extra"
   - Allocate capacity for it

3. **Make it team ritual**: Weekly Monday sync
   - "What research did we finish?"
   - "New insights to share?"
   - Celebrate good synthesis

4. **Peer review**: Have someone review synthesis
   - Catches vague language
   - Confirms quantification makes sense
   - Spreads knowledge across team

---

## 📈 Track Your Compliance

**Every month, measure:**

| Metric | Target | How to improve |
|--------|--------|----------------|
| % research synthesized in 48h | 90%+ | Add calendar reminders |
| % Notion entries complete | 100% | Use template (removes guesswork) |
| % insights with quantified evidence | 100% | Checklist step |
| Avg time to synthesize | 5-7h | Templates save time |

---

## ✅ Ready?

Print this checklist. Post on your desk. Use every time you finish research.

**Remember:** Consistency > Perfection

48h window is tight, but not impossible. And it's the difference between insights that sit in personal notes forever vs. insights that drive product decisions for years.

**You got this! 🚀**
