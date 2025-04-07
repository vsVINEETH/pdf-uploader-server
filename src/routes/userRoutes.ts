import express from 'express';
import { tokenAuth } from '../middlewares/tokenAuth';
import { uploads } from '../middlewares/multer';

import { authController } from '../controllers/authController';
import { userController } from '../controllers/userController';
const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', userController.signup);
router.post('/upload', tokenAuth, uploads, userController.uploadPDF);
router.post('/extract', tokenAuth, userController.extract);
router.get('/all_files', tokenAuth, userController.getAllFiles);
router.get('/selected_file', tokenAuth, userController.getSelectedFile);
router.delete('/delete_file', tokenAuth, userController.deleteFile)
router.delete('/logout', tokenAuth, authController.logout);

export default router;