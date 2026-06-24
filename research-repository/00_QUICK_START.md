# Research Repository - Quick Start Guide (5 min)

**🚀 Start from here if you're new!**

---

## ⚡ 30-Second Version

**Research Repository = Kho lưu trữ tập trung** nơi bạn lưu tất cả:
- **Raw data** (interviews, surveys, recordings)
- **Insights** (findings + evidence)
- **Decisions** (why you decided X)

Lợi ích:
- ✅ Team mới không phải research lại
- ✅ Trace được tại sao decisions lại như vậy
- ✅ Build knowledge base theo thời gian

---

## 📁 Folder Structure (Copy This)

```
research-repository/
├── 00_RAW_DATA/               ← Lưu recordings, surveys, transcripts
│   ├── interviews/
│   ├── surveys/
│   ├── usability-tests/
│   └── session-recordings/
│
├── 01_SYNTHESIZED_INSIGHTS/   ← Lưu findings + insights
│   ├── empathy-maps/
│   ├── personas/
│   ├── journey-maps/
│   ├── key-findings/
│   └── quotes-verbatim/
│
├── 02_STUDIES_INDEX/          ← Master index of all research
│   └── studies-index.md
│
└── 03_DECISIONS_LOG/          ← Track design decisions + research backing
    └── design-decisions-with-research-backing.md
```

**👉 Action:** Copy structure này vào workspace của bạn ngay bây giờ

---

## 🎯 3 Thói quen bắt buộc

### 1️⃣ Sau research → Synthesize (48h)
- ⏱️ **Deadline:** Trong 48h sau khi research kết thúc
- 📝 **Cách:** Dùng `03_INSIGHT_ENTRY_TEMPLATE.md` để write standardized entry
- 📍 **Nơi:** `01_SYNTHESIZED_INSIGHTS/key-findings/findings-[topic]-[date].md`

**Checklist (30 min):**
```
[ ] Collect raw data + recordings
[ ] Write 1 insight statement (specific, action-focused)
[ ] Add evidence (quantified numbers)
[ ] Extract 3-5 best quotes
[ ] Add to Notion database
[ ] Update Studies Index
```

### 2️⃣ Trước research mới → Search repository
- 🔍 **Hỏi:** "Chúng ta đã research câu hỏi này chưa?"
- 📍 **Nơi:** Search `02_STUDIES_INDEX/studies-index.md`
- 💡 **Lợi ích:** Tránh duplicate research

### 3️⃣ Khi design decision → Tag insight
- 🏷️ **Cách:** Update `03_DECISIONS_LOG/` 
- 📝 **Nội dung:** Decision name + supporting research link
- 🎯 **Lợi ích:** Trace back tại sao decide lại như vậy

---

## 📊 Insight Entry: 5 Trường Bắt Buộc

**Mỗi insight phải có:**

| # | Trường | Ví dụ |
|---|--------|-------|
| 1 | **Insight** | Users abandon checkout due to forced account creation |
| 2 | **Evidence** | 7/8 users mentioned, 65% bounce rate |
| 3 | **Confidence** | 🟢 High (5+ sources) / 🟡 Med (3-4) / 🔴 Low (1-2) |
| 4 | **Source** | Interview tháng 5/2026, Checkout Study |
| 5 | **Status** | Pending / In Progress / Addressed / Invalidated |

**👉 Action:** Fill template này sau mỗi research

---

## 🛠️ Tools để use

**Pick 1, không cần tất cả:**

| Tool | Dùng cho | Giá | Setup |
|------|----------|-----|-------|
| **Notion** ⭐ | Flexible, team đã dùng | Free | 30 min |
| **Airtable** | Database + filters | Free tier | 1 hour |
| **Dovetail** | Chuyên research | $25+/mo | 3 hours |

**💡 Gợi ý:** Bắt đầu Notion nếu chưa có gì. Sau đó nâng cấp nếu cần.

---

## 🚀 Setup trong 30 Phút

### Bước 1: Tạo folder structure (2 min)
```bash
mkdir -p research-repository/{00_RAW_DATA/{interviews,surveys,usability-tests,session-recordings},01_SYNTHESIZED_INSIGHTS/{empathy-maps,personas,journey-maps,key-findings,quotes-verbatim},02_STUDIES_INDEX,03_DECISIONS_LOG,04_TEMPLATES}
```

### Bước 2: Setup Notion (15 min)
1. Tạo Notion database mới
2. Add 5 properties: Insight, Evidence, Confidence, Source, Status
3. Done!
4. (Chi tiết xem `02_NOTION_TEMPLATE.md`)

