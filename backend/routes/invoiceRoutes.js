const express = require('express');
const router = express.Router();
const { getInvoice, listInvoices, downloadInvoiceFile } = require('../controllers/invoiceController');

router.get('/', listInvoices);
router.get('/files/:fileName', downloadInvoiceFile);
router.get('/:id', getInvoice);

module.exports = router;
