# Online Rich Text Editor

A powerful online rich text editor with file management, text editing, and image upload capabilities.
[Playground](https://webtookit-production.up.railway.app/)

## Features

### 1. File Management System
- File List Display
  - Support for grid and list view switching
  - Display filename, size, and modification time

- File Operations
  - Create new files
  - Import files (supports TXT and HTML)
  - Delete files

### 2. Rich Text Editor
- Text Editing Features
  - Font styles (bold, italic, underline)
  - Font size and color adjustment
  - Text alignment

- Image Handling
  - Image upload (supports drag & drop and click upload)
  - Image size adjustment
  - Image position adjustment

### 3. Import/Export Features
- File Import
  - Support for TXT file import
  - Support for HTML file import (automatic text content extraction)

- File Export
  - Export to HTML format
  - Preserve complete styles and images

## Tech Stack
- Frontend
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
  - EJS Template Engine

- Backend
  - Node.js
  - Express.js
  - Multer (File Upload)

## Installation Guide

1. Clone Repository
```bash
git clone https://github.com/your-username/your-repo.git
```

2. Install Dependencies
```bash
cd your-repo
npm install
```

3. Start Server
```bash
npm start
```

4. Access Application
Open browser and visit `http://localhost:3000`

## User Guide

### File Management
1. Create New File
   - Click "New File" button in toolbar
   - Enter filename
   - Start editing

2. Import File
   - Click "Import File" button
   - Select file to import (supports .txt and .html)
   - File content will automatically load into editor

3. Delete File
   - Find file to delete in file list
   - Click delete icon
   - Confirm deletion

### Editor Usage
1. Text Editing
   - Use toolbar buttons to adjust text styles
   - Supports keyboard shortcuts (e.g., Ctrl+B for bold)

2. Image Handling
   - Click image upload button or drag & drop images
   - Adjust image size: drag image borders
   - Move image position: drag image

3. Save and Export
   - Click save button to save current document
   - Click export button to export document as HTML file

## Notes
- Recommended to use modern browsers (Chrome, Firefox, Edge, etc.) for best experience
- Image upload size limit is 5MB
- When importing HTML files, script and style tags will be automatically filtered out

## Contribution Guide
Welcome to submit Issues and Pull Requests. Before submitting PR, please ensure:
1. Code meets project's coding standards
2. New features have proper test coverage
3. All tests pass
4. Relevant documentation is updated
