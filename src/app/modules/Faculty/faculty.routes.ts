import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { FacultyControllers } from './faculty.controller';

const router = express.Router();

router.get(
    '/:id',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
    FacultyControllers.getSingleFaculty,
);

router.patch(
    '/:id',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    FacultyControllers.updateFaculty,
);
router.delete(
    '/:id',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    FacultyControllers.deleteFaculty,
);
router.get(
    '/',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
    FacultyControllers.getAllFaculties,
);

export const FacultyRoutes = router;
