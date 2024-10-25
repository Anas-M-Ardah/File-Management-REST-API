import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readAllFiles, writeToFile, readFromFile, renameFile, deleteFile, returnFilesByName, compressFile } from './modules/fileOperations.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // body parser

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


// ***** ROUTING ***** //


// *** INDEX ROUTE *** //
app.get("/", async (req, res) => {
    const files = await readAllFiles('./data');
    res.render('index', { title: 'File List', files: files });
});


// *** CREATE ROUTE *** //
app.get("/create", (req, res) => {
    res.render('create', { title: 'Create File' });
});

app.post("/create", async (req, res) => {
    const { fileName, fileContent } = req.body;
    const filePath = `./data/${fileName}.txt`;
    await writeToFile(filePath, fileContent);
    res.redirect("/");
});


// *** VIEW ROUTE *** //
app.get("/view", async (req, res) => {
    const { fileName } = req.query;
    const filePath = `./data/${fileName}`;
    const fileContent = await readFromFile(filePath);
    res.render('detail', { title: 'View File', fileName: fileName, fileContent: fileContent });
});

// *** EDIT ROUTE *** //
app.get("/edit", async (req, res) => {
    const { fileName } = req.query;
    const filePath = `./data/${fileName}`;
    const fileContent = await readFromFile(filePath);
    res.render('edit', { title: 'Edit File', fileName: fileName, fileContent: fileContent });
});

app.post('/edit', async (req, res) => {
    const { fileName, fileContent } = req.body;
    const oldFileName = req.query.fileName;
    const oldFilePath = `./data/${oldFileName}`;
    const newFilePath = `./data/${fileName}`;

    try {
        // If the file name was changed, rename the file
        if (oldFileName !== fileName) {
            await renameFile(oldFilePath, newFilePath);
        }

        // Write the new content to the file
        await writeToFile(newFilePath, fileContent, 'utf8');
        res.redirect('/');
    } catch (err) {
        console.error('Error editing file:', err);
        res.status(500).send('Error editing file');
    }
});

// *** DELETE ROUTE *** //
app.delete('/delete', async (req, res) => {
    const {fileName} = req.body;
    const filePath = `./data/${fileName}`;
    await deleteFile(filePath);
    res.json({ message: `File ${fileName} deleted` });
}); 


// *** UPLOAD ROUTE *** //
app.get('/upload', (req, res) => {
    res.render('upload', { title: 'Upload File' });
});

app.post('/upload', upload.array('file', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    const uploadedFiles = req.files.map(f => f.filename);
    console.log("Files uploaded:", uploadedFiles);
    res.render('uploadSuccess', { files: uploadedFiles });
});


// *** DOWNLOAD ROUTE *** //
app.get('/download', async (req, res) => {
    console.log('Download request received.');
    const { fileName } = req.query;
    const filePath = path.join(__dirname, 'data', fileName);

    try {
        console.log('Checking if file exists:', filePath);
        if (!fs.existsSync(filePath)) {
            console.log('File not found:', filePath);
            return res.status(404).send('File not found.');
        }

        console.log('Downloading file:', filePath);
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file.');
            } else {
                console.log('File downloaded successfully:', filePath);
            }
        });
    } catch (err) {
        console.error('Error handling download request:', err);
        res.status(500).send('Error processing file download.');
    }
});


// *** SEARCH ROUTE *** //
app.post('/search', async (req, res) => {
    const { searchTerm } = req.body;
    const files = await returnFilesByName('./data', searchTerm);
    res.status(200).json({ files });
});

// *** COMPRESS ROUTE *** //
app.post("/compress", async (req, res) => {
    const { fileName } = req.body;

    try {
        const filePath = `./data/${fileName}`;
        await compressFile(filePath);
        res.status(200).json({ message: "File compressed successfully" });
    } catch (err) {
        console.error("Error compressing file:", err);
        res.status(500).json({ message: "Error compressing file" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

