const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const templates = require('./data/templates');
const FileSystem = require('./models/FileSystem');

const app = express();
const port = 3000;

// 初始化文件系统
const fileSystem = new FileSystem(path.join(__dirname, 'user_files'));

// 配置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 配置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user_files', express.static(path.join(__dirname, 'user_files')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 创建必要的目录
const uploadDir = path.join(__dirname, 'public', 'uploads');
const templatesDir = path.join(__dirname, 'public', 'images', 'templates');
const userFilesDir = path.join(__dirname, 'user_files');
require('fs').mkdirSync(uploadDir, { recursive: true });
require('fs').mkdirSync(templatesDir, { recursive: true });
require('fs').mkdirSync(userFilesDir, { recursive: true });

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 使用绝对路径
        cb(null, path.join(__dirname, 'public', 'uploads'))
    },
    filename: function (req, file, cb) {
        // 保持原始文件名，避免中文文件名问题
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // 只允许上传图片
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('只允许上传图片文件！'), false);
        }
        cb(null, true);
    }
});

// 页面路由
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/editor', (req, res) => {
    res.render('editor');
});

app.get('/templates', (req, res) => {
    res.render('templates', { templates });
});

app.get('/files', (req, res) => {
    res.render('files');
});

// 文件管理API
app.get('/api/files/tree', async (req, res) => {
    try {
        const tree = await fileSystem.getDirectoryStructure();
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get directory structure' });
    }
});

app.get('/api/files', async (req, res) => {
    try {
        const files = await fileSystem.getDirectoryStructure(req.query.path || '');
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get files' });
    }
});

app.post('/api/files/folder', async (req, res) => {
    try {
        const { path, name } = req.body;
        const folderPath = path ? `${path}/${name}` : name;
        const result = await fileSystem.createFolder(folderPath);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

app.post('/api/files/move', async (req, res) => {
    try {
        const { source, target } = req.body;
        const result = await fileSystem.move(source, target);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to move file' });
    }
});

app.delete('/api/files', async (req, res) => {
    try {
        const { path } = req.body;
        const result = await fileSystem.delete(path);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// 文件导入API
app.post('/api/files/import', upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        const { type, path } = req.body;
        let content = '';

        switch (type) {
            case 'word':
                const wordResult = await mammoth.extractRawText({ path: file.path });
                content = wordResult.value;
                break;
            case 'pdf':
                const pdfData = await pdf(file.path);
                content = pdfData.text;
                break;
            case 'html':
                content = await require('fs').promises.readFile(file.path, 'utf-8');
                break;
            default:
                throw new Error('Unsupported file type');
        }

        // 创建HTML文件
        const fileName = path ? 
            `${path}/${file.originalname.split('.')[0]}.html` : 
            `${file.originalname.split('.')[0]}.html`;
        
        await fileSystem.createFile(fileName, content);

        res.json({
            success: true,
            path: fileName
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Failed to import file' });
    }
});

// 其他API路由
app.get('/api/templates/:id', (req, res) => {
    const template = templates.find(t => t.id === req.params.id);
    if (template) {
        res.json(template);
    } else {
        res.status(404).json({ error: 'Template not found' });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // 返回相对于public目录的路径
    res.json({
        success: true,
        filename: req.file.filename,
        path: '/uploads/' + req.file.filename
    });
});

app.post('/api/save', async (req, res) => {
    try {
        const { content, styles, path } = req.body;
        if (path) {
            await fileSystem.updateFile(path, content);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
