import httpStatus from 'http-status';
import { Schema, model } from 'mongoose';
import AppError from '../../errors/AppError';
import { TAcademicDepartment } from './academicDepartment.interface';

const academicDepartmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    academicFaculty: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicFaculty',
        required: true,
    },
});

academicDepartmentSchema.pre('save', async function (next) {
    const isDepartmentExists = await AcademicDepartment.findOne({
        name: this.name,
    });

    if (isDepartmentExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Department already exists');
    }

    next();
});

academicDepartmentSchema.pre('findOneAndUpdate', async function (next) {
    const query = this.getQuery(); // { _id:"6256qo95u094u1041" }

    const isDepartmentExists = await AcademicDepartment.findOne(query);

    if (!isDepartmentExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Department doesn't exist");
    }

    next();
});

export const AcademicDepartment = model<TAcademicDepartment>(
    'AcademicDepartment',
    academicDepartmentSchema,
);
