import { Schema, model } from 'mongoose';
import validator from 'validator';
import { BloodGroup, Gender } from './faculty.constants';
import { TFaculty, TUserName } from './faculty.interface';

const userNameSchema = new Schema<TUserName>({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [20, 'First name should be less than 20 characters'],
        validate: {
            validator: function (value: string) {
                const firstNameStr =
                    value.charAt(0).toUpperCase() + value.slice(1);
                return firstNameStr === value;
            },
            message: '{VALUE} is not in capital letters',
        },
    },
    middleName: { type: String, trim: true },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        validate: {
            validator: (value: string) => validator.isAlpha(value), // name a number use korte parbo "sajid124 --> aita te error dibe"
            message: '{VALUE} is not valid',
        },
    },
});

const facultySchema = new Schema<TFaculty>(
    {
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

        academicDepartment: {
            type: Schema.Types.ObjectId,
            ref: 'AcademicDepartment',
        },

        isDeleted: { type: Boolean, default: false },
    },
    {
        toJSON: { virtuals: true },
    },
);

export const Faculty = model<TFaculty>('Faculty', facultySchema);
