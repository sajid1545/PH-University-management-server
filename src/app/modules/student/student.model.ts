import { Schema, model } from 'mongoose';
import validator from 'validator';
import {
    StudentModel,
    TGuardian,
    TLocalGuardian,
    TStudent,
    TUserName,
} from './student.interface';

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

const guardianSchema = new Schema<TGuardian>({
    fatherName: { type: String, required: [true, 'Father name is required'] },
    fatherOccupation: {
        type: String,
        required: [true, 'Father occupation is required'],
    },
    fatherContactNo: {
        type: String,
        required: [true, 'Father contact number is required'],
    },
    motherName: { type: String, required: [true, 'Mother name is required'] },
    motherOccupation: {
        type: String,
        required: [true, 'Mother occupation is required'],
    },
    motherContactNo: {
        type: String,
        required: [true, 'Mother contact number is required'],
    },
});

const localGuardianSchema = new Schema<TLocalGuardian>({
    name: { type: String, required: [true, 'Local guardian name is required'] },
    occupation: {
        type: String,
        required: [true, 'Local guardian occupation is required'],
    },
    contactNo: {
        type: String,
        required: [true, 'Local guardian contact number is required'],
    },
    address: {
        type: String,
        required: [true, 'Local guardian address is required'],
    },
});

const studentSchema = new Schema<TStudent, StudentModel>(
    {
        id: {
            type: String,
            unique: true,
            required: [true, 'Student ID is required'],
        },

        name: {
            type: userNameSchema,
            required: [true, 'Student name is required'],
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
                values: ['male', 'female', 'other'],
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
                values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
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
        guardian: {
            type: guardianSchema,
            required: [true, 'Guardian information is required'],
        },
        localGuardian: {
            type: localGuardianSchema,
            required: [true, 'Local guardian information is required'],
        },
        profileImage: { type: String },
        admissionSemester: {
            type: Schema.Types.ObjectId,
            ref: 'AcademicSemester',
        },
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

// virtual

studentSchema.virtual('fullName').get(function () {
    return `${this.name.firstName} ${this.name.middleName} ${this.name.lastName}`;
});

// query middleware

studentSchema.pre('find', async function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});
studentSchema.pre('findOne', async function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});
studentSchema.pre('aggregate', async function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});

// creating a static method
studentSchema.statics.isUserExists = async function (id: string) {
    const existingUser = await Student.findOne({ id });
    return existingUser;
};

// creating custom instance methods
// studentSchema.methods.isUserExists = async function (id: string) {
//     const existingUser = await Student.findOne({ id });
//     return existingUser;
// };

export const Student = model<TStudent, StudentModel>('Student', studentSchema);
