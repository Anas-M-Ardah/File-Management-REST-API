const { readFile, writeFile, readdir, rename, unlink } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');
const { createGzip } = require('zlib');
const path = require('path');

/**
 * Reads the content of a file.
 * @param {string} filePath - The path of the file to be read.
 * @returns {string} The content of the file as a string.
 * @throws Error if there is an error reading the file.
 */
async function readFromFile(filePath) {
    // Try to read the file at the specified path
    try {
        const data = await readFile(filePath, 'utf8');
        // Return the content of the file as a string
        return data;
    } catch (err) {
        // If there is an error, log it and throw the error
        console.error(`Error reading file ${filePath}:`, err);
        throw err;
    }
}

/**
 * Writes data to a file at the specified path.
 * @param {string} filePath - The path of the file where data will be written.
 * @param {string} data - The content to write to the file.
 * @throws Error if there is an error writing to the file.
 */
async function writeToFile(filePath, data) {
    // Attempt to write data to the file
    try {
        await writeFile(filePath, data, 'utf8');
        // Log success message if writing is successful
        console.log(`Data successfully written to ${filePath}`);
    } catch (err) {
        // Log error and rethrow if there is an issue writing to the file
        console.error(`Error writing to file ${filePath}:`, err);
        throw err;
    }
}

/**
 * Reads all files in a directory and returns an array of objects containing file names and their contents.
 * @param {string} dirPath - The path of the directory to read files from.
 * @returns {Promise<Array<{fileName: string, content: string}>>} An array of objects, each containing the file name and content.
 * @throws Error if there is an error reading the directory or any file within it.
 */
async function readAllFiles(dirPath) {
    try {
        // Read the directory to get a list of files
        const files = await readdir(dirPath);
        const dataArr = [];

        // Iterate over each file in the directory
        for (const file of files) {
            // Construct the full file path
            const filePath = `${dirPath}/${file}`;
            // Read the content of the file
            const content = await readFromFile(filePath);

            // Add the file name and content to the data array
            dataArr.push({
                fileName: file,
                content: content
            });
        }

        // Return the array of file data
        return dataArr; 
    } catch (err) {
        // Log an error message and rethrow the error if reading fails
        console.error(`Error reading directory ${dirPath}:`, err);
        throw err;
    }
}

/**
 * Renames a file from oldFilePath to newFilePath.
 *
 * @param {string} oldFilePath - The current path of the file to be renamed.
 * @param {string} newFilePath - The new path for the file.
 *
 * @throws Error if there is an error renaming the file.
 */
async function renameFile(oldFilePath, newFilePath) {
    try {
        // Attempt to rename the file
        await rename(oldFilePath, newFilePath);
        // Log success message if renaming is successful
        console.log(`File ${oldFilePath} successfully renamed to ${newFilePath}`);
    } catch (err) {
        // Log an error message and rethrow the error if renaming fails
        console.error(`Error renaming file ${oldFilePath} to ${newFilePath}:`, err);
        throw err;
    }
}

/**
 * Deletes a file at the specified path.
 * @param {string} filePath - The path of the file to be deleted.
 * @throws Error if there is an error deleting the file.
 */
async function deleteFile(filePath) {
    try {
        // Attempt to delete the file
        await unlink(filePath);
        // Log success message if deletion is successful
        console.log(`File ${filePath} successfully deleted`);
    } catch (err) {
        // Log an error message and rethrow the error if deletion fails
        console.error(`Error deleting file ${filePath}:`, err);
        throw err;
    }
}

/**
 * Uploads a file to the ./data/ directory without encryption or renaming.
 * @param {string} filePath - The path of the file to be uploaded.
 * @throws Error if there is an error uploading the file.
 */
async function uploadFile(filePath) {
    try {
        // Move the file to the `./data/` directory without encryption or renaming
        await rename(filePath, `./data/${filePath}`);

        // Log success message if upload is successful
        console.log(`File ${filePath} successfully uploaded`);
    } catch (err) {
        // Log an error message and rethrow the error if upload fails
        console.error(`Error uploading file ${filePath}:`, err);
        throw err;
    }
}

/**
 * Returns an array of objects containing file names and their contents from a directory.
 * The method searches for files containing the search term in their names and returns an array
 * of objects with the file name and content.
 * @param {string} dirPath - The path of the directory to search for files.
 * @param {string} fileName - The search term to search for in the file names.
 * @returns {Promise<Array<{fileName: string, content: string}>>} An array of objects, each containing the file name and content.
 * @throws Error if there is an error reading the directory or any file within it.
 */
async function returnFilesByName(dirPath, fileName) {
    try {
        // Read the directory to get a list of files
        const files = await readdir(dirPath);
        const dataArr = [];

        // Iterate over each file in the directory
        for (const file of files) {
            // Check if the file name matches the search term
            if (file.includes(fileName)) {
                // Construct the full file path
                const filePath = `${dirPath}/${file}`;
                // Read the content of the file
                const content = await readFromFile(filePath);

                // Add the file name and content to the data array
                dataArr.push({
                    fileName: file,
                    content: content
                });
            }
        }

        // Return the array of file data
        return dataArr; 
    } catch (err) {
        // Log an error message and rethrow the error if reading fails
        console.error(`Error reading directory ${dirPath}:`, err);
        throw err;
    }
}

/**
 * Compresses a file using gzip compression.
 * @param {string} fileName - The path and name of the file to compress.
 * @throws {Error} If there is an error reading or writing the file.
 */
async function compressFile(fileName) {
    try {
        // Create paths for input and output files
        const filePath = path.resolve(fileName);           // Original file path
        const compressedFilePath = `${filePath}.gz`;       // Compressed file path

        // Create read and write streams
        const readStream = createReadStream(filePath);     // Stream for reading the file
        const writeStream = createWriteStream(compressedFilePath); // Stream for writing the compressed file

        // Create Gzip stream
        const gzipStream = createGzip();                   // Gzip compression stream

        // Use pipeline to compress the file
        await pipeline(readStream, gzipStream, writeStream);

        console.log(`File compressed successfully: ${compressedFilePath}`);
    } catch (error) {
        console.error(`Error compressing file: ${error.message}`);
        throw error;
    }
}

module.exports = {
    readFromFile,
    writeToFile,
    readAllFiles,
    renameFile,
    deleteFile,
    uploadFile,
    returnFilesByName,
    compressFile
};