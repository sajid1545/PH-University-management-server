import express from 'express';
import { AdminControllers } from './admin.controller';

const router = express.Router();

router.patch('/:adminId', AdminControllers.updateAdmin);

router.get('/:adminId', AdminControllers.getSingleAdmin);

router.delete('/:adminId', AdminControllers.deleteAdmin);

router.get('/', AdminControllers.getAllAdmins);
export const AdminRoutes = router;