### Bước 3: Add first study (10 min)
1. Dùng `03_INSIGHT_ENTRY_TEMPLATE.md` để fill info
2. Add vào Notion
3. Save file vào 01_SYNTHESIZED_INSIGHTS/
4. Update 02_STUDIES_INDEX/studies-index.md

**👉 Done! Repository của bạn ready để dùng**

---

## 📖 File Guide

| File | Dùng khi | Time |
|------|----------|------|
| `01_RESEARCH_REPOSITORY_GUIDE.md` | Want to understand concept | 10 min read |
| `02_NOTION_TEMPLATE.md` | Setup Notion database | Reference |
| `03_INSIGHT_ENTRY_TEMPLATE.md` | Writing insight entry | Fill 1 entry = 15 min |
| `04_48HOUR_WORKFLOW_CHECKLIST.md` | After research ends | Print + use |
| `05_FINDINGS_SYNTHESIS_TEMPLATE.md` | Writing detailed findings | 2-3 hours per study |
| `06_STUDIES_INDEX_TEMPLATE.md` | Master index | Update after each study |
| `07_DECISIONS_LOG_TEMPLATE.md` | Track design decisions | Update when decision made |

**👉 Start with: 01_RESEARCH_REPOSITORY_GUIDE.md (10 min)**

---

## ⚡ First 48 Hours (After First Research)

**When:** Just finished your first user research study  
**What to do:**

```
Hour 0 (RIGHT AFTER):
[ ] Collect recordings + notes
[ ] Create folder: 01_SYNTHESIZED_INSIGHTS/findings-[topic]-[date].md
[ ] Brain dump: Top 3 insights + best quotes

Hour 2-24:
[ ] Re-read/re-watch everything
[ ] Identify themes
[ ] Count: How many users mentioned each?
[ ] Write findings document (use 05_FINDINGS_SYNTHESIS_TEMPLATE.md)

Hour 24-48:
[ ] Add entry to Notion (use 03_INSIGHT_ENTRY_TEMPLATE.md)
[ ] Extract quotes + empathy map
[ ] Update Studies Index (06_STUDIES_INDEX_TEMPLATE.md)
[ ] Share with team 🎉
```

**Output:**
- 1 Notion entry ✅
- 1 Findings document ✅
- Studies Index updated ✅
- Team knows about findings ✅

---

## 🎯 Long-term View

**After 6 months, you'll have:**

✅ Repository of 8-12 studies  
✅ 30+ validated insights  
✅ 5-7 strong personas  
✅ Complete decision log (why we decided X)  
✅ New team members can onboard in days (not weeks)  
✅ No more duplicate research  

---

## 🆘 Troubleshooting

**Q: How do I start if I have old research?**
- A: Backfill repository with past studies (add to Studies Index first)

**Q: What if team doesn't follow 48h deadline?**
- A: Make it sprint scope, not optional. Add calendar reminder.

**Q: Is Notion gonna be slow with lots of insights?**
- A: Filter to last 6 months. Archive old ones. Should be fine.

**Q: I don't have time for perfect synthesis.**
- A: Good enough synthesis > perfect synthesis done late. Use template, rough is OK.

---

## 📱 Weekly Routine (5 min)

Every Monday morning:
```
[ ] Check Studies Index - any new research?
[ ] Review "Pending" insights - ready to implement?
[ ] Share top insight in team sync (10 min discussion)
```

---

## 🎓 30-Day Checklist

**Week 1:**
- [ ] Copy folder structure
- [ ] Setup Notion database
- [ ] Read 01_RESEARCH_REPOSITORY_GUIDE.md

**Week 2:**
- [ ] Conduct first research study
- [ ] Synthesize using templates (48h)
- [ ] Add to Notion + Studies Index

**Week 3:**
- [ ] Second research study
- [ ] Make 1 design decision backed by research
- [ ] Update Decisions Log

**Week 4:**
- [ ] Review system - what's working?
- [ ] Share with team
- [ ] Plan next studies

**After 30 days:** Repository ready for daily use!

---

## 🚀 Ready to Go?

1. **Print Quick Start này** (keep on desk)
2. **Copy folder structure** (5 min)
3. **Setup Notion** (15 min)
4. **Read full guide** (10 min)
5. **Conduct first research** ✨

**You're ready to build your research knowledge base!**

---

## 💬 Key Takeaway

> **"Research Repository is not about perfect documentation.  
> It's about having a system where insights don't disappear when people leave."**

Start simple. Keep using it. Watch it compound over time.

---

## 📞 Next Steps

1. **This week:** Setup folder + Notion
2. **This sprint:** First research + synthesis (use templates)
3. **This month:** 2-3 studies in repository
4. **This quarter:** Team knows how to use it

**Questions?** Refer to specific template file.

**Let's build! 🎉**
