import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { studentsSearchableFields } from './student.constants';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
    const studentQuery = new QueryBuilder(
        Student.find()

            .populate('user')
            .populate('admissionSemester')
            .populate('academicDepartment academicFaculty'),
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
        .populate('academicDepartment academicFaculty');
    return result;
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
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
    if (await Student.isUserExists(id)) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const deletedStudent = await Student.findByIdAndUpdate(
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
