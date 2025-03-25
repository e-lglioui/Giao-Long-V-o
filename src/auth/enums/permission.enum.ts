export enum Permission {
  // User permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  // SCHOOL_MANAGE_STUDENTS=""
  // School permissions
  SCHOOL_CREATE = 'school:create',
  SCHOOL_READ = 'school:read',
  SCHOOL_UPDATE = 'school:update',
  SCHOOL_DELETE = 'school:delete',
  SCHOOL_MANAGE_STAFF = 'school:manage_staff',

  // Student permissions
  STUDENT_CREATE = 'student:create',
  STUDENT_READ = 'student:read',
  STUDENT_UPDATE = 'student:update', 
  STUDENT_DELETE = 'student:delete',
  STUDENT_ENROLL = 'student:enroll',

  // Class permissions
  CLASS_CREATE = 'class:create',
  CLASS_READ = 'class:read',
  CLASS_UPDATE = 'class:update',
  CLASS_DELETE = 'class:delete',
  CLASS_SCHEDULE = 'class:schedule',

  // Course permissions
  COURSE_CREATE = 'course:create',
  COURSE_READ = 'course:read',
  COURSE_UPDATE = 'course:update',
  COURSE_DELETE = 'course:delete',

  // Instructor permissions
  INSTRUCTOR_CREATE = 'instructor:create',
  INSTRUCTOR_READ = 'instructor:read',
  INSTRUCTOR_UPDATE = 'instructor:update',
  INSTRUCTOR_DELETE = 'instructor:delete',
  INSTRUCTOR_ASSIGN = 'instructor:assign',

  // Attendance permissions
  ATTENDANCE_CREATE = 'attendance:create',
  ATTENDANCE_READ = 'attendance:read',
  ATTENDANCE_UPDATE = 'attendance:update',
  ATTENDANCE_DELETE = 'attendance:delete',
  
  // Progress permissions
  PROGRESS_CREATE = 'progress:create',
  PROGRESS_READ = 'progress:read',
  PROGRESS_UPDATE = 'progress:update',
  PROGRESS_DELETE = 'progress:delete',

  // Event permissions
  EVENT_CREATE = 'event:create',
  EVENT_READ = 'event:read',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  EVENT_REGISTER = 'event:register',

  // Report permissions
  REPORT_CREATE = 'report:create',
  REPORT_READ = 'report:read',
  REPORT_UPDATE = 'report:update',
  REPORT_DELETE = 'report:delete',
  REPORT_EXPORT = 'report:export',

  // Enrollment permissions
  ENROLLMENT_CREATE = 'enrollment:create',
  ENROLLMENT_READ = 'enrollment:read',
  ENROLLMENT_UPDATE = 'enrollment:update',
  ENROLLMENT_DELETE = 'enrollment:delete',
  ENROLLMENT_APPROVE = 'enrollment:approve',

  // System-wide permissions
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_RESTORE = 'system:restore'
} 