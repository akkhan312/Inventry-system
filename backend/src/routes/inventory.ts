import express from 'express';
import { getStats, getRecentProducts, getAllProducts, createProduct, getDashboardData, deleteProduct, getAllSubmissions, getSubmissionById, deleteSubmission, importProducts } from '../controllers/inventoryController.js';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/dashboard', getDashboardData);
router.get('/stats', getStats);
router.get('/recent', getRecentProducts);
router.get('/', getAllProducts);
router.post('/', createProduct);
router.post('/import', upload.single('file'), importProducts as any);

router.get('/submissions', getAllSubmissions);
router.get('/submissions/:id', getSubmissionById);
router.delete('/submissions/:id', deleteSubmission);

router.delete('/:id', deleteProduct);

export default router;
