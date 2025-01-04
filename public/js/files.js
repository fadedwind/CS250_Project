document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const filesContent = document.getElementById('filesContent');
    const searchInput = document.getElementById('searchInput');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const newFileBtn = document.getElementById('newFileBtn');
    const importBtn = document.getElementById('importBtn');
    const importModal = document.getElementById('importModal');
    const fileInput = document.getElementById('fileInput');
    const startImportBtn = document.getElementById('startImportBtn');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const viewOptions = document.querySelectorAll('.view-options button');

    let currentPath = '';
    let currentView = 'grid';

    // 加载文件和文件夹
    async function loadFiles() {
        try {
            const response = await fetch('/api/files/list' + currentPath);
            if (!response.ok) throw new Error('加载文件失败');
            const data = await response.json();
            renderFiles(data);
        } catch (error) {
            console.error('加载文件失败:', error);
            showNotification('加载文件失败', 'error');
        }
    }

    // 渲染文件和文件夹
    function renderFiles(data) {
        filesContent.innerHTML = '';
        const container = document.createElement('div');
        container.className = currentView === 'grid' ? 'files-grid' : 'files-list';

        // 如果不是根目录，添加返回上级目录的按钮
        if (currentPath) {
            const backBtn = document.createElement('div');
            backBtn.className = 'folder-item';
            backBtn.innerHTML = `
                <i class="fas fa-level-up-alt"></i>
                <span class="folder-name">返回上级目录</span>
            `;
            backBtn.onclick = () => {
                currentPath = currentPath.split('/').slice(0, -1).join('/');
                loadFiles();
            };
            container.appendChild(backBtn);
        }

        // 渲染文件夹
        data.folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';
            folderElement.innerHTML = `
                <i class="fas fa-folder"></i>
                <span class="folder-name">${folder.name}</span>
                <button class="delete-btn" title="删除文件夹">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            // 点击文件夹进入
            folderElement.onclick = (e) => {
                if (!e.target.closest('.delete-btn')) {
                    currentPath = folder.path;
                    loadFiles();
                }
            };

            // 删除文件夹
            const deleteBtn = folderElement.querySelector('.delete-btn');
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个文件夹吗？')) {
                    try {
                        const response = await fetch('/api/files' + folder.path, {
                            method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('删除文件夹失败');
                        loadFiles();
                        showNotification('文件夹已删除');
                    } catch (error) {
                        console.error('删除文件夹失败:', error);
                        showNotification('删除文件夹失败', 'error');
                    }
                }
            };

            container.appendChild(folderElement);
        });

        // 渲染文件
        data.files.forEach(file => {
            const fileElement = currentView === 'grid' ? 
                createFileCard(file) : createFileRow(file);
            container.appendChild(fileElement);
        });

        filesContent.appendChild(container);
    }

    // 创建文件卡片（网格视图）
    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div class="file-name">${file.name}</div>
            <div class="file-info">
                <span>${formatFileSize(file.size)}</span>
                <span>${formatDate(file.modified)}</span>
            </div>
            <div class="file-actions">
                <button class="edit-btn" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // 编辑文件
        card.querySelector('.edit-btn').onclick = () => {
            window.location.href = '/editor' + file.path;
        };

        // 删除文件
        card.querySelector('.delete-btn').onclick = async () => {
            if (confirm('确定要删除这个文件吗？')) {
                try {
                    const response = await fetch('/api/files' + file.path, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error('删除文件失败');
                    loadFiles();
                    showNotification('文件已删除');
                } catch (error) {
                    console.error('删除文件失败:', error);
                    showNotification('删除文件失败', 'error');
                }
            }
        };

        return card;
    }

    // 创建文件行（列表视图）
    function createFileRow(file) {
        const row = document.createElement('div');
        row.className = 'file-row';
        row.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div class="file-name">${file.name}</div>
            <div class="file-info">
                <span>${formatFileSize(file.size)}</span>
                <span>${formatDate(file.modified)}</span>
            </div>
            <div class="file-actions">
                <button class="edit-btn" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // 编辑文件
        row.querySelector('.edit-btn').onclick = () => {
            window.location.href = '/editor' + file.path;
        };

        // 删除文件
        row.querySelector('.delete-btn').onclick = async () => {
            if (confirm('确定要删除这个文件吗？')) {
                try {
                    const response = await fetch('/api/files' + file.path, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error('删除文件失败');
                    loadFiles();
                    showNotification('文件已删除');
                } catch (error) {
                    console.error('删除文件失败:', error);
                    showNotification('删除文件失败', 'error');
                }
            }
        };

        return row;
    }

    // 新建文件夹
    newFolderBtn.addEventListener('click', async () => {
        const folderName = prompt('请输入文件夹名称:');
        if (folderName) {
            try {
                const response = await fetch('/api/files/folder' + (currentPath ? currentPath + '/' : '/') + folderName, {
                    method: 'POST'
                });
                if (!response.ok) throw new Error('创建文件夹失败');
                loadFiles();
                showNotification('文件夹已创建');
            } catch (error) {
                console.error('创建文件夹失败:', error);
                showNotification('创建文件夹失败', 'error');
            }
        }
    });

    // 新建文件
    newFileBtn.addEventListener('click', () => {
        window.location.href = '/editor/new' + currentPath;
    });

    // 导入文件
    importBtn.addEventListener('click', () => {
        importModal.style.display = 'block';
    });

    // 关闭导入模态框
    document.querySelector('.close-btn').addEventListener('click', () => {
        importModal.style.display = 'none';
    });

    // 文件拖放
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    });

    // 文件选择
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    });

    // 处理文件上传
    async function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', document.querySelector('input[name="importType"]:checked').value);
        formData.append('path', currentPath);

        try {
            const response = await fetch('/api/files/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('导入文件失败');
            
            importModal.style.display = 'none';
            loadFiles();
            showNotification('文件导入成功');
        } catch (error) {
            console.error('导入文件失败:', error);
            showNotification('导入文件失败', 'error');
        }
    }

    // 搜索功能
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            searchFiles(searchTerm);
        }, 300);
    });

    // 搜索文件
    async function searchFiles(term) {
        try {
            const response = await fetch('/api/files/search?q=' + encodeURIComponent(term));
            if (!response.ok) throw new Error('搜索文件失败');
            const data = await response.json();
            renderFiles(data);
        } catch (error) {
            console.error('搜索文件失败:', error);
            showNotification('搜索文件失败', 'error');
        }
    }

    // 切换视图
    viewOptions.forEach(button => {
        button.addEventListener('click', () => {
            currentView = button.dataset.view;
            viewOptions.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadFiles();
        });
    });

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 格式化日期
    function formatDate(date) {
        return new Date(date).toLocaleString();
    }

    // 显示通知
    function showNotification(message, type = 'success') {
        // 实现通知功能
    }

    // 初始化
    loadFiles();
});
