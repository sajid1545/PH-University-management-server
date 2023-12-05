/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { CourseSearchableFields } from './course.constants';
import { TCourse } from './course.interface';
import { Course } from './course.model';

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
// const getAllCoursesFromDB = async () => {
//     const result = await Course.find();
//     return result;
// };

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

    // step 1 : Basic course info update
    const updateBasicCourseInfo = await Course.findByIdAndUpdate(
        id,
        courseRemainingData,
        {
            new: true,
            runValidators: true,
        },
    );

    // step 2 : preRequisiteCourses update
    // check if there is any pre requisite courses to update
    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
        // filter out the delete field

        // filter ==> console.log(deletePreRequisites); [ { course: '656f43096796915b9c89587f', isDeleted: true } ]
        const deletePreRequisites = preRequisiteCourses
            .filter((elem) => elem.course && elem.isDeleted)
            .map((el) => el.course);

        // map ==> console.log(deletePreRequisites);  ['656f43096796915b9c89587f'] j gula isDeleted true oigular course property dibe

        const deletedPreRequisiteCourses = await Course.findByIdAndUpdate(id, {
            $pull: {
                preRequisiteCourses: {
                    course: { $in: deletePreRequisites },
                },
            },
        });

        // filter out the new course fields
        const newPreRequisites = preRequisiteCourses.filter(
            (elem) => elem.course && !elem.isDeleted,
        );

        // console.log(newPreRequisites); [ { course: '656f43096796915b9c89587f', isDeleted: false } ]

        const newPreRequisitesCourses = await Course.findByIdAndUpdate(id, {
            $addToSet: {
                preRequisiteCourses: { $each: newPreRequisites },
            },
        });
    }

    const result = await Course.findById(id).populate(
        'preRequisiteCourses.course',
    );
    return result;
};

export const CourseServices = {
    createCourseIntoDB,
    getAllCoursesFromDB,
    getSingleCourseFromDB,
    deleteCourseFromDB,
    updateCourseIntoDB,
};
