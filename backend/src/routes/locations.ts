import express from 'express';
import * as locationController from '../controllers/locationController.js';

const router = express.Router();

// Get all locations
router.get('/', locationController.getAllLocations);

// Create new location
router.post('/', locationController.createLocation);

// Update location
router.put('/:id', locationController.updateLocation);

// Delete location
router.delete('/:id', locationController.deleteLocation);

export default router;
