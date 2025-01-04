document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const fileListContent = document.getElementById('file-list-content');
    const currentPathDisplay = document.getElementById('current-path');
    const uploadBtn = document.getElementById('upload-file-btn');
    const fileInput = document.getElementById('file-input');
    const createFolderBtn = document.getElementById('create-folder-btn');

    let currentPath = '/';

    // 初始化
    loadFiles();

    // 上传文件按钮点击事件
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // 文件选择变化事件
    fileInput.addEventListener('change', function() {
        const files = this.files;
        if (files.length > 0) {
            uploadFiles(files);
        }
    });

    // 创建文件夹按钮点击事件
    createFolderBtn.addEventListener('click', function() {
        const folderName = prompt('请输入文件夹名称：');
        if (folderName) {
            createFolder(folderName);
        }
    });

    // 加载文件列表
    async function loadFiles() {
        try {
            const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
            const files = await response.json();
            renderFiles(files);
            currentPathDisplay.textContent = currentPath || '/';
        } catch (error) {
            console.error('加载文件列表失败:', error);
            alert('加载文件列表失败');
        }
    }

    // 渲染文件列表
    function renderFiles(files) {
        fileListContent.innerHTML = '';

        // 如果不在根目录，添加返回上级目录选项
        if (currentPath !== '/') {
            const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
            const backItem = document.createElement('div');
            backItem.className = 'file-item';
            backItem.innerHTML = `
                <div class="file-name">
                    <i class="fas fa-level-up-alt"></i>
                    <span>..</span>
                </div>
                <div class="file-size">-</div>
                <div class="file-modified">-</div>
                <div class="file-actions"></div>
            `;
            backItem.querySelector('.file-name').addEventListener('click', () => {
                currentPath = parentPath;
                loadFiles();
            });
            fileListContent.appendChild(backItem);
        }

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-name">
                    <i class="fas ${getFileIcon(file)}"></i>
                    <span>${file.name}</span>
                </div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <div class="file-modified">${formatDate(file.modified)}</div>
                <div class="file-actions">
                    <button class="delete-btn" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${file.type !== 'folder' && file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? `
                        <button class="use-btn" title="使用">
                            <i class="fas fa-plus"></i>
                        </button>
                    ` : ''}
                </div>
            `;

            // 文件名点击事件
            const nameElement = fileItem.querySelector('.file-name');
            nameElement.addEventListener('click', () => {
                if (file.type === 'folder') {
                    currentPath = file.path;
                    loadFiles();
                }
            });

            // 删除按钮点击事件
            const deleteBtn = fileItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定要删除 ${file.name} 吗？`)) {
                    deleteFile(file.path);
                }
            });

            // 使用按钮点击事件（仅对图片文件）
            const useBtn = fileItem.querySelector('.use-btn');
            if (useBtn) {
                useBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    useFile(file.path);
                });
            }

            fileListContent.appendChild(fileItem);
        });
    }

    // 上传文件
    async function uploadFiles(files) {
        const formData = new FormData();
        for (let file of files) {
            formData.append('file', file);
        }
        formData.append('path', currentPath);

        try {
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                loadFiles();
            } else {
                throw new Error('文件上传失败');
            }
        } catch (error) {
            console.error('文件上传失败:', error);
            alert('文件上传失败，请重试');
        }
    }

    // 创建文件夹
    async function createFolder(name) {
        try {
            const response = await fetch('/api/files/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: currentPath,
                    name: name
                })
            });

            if (response.ok) {
                loadFiles();
            } else {
                throw new Error('创建文件夹失败');
            }
        } catch (error) {
            console.error('创建文件夹失败:', error);
            alert('创建文件夹失败，请重试');
        }
    }

    // 删除文件
    async function deleteFile(path) {
        try {
            const response = await fetch(`/api/files${path}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadFiles();
            } else {
                throw new Error('删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败，请重试');
        }
    }

    // 使用文件
    function useFile(path) {
        window.location.href = `/editor?file=${encodeURIComponent(path)}`;
    }

    // 获取文件图标
    function getFileIcon(file) {
        if (file.type === 'folder') {
            return 'fa-folder';
        } else if (file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return 'fa-file-image';
        } else {
            return 'fa-file';
        }
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0 || bytes === undefined) return '-';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 格式化日期
    function formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleString();
    }
});
