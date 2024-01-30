/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { AcademicSemester } from '../AcademicSemester/academicSemester.model';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';
import { TFaculty } from '../Faculty/faculty.interface';
import { Faculty } from '../Faculty/faculty.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import {
    generateAdminId,
    generateFacultyId,
    generateStudentId,
} from './user.utils';

const createStudentIntoDB = async (
    password: string,
    payload: TStudent,
    file: any,
) => {
    // create a user object
    const userData: Partial<TUser> = {};

    // if password is not provided, use default password
    userData.password = password || (config.default_password as string);

    // set student role
    userData.role = 'student';
    userData.email = payload.email;

    // find academic semester info
    const admissionSemester = await AcademicSemester.findById(
        payload.admissionSemester,
    );

    // FIND DEPARTMENT
    const academicDepartment = await AcademicDepartment.findById(
        payload.academicDepartment,
    );

    if (!academicDepartment) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Department');
    }

    payload.academicFaculty = academicDepartment.academicFaculty;

    const session = await mongoose.startSession();

    //!     -----------     transaction --------------

    try {
        session.startTransaction();
        //set  generated id
        userData.id = await generateStudentId(admissionSemester);

        //^ create a user (transaction - 1)

        //& send image to cloudinary
        if (file) {
            const imageName = `${userData?.id}${payload?.name?.firstName}`;
            const path = file.path;
            const { secure_url } = await sendImageToCloudinary(imageName, path);
            payload.profileImage = secure_url as string;
        }

        //~ transaction a create korar somoy array ar bitore data dibo [userData]
        const newUser = await User.create([userData], { session }); // new user akon array age chilo object

        // create a user
        if (!newUser.length) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create User');
        }
        // set id, _id as user
        payload.id = newUser[0].id;
        payload.user = newUser[0]._id; // reference id

        //^ create a Student (transaction - 2)

        const newStudent = await Student.create([payload], { session });
        if (!newStudent.length) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Failed to create Student',
            );
        }

        await session.commitTransaction();
        await session.endSession();

        return newStudent;
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error(error);
    }
};

const createFacultyIntoDB = async (
    password: string,
    payload: TFaculty,
    file: any,
) => {
    const userData: Partial<TUser> = {};

    userData.password = password || (config.default_password as string);

    userData.role = 'faculty';
    userData.email = payload.email;

    // FIND DEPARTMENT
    const academicDepartment = await AcademicDepartment.findById(
        payload.academicDepartment,
    );

    if (!academicDepartment) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Department');
    }

    payload.academicFaculty = academicDepartment?.academicFaculty;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        //set  generated id
        userData.id = await generateFacultyId();

        //& send image to cloudinary
        if (file) {
            const imageName = `${userData?.id}${payload?.name?.firstName}`;
            const path = file.path;
            const { secure_url } = await sendImageToCloudinary(imageName, path);
            payload.profileImage = secure_url as string;
        }

        //^ create a user (transaction - 1)

        const newUser = await User.create([userData], { session });

        if (!newUser.length) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create User');
        }
        // set id, _id as user
        payload.id = newUser[0].id;
        payload.user = newUser[0]._id; // reference id

        //^ create a faculty (transaction - 2)

        const newFaculty = await Faculty.create([payload], { session });

        if (!newFaculty.length) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Failed to create Faculty',
            );
        }

        await session.commitTransaction();
        await session.endSession();
        return newFaculty;
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error(error);
    }
};

const createAdminIntoDB = async (
    password: string,
    payload: TAdmin,
    file: any,
) => {
    const userData: Partial<TUser> = {};

    userData.password = password || (config.default_password as string);

    userData.role = 'admin';
    userData.email = payload.email;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        userData.id = await generateAdminId();

        //& send image to cloudinary
        if (file) {
            const imageName = `${userData?.id}${payload?.name?.firstName}`;
            const path = file.path;
            const { secure_url } = await sendImageToCloudinary(imageName, path);
            payload.profileImage = secure_url as string;
        }

        //^ transaction 1 create new user
        const newUser = await User.create([userData], { session });
        if (!newUser.length) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create User');
        }

        // setting id
        payload.id = newUser[0].id;
        payload.user = newUser[0]._id;

        //^ transaction 2 create new Admin

        const newAdmin = await Admin.create([payload], { session });

        if (!newAdmin.length) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Failed to create Admin',
            );
        }

        await session.commitTransaction();
        await session.endSession();
        return newAdmin;
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error(error);
    }
};

const getMe = async (userId: string, role: string) => {
    let result = null;
    if (role === 'student') {
        result = await Student.findOne({ id: userId })
            .populate('user')
            .populate('admissionSemester')
            .populate({
                path: 'academicDepartment',
                populate: {
                    path: 'academicFaculty',
                },
            });
    }
    if (role === 'admin') {
        result = await Admin.findOne({ id: userId }).populate('user');
    }

    if (role === 'faculty') {
        result = await Faculty.findOne({ id: userId }).populate('user');
    }

    return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
    const result = await User.findByIdAndUpdate(id, payload, {
        new: true,
    });

    return result;
};

export const UserServices = {
    createStudentIntoDB,
    createFacultyIntoDB,
    createAdminIntoDB,
    getMe,
    changeStatus,
};
