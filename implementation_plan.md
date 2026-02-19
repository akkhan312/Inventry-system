# Implementation Plan - Force Mobile Layout for Locations when accessed from Mobile UI

## Objective
Ensure that when a user navigates to "Locations" from the "Mobile UI" dashboard, they see the mobile-optimized layout (no sidebar, no desktop header, mobile content style) regardless of the device screen size (e.g., testing on desktop). Meanwhile, the Admin Dashboard access to "Locations" must remain the standard desktop view with sidebar.

## Strategy
Use a URL query parameter `?mobile=true` to explicitly signal the intent to view the mobile version of the page. This bypasses screen-size-only detection.

## Changes
1.  **`frontend/src/pages/MobileUI.tsx`**:
    *   Update the "Locations" button `onClick` handler to navigate to `/locations?mobile=true`.

2.  **`frontend/src/layouts/DashboardLayout.tsx`**:
    *   Update logic to treat the current route as a "Mobile UI" route if the `mobile=true` query parameter is present.
    *   This will trigger the existing logic to hide the `Sidebar` and main `Header`.

3.  **`frontend/src/pages/Locations.tsx`**:
    *   Import `useLocation` from `react-router-dom`.
    *   Initialize `useLocation`.
    *   Update the `isMobile` check to returns `true` if `useIsMobile()` is true OR if the `mobile=true` query parameter is present.
    *   This ensures the render function displays the `mobileContent` (cards view) instead of the `desktopContent` (table view).

## Verification
*   **Scenario A: Admin Dashboard (Desktop)**
    *   Go to `/dashboard`.
    *   Click "Locations" in Sidebar.
    *   URL is `/locations`.
    *   Result: Sidebar Visible, Header Visible, Table View. (Correct)
    *   Resize window to mobile size -> Result: Sidebar Hidden, Mobile View. (Correct)

*   **Scenario B: Mobile UI (Desktop/Testing)**
    *   Go to `/mobile-ui`.
    *   Click "Locations" button.
    *   URL is `/locations?mobile=true`.
    *   Result: Sidebar Hidden, Header Hidden, Mobile View (Cards). (Correct)

*   **Scenario C: Mobile Device**
    *   Go to `/mobile-ui` (or start there).
    *   Click "Locations".
    *   URL is `/locations?mobile=true`.
    *   Result: Sidebar Hidden, Header Hidden, Mobile View. (Correct)
