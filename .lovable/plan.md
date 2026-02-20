

# SOW Document Generator for Howard Technology Solutions

## Overview
A web application that lets you upload a BOM Excel file, fill in project/customer details once, and generate three branded SOW documents (SOW_Customer, SOW_SUB_Quoting, SOW_SUB_Project) with all fields auto-populated. You can preview and edit each document before exporting as Word (.docx) and/or PDF.

---

## Step 1: BOM Upload & Parsing
- Upload screen with drag-and-drop for your `.xlsm` BOM file
- Automatically extract equipment lists, quantities, descriptions, and labor data from the BOM
- Display a summary of parsed items so you can verify the import was successful

## Step 2: Project Information Form (Fill Once)
A single form where you enter all shared fields that flow into every document:
- **Project Info**: Project Name, OPP Number, Project Number, Date
- **Customer Info**: Company Name, Company Address, City/State/Zip, Customer Name, Customer Contact, Customer Phone
- **HTS Info**: Solution Architect name
- **Scope**: Auto-populated from BOM equipment list, with ability to edit the scope text
- **Custom Fields**: Any additional notes or overrides

## Step 3: Hardware Schedule Upload
- Option to upload an additional document (hardware schedule)
- This document will be bundled into the output folder alongside SUB_SOW_Quoting and SUB_SOW_Project exports

## Step 4: Document Preview & Manual Overrides
- Tabbed interface showing all 3 documents: **SOW_Customer**, **SOW_SUB_Quoting**, **SOW_SUB_Project**
- Each tab shows a live preview of the generated document with all placeholders filled in
- Editable fields inline — click any populated field to override the auto-filled value for that specific document
- Scope section shows the equipment/material list formatted from the BOM

## Step 5: Export Options
- **Export individual**: Download any single document as Word (.docx) or PDF
- **Export all**: One-click to generate all 3 documents plus the hardware schedule into a single download (zip)
- Documents use Howard Technology Solutions branding (logo, headers, formatting matching your templates)
- Output folder structure: project name folder containing all documents

## Design & Experience
- Clean, professional interface matching HTS branding
- Step-by-step workflow: Upload BOM → Fill Info → Upload Hardware Schedule → Preview/Edit → Export
- Progress indicator showing which step you're on
- All data stays in-browser (no backend needed for initial version)

