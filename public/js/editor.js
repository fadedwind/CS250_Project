document.addEventListener('DOMContentLoaded', function() {
    const editor = document.querySelector('.editor-content');
    const preview = document.querySelector('.preview-content');
    const toolButtons = document.querySelectorAll('.tool-btn');
    const fontFamily = document.querySelector('.font-family');
    const fontSize = document.querySelector('.font-size');
    const colorPicker = document.querySelector('.color-picker');
    const bgColorPicker = document.querySelector('.bg-color-picker');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const createFolderBtn = document.getElementById('create-folder-btn');
    const uploadBtn = document.getElementById('upload-file-btn');
    const fileInput = document.getElementById('file-input');

    // 检查是否有选择的模板
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    if (selectedTemplate) {
        const template = JSON.parse(selectedTemplate);
        
        // 创建样式标签
        const styleTag = document.createElement('style');
        styleTag.textContent = template.styles;
        document.head.appendChild(styleTag);
        
        // 设置编辑器内容
        editor.innerHTML = template.content;
        preview.innerHTML = template.content;
        
        // 清除localStorage中的模板数据
        localStorage.removeItem('selectedTemplate');
    }

    // 实时预览
    editor.addEventListener('input', function() {
        preview.innerHTML = editor.innerHTML;
        updateToolbarState();
    });

    // 选择文本时更新工具栏状态
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('keyup', updateToolbarState);

    // 工具栏按钮功能
    toolButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const command = this.dataset.command;
            
            if (command === 'insertImage') {
                showImageUploadDialog();
            } else if (command === 'createLink') {
                const url = prompt('请输入链接URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            updateToolbarState();
            editor.focus();
        });
    });

    // 字体选择
    fontFamily.addEventListener('change', function() {
        if (this.value !== 'default') {
            document.execCommand('fontName', false, this.value);
            editor.focus();
        }
    });

    // 字号选择
    fontSize.addEventListener('change', function() {
        if (this.value !== 'default') {
            document.execCommand('fontSize', false, this.value);
            editor.focus();
        }
    });

    // 文字颜色
    colorPicker.addEventListener('input', function() {
        document.execCommand('foreColor', false, this.value);
        editor.focus();
    });

    // 背景颜色
    bgColorPicker.addEventListener('input', function() {
        document.execCommand('hiliteColor', false, this.value);
        editor.focus();
    });

    // 更新工具栏状态
    function updateToolbarState() {
        toolButtons.forEach(button => {
            const command = button.dataset.command;
            if (command && document.queryCommandState(command)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // 图片上传对话框
    function showImageUploadDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'image-upload-dialog';
        dialog.innerHTML = `
            <h3>上传图片</h3>
            <div class="image-upload-area" id="imageUploadArea">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>点击或拖放图片到这里</p>
                <input type="file" accept="image/*" style="display: none" id="imageInput">
            </div>
            <div class="dialog-buttons">
                <button class="btn btn-secondary" id="cancelUpload">取消</button>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const uploadArea = dialog.querySelector('#imageUploadArea');
        const imageInput = dialog.querySelector('#imageInput');
        const cancelBtn = dialog.querySelector('#cancelUpload');

        // 处理拖放
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#007bff';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#dee2e6';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#dee2e6';
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleImageUpload(files[0]);
            }
        });

        // 处理点击上传
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageUpload(e.target.files[0]);
            }
        });

        // 取消上传
        cancelBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', closeDialog);

        function closeDialog() {
            dialog.remove();
            overlay.remove();
        }

        // 处理图片上传
        async function handleImageUpload(file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (data.success) {
                    const img = document.createElement('img');
                    // 使用完整的URL路径
                    img.src = window.location.origin + data.path;
                    img.style.maxWidth = '100%';
                    img.style.cursor = 'nw-resize';
                    // 添加可调整大小的属性
                    img.setAttribute('contenteditable', 'false');
                    img.setAttribute('draggable', 'true');
                    img.style.resize = 'both';
                    img.style.overflow = 'hidden';
                    
                    editor.focus();
                    document.execCommand('insertHTML', false, img.outerHTML);
                    
                    // 为新插入的图片添加事件监听器
                    const insertedImg = editor.querySelector(`img[src="${img.src}"]`);
                    if (insertedImg) {
                        makeImageResizable(insertedImg);
                    }
                    
                    updatePreview();
                    closeDialog();
                    updateToolbarState();
                    alert('图片上传成功！');
                } else {
                    alert('图片上传失败，请重试！');
                }
            } catch (error) {
                console.error('图片上传失败:', error);
            }
        }

        // 使图片可调整大小
        function makeImageResizable(img) {
            let isResizing = false;
            let startX, startY, startWidth, startHeight;

            img.addEventListener('mousedown', function(e) {
                // 检查是否点击在图片边缘
                const rect = img.getBoundingClientRect();
                const edge = 10; // 边缘检测范围

                if (e.clientX > rect.right - edge && e.clientY > rect.bottom - edge) {
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = img.offsetWidth;
                    startHeight = img.offsetHeight;
                    
                    e.preventDefault();
                }
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                const width = startWidth + (e.clientX - startX);
                const height = startHeight + (e.clientY - startY);

                img.style.width = width + 'px';
                img.style.height = height + 'px';
                
                e.preventDefault();
            });

            document.addEventListener('mouseup', function(e) {
                isResizing = false;
            });
        }
    }

    // 保存功能
    saveBtn.addEventListener('click', function() {
        const content = editor.innerHTML;
        
        // 将内容通过URL参数传递到文件管理页面
        const params = new URLSearchParams({
            content: content
        });
        window.location.href = `/files?${params.toString()}`;
    });

    // 导出功能
    exportBtn.addEventListener('click', function() {
        const content = editor.innerHTML;
        // 替换所有相对路径为绝对路径
        const exportContent = content.replace(/(src=["'])(\/[^"']+)(["'])/g, 
            (match, p1, p2, p3) => p1 + 'file:///' + __dirname + p2 + p3
        );
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>导出文档</title>
                <style>
                    body { max-width: 800px; margin: 0 auto; padding: 20px; }
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
                ${exportContent}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
    });

    // 文件管理功能
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        const files = this.files;
        if (files.length > 0) {
            uploadFiles(files);
        }
    });

    // 加载文件列表
    loadFiles();

    // 上传文件
    function uploadFiles(files) {
        const formData = new FormData();
        for (let file of files) {
            formData.append('file', file);
        }

        fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('文件上传成功:', data);
            loadFiles(); // 重新加载文件列表
        })
        .catch(error => {
            console.error('文件上传失败:', error);
            alert('文件上传失败，请重试');
        });
    }

    // 加载文件列表
    function loadFiles() {
        fetch('/api/files')
            .then(response => response.json())
            .then(files => {
                const fileList = document.getElementById('file-list');
                fileList.innerHTML = '';
                
                files.forEach(file => {
                    const li = document.createElement('li');
                    li.className = 'file-item';
                    
                    // 创建图标
                    const icon = document.createElement('i');
                    if (file.isDirectory) {
                        icon.className = 'fas fa-folder';
                    } else if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        icon.className = 'fas fa-file-image';
                    } else {
                        icon.className = 'fas fa-file';
                    }
                    
                    // 创建文件名
                    const name = document.createElement('span');
                    name.textContent = file.name;
                    
                    // 创建操作按钮容器
                    const actions = document.createElement('div');
                    actions.className = 'file-actions';
                    
                    // 删除按钮
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.onclick = () => deleteFile(file.name);
                    
                    // 添加到DOM
                    li.appendChild(icon);
                    li.appendChild(name);
                    actions.appendChild(deleteBtn);
                    
                    // 如果是图片，添加使用按钮
                    if (!file.isDirectory && file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        const useBtn = document.createElement('button');
                        useBtn.className = 'use-btn';
                        useBtn.innerHTML = '<i class="fas fa-plus"></i>';
                        useBtn.onclick = () => useFile(file.path);
                        actions.appendChild(useBtn);
                    }
                    
                    li.appendChild(actions);
                    fileList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('加载文件列表失败:', error);
            });
    }

    // 删除文件
    function deleteFile(fileName) {
        if (confirm(`确定要删除 ${fileName} 吗？`)) {
            fetch(`/api/files/${fileName}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(() => {
                loadFiles(); // 重新加载文件列表
            })
            .catch(error => {
                console.error('删除文件失败:', error);
                alert('删除文件失败，请重试');
            });
        }
    }

    // 使用文件（插入到编辑器）
    function useFile(filePath) {
        const editor = document.querySelector('.editor-content');
        if (filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const img = document.createElement('img');
            img.src = filePath;
            editor.appendChild(img);
        }
    }

    // 创建文件夹
    createFolderBtn.addEventListener('click', function() {
        const folderName = prompt('请输入文件夹名称：');
        if (folderName) {
            fetch('/api/files/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: folderName })
            })
            .then(response => response.json())
            .then(() => {
                loadFiles(); // 重新加载文件列表
            })
            .catch(error => {
                console.error('创建文件夹失败:', error);
                alert('创建文件夹失败，请重试！');
            });
        }
    });

    // 初始化工具栏状态
    updateToolbarState();
});
