# Research Repository - Notion Template Setup

## 🗂️ Cách setup trên Notion

### Step 1: Create Database
1. Tạo page mới trong Notion workspace
2. Chọn "Database" → "Table"
3. Rename thành "Research Insights Master"

### Step 2: Configure Properties

**Property 1: Title (default)**
- Name: `Insight`
- Type: Title
- Description: Core insight statement

**Property 2: Evidence**
- Name: `Evidence`
- Type: Text
- Description: Quantified data supporting the insight (e.g., "7/8 users mentioned", "65% bounce rate")

**Property 3: Confidence**
- Name: `Confidence`
- Type: Select
- Options: 
  - 🔴 Low (1-2 sources)
  - 🟡 Medium (3-5 sources)
  - 🟢 High (5+ sources or validated)

**Property 4: Source**
- Name: `Source`
- Type: Text
- Description: Study name + date (e.g., "Interview 2026-05, Checkout Usability Study")

**Property 5: Status**
- Name: `Status`
- Type: Select
- Options:
  - 📋 Pending (Found but not acted on)
  - 🔄 In Progress (Being addressed)
  - ✅ Addressed (Implemented)
  - ❌ Invalidated (Disproven)

**Property 6: Research Type** (Optional)
- Name: `Research Type`
- Type: Select
- Options:
  - Interview
  - Survey
  - Usability Test
  - Session Recording
  - Competitive Analysis
  - Market Research

**Property 7: Study Link**
- Name: `Study Link`
- Type: URL
- Description: Link to detailed findings in 01_SYNTHESIZED_INSIGHTS/

**Property 8: Keywords**
- Name: `Keywords`
- Type: Text
- Description: Tags for searching (comma-separated)

**Property 9: Date Created**
- Name: `Date Created`
- Type: Date
- Description: When insight was created

**Property 10: Related Decisions**
- Name: `Related Decisions`
- Type: Text
- Description: Link to design decisions using this insight

---

## 🔍 Views để setup

### View 1: All Insights
- Default table view
- Sort by: Date Created (newest first)
- Filter: None

### View 2: By Status
- Table view
- Group by: Status
- Useful để see ngay cái insights pending vs addressed

```
📋 Pending
  - User bỏ checkout vì account creation
  - Long loading time frustrates users
  
🔄 In Progress
  - Guest communication preferences
  
✅ Addressed
  - Booking flow confusion
```

### View 3: High Confidence Only
- Table view
- Filter: Confidence = High
- Sort by: Date Created
- Useful để quick access most validated insights

### View 4: Research Index
- Gallery or Table view
- Group by: Research Type
- Shows all studies conducted

```
Interview
  - 2026-05 Guest Behavior Study
  - 2026-04 Host Pain Points
  
Survey
  - Q2 Guest Satisfaction Survey
  - Competitor Pricing Perception
```

### View 5: Decisions Traceability
- Table view
- Filter: Related Decisions ≠ empty
- Shows mỗi decision + supporting insights

---

## 📝 Example Entries

### Entry 1: High Confidence Insight
```
Insight: Users abandon checkout due to forced account creation

Evidence: 
- 7/8 users mentioned friction during interview
- Session recordings show 65% bounce rate at account creation step
- Survey: 76% prefer guest checkout

Confidence: 🟢 High

Source: Checkout Usability Study 2026-05, Guest Behavior Interviews 2026-05

Status: ✅ Addressed

Research Type: Usability Test, Interview

Study Link: /research-repository/01_SYNTHESIZED_INSIGHTS/findings-booking-flow-2026-05.md

Keywords: checkout, account creation, friction, abandonment, guest experience

Date Created: 2026-05-15

Related Decisions: Guest Checkout Feature (shipped 2026-06)
```

### Entry 2: Medium Confidence Insight
```
Insight: Long loading time on property gallery frustrates users

Evidence:
- Mentioned by 4/10 survey respondents
- Heatmap shows scroll pause >3s on gallery section

Confidence: 🟡 Medium

Source: Guest Experience Survey Q2 2026, Session Recording Analysis

Status: 🔄 In Progress

Research Type: Survey, Session Recording

Study Link: /research-repository/01_SYNTHESIZED_INSIGHTS/findings-guest-experience-q2.md

Keywords: performance, loading, frustration, gallery, ux

Date Created: 2026-05-20

Related Decisions: Image Optimization Initiative
```

### Entry 3: Pending Insight
```
Insight: Budget travelers book last-minute; luxury seekers plan ahead

Evidence:
- Budget segment: 70% book within 48h
- Luxury segment: 65% book >2 weeks ahead

Confidence: 🟢 High

Source: Booking Pattern Analysis 2026-Q2

Status: 📋 Pending

Research Type: Market Research, Competitive Analysis

Study Link: /research-repository/01_SYNTHESIZED_INSIGHTS/findings-booking-behavior.md

Keywords: booking behavior, booking timeline, segments, personas

Date Created: 2026-05-18

Related Decisions: [To be filled] - Potential for segment-specific marketing
```

