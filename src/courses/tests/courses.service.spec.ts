import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses.service';
import { CoursesRepository } from '../courses.repository';
import { NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: CoursesRepository;

  const mockCoursesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCourse = {
    _id: 'mockId',
    schoolId: 'schoolId',
    instructorId: 'instructorId',
    title: 'Test Course',
    description: 'Test Description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: CoursesRepository,
          useValue: mockCoursesRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    repository = module.get<CoursesRepository>(CoursesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      mockCoursesRepository.create.mockResolvedValue(mockCourse);
      const result = await service.createCourse(mockCourse);
      expect(result).toEqual(mockCourse);
      expect(mockCoursesRepository.create).toHaveBeenCalledWith(mockCourse);
    });
  });

  describe('getAllCourses', () => {
    it('should return all courses', async () => {
      mockCoursesRepository.findAll.mockResolvedValue([mockCourse]);
      const result = await service.getAllCourses();
      expect(result).toEqual([mockCourse]);
      expect(mockCoursesRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getCourseById', () => {
    it('should return a course by id', async () => {
      mockCoursesRepository.findById.mockResolvedValue(mockCourse);
      const result = await service.getCourseById('mockId');
      expect(result).toEqual(mockCourse);
      expect(mockCoursesRepository.findById).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException when course not found', async () => {
      mockCoursesRepository.findById.mockResolvedValue(null);
      await expect(service.getCourseById('mockId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCourse', () => {
    it('should update a course successfully', async () => {
      mockCoursesRepository.update.mockResolvedValue(mockCourse);
      const result = await service.updateCourse('mockId', { title: 'Updated Title' });
      expect(result).toEqual(mockCourse);
      expect(mockCoursesRepository.update).toHaveBeenCalledWith('mockId', { title: 'Updated Title' });
    });

    it('should throw NotFoundException when course not found', async () => {
      mockCoursesRepository.update.mockResolvedValue(null);
      await expect(service.updateCourse('mockId', { title: 'Updated Title' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course successfully', async () => {
      mockCoursesRepository.delete.mockResolvedValue(mockCourse);
      const result = await service.deleteCourse('mockId');
      expect(result).toEqual(mockCourse);
      expect(mockCoursesRepository.delete).toHaveBeenCalledWith('mockId');
    });

    it('should throw NotFoundException when course not found', async () => {
      mockCoursesRepository.delete.mockResolvedValue(null);
      await expect(service.deleteCourse('mockId')).rejects.toThrow(NotFoundException);
    });
  });
}); 