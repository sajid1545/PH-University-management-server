import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Student } from '../student/student.model';
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

const getAllOfferedCoursesFromDB = async (query: Record<string, unknown>) => {
    const offeredCourseQuery = new QueryBuilder(OfferedCourse.find(), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await offeredCourseQuery.modelQuery;
    const meta = await offeredCourseQuery.countTotal();
    return {
        meta,
        result,
    };
};

const getMyOfferedCoursesFromDB = async (userId: string) => {
    //! check if user exists
    const student = await Student.findOne({ id: userId });
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
    }

    //! find current ongoing semester
    const currentOngoingRegistrationSemester =
        await SemesterRegistration.findOne({
            status: 'ONGOING',
        });

    if (!currentOngoingRegistrationSemester) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'There is no ongoing semester registration!',
        );
    }

    const result = await OfferedCourse.aggregate([
        {
            $match: {
                semesterRegistration: currentOngoingRegistrationSemester._id,
                academicFaculty: student.academicFaculty,
                academicDepartment: student.academicDepartment,
            },
        },

        {
            $lookup: {
                from: 'courses',
                localField: 'course',
                foreignField: '_id',
                as: 'course',
            },
        },

        {
            $unwind: '$course',
        },

        {
            $lookup: {
                from: 'enrolledcourses',
                let: {
                    currentOngoingRegistrationSemester:
                        currentOngoingRegistrationSemester._id,
                    currentStudent: student._id,
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            //* current registration semester and enrolled registration semester should be same
                                            '$semesterRegistration',
                                            '$$currentOngoingRegistrationSemester',
                                        ],
                                    },
                                    {
                                        //* current student and enrolled student should be same
                                        $eq: ['$student', '$$currentStudent'],
                                    },
                                    {
                                        $eq: ['$isEnrolled', true],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: 'enrolledCourses',
            },
        },

        {
            $lookup: {
                from: 'enrolledcourses',
                let: {
                    currentStudent: student._id,
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$student', '$$currentStudent'],
                                    },

                                    {
                                        $eq: ['$isCompleted', true],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: 'completedCourses',
            },
        },

        {
            //* completed course ar ids gula lagbe
            $addFields: {
                completedCourseIds: {
                    $map: {
                        input: '$completedCourses',
                        as: 'completed',
                        in: '$$completed.course',
                    },
                },
            },
        },

        {
            $addFields: {
                //* course prerequisites r completed course ids ar sathe compare
                isPreRequisitesFulFilled: {
                    $or: [
                        { $eq: ['$course.preRequisiteCourses', []] },
                        {
                            $setIsSubset: [
                                '$course.preRequisiteCourses.course',
                                '$completedCourseIds',
                            ],
                        },
                    ],
                },

                isAlreadyEnrolled: {
                    $in: [
                        '$course._id',
                        {
                            $map: {
                                input: '$enrolledCourses',
                                as: 'enroll',
                                in: '$$enroll.course',
                            },
                        },
                    ],
                },
            },
        },
        {
            $match: {
                isAlreadyEnrolled: false,
                isPreRequisitesFulFilled: true,
            },
        },
    ]);

    return {
        result,
    };
};

const getSingleOfferedCourseFromDB = async (id: string) => {
    const isOfferedCourseExists = await OfferedCourse.findById(id);
    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
    }
    const result = await OfferedCourse.findById(id);
    return result;
};

const updateOfferedCourseIntoDB = async (
    id: string,
    payload: Pick<TOfferedCourse, 'faculty' | 'days' | 'startTime' | 'endTime'>,
) => {
    const { faculty, days, startTime, endTime } = payload;

    // check if offered course exist
    const isOfferedCourseExists = await OfferedCourse.findById(id);

    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
    }

    // check if faculty  exist
    const isFacultyExists = await Faculty.findById(faculty);

    if (!isFacultyExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
    }

    const semesterRegistration = isOfferedCourseExists.semesterRegistration;

    // get the schedule of the faculties
    const assignedSchedules = await OfferedCourse.find({
        semesterRegistration,
        faculty,
        days: {
            $in: days,
        },
    }).select('days startTime endTime');

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

    // check if registered semester is upcoming

    const semesterRegistrationStatus =
        await SemesterRegistration.findById(semesterRegistration).select(
            'status',
        );

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

const deleteOfferedCourseFromDB = async (id: string) => {
    // registration semester ar status jodi UPCOMING hoi tokon shudu delete korte parbo

    // check if offered course exist
    const isOfferedCourseExists = await OfferedCourse.findById(id);
    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
    }

    const semesterRegistration = await SemesterRegistration.findById(
        isOfferedCourseExists.semesterRegistration,
    ).select('status');

    if (semesterRegistration?.status !== 'UPCOMING') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `You cannot delete this offered course because the registered semester is ${semesterRegistration?.status}`,
        );
    }

    const result = await OfferedCourse.findByIdAndDelete(id);
    return result;
};

export const OfferedCourseServices = {
    createOfferedCourseIntoDB,
    updateOfferedCourseIntoDB,
    deleteOfferedCourseFromDB,
    getAllOfferedCoursesFromDB,
    getSingleOfferedCourseFromDB,
    getMyOfferedCoursesFromDB,
};
