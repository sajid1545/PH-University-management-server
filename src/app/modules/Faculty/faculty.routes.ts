import express from 'express';
import { FacultyControllers } from './faculty.controller';

const router = express.Router();

router.patch('/:facultyId', FacultyControllers.updateFaculty);
router.get('/:facultyId', FacultyControllers.getSingleFaculty);
router.delete('/:facultyId', FacultyControllers.deleteFaculty);
router.get('/', FacultyControllers.getAllFaculties);

export const FacultyRoutes = router;
