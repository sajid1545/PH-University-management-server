import express from 'express';
import auth from '../../middlewares/auth';
import { FacultyControllers } from './faculty.controller';

const router = express.Router();

router.patch('/:facultyId', FacultyControllers.updateFaculty);
router.get('/:facultyId', FacultyControllers.getSingleFaculty);
router.delete('/:facultyId', FacultyControllers.deleteFaculty);
router.get('/', auth(), FacultyControllers.getAllFaculties);

export const FacultyRoutes = router;
