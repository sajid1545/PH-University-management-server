import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicDepartmentControllers } from './academicDepartment.controller';
import { AcademicDepartmentValidations } from './academicDepartment.validation';

const router = express.Router();

router.post(
    '/create-academic-department',
    validateRequest(
        AcademicDepartmentValidations.createAcademicDepartmentValidationSchema,
    ),
    AcademicDepartmentControllers.createAcademicDepartment,
);

router.patch(
    '/:departmentId',
    validateRequest(
        AcademicDepartmentValidations.updateAcademicDepartmentValidationSchema,
    ),
    AcademicDepartmentControllers.updateAcademicDepartment,
);
router.get(
    '/:departmentId',
    AcademicDepartmentControllers.getSingleAcademicDepartment,
);

router.get('/', AcademicDepartmentControllers.getAllAcademicDepartments);

export const AcademicDepartmentRoutes = router;
