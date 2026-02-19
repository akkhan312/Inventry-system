# Implementation Plan - Enhance Responsiveness and Cursor Feedback for Locations Mobile UI

## Objective
Adjust the "Mobile UI" layout of the Locations page to be responsive on all devices (especially when accessed via `?mobile=true` on desktop), and ensure appropriate cursor feedback (pointer) on interactive elements.

## Changes
1.  **Frontend (`Locations.tsx`)**:
    *   **Responsiveness**: Adjust the `mobileContent` container. Change `max-w-[430px]` to a meaningful maximum (e.g., `w-full max-w-3xl`) and ensure appropriate padding/margins. This allows the content to expand comfortably on tablets or desktops while maintaining the mobile "card" look.
    *   **Grid Layout**: For wider screens (md/lg breakpoints in the mobile view), switch the list of locations from a single column to a grid (e.g., `grid-cols-1 md:grid-cols-2`) so the space is utilized effectively.
    *   **Interactive Elements**: Explicitly add `cursor-pointer` to:
        *   Edit button (`<button>`)
        *   Floating Action Button (Add Location)
        *   Back button (in `MobileHeader` - handled internally, but verify if needed).
        *   Delete button in the modal.

## Verification
*   **Responsiveness**:
    *   Open `/locations?mobile=true` on a large desktop screen.
    *   Verify the content is not constricted to a tiny 430px column but uses the available width sensibly (e.g., max-width 3xl).
    *   Verify the cards are laid out in a grid if space allows.
*   **Cursors**:
    *   Hover over the Edit button, Add (+) button, and Delete button.
    *   Verify the cursor changes to a pointer.
