# Implementation Plan - Fix Sidebar Visibility for Locations Page

## Objective
Ensure the sidebar is visible on the "Locations" page when accessed from the admin dashboard (desktop view).

## Issue
Currently, the `/locations` route is treated as a "mobile UI" route in `DashboardLayout.tsx`, causing the sidebar and header to be hidden even on desktop.

## Changes
1.  **Frontend (`DashboardLayout.tsx`)**:
    *   Remove `'/locations'` from the `mobileRoutes` array.
    *   This will allow the `Sidebar` and `Header` to render on the Locations page when `isMobile` is false.
    *   The `Locations` component itself already handles responsive rendering (`isMobile` check), so it will still display the mobile-optimized view on mobile devices.

## Verification
*   **Manual Verification**:
    *   Open the application in a desktop browser.
    *   Navigate to the Dashboard.
    *   Click on "Location" in the sidebar.
    *   Verify that the sidebar remains visible on the Locations page.
    *   (Optional but recommended) Open in mobile view/emulator and ensure the mobile layout still works as expected (no double header/sidebar).
