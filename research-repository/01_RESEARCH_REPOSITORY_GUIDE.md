# Research Repository Implementation Guide

## 📋 Tổng quan

Research Repository là **kho lưu trữ tập trung** nơi toàn bộ insight, finding, và raw data từ research được lưu để team có thể **tìm kiếm và tái sử dụng**.

### Vấn đề cần giải quyết
- Research xong → insights nằm trong note cá nhân → designer nghỉ việc → team mới đi làm research y chang từ đầu
- Cùng 1 câu hỏi research được làm đi làm lại nhiều lần
- Không có knowledge base về user theo thời gian

---

## 📁 Folder Structure

```
research-repository/
├── 00_RAW_DATA/
│   ├── interviews/
│   │   ├── 2026-05-interview-guest-behavior.md
│   │   ├── 2026-05-interview-guest-behavior-recording.mp4 (hoặc link Drive)
│   │   └── transcript_2026-05-01.txt
│   ├── surveys/
│   │   ├── 2026-05-guest-satisfaction-survey.xlsx
│   │   └── 2026-05-market-research-competitor.xlsx
│   ├── usability-tests/
│   │   ├── 2026-05-booking-flow-test.md
│   │   └── recordings/
│   └── session-recordings/
│       ├── hotjar-clips-2026-05.md
│       └── mix-panel-session-notes.md
│
├── 01_SYNTHESIZED_INSIGHTS/
│   ├── empathy-maps/
│   │   ├── john-budget-traveler-empathy-map.md
│   │   ├── jane-luxury-seeker-empathy-map.md
│   │   └── _aggregated-empathy-patterns.md
│   ├── personas/
│   │   ├── persona-budget-traveler.md
│   │   ├── persona-luxury-seeker.md
│   │   └── persona-business-traveler.md
│   ├── journey-maps/
│   │   ├── guest-journey-discovery-to-checkout.md
│   │   ├── guest-journey-stay-experience.md
│   │   └── host-journey-listing-to-review.md
│   ├── key-findings/
│   │   ├── findings-booking-flow-2026-05.md
│   │   ├── findings-pricing-sensitivity-2026-Q2.md
│   │   └── findings-guest-communication-preferences.md
│   └── quotes-verbatim/
│       └── quotes-library-2026.md
│
├── 02_STUDIES_INDEX/
│   └── studies-index.md (master index)
│
├── 03_DECISIONS_LOG/
│   └── design-decisions-with-research-backing.md
│
└── 04_TEMPLATES/
    ├── insight-entry-template.md
    ├── study-planning-template.md
    └── findings-synthesis-template.md
```

---

## 📊 Mỗi Insight Entry cần 5 trường

| Trường | Ví dụ | Ghi chú |
|--------|-------|--------|
| **Insight** | User bỏ checkout vì bắt buộc tạo account | Câu statement ngắn gọn, action-focused |
| **Evidence** | 7/8 user phỏng vấn đề cập, session recording cho thấy bounce rate 65% tại step này | Cụ thể: số lượng, % hoặc tần suất |
| **Confidence** | High (nhiều nguồn confirm) | Low / Medium / High |
| **Source** | Interview tháng 5/2026, Checkout Usability Study | Tên study + ngày |
| **Status** | Addressed (Guest Checkout đã ship) | Pending / In Progress / Addressed / Invalidated |

---

## 🔄 3 Thói quen bắt buộc để duy trì Repository

### 1️⃣ **Sau mỗi research → Synthesize & Add (48h)**
- ⏱️ Deadline: Trong vòng **48 giờ** sau khi kết thúc research
- 📝 Cách làm: Dùng insight-entry-template.md để standardize
- 🎯 Lý do: Không để "insights nguội" → dễ quên detail quan trọng

**Checklist**
- [ ] Collect raw data + transcripts
- [ ] Synthesize key findings
- [ ] Extract quotes đáng chú ý
- [ ] Add vào 01_SYNTHESIZED_INSIGHTS/
- [ ] Update 02_STUDIES_INDEX/

### 2️⃣ **Trước khi bắt đầu research mới → Search Repository**
- 🔍 Hỏi câu hỏi: "Chúng ta đã có insight gì về vấn đề này chưa?"
- 📌 Cách làm: Scroll qua studies-index.md + search by keyword
- 💡 Lợi ích: Tránh duplicate research, build on existing knowledge

**Checklist**
- [ ] Search studies-index.md bằng keyword
- [ ] Đọc lại findings từ research tương tự trước đó
- [ ] Decide: Cần research thêm hay reuse insight cũ?

