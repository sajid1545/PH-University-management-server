import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { StudentControllers } from './student.controller';
import { updateStudentValidationSchema } from './student.validation';

const router = express.Router();

router.get('/:studentID', StudentControllers.getSingleStudent);
router.patch(
    '/:studentID',
    validateRequest(updateStudentValidationSchema),
    StudentControllers.updateStudent,
);

router.delete('/:studentID', StudentControllers.deleteStudent);
router.get('/', StudentControllers.getAllStudents);

export const StudentsRoutes = router;
