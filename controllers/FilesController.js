const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const createFile = async (req, res) => {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: 'Missing name' });
    }

    if (!type || !['file', 'image', 'folder'].includes(type)) {
        return res.status(400).json({ message: 'Missing or invalid type' });
    }

    if (type !== 'folder' && !data) {
        return res.status(400).json({ message: 'Missing data' });
    }

    if (parentId) {
        const parent = await File.findById(parentId);
        if (!parent) {
            return res.status(400).json({ message: 'Parent not found' });
        }
        if (parent.type !== 'folder') {
            return res.status(400).json({ message: 'Parent is not a folder' });
        }
    }

    const file = new File({
        userId,
        name,
        type,
        parentId,
        isPublic,
    });

    if (type !== 'folder') {
        const localPath = path.join(FOLDER_PATH, uuidv4());
    const fileContent = Buffer.from(data, 'base64');
        try {
            await fs.promises.mkdir(FOLDER_PATH, { recursive: true });
            await fs.promises.writeFile(localPath, fileContent);
            file.localPath = localPath;
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error while creating file' });
        }
    }

    try {
        const savedFile = await file.save();
        res.status(201).json(savedFile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error while saving file' });
    }
};

module.exports = { postUpload: createFile };
