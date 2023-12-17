import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { FacultyControllers } from './faculty.controller';

const router = express.Router();

router.patch('/:facultyId', FacultyControllers.updateFaculty);
router.get('/:facultyId', FacultyControllers.getSingleFaculty);
router.delete('/:facultyId', FacultyControllers.deleteFaculty);
router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.faculty),
    FacultyControllers.getAllFaculties,
);

export const FacultyRoutes = router;
