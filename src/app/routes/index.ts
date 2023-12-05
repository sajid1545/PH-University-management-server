import { Router } from 'express';
import { AdminRoutes } from '../modules/Admin/admin.routes';
import { FacultyRoutes } from '../modules/Faculty/faculty.routes';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.routes';
import { AcademicFacultiesRoutes } from '../modules/academicFaculty/academicFaculty.routes';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { StudentsRoutes } from '../modules/student/student.route';
import { UserRoutes } from '../modules/user/user.route';
import { CourseRoutes } from '../modules/Course/course.routes';

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
    {
        path: '/academic-faculties',
        route: AcademicFacultiesRoutes,
    },
    {
        path: '/academic-departments',
        route: AcademicDepartmentRoutes,
    },
    {
        path: '/faculties',
        route: FacultyRoutes,
    },
    {
        path: '/admins',
        route: AdminRoutes,
    },

    {
        path: '/courses',
        route: CourseRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
