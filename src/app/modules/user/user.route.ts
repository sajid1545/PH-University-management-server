/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidations } from '../Admin/admin.validation';
import { createFacultyValidationSchema } from '../Faculty/faculty.validation';
import { createStudentValidationSchema } from './../student/student.validation';
import { UserControllers } from './user.controller';

const router = express.Router();

// higher order function

router.post(
    '/create-student',
    validateRequest(createStudentValidationSchema),
    UserControllers.createStudent,
);

router.post(
    '/create-faculty',
    validateRequest(createFacultyValidationSchema),
    UserControllers.createFaculty,
);

router.post(
    '/create-admin',
    validateRequest(AdminValidations.createAdminValidationSchema),
    UserControllers.createAdmin,
);

export const UserRoutes = router;
