document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const folderTree = document.getElementById('folderTree');
    const filesContent = document.getElementById('filesContent');
    const searchInput = document.getElementById('searchInput');
    const newFolderBtn = document.getElementById('newFolderBtn');
    const newFileBtn = document.getElementById('newFileBtn');
    const importBtn = document.getElementById('importBtn');
    const importModal = document.getElementById('importModal');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const startImportBtn = document.getElementById('startImportBtn');
    
    let currentView = 'grid';
    let currentPath = '';

    // 初始化
    loadFolderTree();
    loadFiles();

    // 加载文件夹树
    async function loadFolderTree() {
        try {
            const response = await fetch('/api/files/tree');
            const data = await response.json();
            renderFolderTree(data);
        } catch (error) {
            console.error('加载文件夹树失败:', error);
            showNotification('加载文件夹树失败', 'error');
        }
    }

    // 渲染文件夹树
    function renderFolderTree(structure, parent = folderTree) {
        parent.innerHTML = '';
        structure.forEach(item => {
            if (item.type === 'folder') {
                const folderDiv = document.createElement('div');
                folderDiv.className = 'tree-item';
                folderDiv.innerHTML = `
                    <i class="fas fa-folder"></i>
                    <span>${item.name}</span>
                `;
                folderDiv.addEventListener('click', () => {
                    currentPath = item.path;
                    loadFiles();
                    highlightFolder(folderDiv);
                });
                parent.appendChild(folderDiv);

                if (item.children && item.children.length > 0) {
                    const childrenDiv = document.createElement('div');
                    childrenDiv.style.marginLeft = '1rem';
                    renderFolderTree(item.children, childrenDiv);
                    parent.appendChild(childrenDiv);
                }
            }
        });
    }

    // 高亮选中的文件夹
    function highlightFolder(element) {
        const allFolders = document.querySelectorAll('.tree-item');
        allFolders.forEach(folder => folder.classList.remove('active'));
        element.classList.add('active');
    }

    // 加载文件列表
    async function loadFiles() {
        try {
            const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
            const data = await response.json();
            renderFiles(data);
        } catch (error) {
            console.error('加载文件列表失败:', error);
            showNotification('加载文件列表失败', 'error');
        }
    }

    // 渲染文件列表
    function renderFiles(files) {
        filesContent.innerHTML = '';
        const container = document.createElement('div');
        container.className = currentView === 'grid' ? 'files-grid' : 'files-list';

        files.forEach(file => {
            const fileElement = currentView === 'grid' 
                ? createFileCard(file) 
                : createFileRow(file);
            container.appendChild(fileElement);
        });

        filesContent.appendChild(container);
    }

    // 创建文件卡片（网格视图）
    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-icon">
                <i class="fas ${file.type === 'folder' ? 'fa-folder' : 'fa-file-alt'}"></i>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-meta">
                ${formatFileSize(file.size)}
                <br>
                ${formatDate(file.modified)}
            </div>
        `;
        card.addEventListener('click', () => handleFileClick(file));
        return card;
    }

    // 创建文件行（列表视图）
    function createFileRow(file) {
        const row = document.createElement('div');
        row.className = 'file-row';
        row.innerHTML = `
            <div class="file-icon">
                <i class="fas ${file.type === 'folder' ? 'fa-folder' : 'fa-file-alt'}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    ${formatFileSize(file.size)} • ${formatDate(file.modified)}
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-icon" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        row.addEventListener('click', () => handleFileClick(file));
        return row;
    }

    // 处理文件点击
    function handleFileClick(file) {
        if (file.type === 'folder') {
            currentPath = file.path;
            loadFiles();
        } else {
            window.location.href = `/editor?file=${encodeURIComponent(file.path)}`;
        }
    }

    // 新建文件夹
    newFolderBtn.addEventListener('click', async () => {
        const folderName = prompt('请输入文件夹名称:');
        if (folderName) {
            try {
                const response = await fetch('/api/files/folder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        path: currentPath,
                        name: folderName
                    })
                });
                
                if (response.ok) {
                    loadFolderTree();
                    loadFiles();
                    showNotification('文件夹创建成功');
                } else {
                    throw new Error('创建文件夹失败');
                }
            } catch (error) {
                console.error('创建文件夹失败:', error);
                showNotification('创建文件夹失败', 'error');
            }
        }
    });

    // 新建文件
    newFileBtn.addEventListener('click', () => {
        window.location.href = `/editor?path=${encodeURIComponent(currentPath)}`;
    });

    // 导入文件
    importBtn.addEventListener('click', () => {
        importModal.classList.add('show');
    });

    // 文件拖放上传
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
        const files = e.dataTransfer.files;
        handleFileUpload(files[0]);
    });

    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files[0]);
    });

    // 处理文件上传
    async function handleFileUpload(file) {
        const importType = document.querySelector('input[name="importType"]:checked').value;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', importType);
        formData.append('path', currentPath);

        try {
            const response = await fetch('/api/files/import', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                importModal.classList.remove('show');
                window.location.href = `/editor?file=${encodeURIComponent(data.path)}`;
            } else {
                throw new Error('导入失败');
            }
        } catch (error) {
            console.error('文件导入失败:', error);
            showNotification('文件导入失败', 'error');
        }
    }

    // 搜索功能
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                searchFiles(searchTerm);
            } else {
                loadFiles();
            }
        }, 300);
    });

    // 搜索文件
    async function searchFiles(term) {
        try {
            const response = await fetch(`/api/files/search?term=${encodeURIComponent(term)}`);
            const data = await response.json();
            renderFiles(data);
        } catch (error) {
            console.error('搜索文件失败:', error);
            showNotification('搜索文件失败', 'error');
        }
    }

    // 工具函数
    function formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(date) {
        return new Date(date).toLocaleString();
    }

    function showNotification(message, type = 'success') {
        // 实现通知功能
        alert(message);
    }

    // 清理
    return () => {
        clearTimeout(searchTimeout);
    };
});
