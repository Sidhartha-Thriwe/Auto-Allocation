# Implementation Plan - Dashboard Granular Date Filter (Day, Week, Month)

## 1. User Intent & Requirements
- **Scope**: Dashboard date filter only.
- **Granularity Modes**: Strictly **Day**, **Week**, or **Month** (no mixed ranges, no custom arbitrary start/end spans).
- **Selection Boundaries**:
  - **Day**: Single calendar day, maximum selectable date is **Yesterday** (e.g., Oct 13, 2026). Today and future dates are disabled.
  - **Week**: Complete calendar week (**Monday to Sunday**), maximum selectable week is **Last Week** (e.g., Oct 5 – Oct 11, 2026). Current ongoing week and future weeks are disabled.
  - **Month**: Complete calendar month (**1st to last day**), maximum selectable month is **Last Month** (e.g., September 2026). Current ongoing month and future months are disabled.
- **Design & Usability**:
  - Segmented toggle (`Day` | `Week` | `Month`) directly in the dashboard header.
  - Single-click quick selector popover with pre-computed valid periods for minimal clicks.
  - Direct past day/week/month picker allowing fast direct selection of any valid past day, week, or month.
  - Do not change anything else in the application.

---

## 2. Architecture & UX Design

### A. Dashboard Header Date Filter (`src/components/Header.tsx`)
1. **Segmented Mode Selector**:
   - Clean, high-density segmented control with 3 tabs: `Day`, `Week`, `Month`.
   - Clear active state styling with smooth transition and no generic pills.
2. **Current Period Button & Popover**:
   - Adjacent to the segmented switch, a clear active period button displaying the selected interval (e.g. `Yesterday (Oct 13, 2026)`, `Last week (Oct 5 - Oct 11, 2026)`, or `Last month (Sep 2026)`).
   - Clicking opens a streamlined quick-select dropdown:
     - **For Day**:
       - Quick shortcuts: *Yesterday (Oct 13)*, *2 days ago (Oct 12)*, *3 days ago (Oct 11)*, *4 days ago (Oct 10)*.
       - Single-date calendar picker where today and future dates are strictly disabled.
     - **For Week (Monday to Sunday)**:
       - Quick shortcuts: *Last week (Oct 5 – Oct 11)*, *2 weeks ago (Sep 28 – Oct 4)*, *3 weeks ago (Sep 21 – Sep 27)*, *4 weeks ago (Sep 14 – Sep 20)*.
       - Complete week selector where current in-progress week and future weeks are strictly disabled.
     - **For Month (Full Calendar Month)**:
       - Quick shortcuts: *Last month (September 2026)*, *August 2026*, *July 2026*, *June 2026*, *May 2026*.
       - Complete month selector where current in-progress month and future months are strictly disabled.

### B. Type & State Updates (`src/types.ts` & `src/App.tsx`)
1. Define date selection interfaces in `src/types.ts`:
   ```typescript
   export type DateFilterMode = 'day' | 'week' | 'month';

   export interface DashboardDateSelection {
     mode: DateFilterMode;
     label: string;
     startDate: string; // e.g. "2026-10-13"
     endDate: string;   // e.g. "2026-10-13"
     displayRange: string; // e.g. "Oct 13, 2026"
   }
   ```
2. Manage state in `App.tsx` and pass to `Header` and `TableSection`.

### C. Dashboard Table Section Alignment (`src/components/TableSection.tsx`)
- Compute the three section titles (`Preceding {date range}`, `In focus {date range}`, `Upcoming {date range}`) dynamically based on the active `DashboardDateSelection`:
  - **Day mode** (e.g., In focus = Oct 13, 2026):
    - Preceding: Oct 12, 2026
    - In focus: Oct 13, 2026
    - Upcoming: Oct 14, 2026
  - **Week mode** (e.g., In focus = Oct 5 - Oct 11, 2026):
    - Preceding: Sep 28 - Oct 4, 2026
    - In focus: Oct 5 - Oct 11, 2026
    - Upcoming: Oct 12 - Oct 18, 2026
  - **Month mode** (e.g., In focus = Sep 1 - Sep 30, 2026):
    - Preceding: Aug 1 - Aug 31, 2026
    - In focus: Sep 1 - Sep 30, 2026
    - Upcoming: Oct 1 - Oct 31, 2026

---

## 3. Step-by-Step Implementation Steps

1. **`src/types.ts`**:
   - Add `DateFilterMode` and `DashboardDateSelection` interfaces.
2. **`src/components/Header.tsx`**:
   - Replace the date dropdown with the Segmented Toggle (`Day` | `Week` | `Month`) and quick-select popover with strict upper bounds:
     - Day <= Yesterday (Oct 13, 2026)
     - Week <= Last week (Mon–Sun: Oct 5 – Oct 11, 2026)
     - Month <= Last month (Sep 1 – Sep 30, 2026)
3. **`src/App.tsx`**:
   - Connect the date filter state and propagate to `TableSection`.
4. **`src/components/TableSection.tsx`**:
   - Update `periods` calculation to reflect selected Day, Week, or Month in the table column headers.
5. **Validation & Verification**:
   - Run `lint_applet` and `compile_applet`.
