import { Test, TestingModule } from '@nestjs/testing';
import { SchoolAdminController } from './school-admin.controller';
import { SchoolAdminService } from '../providers/school-admin.service';
import { Role } from '../../auth/enums/role.enum';

describe('SchoolAdminController', () => {
  let controller: SchoolAdminController;
  let schoolAdminService: SchoolAdminService;

  const mockSchoolAdmin = {
    message: 'School admin created successfully',
    user: {
      _id: 'user-id-1',
      username: 'testadmin',
      email: 'admin@example.com',
    },
    school: 'Test School',
  };

  const mockAdmins = {
    school: 'Test School',
    admins: [
      { username: 'admin1', email: 'admin1@example.com' },
      { username: 'admin2', email: 'admin2@example.com' },
    ],
  };

  const mockUser = {
    id: 'user-id-1',
    username: 'testadmin',
    email: 'admin@example.com',
    role: Role.SCHOOL_ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolAdminController],
      providers: [
        {
          provide: SchoolAdminService,
          useValue: {
            createSchoolAdmin: jest.fn().mockResolvedValue(mockSchoolAdmin),
            getAdminsBySchool: jest.fn().mockResolvedValue(mockAdmins),
            removeSchoolAdmin: jest.fn().mockResolvedValue({ message: 'School admin removed successfully' }),
          },
        },
      ],
    }).compile();

    controller = module.get<SchoolAdminController>(SchoolAdminController);
    schoolAdminService = module.get<SchoolAdminService>(SchoolAdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSchoolAdmin', () => {
    it('should create a school admin', async () => {
      const createSchoolAdminDto = {
        username: 'newadmin',
        email: 'newadmin@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Admin',
      };

      const result = await controller.createSchoolAdmin('school-id-1', createSchoolAdminDto);

      expect(schoolAdminService.createSchoolAdmin).toHaveBeenCalledWith('school-id-1', createSchoolAdminDto);
      expect(result).toEqual(mockSchoolAdmin);
    });
  });

  describe('getSchoolAdmins', () => {
    it('should get all admins for a school as super admin', async () => {
      const result = await controller.getSchoolAdmins('school-id-1', { ...mockUser, role: Role.SUPER_ADMIN });

      expect(schoolAdminService.getAdminsBySchool).toHaveBeenCalledWith('school-id-1');
      expect(result).toEqual(mockAdmins);
    });

    it('should get all admins for a school as school admin', async () => {
      // Mock the implementation to match what the controller actually does
      schoolAdminService.getAdminsBySchool = jest.fn().mockImplementation((schoolId, userId) => {
        return Promise.resolve(mockAdmins);
      });

      const result = await controller.getSchoolAdmins('school-id-1', mockUser);

      expect(schoolAdminService.getAdminsBySchool).toHaveBeenCalledWith('school-id-1', mockUser.id);
      expect(result).toEqual(mockAdmins);
    });
  });

  describe('removeSchoolAdmin', () => {
    it('should remove a school admin', async () => {
      const result = await controller.removeSchoolAdmin('school-id-1', 'admin-id-1');

      expect(schoolAdminService.removeSchoolAdmin).toHaveBeenCalledWith('school-id-1', 'admin-id-1');
      expect(result).toEqual({ message: 'School admin removed successfully' });
    });
  });
});