/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { AdminValidations } from '../Admin/admin.validation';
import { createFacultyValidationSchema } from '../Faculty/faculty.validation';
import { createStudentValidationSchema } from '../student/student.validation';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

// higher order function

router.post(
    '/create-student',
    auth(USER_ROLE.admin),
    upload.single('file'), // file ta k parse korbe
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },
    validateRequest(createStudentValidationSchema),
    UserControllers.createStudent,
);

router.post(
    '/create-faculty',
    auth(USER_ROLE.admin),

    validateRequest(createFacultyValidationSchema),
    UserControllers.createFaculty,
);

router.post(
    '/create-admin',
    // auth(USER_ROLE.admin),
    validateRequest(AdminValidations.createAdminValidationSchema),
    UserControllers.createAdmin,
);

router.post(
    '/change-status/:id',
    auth(USER_ROLE.admin),
    validateRequest(UserValidation.changeStatusValidationSchema),
    UserControllers.changeStatus,
);

router.get('/me', auth('admin', 'faculty', 'student'), UserControllers.getMe);

export const UserRoutes = router;
