import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
    // email : { $regex : query.searchTerm, $options : i }
    // presentAddress : { $regex : query.searchTerm, $options : i }
    // "name.firstName" : { $regex : query.searchTerm, $options : i }

    const queryObj = { ...query };

    const studentsSearchableFields = [
        'email',
        'name.firstName',
        'name.middleName',
        'presentAddress',
    ];
    let searchTerm = '';

    if (query?.searchTerm) {
        searchTerm = query.searchTerm as string;
    }

    const searchQuery = Student.find({
        $or: studentsSearchableFields.map((field) => ({
            [field]: {
                $regex: searchTerm,
                $options: 'i',
            },
        })),
    }); // partial search

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((field) => delete queryObj[field]);
    console.log({ query, queryObj });

    const filterQuery = searchQuery
        .find(queryObj)
        .populate('admissionSemester')
        .populate({
            path: 'academicDepartment',
            populate: {
                path: 'academicFaculty',
            },
        });

    // Sorting
    let sort = '-createAt';
    if (query?.sort) {
        sort = query.sort as string;
    }

    const sortQuery = filterQuery.sort(sort);

    let page = 1;
    let limit = 1;
    let skip = 0;

    if (query?.limit) {
        limit = Number(query.limit);
    }
    if (query?.page) {
        page = Number(query.page);
        skip = (page - 1) * limit;
    }

    const paginateQuery = sortQuery.skip(skip);

    const limitQuery = paginateQuery.limit(limit);

    // field limiting

    let fields = '-__v';

    // fields: 'name,email' ==> 'name email'

    if (query?.fields) {
        fields = (query.fields as string).split(',').join(' ');
    }

    const fieldsQuery = await limitQuery.select(fields);

    return fieldsQuery;
};

const getSingleStudentFromDB = async (id: string) => {
    const result = await Student.findOne({ id })
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

    const result = await Student.findOneAndUpdate({ id }, modifiedUpdatedData, {
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
            const deletedStudent = await Student.findOneAndUpdate(
                // findOneAndUpdate use kortesi bcoz amara mongoose ar generated id use kortesi na
                { id },
                { isDeleted: true },
                { new: true, session },
            );

            if (!deletedStudent) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'Failed to delete student',
                );
            }

            const deletedUser = await User.findOneAndUpdate(
                { id },
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
