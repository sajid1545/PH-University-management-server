import { Types } from 'mongoose';

export type TUserName = {
    firstName: string;
    middleName?: string;
    lastName: string;
};

export type TGender = 'male' | 'female' | 'other';
export type TBloodGroup =
    | 'A+'
    | 'A-'
    | 'B+'
    | 'B-'
    | 'AB+'
    | 'AB-'
    | 'O+'
    | 'O-';

export type TFaculty = {
    id: string;
    user: Types.ObjectId;
    name: TUserName;
    designation: string;
    gender: TGender;
    dateOfBirth?: string;
    email: string;
    contactNumber: string;
    emergencyContactNo: string;
    bloodGroup?: TBloodGroup;
    presentAddress: string;
    permanentAddress: string;
    profileImage?: string;
    academicDepartment: Types.ObjectId;
    academicFaculty: Types.ObjectId;
    isDeleted: boolean;
};
