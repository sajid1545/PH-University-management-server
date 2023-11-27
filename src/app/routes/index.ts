import { Router } from 'express';
import { AcademicSemesterRoutes } from '../modules/AcademicSemester/academicSemester.route';
import { StudentsRoutes } from '../modules/student/student.route';
import { UserRoutes } from '../modules/user/user.route';

const router = Router();

const moduleRoutes = [
    {
        path: '/users',
        route: UserRoutes,
    },
    {
        path: '/students',
        route: StudentsRoutes,
    },

    {
        path: '/academic-semesters',
        route: AcademicSemesterRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
