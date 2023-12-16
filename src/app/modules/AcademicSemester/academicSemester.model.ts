import mongoose, { Schema, model } from 'mongoose';

import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
    AcademicSemesterCodes,
    AcademicSemesterName,
    Months,
} from './academicSemester.constants';
import { TAcademicSemester } from './academicSemester.interface';

// Autumn 01
// Summer 02
// Fall 03

const academicSemesterSchema = new Schema<TAcademicSemester>(
    {
        name: {
            type: String,
            required: true,
            enum: AcademicSemesterName,
        },
        year: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            enum: AcademicSemesterCodes,
        },
        startMonth: {
            type: String,
            required: true,
            enum: Months,
        },
        endMonth: {
            type: String,
            required: true,
            enum: Months,
        },
    },
    {
        timestamps: true,
    },
);

// business ar logic gula service a likbo

academicSemesterSchema.pre('save', async function (next) {
    const isSemesterExist = await AcademicSemester.findOne({
        year: this.year,
        name: this.name,
    });

    if (isSemesterExist) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Academic Semester  already exists',
        );
    }
    next(); // mongoose ar next
});

export const AcademicSemester =
    mongoose.models.AcademicSemester ||
    model<TAcademicSemester>('AcademicSemester', academicSemesterSchema);