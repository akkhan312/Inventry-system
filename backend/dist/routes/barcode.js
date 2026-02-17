import express from 'express';
import * as barcodeController from '../controllers/barcodeController.js';
const router = express.Router();
router.get('/', barcodeController.listMappings);
router.get('/export', barcodeController.exportMappingsToExcel);
router.post('/', barcodeController.createMapping);
router.patch('/:id/approve', barcodeController.approveMapping);
router.delete('/:id', barcodeController.deleteMapping);
export default router;
