const path = require('path');
const fs = require("fs");
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const { readAllFiles, writeToFile, readFromFile, renameFile, deleteFile, returnFilesByName, compressFile } = require('../modules/fileOperations.js');

// Render index view with a list of files
exports.index = async (req, res) => {
    const files = await readAllFiles('./data');
    res.render('index', { title: 'File List', files });
};

// Render create view
exports.createForm = (req, res) => {
    res.render('create', { title: 'Create File' });
};

// Create new file
exports.createFile = async (req, res) => {
    const { fileName, fileContent } = req.body;
    const filePath = `./data/${fileName}.txt`;
    await writeToFile(filePath, fileContent);
    res.redirect('/');
};

// View file content
exports.viewFile = async (req, res) => {
    const { fileName } = req.query;
    const filePath = `./data/${fileName}`;
    const fileContent = await readFromFile(filePath);
    res.render('detail', { title: 'View File', fileName, fileContent });
};

// Render edit form with file content
exports.editForm = async (req, res) => {
    const { fileName } = req.query;
    const filePath = `./data/${fileName}`;
    const fileContent = await readFromFile(filePath);
    res.render('edit', { title: 'Edit File', fileName, fileContent });
};

// Edit file content and name if changed
exports.editFile = async (req, res) => {
    const { fileName, fileContent } = req.body;
    const oldFileName = req.query.fileName;
    const oldFilePath = `./data/${oldFileName}`;
    const newFilePath = `./data/${fileName}`;

    try {
        if (oldFileName !== fileName) await renameFile(oldFilePath, newFilePath);
        await writeToFile(newFilePath, fileContent);
        res.redirect('/');
    } catch (err) {
        console.error('Error editing file:', err);
        res.status(500).send('Error editing file');
    }
};

// Delete a file
exports.deleteFileController = async (req, res) => {
    const { fileName } = req.body;
    const filePath = `./data/${fileName}`;
    await deleteFile(filePath);
    res.json({ message: `File ${fileName} deleted` });
};

// Upload files
exports.uploadFiles = (req, res) => {
    const uploadedFiles = req.files.map((f) => f.filename);
    res.render('uploadSuccess', { files: uploadedFiles });
};

// Download file
exports.downloadFile = async (req, res) => {
    const { fileName } = req.query;
    const filePath = path.join(__dirname, '../data', fileName);

    try {
        if (!fs.existsSync(filePath)) return res.status(404).send('File not found.');
        res.download(filePath, fileName);
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file.');
    }
};

// Search for files by name
exports.searchFiles = async (req, res) => {
    const { searchTerm } = req.body;
    const files = await returnFilesByName('./data', searchTerm);
    res.status(200).json({ files });
};

// Compress a file
exports.compressFileController = async (req, res) => {
    const { fileName } = req.body;

    try {
        const filePath = `./data/${fileName}`;
        await compressFile(filePath);
        res.status(200).json({ message: 'File compressed successfully' });
    } catch (err) {
        console.error('Error compressing file:', err);
        res.status(500).json({ message: 'Error compressing file' });
    }
};

module.exports = exports;