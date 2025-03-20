import { Permission } from '../enums/permission.enum';
import { Role } from '../enums/role.enum';

export const ROLE_PERMISSIONS = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // Super admin has all permissions

  [Role.SCHOOL_ADMIN]: [
    // User management
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    
    // School management
    Permission.SCHOOL_READ,
    Permission.SCHOOL_UPDATE,
    Permission.SCHOOL_MANAGE_STAFF,
    
    // Student management
    Permission.STUDENT_CREATE,
    Permission.STUDENT_READ,
    Permission.STUDENT_UPDATE,
    Permission.STUDENT_DELETE,
    Permission.STUDENT_ENROLL,
    
    // Class management
    Permission.CLASS_CREATE,
    Permission.CLASS_READ,
    Permission.CLASS_UPDATE,
    Permission.CLASS_DELETE,
    Permission.CLASS_SCHEDULE,
    
    // Course management
    Permission.COURSE_CREATE,
    Permission.COURSE_READ,
    Permission.COURSE_UPDATE,
    Permission.COURSE_DELETE,
    
    // Instructor management
    Permission.INSTRUCTOR_CREATE,
    Permission.INSTRUCTOR_READ,
    Permission.INSTRUCTOR_UPDATE,
    Permission.INSTRUCTOR_DELETE,
    Permission.INSTRUCTOR_ASSIGN,
    
    // Attendance management
    Permission.ATTENDANCE_READ,
    
    // Progress management
    Permission.PROGRESS_READ,
    
    // Event management
    Permission.EVENT_CREATE,
    Permission.EVENT_READ,
    Permission.EVENT_UPDATE,
    Permission.EVENT_DELETE,
    
    // Report management
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    
    // Enrollment management
    Permission.ENROLLMENT_CREATE,
    Permission.ENROLLMENT_READ,
    Permission.ENROLLMENT_UPDATE,
    Permission.ENROLLMENT_DELETE,
    Permission.ENROLLMENT_APPROVE,
  ],

  [Role.INSTRUCTOR]: [
    // User management
    Permission.USER_READ,
    
    // Student management
    Permission.STUDENT_READ,
    
    // Class management
    Permission.CLASS_READ,
    
    // Course management
    Permission.COURSE_READ,
    
    // Instructor management
    Permission.INSTRUCTOR_READ,
    Permission.INSTRUCTOR_UPDATE, // Only their own profile
    
    // Attendance management
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_UPDATE,
    
    // Progress management
    Permission.PROGRESS_CREATE,
    Permission.PROGRESS_READ,
    Permission.PROGRESS_UPDATE,
    
    // Event management
    Permission.EVENT_READ,
    Permission.EVENT_REGISTER,
    
    // Report management
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    
    // Enrollment management
    Permission.ENROLLMENT_READ,
  ],

  [Role.STUDENT]: [
    // User management
    Permission.USER_READ, // Only their own profile
    
    // Student management
    Permission.STUDENT_READ, // Only their own profile
    
    // Class management
    Permission.CLASS_READ,
    
    // Course management
    Permission.COURSE_READ,
    
    // Instructor management
    Permission.INSTRUCTOR_READ,
    
    // Attendance management
    Permission.ATTENDANCE_READ, // Only their own attendance
    
    // Progress management
    Permission.PROGRESS_READ, // Only their own progress
    
    // Event management
    Permission.EVENT_READ,
    Permission.EVENT_REGISTER,
    
    // Enrollment management
    Permission.ENROLLMENT_CREATE,
    Permission.ENROLLMENT_READ, // Only their own enrollments
  ],

  [Role.STAFF]: [
    // User management
    Permission.USER_READ,
    
    // School management
    Permission.SCHOOL_READ,
    
    // Student management
    Permission.STUDENT_READ,
    Permission.STUDENT_CREATE,
    Permission.STUDENT_UPDATE,
    
    // Class management
    Permission.CLASS_READ,
    
    // Course management
    Permission.COURSE_READ,
    
    // Instructor management
    Permission.INSTRUCTOR_READ,
    
    // Attendance management
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_CREATE,
    
    // Event management
    Permission.EVENT_READ,
    Permission.EVENT_CREATE,
    Permission.EVENT_UPDATE,
    
    // Report management
    Permission.REPORT_READ,
    
    // Enrollment management
    Permission.ENROLLMENT_READ,
    Permission.ENROLLMENT_CREATE,
    Permission.ENROLLMENT_UPDATE,
  ],

  [Role.USER]: [
    // Basic user permissions
    Permission.USER_READ, // Read own profile only
    
    // School permissions (view only)
    Permission.SCHOOL_READ,
    
    // Course read-only permissions
    Permission.COURSE_READ,
    
    // Class read-only permissions
    Permission.CLASS_READ,
    
    // Event read-only permissions
    Permission.EVENT_READ,
    Permission.EVENT_REGISTER,
  ],
}; 