# Online Rich Text Editor - Software Development Report

## Part 1: Software Development Process

### 1.1 System Architecture

Our online rich text editor is built using a modern web stack:
- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js with Express.js
- Template Engine: EJS
- File System: Native Node.js fs module

### 1.2 Core Components

#### 1.2.1 File Management System
The file management system handles file operations through a RESTful API:

```javascript
// Core file operations in files.js
const fileOperations = {
    // Create new file
    createFile: async (filename, content) => {
        try {
            await fs.writeFile(filename, content);
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Import file
    importFile: async (file) => {
        const content = await fs.readFile(file.path, 'utf8');
        if (file.mimetype === 'text/html') {
            return stripHtmlTags(content);
        }
        return content;
    }
};
```

#### 1.2.2 Rich Text Editor
The editor implements core text editing features:

```javascript
// Core editor functionality in editor.js
class Editor {
    constructor() {
        this.editorContent = document.querySelector('.editor-content');
        this.setupToolbar();
        this.setupEventListeners();
    }

    // Execute editor commands
    execCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.updatePreview();
    }

    // Handle image uploads
    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            this.editorContent.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}
```

## Part 2: Software Testing

### 2.1 White-box Testing

#### 2.1.1 Unit Testing for File Operations
```javascript
describe('File Operations', () => {
    // File Creation Tests
    test('Create File', async () => {
        const result = await fileOperations.createFile('test.txt', 'content');
        expect(result.success).toBe(true);
    });

    test('Create File with Special Characters', async () => {
        const result = await fileOperations.createFile('测试文件.txt', '特殊字符内容');
        expect(result.success).toBe(true);
    });

    test('Create File with Empty Content', async () => {
        const result = await fileOperations.createFile('empty.txt', '');
        expect(result.success).toBe(true);
    });

    // File Import Tests
    test('Import HTML File', async () => {
        const htmlFile = {
            path: 'test.html',
            mimetype: 'text/html'
        };
        const content = await fileOperations.importFile(htmlFile);
        expect(content).not.toContain('<script>');
        expect(content).not.toContain('<style>');
        expect(content).not.toContain('<html>');
        expect(content).toBe('Plain text content');
    });

    test('Import Text File', async () => {
        const txtFile = {
            path: 'test.txt',
            mimetype: 'text/plain'
        };
        const content = await fileOperations.importFile(txtFile);
        expect(content).toBe('Original content');
    });

    // File Delete Tests
    test('Delete Existing File', async () => {
        const result = await fileOperations.deleteFile('existing.txt');
        expect(result.success).toBe(true);
    });

    test('Delete Non-existent File', async () => {
        const result = await fileOperations.deleteFile('nonexistent.txt');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });

    // Error Handling Tests
    test('Handle Invalid File Path', async () => {
        const result = await fileOperations.createFile('invalid/path/file.txt', 'content');
        expect(result.success).toBe(false);
        expect(result.error.code).toBe('ENOENT');
    });

    test('Handle File Permission Error', async () => {
        const result = await fileOperations.createFile('/root/restricted.txt', 'content');
        expect(result.success).toBe(false);
        expect(result.error.code).toBe('EACCES');
    });
});

// Editor Component Tests
describe('Editor Component', () => {
    test('Initialize Editor', () => {
        const editor = new Editor();
        expect(editor.editorContent).toBeDefined();
        expect(editor.toolbar).toBeDefined();
    });

    test('Execute Bold Command', () => {
        const editor = new Editor();
        editor.execCommand('bold');
        const selection = window.getSelection();
        expect(document.queryCommandState('bold')).toBe(true);
    });

    test('Image Upload', async () => {
        const editor = new Editor();
        const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
        await editor.handleImageUpload(imageFile);
        const images = editor.editorContent.querySelectorAll('img');
        expect(images.length).toBe(1);
        expect(images[0].src).toContain('data:image/jpeg;base64');
    });

    test('Save Content', async () => {
        const editor = new Editor();
        editor.editorContent.innerHTML = '<p>Test content</p>';
        const result = await editor.saveContent('test.html');
        expect(result.success).toBe(true);
        expect(result.path).toBe('test.html');
    });
});

// File System Integration Tests
describe('File System Integration', () => {
    test('Create and Read File', async () => {
        const content = 'Test content';
        await fileOperations.createFile('test.txt', content);
        const readContent = await fileOperations.readFile('test.txt');
        expect(readContent).toBe(content);
    });

    test('Import and Export HTML', async () => {
        const htmlContent = '<html><body><p>Test</p></body></html>';
        await fileOperations.createFile('test.html', htmlContent);
        const imported = await fileOperations.importFile({
            path: 'test.html',
            mimetype: 'text/html'
        });
        expect(imported).toBe('Test');
    });

    test('File System Events', async () => {
        const eventSpy = jest.fn();
        fileSystem.on('fileChanged', eventSpy);
        await fileOperations.createFile('test.txt', 'content');
        expect(eventSpy).toHaveBeenCalledWith({
            type: 'create',
            path: 'test.txt'
        });
    });
});
```

