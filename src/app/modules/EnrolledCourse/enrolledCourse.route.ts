import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { EnrolledCourseControllers } from './enrolledCourse.controller';
import { EnrolledCourseValidations } from './enrolledCourse.validation';

const router = express.Router();

router.post(
    '/enroll-into-course',
    auth(USER_ROLE.student),
    validateRequest(
        EnrolledCourseValidations.createEnrolledCourseValidationSchema,
    ),
    EnrolledCourseControllers.createEnrolledCourse,
);

router.get(
    '/my-enrolled-courses',
    auth(USER_ROLE.student),
    EnrolledCourseControllers.getMyEnrolledCourses,
);

router.patch(
    '/update-enrolled-course-marks',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
    validateRequest(
        EnrolledCourseValidations.updateEnrolledCourseMarksValidationSchema,
    ),
    EnrolledCourseControllers.updateEnrolledCourseMarks,
);

router.get(
    '/faculty-courses',
    auth(USER_ROLE.faculty),
    EnrolledCourseControllers.getFacultyEnrolledCourses,
);

export const EnrolledCourseRoutes = router;
