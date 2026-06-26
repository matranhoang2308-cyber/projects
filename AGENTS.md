# Project AI Rule

## Purpose
Appminis Design System is the **Single Source of Truth** and the only UI reference for all user interface developments in this project.
All AI agents (Antigravity, Codex, Claude, etc.) must adhere strictly to this design system to ensure consistency, cleanliness, and premium UI/UX quality across the entire application without duplicating code or creating custom ad-hoc styling.

---

## Required Reading
Before starting any UI-related task, the AI agent **MUST** read the following documents in this exact order:

1. [appminis-design-system/README.md](file:///Users/matranhoang/Documents/CRM%20-%20AKH/project/appminis-design-system/README.md)
2. [appminis-design-system/README_LEARNING_PATH.md](file:///Users/matranhoang/Documents/CRM%20-%20AKH/project/appminis-design-system/README_LEARNING_PATH.md)
3. [AI_WORKFLOW.md](file:///Users/matranhoang/Documents/CRM%20-%20AKH/project/AI_WORKFLOW.md)

---

## UI Task Classification
Before generating any code, the AI agent **MUST** identify the specific type of screen or view being implemented. Common screen types include:
- **Dashboard** (Tổng quan dữ liệu, biểu đồ, widgets)
- **Report** (Báo cáo chi tiết, thống kê)
- **List Page** (Danh sách đối tượng, tìm kiếm, bộ lọc)
- **Detail Page** (Thông tin chi tiết đối tượng, tabs, timelines)
- **Form** (Nhập liệu, thêm mới, chỉnh sửa thông tin)
- **Table** (Bảng hiển thị dữ liệu nhiều cột, phân trang)
- **Chart** (Biểu đồ phân tích số liệu)
- **Modal** (Hộp thoại tương tác nổi)
- **Drawer** (Ngăn kéo trượt hiển thị thêm thông tin)
- **Empty State** (Màn hình trống khi chưa có dữ liệu)

Do not skip this classification step. It determines which patterns and layouts to load.

---

## Reading Order
Once the screen type is identified, the AI agent **MUST** read the Design System documents in the following strict top-down order:

```text
Pattern (04-patterns)
      ↓
Layout (03-layout)
      ↓
Component (02-components)
      ↓
Foundation (01-foundation)
      ↓
Guideline (05-guidelines)
```
- **Do NOT read backward.**
- **Do NOT skip any layer.**

---

## Decision Priority
When generating or modifying UI code, prioritize decisions using the following order:

1. **Existing Project Component**: If a component exists in the CRM project matching the need, reuse it.
2. **Existing Project Layout**: Reuse current app-shells, sidebars, grids already active in the project.
3. **Appminis Pattern**: Implement the design patterns described in `04-patterns`.
4. **Appminis Layout**: Follow structures described in `03-layout`.
5. **Appminis Component**: Reference and build standard components from `02-components`.
6. **Appminis Foundation**: Use tokens (colors, spacing, typo) from `01-foundation`.
7. **Build New Component**: Create a new project-level component only if it does not exist in either the project or the Design System.

*Never create a new component if an existing one can be reused or extended.*

---

## Do & Don't

### DO:
- **Reuse components**: Always check the local codebase for existing components before writing new ones.
- **Reuse layouts**: Maintain consistency with the current workspace layouts.
- **Follow Design System**: Adhere to Appminis Design System guidelines, colors (oklch), shadows, and radii.
- **Read Related Documents**: Ensure all referenced design files are read before coding.
- **Keep UI consistent**: Maintain alignment, spacing, typography, and hover states with the rest of the app.

### DON'T:
- **No hardcoded styles**: Do not write raw pixel sizes, custom hex colors, or inline styles. Use Tailwind CSS v4 variables or system design tokens.
- **No copying Metronic**: Do not copy arbitrary styles directly from external Metronic/templates without aligning them to the design system.
- **No style duplication**: Do not create new classes or configurations if the system defines a utility.
- **Do NOT modify the Design System**: Never write to, modify, or add files within the `appminis-design-system` repository unless explicitly requested.
- **No out-of-scope refactoring**: Do not refactor UI elements that are outside the scope of your assigned task.
