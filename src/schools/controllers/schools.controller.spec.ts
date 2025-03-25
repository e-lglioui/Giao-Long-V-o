import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from '../providers/schools.service';
import { InstructorsService } from '../../instructors/providers/instructors.service';
import { CreateSchoolDto } from '../dto/create-school.dto';
import { CreateInstructorDto } from '../../instructors/dto/create-instructor.dto';
import { Logger } from '@nestjs/common';

describe('SchoolsController', () => {
  let controller: SchoolsController;
  let schoolsService: SchoolsService;
  let instructorsService: InstructorsService;

  const mockSchool = {
    _id: 'school-id-1',
    name: 'Test School',
    address: '123 Test St',
    contactNumber: '123-456-7890',
    description: 'A test school',
    maxStudents: 100,
    images: [],
    instructors: [],
    students: [],
  };

  const mockInstructor = {
    _id: 'instructor-id-1',
    userId: 'user-id-1',
    name: 'Test Instructor',
  };

  // Mock CreateInstructorDto that matches the actual DTO structure
  const mockCreateInstructorDto: CreateInstructorDto = {
    username: 'instructor1',
    password: 'password123',
    email: 'instructor@example.com',
    firstName: 'Test',
    lastName: 'Instructor',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsController],
      providers: [
        {
          provide: SchoolsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockSchool),
            findAll: jest.fn().mockResolvedValue([mockSchool]),
            findOne: jest.fn().mockResolvedValue(mockSchool),
            update: jest.fn().mockResolvedValue(mockSchool),
            remove: jest.fn().mockResolvedValue(undefined),
            addImage: jest.fn().mockResolvedValue(mockSchool),
            addInstructor: jest.fn().mockResolvedValue(mockSchool),
            addStudent: jest.fn().mockResolvedValue(mockSchool),
            findNearbySchools: jest.fn().mockResolvedValue([mockSchool]),
          },
        },
        {
          provide: InstructorsService,
          useValue: {
            create: jest.fn().mockImplementation(() => Promise.resolve(mockInstructor)),
          },
        },
      ],
    }).compile();

    controller = module.get<SchoolsController>(SchoolsController);
    schoolsService = module.get<SchoolsService>(SchoolsService);
    instructorsService = module.get<InstructorsService>(InstructorsService);

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });



  describe('create', () => {
    it('should create a new school', async () => {
      const createSchoolDto: CreateSchoolDto = {
        name: 'New School',
        address: '123 New St',
        contactNumber: '123-456-7890',
        description: 'A new school',
        maxStudents: 100,
      };

      const result = await controller.create(createSchoolDto);

      expect(schoolsService.create).toHaveBeenCalledWith(createSchoolDto);
      expect(result).toEqual(mockSchool);
    });
  });

  describe('findAll', () => {
    it('should return an array of schools', async () => {
      const result = await controller.findAll();

      expect(schoolsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockSchool]);
    });
  });

  describe('findOne', () => {
    it('should return a school by id', async () => {
      const result = await controller.findOne('school-id-1');

      expect(schoolsService.findOne).toHaveBeenCalledWith('school-id-1');
      expect(result).toEqual(mockSchool);
    });
  });

  describe('update', () => {
    it('should update a school', async () => {
      const updateSchoolDto = {
        name: 'Updated School',
        description: 'Updated description',
      };

      const result = await controller.update('school-id-1', updateSchoolDto);

      expect(schoolsService.update).toHaveBeenCalledWith('school-id-1', updateSchoolDto);
      expect(result).toEqual(mockSchool);
    });
  });

  describe('remove', () => {
    it('should remove a school', async () => {
      await controller.remove('school-id-1');

      expect(schoolsService.remove).toHaveBeenCalledWith('school-id-1');
    });
  });

  describe('uploadImage', () => {
    it('should upload an image to a school', async () => {
      const file = { filename: 'test.jpg' } as Express.Multer.File;

      const result = await controller.uploadImage('school-id-1', file);

      expect(schoolsService.addImage).toHaveBeenCalledWith('school-id-1', '/images/test.jpg');
      expect(result).toEqual(mockSchool);
    });

    it('should throw an error if no file is uploaded', async () => {
      await expect(controller.uploadImage('school-id-1', null)).rejects.toThrow('No image file uploaded');
    });
  });

  describe('uploadMultipleImages', () => {
    it('should upload multiple images to a school', async () => {
      const files = [
        { filename: 'test1.jpg' },
        { filename: 'test2.jpg' },
      ] as Express.Multer.File[];

      const result = await controller.uploadMultipleImages('school-id-1', files);

      expect(schoolsService.addImage).toHaveBeenCalledTimes(2);
      expect(schoolsService.addImage).toHaveBeenCalledWith('school-id-1', '/images/test1.jpg');
      expect(schoolsService.addImage).toHaveBeenCalledWith('school-id-1', '/images/test2.jpg');
      expect(result).toEqual(mockSchool);
    });
  });

  describe('addInstructor', () => {
    it('should add a new instructor to a school', async () => {
      const result = await controller.addInstructor('school-id-1', mockCreateInstructorDto);

      expect(instructorsService.create).toHaveBeenCalledWith(mockCreateInstructorDto);
      expect(schoolsService.addInstructor).toHaveBeenCalledWith('school-id-1', expect.any(String));
      expect(result).toEqual(mockSchool);
    });
  });

  describe('addExistingInstructor', () => {
    it('should add an existing instructor to a school', async () => {
      const result = await controller.addExistingInstructor('school-id-1', 'instructor-id-1');

      expect(schoolsService.addInstructor).toHaveBeenCalledWith('school-id-1', 'instructor-id-1');
      expect(result).toEqual(mockSchool);
    });
  });

  describe('addStudent', () => {
    it('should add a student to a school', async () => {
      const result = await controller.addStudent('school-id-1', 'student-id-1');

      expect(schoolsService.addStudent).toHaveBeenCalledWith('school-id-1', 'student-id-1');
      expect(result).toEqual(mockSchool);
    });
  });

  describe('findNearbySchools', () => {
    it('should find schools near a location', async () => {
      const result = await controller.findNearbySchools('48.8566', '2.3522', '5000');

      expect(schoolsService.findNearbySchools).toHaveBeenCalledWith(48.8566, 2.3522, 5000);
      expect(result).toEqual([mockSchool]);
    });
  });
});