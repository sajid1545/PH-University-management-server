import express from 'express';
import { FacultyControllers } from './faculty.controller';

const router = express.Router();

router.get('/:facultyId', FacultyControllers.getSingleFaculty);
router.get('/', FacultyControllers.getAllFaculties);

export const FacultyRoutes = router;
