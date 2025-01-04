const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 获取文件列表
router.get('/', async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, '../public/uploads');
        const files = await fs.readdir(uploadsDir);
        const fileList = await Promise.all(files.map(async (file) => {
            const filePath = path.join(uploadsDir, file);
            const stats = await fs.stat(filePath);
            return {
                name: file,
                path: `/uploads/${file}`,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                createdAt: stats.birthtime
            };
        }));
        res.json(fileList);
    } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({ error: '获取文件列表失败' });
    }
});

// 上传文件
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
    }
    res.json({
        message: '文件上传成功',
        file: {
            name: req.file.filename,
            path: `/uploads/${req.file.filename}`
        }
    });
});

// 创建文件夹
router.post('/folder', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: '文件夹名称不能为空' });
        }

        const folderPath = path.join(__dirname, '../public/uploads', name);
        await fs.mkdir(folderPath);
        res.json({ message: '文件夹创建成功' });
    } catch (error) {
        console.error('创建文件夹失败:', error);
        res.status(500).json({ error: '创建文件夹失败' });
    }
});

// 删除文件或文件夹
router.delete('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const filePath = path.join(__dirname, '../public/uploads', name);
        
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            await fs.rmdir(filePath, { recursive: true });
        } else {
            await fs.unlink(filePath);
        }
        
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error('删除失败:', error);
        res.status(500).json({ error: '删除失败' });
    }
});

module.exports = router;
