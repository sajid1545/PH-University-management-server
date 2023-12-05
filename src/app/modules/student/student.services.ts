import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { studentsSearchableFields } from './student.constants';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
    // email : { $regex : query.searchTerm, $options : i }
    // presentAddress : { $regex : query.searchTerm, $options : i }
    // "name.firstName" : { $regex : query.searchTerm, $options : i }
    // const queryObj = { ...query };

    // let searchTerm = '';
    // if (query?.searchTerm) {
    //     searchTerm = query.searchTerm as string;
    // }
    // const searchQuery = Student.find({
    //     $or: studentsSearchableFields.map((field) => ({
    //         [field]: {
    //             $regex: searchTerm,
    //             $options: 'i',
    //         },
    //     })),
    // }); // partial search
    // // Filtering
    // const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    // excludeFields.forEach((field) => delete queryObj[field]);
    // console.log({ query, queryObj });
    // const filterQuery = searchQuery
    //     .find(queryObj)
    //
    // // Sorting
    // let sort = '-createAt';
    // if (query?.sort) {
    //     sort = query.sort as string;
    // }
    // const sortQuery = filterQuery.sort(sort);
    // let page = 1;
    // let limit = 1;
    // let skip = 0;
    // if (query?.limit) {
    //     limit = Number(query.limit);
    // }
    // if (query?.page) {
    //     page = Number(query.page);
    //     skip = (page - 1) * limit;
    // }
    // const paginateQuery = sortQuery.skip(skip);
    // const limitQuery = paginateQuery.limit(limit);
    // field limiting
    // let fields = '-__v';
    // // fields: 'name,email' ==> 'name email'
    // if (query?.fields) {
    //     fields = (query.fields as string).split(',').join(' ');
    // }
    // const fieldsQuery = await limitQuery.select(fields);
    // return fieldsQuery;

    // Student.find() ar upore shob kaaj hocchilo tai aita pataite hobe
    const studentQuery = new QueryBuilder(
        Student.find()
            .populate('admissionSemester')
            .populate({
                path: 'academicDepartment',
                populate: {
                    path: 'academicFaculty',
                },
            }),
        query,
    )
        .search(studentsSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await studentQuery.modelQuery;
    return result;
};

const getSingleStudentFromDB = async (id: string) => {
    const result = await Student.findById(id)
        .populate('admissionSemester')
        .populate({
            path: 'academicDepartment',
            populate: {
                path: 'academicFaculty',
            },
        });
    return result;
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
    // payload theke non primitive data gula alada kore felbo

    const { name, guardian, localGuardian, ...remainingStudentData } = payload;

    const modifiedUpdatedData: Record<string, unknown> = {
        ...remainingStudentData,
    };

    if (name && Object.keys(name).length) {
        for (const [key, value] of Object.entries(name)) {
            modifiedUpdatedData[`name.${key}`] = value;
        }
    }
    if (guardian && Object.keys(guardian).length) {
        for (const [key, value] of Object.entries(guardian)) {
            modifiedUpdatedData[`guardian.${key}`] = value;
        }
    }
    if (localGuardian && Object.keys(localGuardian).length) {
        for (const [key, value] of Object.entries(localGuardian)) {
            modifiedUpdatedData[`localGuardian.${key}`] = value;
        }
    }

    console.log(modifiedUpdatedData);

    const result = await Student.findByIdAndUpdate(id, modifiedUpdatedData, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteStudentFromDB = async (id: string) => {
    // transaction use korte hobe hjehetu Student r User 2tai collection a delete kore dite hobe ()

    if (await Student.isUserExists(id)) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const deletedStudent = await Student.findByIdAndUpdate(
                // findOneAndUpdate use kortesi bcoz amara mongoose ar generated id use kortesi na
                id,
                { isDeleted: true },
                { new: true, session },
            );

            if (!deletedStudent) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Failed to delete student',
                );
            }

            const userId = deletedStudent.user;

            const deletedUser = await User.findByIdAndUpdate(
                userId,
                { isDeleted: true },
                { new: true, session },
            );

            if (!deletedUser) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Failed to delete user',
                );
            }

            await session.commitTransaction();
            await session.endSession();
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();

            throw new Error('Failed to delete student');
        }
    } else {
        throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
    }
};

export const StudentServices = {
    getAllStudentsFromDB,
    getSingleStudentFromDB,
    deleteStudentFromDB,
    updateStudentIntoDB,
};
