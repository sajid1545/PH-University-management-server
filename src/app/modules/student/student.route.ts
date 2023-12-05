import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { StudentControllers } from './student.controller';
import { updateStudentValidationSchema } from './student.validation';

const router = express.Router();

router.get('/:id', StudentControllers.getSingleStudent);
router.patch(
    '/:id',
    validateRequest(updateStudentValidationSchema),
    StudentControllers.updateStudent,
);

router.delete('/:id', StudentControllers.deleteStudent);
router.get('/', StudentControllers.getAllStudents);

export const StudentsRoutes = router;
