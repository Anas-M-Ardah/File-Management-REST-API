const express = require('express');
const { 
  index, 
  createForm, 
  createFile, 
  viewFile, 
  editForm, 
  editFile, 
  deleteFileController, 
  uploadFiles, 
  downloadFile, 
  searchFiles, 
  compressFileController 
} = require('../controllers/fileController');

const router = express.Router();

router.get('/', index);
router.get('/create', createForm);
router.post('/create', createFile);
router.get('/view', viewFile);
router.get('/edit', editForm);
router.post('/edit', editFile);
router.delete('/delete', deleteFileController);
router.post('/upload', uploadFiles);
router.get('/download', downloadFile);
router.post('/search', searchFiles);
router.post('/compress', compressFileController);

module.exports = router;
