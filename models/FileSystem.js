const fs = require('fs').promises;
const path = require('path');

class FileSystem {
    constructor(rootDir) {
        this.rootDir = rootDir;
    }

    // 创建文件夹
    async createFolder(folderPath) {
        const fullPath = path.join(this.rootDir, folderPath);
        await fs.mkdir(fullPath, { recursive: true });
        return { success: true, path: folderPath };
    }

    // 创建文件
    async createFile(filePath, content) {
        const fullPath = path.join(this.rootDir, filePath);
        await fs.writeFile(fullPath, content);
        return { success: true, path: filePath };
    }

    // 获取目录结构
    async getDirectoryStructure(dirPath = '') {
        const fullPath = path.join(this.rootDir, dirPath);
        const items = await fs.readdir(fullPath, { withFileTypes: true });
        
        const structure = [];
        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            if (item.isDirectory()) {
                const children = await this.getDirectoryStructure(itemPath);
                structure.push({
                    type: 'folder',
                    name: item.name,
                    path: itemPath,
                    children
                });
            } else {
                const stats = await fs.stat(path.join(fullPath, item.name));
                structure.push({
                    type: 'file',
                    name: item.name,
                    path: itemPath,
                    size: stats.size,
                    modified: stats.mtime
                });
            }
        }
        return structure;
    }

    // 移动文件或文件夹
    async move(sourcePath, targetPath) {
        const fullSourcePath = path.join(this.rootDir, sourcePath);
        const fullTargetPath = path.join(this.rootDir, targetPath);
        await fs.rename(fullSourcePath, fullTargetPath);
        return { success: true, newPath: targetPath };
    }

    // 删除文件或文件夹
    async delete(itemPath) {
        const fullPath = path.join(this.rootDir, itemPath);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
            await fs.rm(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }
        return { success: true };
    }

    // 读取文件内容
    async readFile(filePath) {
        const fullPath = path.join(this.rootDir, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        return { content };
    }

    // 更新文件内容
    async updateFile(filePath, content) {
        const fullPath = path.join(this.rootDir, filePath);
        await fs.writeFile(fullPath, content);
        return { success: true };
    }
}

module.exports = FileSystem;
