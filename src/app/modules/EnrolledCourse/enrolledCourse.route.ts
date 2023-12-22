import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EnrolledCourseControllers } from './enrolledCourse.controller';
import { EnrolledCourseValidations } from './enrolledCourse.validation';

const router = express.Router();

router.post(
    '/enroll-into-course',
    auth('student'),
    validateRequest(
        EnrolledCourseValidations.createEnrolledCourseValidationSchema,
    ),
    EnrolledCourseControllers.createEnrolledCourse,
);

export const EnrolledCourseRoutes = router;
