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
router.patch(
    '/:id',
    validateRequest(
        OfferedCourseValidations.updateOfferedCourseSchemaValidation,
    ),
    OfferedCourseController.updateOfferedCourse,
);

router.delete('/:id', OfferedCourseController.deleteOfferedCourse);

router.get('/:id', OfferedCourseController.getSingleOfferedCourse);

router.get('/', OfferedCourseController.getAllOfferedCourses);

export const offeredCourseRoutes = router;