### 3️⃣ **Khi design decision → Tag insight support nó**
- 🏷️ Cách làm: Update 03_DECISIONS_LOG với reference đến insight
- 📊 Lợi ích: Trace back được tại sao design decision lại như vậy
- 🎓 Giáo dục team: Mọi người thấy evidence-based decisions

**Checklist**
- [ ] Design decision được đưa ra
- [ ] Tìm insight nào support nó
- [ ] Add vào 03_DECISIONS_LOG/ với tag link
- [ ] Tag lại assumption cần validate thêm

---

## 🛠️ Tool Recommendations (2026)

| Tool | Tốt cho | Giá | Setup Time |
|------|---------|-----|-----------|
| **Notion** ⭐ | Flexible, team đã dùng, search tốt | Free / $10/user/mo | 1-2 ngày |
| **Airtable** | Database-like, filter/sort mạnh | Free tier OK | 1-2 ngày |
| **Dovetail** | Repository chuyên dụng, AI tagging | $25+/mo | 3-5 ngày |
| **Confluence** | Enterprise team, integration tốt | Atlassian | Sẵn có |
| **FigJam** | Visual research, quick collaboration | Free | Immediate |

**💡 Gợi ý**: Bắt đầu với **Notion** nếu chưa có gì. Repository tốt nhất là cái team thật sự dùng, không phải cái fancy nhất.

---

## 📱 Quick Start (3 bước)

### Bước 1: Setup folder structure
```bash
# Copy folder template này vào workspace của bạn
cp -r research-repository/ /your-project-path/
```

### Bước 2: Tạo Notion database
- Duplicate Notion template (xem file `02_NOTION_TEMPLATE.md`)
- Config 5 properties: Insight, Evidence, Confidence, Source, Status
- Setup filters: By status, by confidence, by date

### Bước 3: Add 48-hour workflow vào calendar
- Tạo recurring task "Research Synthesis - Due 48h after study ends"
- Add vào Monday dành cho team

---

## 📚 Best Practices

### ✅ DO:
- **Specific insights**: "Users abandon checkout because account creation feels unnecessary" (not vague like "UX needs improvement")
- **Quantified evidence**: "7/10 users mentioned..." (not "some users said...")
- **Link everything**: Use folder structure để tìm kiếm dễ
- **Regular review**: 1x/month, aggregate patterns across studies
- **Share findings**: Weekly team sync share new insights

### ❌ DON'T:
- **Don't leave raw data unprocessed**: "Just upload recording and move on" → Insights get lost
- **Don't duplicate research**: Always check repository first
- **Don't have outdated insights**: Update status = "Invalidated" if proven wrong
- **Don't make decisions without evidence**: Every design decision should tag supporting insight

---

## 🎯 KPIs để measure effectiveness

Track những metrics này hàng tháng:

| Metric | Target | Benefit |
|--------|--------|---------|
| **Time saved** (research dedup) | -30% duplicate research time | Faster iteration |
| **Insights reused** | 40%+ of new research builds on existing | Better knowledge base |
| **Decision traceability** | 100% design decisions có insight tag | Reduced assumption risk |
| **48h synthesis rate** | 90%+ research synthesized on time | Less "lost" insights |

---

## 🚀 Rollout Plan (cho team)

**Week 1**: Setup
- [ ] Create folder structure
- [ ] Setup Notion database
- [ ] Train team trên templates

**Week 2-4**: First research cycle
- [ ] Run 1-2 research studies
- [ ] Practice 48-hour synthesis
- [ ] Weekly team sync share findings

**Month 2**: Optimize
- [ ] Review system trên team usage
- [ ] Adjust folder structure nếu cần
- [ ] Setup monthly insights review

---

## 📞 Troubleshooting

**Q: Team lùi deadline 48h?**
- A: Set hard deadline (48h after study ends = before next standup)
- Make synthesis part of sprint scope, not "later"

**Q: Folder structure quá phức tạp?**
- A: Start simple, add sub-folders when you have >10 studies
- Don't optimize prematurely

**Q: Không biết ghi chi tiết hay ngắn gọn?**
- A: Use template. Template sẽ guide bạn đúng format

---

## 📖 Next Steps

1. Copy folder structure
2. Create first insight entry (dùng template)
3. Setup Notion database
4. Schedule 48-hour synthesis check-in vào calendar
5. Share với team + explain 3 thói quen bắt buộc

**Good luck! 🎉**
