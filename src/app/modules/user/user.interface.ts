/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
    id: string;
    password: string;
    needsPasswordChange: boolean;
    passwordChangedAt?: Date;
    role: 'admin' | 'student' | 'faculty';
    status: 'in-progress' | 'blocked';
    isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
    isUserExistsByCustom(id: string): Promise<TUser>;
    isPasswordMatched(
        plainTextPassword: string,
        hashedPassword: string,
    ): Promise<boolean>;
    isUserDeleted(id: string): Promise<boolean>;
    isUserBlocked(id: string): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
