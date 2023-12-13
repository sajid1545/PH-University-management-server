import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { TOfferedCourse } from './OfferedCourse.interface';
import { OfferedCourse } from './OfferedCourse.model';
import { hasTimeConflict } from './OfferedCourse.utils';

const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
    const {
        semesterRegistration,
        academicFaculty,
        academicDepartment,
        course,
        faculty,
        section,
        days,
        startTime,
        endTime,
    } = payload;

    // check if semester registration exist
    const isSemesterRegistrationExist =
        await SemesterRegistration.findById(semesterRegistration);

    if (!isSemesterRegistrationExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Semester Registration not found',
        );
    }

    const academicSemester = isSemesterRegistrationExist.academicSemester;

    // check if ACADEMIC FACULTY exist
    const isAcademicFacultyExist =
        await AcademicFaculty.findById(academicFaculty);

    if (!isAcademicFacultyExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'AcademicFaculty not found');
    }

    // check if ACADEMIC Department exist
    const isAcademicDepartmentExist =
        await AcademicDepartment.findById(academicDepartment);

    if (!isAcademicDepartmentExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Academic Department not found',
        );
    }

    // check if course exist
    const isCourseExist = await Course.findById(course);

    if (!isCourseExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
    }

    // check if faculty exist
    const isFacultyExist = await Faculty.findById(faculty);

    if (!isFacultyExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
    }

    // check if department belongs to that faculty
    const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
        _id: academicDepartment,
        academicFaculty,
    });

    if (!isDepartmentBelongToFaculty) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            `These ${isAcademicDepartmentExist.name} doesn't belong to that ${isAcademicFacultyExist.name}`,
        );
    }

    // check if the same course same section in same registered semester exists
    const isSameOfferedCourseExistWithSameRegisteredSemester =
        await OfferedCourse.findOne({
            semesterRegistration,
            course,
            section,
        });

    if (isSameOfferedCourseExistWithSameRegisteredSemester) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Offered course already exists with same registered semester',
        );
    }

    // get the schedule of the faculties
    const assignedSchedules = await OfferedCourse.find({
        semesterRegistration,
        faculty,
        days: {
            $in: days,
        },
    }).select('days startTime endTime');
    console.log(assignedSchedules);
    const newSchedule = {
        days,
        startTime,
        endTime,
    };

    if (hasTimeConflict(assignedSchedules, newSchedule)) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Time conflict with another offered course',
        );
    }

    const result = await OfferedCourse.create({ ...payload, academicSemester });
    return result;
};

const updateOfferedCourseIntoDB = async (
    id: string,
    payload: Partial<TOfferedCourse>,
) => {
    // const { faculty, days, startTime, endTime } = payload;

    const isOfferedCourseExists = await OfferedCourse.findById(id);

    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
    }

    const semesterRegistrationStatus = await SemesterRegistration.findById(
        isOfferedCourseExists.semesterRegistration,
    ).select('status');

    if (semesterRegistrationStatus?.status !== 'UPCOMING') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `You cannot update this offered course because the registered semester is ${semesterRegistrationStatus?.status}`,
        );
    }

    const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

// const deleteOfferedCourseFromDB = async () => {
//     // registration semester ar status jodi UPCOMING hoi tokon shudu delete korte parbo
// };

export const OfferedCourseServices = {
    createOfferedCourseIntoDB,
    updateOfferedCourseIntoDB,
};