---

## 🔗 Database Relations (Advanced)

Nếu team muốn track connections:

### Add Master Database: Studies Index
- Name: `Study Name` (Title)
- Ngày: `Study Date`
- Method: Interviews / Survey / Usability Test
- Participants: Number
- Related Insights: Relation to "Research Insights Master" database

Benefit: Có thể filter insights by study name

---

## 📊 Insights Dashboard (Optional)

Create a summary page using Notion formulas:

```
Total Insights: [COUNT insights]
High Confidence: [COUNT where Confidence = High]
Addressed: [COUNT where Status = Addressed]
Pending: [COUNT where Status = Pending]

Last Updated: [MAX Date Created]
```

---

## 🚀 Import Instructions

Nếu bạn muốn setup nhanh hơn:

### Option 1: Manual (15 min)
- Follow Step 1 & 2 ở trên
- Create entries manually từ examples

### Option 2: CSV Import (10 min)
- Tôi sẽ tạo CSV template
- Upload vào Notion via "Import" feature
- Adjust properties sau

### Option 3: Duplicate Template (Instant)
- Bảo tôi gửi Notion template link (nếu có)
- Duplicate → Rename
- Start adding insights ngay

---

## 💡 Tips for Daily Use

### Adding New Insight
1. Click "New" button
2. Fill 5 essential properties: Insight, Evidence, Confidence, Source, Status
3. Add Research Type + Keywords
4. Paste Study Link từ 01_SYNTHESIZED_INSIGHTS/
5. Done! (Tag Related Decisions later nếu có)

### Weekly Sync: Review Pending Insights
```
Filter: Status = Pending
Sort: Date Created descending

Action: 
- Mỗi pending insight → decide next step
- Nếu ready để implement → change Status = In Progress
```

### Monthly: Review & Archive
```
Archive cũ insights (>6 months, Status = Invalidated)
Update Status của In Progress insights
Review keywords - add new trending keywords
```

### Search Tips
- Use "Keywords" field cho quick filtering
- Use Notion search (Cmd+K) sau đó type keyword
- Filter by Confidence = High for most relevant findings

---

## 🔄 Integration with Design Decisions

### Workflow:
1. **Design Decision Made**: "Add guest checkout option"
2. **Find Supporting Insights**: Filter by Confidence = High + relevant keywords
3. **Update Decisions Log** (3. DECISIONS_LOG/design-decisions-with-research-backing.md):
   ```
   Decision: Guest Checkout Feature
   Insight: Users abandon checkout due to forced account creation (High confidence)
   Evidence: 65% bounce rate, 7/8 users mentioned friction
   Shipped: 2026-06-01
   Impact: [Track conversion rate change]
   ```
4. **Update Related Decisions** field in Notion:
   ```
   Related Decisions: Guest Checkout Feature
   ```

---

## 🎯 Maintenance Checklist

**Weekly:**
- [ ] Any new insights from research? Add to database
- [ ] Review Pending insights → any ready to implement?

**Monthly:**
- [ ] Review High Confidence insights → any patterns?
- [ ] Update Status nếu design decisions shipped
- [ ] Archive old/invalidated insights
- [ ] Team sync: Share top 3 insights từ tháng

**Quarterly:**
- [ ] Analyze patterns across all insights
- [ ] Identify knowledge gaps → prioritize next research
- [ ] Review keyword taxonomy → standardize

---

## 🚨 Common Mistakes to Avoid

❌ **Don't:**
- Write vague insights ("UX needs improvement")
- Store raw data chỉ trong Notion (use folder structure)
- Forget to fill Evidence field
- Leave Status as blank
- Keep insights "pending" quá lâu (>3 months = archive)

✅ **Do:**
- Write specific, action-oriented insights
- Link to detailed findings files
- Update Evidence với actual numbers
- Review & update Status regularly
- Monthly cleanup

---

## 📞 Template Support

**Q: Database quá slow?**
- A: Filter to Last 6 Months, archive old ones

**Q: Team không dùng database?**
- A: Start with simple table, add views later
- Make it part of sprint - not optional

**Q: Cần thêm property?**
- A: Add gradually, don't overload từ đầu
- Start với 5 essential, expand quarter-by-quarter

---

## ✅ Ready to Go!

Copy này đủ để bạn setup Notion database hoàn chỉnh trong 30 phút.

**Next**: Tạo folder structure + đọc 48-hour workflow guide.

Happy researching! 🚀