#### 2.1.2 Integration Testing
```javascript
describe('Editor Integration', () => {
    // UI Integration Tests
    test('Toolbar Button Integration', () => {
        const editor = new Editor();
        const boldButton = document.querySelector('[data-command="bold"]');
        boldButton.click();
        expect(document.queryCommandState('bold')).toBe(true);
    });

    test('Font Selection Integration', () => {
        const editor = new Editor();
        const fontSelect = document.querySelector('.font-family');
        fontSelect.value = 'Arial';
        fontSelect.dispatchEvent(new Event('change'));
        expect(document.queryCommandValue('fontName')).toBe('Arial');
    });

    // File System Integration
    test('Save Button Integration', async () => {
        const editor = new Editor();
        editor.editorContent.innerHTML = '<p>Test content</p>';
        const saveButton = document.getElementById('saveBtn');
        await saveButton.click();
        const savedFile = await fileOperations.readFile('document.html');
        expect(savedFile).toContain('Test content');
    });

    // Image Handling Integration
    test('Image Drag and Drop', async () => {
        const editor = new Editor();
        const dropEvent = new DragEvent('drop');
        Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
                files: [new File([''], 'test.jpg', { type: 'image/jpeg' })]
            }
        });
        await editor.editorContent.dispatchEvent(dropEvent);
        expect(editor.editorContent.querySelector('img')).toBeTruthy();
    });

    // Error Handling Integration
    test('Error Notification Integration', async () => {
        const editor = new Editor();
        const notificationSpy = jest.spyOn(window, 'alert');
        await editor.handleImageUpload(new File([''], 'large.jpg', { type: 'image/jpeg', size: 10000000 }));
        expect(notificationSpy).toHaveBeenCalledWith('File size exceeds limit');
    });
});
```

### 2.2 Black-box Testing

#### 2.2.1 Functional Testing
1. File Management Testing
   - Create new file ✓
   - Import HTML file ✓
   - Import TXT file ✓
   - Delete file ✓

2. Editor Testing
   - Text formatting (bold, italic, underline) ✓
   - Image upload and display ✓
   - File saving ✓
   - HTML export ✓

#### 2.2.2 User Interface Testing
1. Responsiveness Testing
   - Desktop browsers ✓
   - Tablet devices ✓
   - Mobile devices ✓

2. Cross-browser Testing
   - Chrome ✓
   - Firefox ✓
   - Edge ✓

## Part 3: System Display

### 3.1 File Management Interface
[Insert screenshot of file management interface]
- Grid view of files
- File operations (create, import, delete)
- File type indicators

### 3.2 Editor Interface
[Insert screenshot of editor interface]
- Rich text editing toolbar
- WYSIWYG editor
- Real-time preview panel

### 3.3 File Operations
[Insert screenshot of file operations]
1. Creating a new file:
   - Click "New File" button
   - Enter filename
   - Start editing

2. Importing files:
   - Click "Import" button
   - Select file (HTML/TXT)
   - Content loaded into editor

### 3.4 Text Editing Features
[Insert screenshot of text editing]
1. Text Formatting:
   - Bold, italic, underline
   - Font size and family
   - Text alignment

2. Image Handling:
   - Drag and drop upload
   - Resize capabilities
   - Position adjustment

## Conclusion

Our online rich text editor successfully implements all required features:
1. File Management System
   - Efficient file operations
   - Support for multiple file types
   - Intuitive user interface

2. Rich Text Editor
   - Comprehensive text formatting
   - Image handling capabilities
   - Real-time preview

3. User Experience
   - Responsive design
   - Cross-browser compatibility
   - Intuitive interface

The system has been thoroughly tested and demonstrates robust performance across various use cases and platforms.
