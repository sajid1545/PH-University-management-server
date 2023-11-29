import { Schema, model } from 'mongoose';
import { TAcademicDepartment } from './academicDepartment.interface';

const academicDepartmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    academicFaculty: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicFaculties',
        required: true,
    },
});

export const AcademicDepartment = model<TAcademicDepartment>(
    'AcademicDepartments',
    academicDepartmentSchema,
);
