import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../courses.controller';
import { CoursesService } from '../courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    createCourse: jest.fn(),
    getAllCourses: jest.fn(),
    getCourseById: jest.fn(),
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
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
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCourse', () => {
    it('should create a course', async () => {
      mockCoursesService.createCourse.mockResolvedValue(mockCourse);
      const result = await controller.createCourse(mockCourse);
      expect(result).toEqual(mockCourse);
      expect(mockCoursesService.createCourse).toHaveBeenCalledWith(mockCourse);
    });
  });

  describe('getAllCourses', () => {
    it('should return all courses', async () => {
      mockCoursesService.getAllCourses.mockResolvedValue([mockCourse]);
      const result = await controller.getAllCourses();
      expect(result).toEqual([mockCourse]);
      expect(mockCoursesService.getAllCourses).toHaveBeenCalled();
    });
  });

  describe('getCourseById', () => {
    it('should return a course by id', async () => {
      mockCoursesService.getCourseById.mockResolvedValue(mockCourse);
      const result = await controller.getCourseById('mockId');
      expect(result).toEqual(mockCourse);
      expect(mockCoursesService.getCourseById).toHaveBeenCalledWith('mockId');
    });
  });

  describe('updateCourse', () => {
    it('should update a course', async () => {
      const updateData = { title: 'Updated Title' };
      mockCoursesService.updateCourse.mockResolvedValue({ ...mockCourse, ...updateData });
      const result = await controller.updateCourse('mockId', updateData);
      expect(result).toEqual({ ...mockCourse, ...updateData });
      expect(mockCoursesService.updateCourse).toHaveBeenCalledWith('mockId', updateData);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      mockCoursesService.deleteCourse.mockResolvedValue(mockCourse);
      const result = await controller.deleteCourse('mockId');
      expect(result).toEqual(mockCourse);
      expect(mockCoursesService.deleteCourse).toHaveBeenCalledWith('mockId');
    });
  });
}); 