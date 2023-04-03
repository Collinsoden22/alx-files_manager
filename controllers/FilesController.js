const { v4: uuidv4 } = require('uuid');
const { getFileType } = require('../utils/fileUtils');
const { ObjectId } = require('mongodb');

const FilesController = {};

FilesController.postNew = async (req, res) => {
    const { name, type, parentId = '0', isPublic = false, data } = req.body;
    const userId = ObjectId(req.user.id);
    const parent = await req.app.locals.db
        .collection('files')
        .findOne({ _id: ObjectId(parentId), type: 'folder' });

    if (!name) {
        return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !getFileType(type)) {
        return res.status(400).json({ error: 'Missing or invalid type' });
    }

    if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0' && (!parent || parent.userId.toString() !== userId.toString())) {
        return res.status(400).json({ error: 'Invalid parent' });
    }

    const fileData = {
        userId,
        name,
        type,
        isPublic,
        parentId,
    };

    if (type === 'folder') {
        const result = await req.app.locals.db.collection('files').insertOne(fileData);
        const file = await req.app.locals.db.collection('files').findOne({ _id: result.insertedId });
        return res.status(201).json({ id: file._id, name: file.name });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const filename = uuidv4();
    const localPath = `${folderPath}/${filename}`;
    const fileContent = Buffer.from(data, 'base64');

    try {
        await req.app.locals.fs.promises.writeFile(localPath, fileContent);
    } catch (err) {
        console.error(`Error saving file to disk: ${err}`);
        return res.status(500).json({ error: 'Error saving file to disk' });
    }

    fileData.localPath = localPath;
    const result = await req.app.locals.db.collection('files').insertOne(fileData);
    const file = await req.app.locals.db.collection('files').findOne({ _id: result.insertedId });
    return res.status(201).json({ id: file._id, name: file.name });
};

module.exports = FilesController;
