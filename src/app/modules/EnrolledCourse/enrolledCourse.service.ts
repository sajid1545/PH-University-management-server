/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Student } from '../student/student.model';
import { TEnrolledCourse } from './enrolledCourse.interface';
import { EnrolledCourse } from './enrolledCourse.model';

const createEnrolledCourseIntoDB = async (
    userId: string,
    payload: TEnrolledCourse,
) => {
    // Step 1 -  check if offered course exist
    // Step 2 -  check if student already enrolled
    // Step 3 -  check capacity of offered course
    // Step 4 -  check if total enrolled course credits exceeded registration semester  max credits
    //
    const { offeredCourse } = payload;

    const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
    }

    // check kortesi capacity ase kina
    if (isOfferedCourseExists.maxCapacity <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Max capacity of this course is reached',
        );
    }

    const student = await Student.findOne({ id: userId }, { _id: 1 });

    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
    }

    const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
        semesterRegistration: isOfferedCourseExists.semesterRegistration,
        offeredCourse,
        student: student?._id,
    });

    if (isStudentAlreadyEnrolled) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Student already enrolled');
    }

    // check if total credits exceeded max credit
    const course = await Course.findById(isOfferedCourseExists.course);

    const currentCredit = course?.credits;

    const semesterRegistration = await SemesterRegistration.findById(
        isOfferedCourseExists.semesterRegistration,
    ).select('maxCredit');
    const maxCredit = semesterRegistration?.maxCredit;

    // get current students enrolled courses credits
    const enrolledCourses = await EnrolledCourse.aggregate([
        // stage - 1
        {
            $match: {
                semesterRegistration:
                    isOfferedCourseExists.semesterRegistration,
                student: student?._id,
            },
        },
        // stage - 2
        {
            $lookup: {
                from: 'courses',
                localField: 'course',
                foreignField: '_id',
                as: 'enrolledCourseData',
            },
        },
        // stage - 3
        {
            $unwind: '$enrolledCourseData',
        },
        // stage - 4
        {
            $group: {
                _id: null, // null mani shob gula k merge kore felbo
                totalEnrolledCredits: {
                    $sum: '$enrolledCourseData.credits',
                },
            },
        },

        // stage - 5
        {
            $project: {
                _id: 0,
                totalEnrolledCredits: 1,
            },
        },
    ]);

    // total enrolled credits + new enrolled course credits > max credit

    // console.log(enrolledCourses); // [ { totalEnrolledCredits: 6 } ]

    const totalCredits =
        enrolledCourses.length > 0
            ? enrolledCourses[0].totalEnrolledCredits
            : 0;

    if (totalCredits && maxCredit && totalCredits + currentCredit > maxCredit) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Total credits exceeded max credit',
        );
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const result = await EnrolledCourse.create(
            [
                {
                    semesterRegistration:
                        isOfferedCourseExists.semesterRegistration,
                    academicSemester: isOfferedCourseExists.academicSemester,
                    academicDepartment:
                        isOfferedCourseExists.academicDepartment,
                    academicFaculty: isOfferedCourseExists.academicFaculty,
                    offeredCourse: offeredCourse,
                    course: isOfferedCourseExists.course,
                    student: student._id,
                    faculty: isOfferedCourseExists.faculty,
                    isEnrolled: true,
                },
            ],
            { session },
        );
        if (!result) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Enrolled course failed',
            );
        }

        const maxCapacity = isOfferedCourseExists.maxCapacity;
        await OfferedCourse.findByIdAndUpdate(offeredCourse, {
            maxCapacity: maxCapacity - 1,
        });

        await session.commitTransaction();
        await session.endSession();
        return result;
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error(error);
    }
};

const updateEnrolledCourseMarksIntoDB = async (
    facultyId: string,
    payload: Partial<TEnrolledCourse>,
) => {
    const { semesterRegistration, offeredCourse, student, courseMarks } =
        payload;

    // check if semester exists
    const isSemesterRegistrationExists =
        await SemesterRegistration.findById(semesterRegistration);
    if (!isSemesterRegistrationExists) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Semester Registration not found',
        );
    }

    // check if offered course exists
    const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
    }

    // check if offered course exists
    const isStudentExists = await Student.findById(student);
    if (!isStudentExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
    }

    // check if the enrolled course belongs to the faculty
    const faculty = await Faculty.findOne({ id: facultyId }, { _id: 1 });

    if (!faculty) {
        throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
    }

    const isCourseBelongsToFaculty = await EnrolledCourse.findOne({
        semesterRegistration,
        student,
        offeredCourse,
        faculty: faculty?._id,
    });
    if (!isCourseBelongsToFaculty) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden');
    }

    const modifiedData: Record<string, unknown> = {
        ...courseMarks,
    };

    if (courseMarks && Object.keys(courseMarks).length > 0) {
        for (const [key, value] of Object.entries(courseMarks)) {
            modifiedData[`courseMarks.${key}`] = value;
        }
    }

    const result = await EnrolledCourse.findByIdAndUpdate(
        isCourseBelongsToFaculty.id,
        modifiedData,
        {
            new: true,
            runValidators: true,
        },
    );
    return result;
};

export const EnrolledCourseServices = {
    createEnrolledCourseIntoDB,
    updateEnrolledCourseMarksIntoDB,
};
