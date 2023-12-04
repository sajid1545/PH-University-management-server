import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { adminSearchableFields } from './admin.constants';
import { TAdmin } from './admin.interface';
import { Admin } from './admin.model';

const getAllAdminsFromDB = async (query: Record<string, unknown>) => {
    const admin = new QueryBuilder(Admin.find(), query)
        .search(adminSearchableFields)
        .filter()
        .fields()
        .sort()
        .paginate();

    const result = await admin.modelQuery;
    return result;
};

const getSingleAdminFromDB = async (id: string) => {
    const result = await Admin.findOne({ id });

    return result;
};

const updateAdminIntoDB = async (id: string, payload: Partial<TAdmin>) => {
    const { name, ...remainingAdminData } = payload;

    const modifiedAdminData: Record<string, unknown> = {
        ...remainingAdminData,
    };

    if (name && Object.keys(name).length) {
        for (const [key, value] of Object.entries(name)) {
            modifiedAdminData[`name.${key}`] = value;
        }
    }

    const result = await Admin.findOneAndUpdate({ id }, modifiedAdminData, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteAdminFromDB = async (id: string) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const deletedUser = await User.findOneAndUpdate(
            { id },
            { isDeleted: true },
            { new: true, session },
        );

        if (!deletedUser) {
            throw new Error('Failed to delete user');
        }

        const deletedAdmin = await Admin.findOneAndUpdate(
            { id },
            { isDeleted: true },
            { new: true, session },
        );

        if (!deletedAdmin) {
            throw new Error('Failed to delete admin');
        }

        await session.commitTransaction();
        await session.endSession();
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error('Failed to delete admin');
    }
};

export const AdminServices = {
    getAllAdminsFromDB,
    getSingleAdminFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
};
