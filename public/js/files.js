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
    const fileTree = document.getElementById('fileTree');

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

    // 新建文件
    newFileBtn.addEventListener('click', () => {
        const fileName = prompt('请输入文件名:', '新文档.txt');
        if (fileName) {
            // 在Working Directory中创建新文件
            fileSystem['Working Directory'].children[fileName] = {
                type: 'file',
                content: '',
                lastModified: new Date().toISOString()
            };
            
            // 保存文件系统
            saveFileSystem();
            
            // 重新渲染文件树
            fileTree.innerHTML = '';
            renderFileTree(fileTree, fileSystem);
        }
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

    // 默认的文件系统结构
    const defaultFileSystem = {
        'Working Directory': {
            type: 'folder',
            children: {}
        }
    };

    // 初始化文件系统
    let fileSystem = null;

    // 从localStorage加载文件系统
    function loadFileSystem() {
        const savedSystem = localStorage.getItem('fileSystem');
        if (savedSystem) {
            fileSystem = JSON.parse(savedSystem);
        } else {
            fileSystem = defaultFileSystem;
            saveFileSystem();
        }
        renderFileTree(fileTree, fileSystem);
    }

    // 保存文件系统到localStorage
    function saveFileSystem() {
        localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
    }

    // 渲染文件树
    function renderFileTree(container, data, path = '') {
        for (const [name, item] of Object.entries(data)) {
            const itemPath = path ? `${path}/${name}` : name;
            const itemElement = document.createElement('div');
            itemElement.className = 'tree-item';
            itemElement.dataset.path = itemPath;

            // 添加展开/折叠图标
            if (item.type === 'folder') {
                const toggle = document.createElement('span');
                toggle.className = 'tree-toggle';
                toggle.innerHTML = '▶';
                itemElement.appendChild(toggle);
            }

            // 添加图标
            const icon = document.createElement('i');
            icon.className = `fas ${item.type === 'folder' ? 'fa-folder' : 'fa-file'}`;
            itemElement.appendChild(icon);

            // 添加名称
            const nameSpan = document.createElement('span');
            nameSpan.className = 'tree-item-name';
            nameSpan.contentEditable = true;
            nameSpan.textContent = name;
            itemElement.appendChild(nameSpan);

            // 添加操作按钮容器（除了根目录）
            if (name !== 'Working Directory') {
                const actions = document.createElement('div');
                actions.className = 'tree-item-actions';

                // 添加删除按钮
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.title = '删除';
                actions.appendChild(deleteBtn);
                itemElement.appendChild(actions);

                // 删除处理
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除${item.type === 'folder' ? '文件夹' : '文件'} "${name}" 吗？`)) {
                        // 从DOM中移除
                        if (item.type === 'folder') {
                            itemElement.nextElementSibling?.remove(); // 移除子容器
                        }
                        itemElement.remove();
                        
                        // 从数据结构中移除
                        const pathParts = itemPath.split('/');
                        let current = fileSystem;
                        for (let i = 0; i < pathParts.length - 1; i++) {
                            current = current[pathParts[i]].children;
                        }
                        delete current[pathParts[pathParts.length - 1]];
                        saveFileSystem();
                    }
                });
            }

            container.appendChild(itemElement);

            if (item.type === 'folder') {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                childrenContainer.style.display = 'none';
                container.appendChild(childrenContainer);

                // 展开/折叠处理
                const toggle = itemElement.querySelector('.tree-toggle');
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = toggle.innerHTML === '▼';
                    toggle.innerHTML = isExpanded ? '▶' : '▼';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                });

                renderFileTree(childrenContainer, item.children, itemPath);
            }

            // 重命名处理
            nameSpan.addEventListener('blur', () => {
                const newName = nameSpan.textContent.trim();
                if (newName !== name) {
                    // 这里可以添加重命名的后端API调用
                    console.log(`重命名 ${name} 为 ${newName}`);
                    const pathParts = itemPath.split('/');
                    let current = fileSystem;
                    for (let i = 0; i < pathParts.length - 1; i++) {
                        current = current[pathParts[i]].children;
                    }
                    current[newName] = current[name];
                    delete current[name];
                    saveFileSystem();
                }
            });

            // 选择处理
            itemElement.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.type === 'folder') {
                    // 如果是文件夹，选中它
                    document.querySelectorAll('.tree-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    itemElement.classList.add('selected');
                    currentPath = itemPath;
                } else {
                    // 如果是文件，跳转到编辑器
                    console.log('点击文件:', name);
                    console.log('文件路径:', itemPath);
                    console.log('文件内容:', item.content);
                    // 跳转到编辑器并传递文件内容
                    const params = new URLSearchParams();
                    params.append('content', item.content || '');
                    params.append('filename', name);
                    window.location.href = '/editor?' + params.toString();
                }
            });
        }
    }

    // 导入文件按钮点击事件
    importBtn.addEventListener('click', () => {
        const modal = document.getElementById('importModal');
        modal.style.display = 'block';
    });

    // 关闭模态框
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('importModal').style.display = 'none';
    });

    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const importType = document.querySelector('input[name="importType"]:checked').value;
        
        // 验证文件类型
        if (importType === 'txt' && !file.name.toLowerCase().endsWith('.txt')) {
            alert('请选择.txt文件');
            return;
        } else if (importType === 'html' && !file.name.toLowerCase().endsWith('.html')) {
            alert('请选择.html文件');
            return;
        }

        // 读取文件内容
        const reader = new FileReader();
        reader.onload = function(e) {
            // 获取文件内容
            const content = e.target.result;
            // 跳转到编辑器页面并传递内容
            window.location.href = `/editor?content=${encodeURIComponent(content)}`;
        };
        reader.readAsText(file);
    });

    // 文件上传区域点击处理
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 开始导入按钮点击事件
    document.getElementById('startImportBtn').addEventListener('click', () => {
        fileInput.click();
    });

    // 检查URL参数中是否有要保存的内容
    const urlParams = new URLSearchParams(window.location.search);
    const content = urlParams.get('content');
    if (content) {
        const fileName = prompt('请输入文件名:', '新文档.txt');
        if (fileName) {
            // 确保文件系统已正确加载
            const savedSystem = localStorage.getItem('fileSystem');
            if (savedSystem) {
                fileSystem = JSON.parse(savedSystem);
            } else {
                fileSystem = defaultFileSystem;
            }
            
            // 添加文件到当前目录
            let current = fileSystem['Working Directory'].children;
            
            // 添加文件
            current[fileName] = {
                type: 'file',
                content: content,
                lastModified: new Date().toISOString()
            };
            
            // 保存文件系统
            saveFileSystem();
            
            // 刷新页面而不是重新渲染
            window.location.href = '/files';
            return;
        }
    }

    // 初始化时加载文件系统
    loadFileSystem();
    loadFiles();
});
