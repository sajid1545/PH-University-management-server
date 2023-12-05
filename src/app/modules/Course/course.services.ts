/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { CourseSearchableFields } from './course.constants';
import { TCourse, TCourseFaculty } from './course.interface';
import { Course, CourseFaculty } from './course.model';

const createCourseIntoDB = async (payload: TCourse) => {
    const result = await Course.create(payload);
    return result;
};

const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
    const courseQuery = new QueryBuilder(
        Course.find().populate('preRequisiteCourses.course'),
        query,
    )
        .search(CourseSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await courseQuery.modelQuery;
    return result;
};

const getSingleCourseFromDB = async (id: string) => {
    const result = await Course.findById(id).populate(
        'preRequisiteCourses.course',
    );
    return result;
};
const deleteCourseFromDB = async (id: string) => {
    const result = await Course.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
    );
    return result;
};

const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
    const { preRequisiteCourses, ...courseRemainingData } = payload;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // step 1 : Basic course info update
        const updateBasicCourseInfo = await Course.findByIdAndUpdate(
            id,
            courseRemainingData,
            {
                new: true,
                runValidators: true,
                session,
            },
        );

        if (!updateBasicCourseInfo) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Failed to update course',
            );
        }

        // step 2 : preRequisiteCourses update
        // check if there is any pre requisite courses to update
        if (preRequisiteCourses && preRequisiteCourses.length > 0) {
            // filter out the delete field

            // filter ==> console.log(deletePreRequisites); [ { course: '656f43096796915b9c89587f', isDeleted: true } ]
            const deletePreRequisites = preRequisiteCourses
                .filter((elem) => elem.course && elem.isDeleted)
                .map((el) => el.course);

            // map ==> console.log(deletePreRequisites);  ['656f43096796915b9c89587f'] j gula isDeleted true oigular course property dibe

            const deletedPreRequisiteCourses = await Course.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        preRequisiteCourses: {
                            course: { $in: deletePreRequisites },
                        },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (!deletedPreRequisiteCourses) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Failed to delete course',
                );
            }

            // filter out the new course fields
            const newPreRequisites = preRequisiteCourses.filter(
                (elem) => elem.course && !elem.isDeleted,
            );

            // console.log(newPreRequisites); [ { course: '656f43096796915b9c89587f', isDeleted: false } ]

            const newPreRequisitesCourses = await Course.findByIdAndUpdate(
                id,
                {
                    $addToSet: {
                        preRequisiteCourses: { $each: newPreRequisites },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (!newPreRequisitesCourses) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Failed to update course',
                );
            }
        }

        const result = await Course.findById(id).populate(
            'preRequisiteCourses.course',
        );

        await session.commitTransaction();
        await session.endSession();
        return result;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete course');
    }
};

const assignFacultiesWithCourseIntoDB = async (
    id: string,
    payload: Partial<TCourseFaculty>,
) => {
    const result = await CourseFaculty.findByIdAndUpdate(
        id,
        {
            course: id,
            $addToSet: {
                faculties: { $each: payload },
            },
        },
        {
            upsert: true,
            new: true,
        },
    );
    return result;
};

export const CourseServices = {
    createCourseIntoDB,
    getAllCoursesFromDB,
    getSingleCourseFromDB,
    deleteCourseFromDB,
    updateCourseIntoDB,
    assignFacultiesWithCourseIntoDB,
};
