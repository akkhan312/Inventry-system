import express from 'express';
import { getInventoryValuation, exportProductsToExcel, exportInventorySubmissionToExcel } from '../controllers/reportController.js';
const router = express.Router();
router.get('/valuation', getInventoryValuation);
router.get('/export/products', exportProductsToExcel);
router.get('/export/inventory/:id', exportInventorySubmissionToExcel);
export default router;
