const router = require('express').Router();
// Paths
const documentRoutes = require('./document');
router.use('/document', documentRoutes);
module.exports = router;