import express from 'express';
import { getAllUsers, createUser, deleteUser, updateProfile, updateUser } from '../controllers/userController.js';
import { profileUpload } from '../lib/uploadConfig.js';
const router = express.Router();
// Wrap multer so upload errors return 400 with message instead of 500
const createUserWithUpload = (req, res, next) => {
    profileUpload.single('avatar')(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message || 'File upload error';
            return res.status(400).json({ message: msg });
        }
        next();
    });
};
router.get('/', getAllUsers);
router.post('/', createUserWithUpload, createUser);
router.patch('/profile/:id', profileUpload.single('avatar'), updateProfile);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
