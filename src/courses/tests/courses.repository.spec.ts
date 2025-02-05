import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoursesRepository } from '../courses.repository';
import { Course } from '../interfaces/course.interface';

describe('CoursesRepository', () => {
  let repository: CoursesRepository;
  let model: Model<Course>;

  const mockCourse = {
    _id: 'mockId',
    schoolId: 'schoolId',
    instructorId: 'instructorId',
    title: 'Test Course',
    description: 'Test Description',
  };

  const mockModel = {
    create: jest.fn().mockResolvedValue(mockCourse),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockCourse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesRepository,
        {
          provide: getModelToken('Course'),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<CoursesRepository>(CoursesRepository);
    model = module.get<Model<Course>>(getModelToken('Course'));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createDto = {
        schoolId: 'schoolId',
        instructorId: 'instructorId',
        title: 'Test Course',
        description: 'Test Description',
      };
      const result = await repository.create(createDto);
      expect(result).toEqual(mockCourse);
      expect(model.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockCourse]),
      } as any);
      const result = await repository.findAll();
      expect(result).toEqual([mockCourse]);
    });
  });

  describe('findById', () => {
    it('should find a course by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCourse),
      } as any);
      const result = await repository.findById('mockId');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateData = { title: 'Updated Title' };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockCourse, ...updateData }),
      } as any);
      const result = await repository.update('mockId', updateData);
      expect(result).toEqual({ ...mockCourse, ...updateData });
    });
  });

  describe('delete', () => {
    it('should delete a course', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCourse),
      } as any);
      const result = await repository.delete('mockId');
      expect(result).toEqual(mockCourse);
    });
  });
}); 