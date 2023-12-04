import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

const findLastStudentId = async () => {
    const lastStudent = await User.findOne(
        { role: 'student' },
        { id: 1, _id: 0 },
    )
        .sort({ createdAt: -1 })
        .lean();

    // 203003  0001
    return lastStudent?.id ? lastStudent.id : undefined;
};

// year, semesterCode, 4 digit number
export const generateStudentId = async (payload: TAcademicSemester) => {
    // first time 0000
    let currentId = (0).toString(); // 0000 by default

    const lastStudentId = await findLastStudentId(); // jodi last student thake tahole last semester code ar year ta pete chai

    //~ last id example  2030 01 0001
    const lastStudentSemesterCode = lastStudentId?.substring(4, 6); // 01
    const lastStudentYear = lastStudentId?.substring(0, 4); // 2030

    const currentSemesterCode = payload.code;
    const currentYear = payload.year;

    if (
        lastStudentId &&
        lastStudentSemesterCode === currentSemesterCode &&
        lastStudentYear === currentYear
    ) {
        currentId = lastStudentId.substring(6); // 0001
    }

    let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

    incrementId = `${payload.year}${payload.code}${incrementId}`;
    return incrementId;
};

const getLastFacultyId = async () => {
    const lastFaculty = await User.findOne(
        { role: 'faculty' },
        { id: 1, _id: 0 },
    )
        .sort({ createdAt: -1 })
        .lean();

    // F-0001
    return lastFaculty?.id ? lastFaculty.id.substring(2) : undefined;
};

export const generateFacultyId = async () => {
    const currentId = (await getLastFacultyId()) || (0).toString();
    let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
    incrementId = `F-${incrementId}`;
    return incrementId;
};

const getLastAdminId = async () => {
    const lastAdminId = await User.findOne({ role: 'admin' }, { id: 1, _id: 0 })
        .sort({ createdAt: -1 })
        .lean();

    return lastAdminId?.id ? lastAdminId.id.substring(2) : null;
};

export const generateAdminId = async () => {
    const currentId = (await getLastAdminId()) || (0).toString();
    let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
    incrementId = `A-${incrementId}`;
    return incrementId;
};
