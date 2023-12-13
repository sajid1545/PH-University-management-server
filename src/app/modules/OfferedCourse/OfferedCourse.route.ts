import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseController } from './OfferedCourse.controller';
import { OfferedCourseValidations } from './OfferedCourse.validation';

const router = express.Router();

router.post(
    '/create-offered-course',
    validateRequest(
        OfferedCourseValidations.createOfferedCourseSchemaValidation,
    ),
    OfferedCourseController.createOfferedCourse,
);

// router.get('/:id');

// router.patch('/:id');

// router.get('/');

export const offeredCourseRoutes = router;
