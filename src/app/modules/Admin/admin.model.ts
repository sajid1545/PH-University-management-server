import { Schema, model } from 'mongoose';
import validator from 'validator';
import { BloodGroup, Gender } from './admin.constants';
import { TAdmin, TUserName } from './admin.interface';

const userNameSchema = new Schema<TUserName>({
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
        trim: true,
        maxlength: [20, 'Name can not be more than 20 characters'],
    },
    middleName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, 'Last Name is required'],
        maxlength: [20, 'Name can not be more than 20 characters'],
    },
});

const adminSchema = new Schema<TAdmin>({
    id: {
        type: String,
        unique: true,
        required: [true, 'Faculty ID is required'],
    },

    name: {
        type: userNameSchema,
        required: [true, 'Faculty name is required'],
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
    },
    user: {
        type: Schema.Types.ObjectId,
        unique: true,
        ref: 'User',
        required: [true, 'User is required'],
    },
    gender: {
        type: String,
        enum: {
            values: Gender,
            message:
                '{VALUE} is not supported. Gender should be one of: male, female, other',
        },
        required: [true, 'Gender is required'],
    },
    dateOfBirth: { type: String },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: (value: string) => validator.isEmail(value),
            message: '{VALUE} is not a valid email',
        },
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
    },
    emergencyContactNo: {
        type: String,
        required: [true, 'Emergency contact number is required'],
    },
    bloodGroup: {
        type: String,
        enum: {
            values: BloodGroup,
            message:
                '{VALUE} is not a valid blood group. Choose from: A+, A-, B+, B-, AB+, AB-, O+, O-',
        },
    },
    presentAddress: {
        type: String,
        required: [true, 'Present address is required'],
    },
    permanentAddress: {
        type: String,
        required: [true, 'Permanent address is required'],
    },

    profileImage: { type: String },

    isDeleted: { type: Boolean, default: false },
});

export const Admin = model<TAdmin>('Admin', adminSchema);
