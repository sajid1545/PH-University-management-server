/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { createStudentValidationSchema } from './../student/student.validation';
import { UserControllers } from './user.controller';

const router = express.Router();

// higher order function

router.post(
    '/create-student',
    validateRequest(createStudentValidationSchema),
    UserControllers.createStudent,
);

export const UserRoutes = router;
