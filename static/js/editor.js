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

    // 添加Font Awesome图标
    const linkStylesheet = document.createElement('link');
    linkStylesheet.rel = 'stylesheet';
    linkStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(linkStylesheet);

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
                const url = prompt('请输入图片URL:');
                if (url) {
                    document.execCommand('insertImage', false, url);
                }
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

    // 保存功能
    saveBtn.addEventListener('click', async function() {
        const content = editor.innerHTML;
        try {
            // 这里添加保存到服务器的逻辑
            // const response = await fetch('/api/save', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ content })
            // });
            // const data = await response.json();
            alert('内容已保存！');
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试！');
        }
    });

    // 导出功能
    exportBtn.addEventListener('click', function() {
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>导出的页面</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                ${editor.innerHTML}
            </body>
            </html>
        `;
        
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'webpage.html';
        a.click();
        URL.revokeObjectURL(url);
    });

    // 初始化工具栏状态
    updateToolbarState();
});
