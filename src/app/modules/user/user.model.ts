import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { USER_ROLE } from './user.constant';
import { TUser, UserModel } from './user.interface';

const userSchema = new Schema<TUser, UserModel>(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: 0,
        },
        needsPasswordChange: {
            type: Boolean,
            default: true,
        },
        passwordChangedAt: {
            type: Date,
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLE),
        },
        status: {
            type: String,
            enum: ['in-progress', 'blocked'],
            default: 'in-progress',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(
        this.password,
        Number(config.bcrypt_salt_rounds),
    );

    next();
});

userSchema.post('save', function (doc, next) {
    doc.password = '';

    next();
});

userSchema.statics.isUserExistsByCustom = async function (id: string) {
    return await User.findOne({ id }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
    plainTextPassword: string,
    hashedPassword: string,
) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isUserDeleted = async function (id: string) {
    const result = await User.findOne({ id });
    return result?.isDeleted;
};

userSchema.statics.isUserBlocked = async function (id: string) {
    const result = await User.findOne({ id });
    return result?.status === 'blocked';
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
) {
    const passwordChangedTime =
        new Date(passwordChangedTimestamp).getTime() / 1000;

    return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>('User', userSchema);
