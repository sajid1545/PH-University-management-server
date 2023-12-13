import { Router } from 'express';
import { AdminRoutes } from '../modules/Admin/admin.routes';
import { CourseRoutes } from '../modules/Course/course.routes';
import { FacultyRoutes } from '../modules/Faculty/faculty.routes';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.routes';
import { AcademicFacultiesRoutes } from '../modules/academicFaculty/academicFaculty.routes';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { semesterRegistrationRoutes } from '../modules/semesterRegistration/semesterRegistration.route';
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

    {
        path: '/semester-registrations',
        route: semesterRegistrationRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
