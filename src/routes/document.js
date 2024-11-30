const router = require('express').Router();
const multer = require('multer');

//Controllers
const documentController = require('../controllers/pdfController');
const userQueryController = require('../controllers/queryController');



// Multer
const storage = multer.memoryStorage();
const uploadDoc = multer({ storage: storage });

// Paths
router.route('/upload').post(uploadDoc.single('file'), documentController.uploadPDF);
router.route('/query').post(userQueryController.query);

module.exports = router;