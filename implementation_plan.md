# Implementation Plan - Master Data Import Template

## Objective
Add a "Template" button to the Master Data page to allow users to download a CSV template for importing products.

## Changes
1.  **Frontend (`MasterData.tsx`)**:
    *   Import `FileText` icon from `lucide-react`.
    *   Add a "Template" button next to the "Import" button.
    *   Implement an `onClick` handler for the "Template" button that generates a CSV file with the required headers and triggers a download.
    *   The headers included are: `SKU`, `Item Name`, `Category`, `Description`, `Barcode / QR`, `Unit`, `Current Qty`, `Purchase Price`, `Sale Price`, `HSN Code`, `GST Rate (%)`, `Opening Qty`, `Min Stock`, `Reorder Qty`, `Location`, `Supplier`, `Serial / Batch`, `Expiry Date`.

## Verification
*   **Manual Verification**:
    *   Navigate to the Master Data page.
    *   Click the "Template" button.
    *   Verify that `inventory_template.csv` is downloaded.
    *   Open the CSV file and verify the headers are correct.
*   **Import Verification**:
    *   Fill in the template with dummy data.
    *   Click "Import" button and upload the file.
    *   Verify the data is correctly added to the Master Data table.
