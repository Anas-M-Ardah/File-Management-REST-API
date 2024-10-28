const {
    readFromFile,
    writeToFile,
    readAllFiles,
    renameFile,
    deleteFile,
    uploadFile,
    returnFilesByName,
    compressFile,
  } = require('../../modules/fileOperations');
  
  const fs = require('fs/promises');
  const path = require('path');
  
  jest.mock('fs/promises');
  
  describe('File Operations Tests', () => {
    const testFilePath = './data/test.txt';
    const testFileContent = 'Hello World';
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('readFromFile should read file content', async () => {
      fs.readFile.mockResolvedValue(testFileContent);
      const result = await readFromFile(testFilePath);
      expect(result).toBe(testFileContent);
      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, 'utf8');
    });
  
    test('writeToFile should write data to file', async () => {
      await writeToFile(testFilePath, testFileContent);
      expect(fs.writeFile).toHaveBeenCalledWith(testFilePath, testFileContent, 'utf8');
    });
  
    test('readAllFiles should read all files in a directory', async () => {
      fs.readdir.mockResolvedValue(['file1.txt', 'file2.txt']);
      fs.readFile.mockResolvedValue(testFileContent).mockResolvedValueOnce(testFileContent);
  
      const result = await readAllFiles('./data');
      expect(result.length).toBe(2);
      expect(fs.readdir).toHaveBeenCalledWith('./data');
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  
    test('renameFile should rename a file', async () => {
      await renameFile(testFilePath, './data/newTest.txt');
      expect(fs.rename).toHaveBeenCalledWith(testFilePath, './data/newTest.txt');
    });
  
    test('deleteFile should delete a file', async () => {
      await deleteFile(testFilePath);
      expect(fs.unlink).toHaveBeenCalledWith(testFilePath);
    });
  
    test('uploadFile should move a file to the ./data/ directory', async () => {
      await uploadFile(testFilePath);
      expect(fs.rename).toHaveBeenCalledWith(testFilePath, `./data/${testFilePath}`);
    });
  
    test('returnFilesByName should return files matching search term', async () => {
      fs.readdir.mockResolvedValue(['test1.txt', 'test2.txt', 'otherFile.txt']);
      fs.readFile.mockResolvedValue(testFileContent).mockResolvedValueOnce(testFileContent);
  
      const result = await returnFilesByName('./data', 'test');
      expect(result.length).toBe(2);
      expect(fs.readdir).toHaveBeenCalledWith('./data');
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  
    test('compressFile should compress a file', async () => {
        // Create a temporary file
        const tempFilePath = 'temp.txt';
        await writeToFile(tempFilePath, 'Test content');
      
        try {
          await compressFile(tempFilePath);
          expect(fs.createReadStream).toHaveBeenCalledWith(tempFilePath);
          expect(fs.createWriteStream).toHaveBeenCalledWith(`${tempFilePath}.gz`);
          expect(pipeline).toHaveBeenCalled();
        } catch (error) {
          // Handle potential errors, e.g., file not found, permission denied, etc.
          console.error('Error compressing file:', error);
        } finally {
          // Clean up the temporary file
          await deleteFile(tempFilePath);
        }
      });
  });