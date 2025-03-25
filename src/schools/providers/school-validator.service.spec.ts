import { Test, TestingModule } from '@nestjs/testing';
import { SchoolValidatorService } from './school-validator.service';
import { getModelToken } from '@nestjs/mongoose';
import { School } from '../schemas/school.schema';
import { InvalidOperationException } from '../../common/exceptions/custom.exceptions';
import { Logger } from '@nestjs/common';

describe('SchoolValidatorService', () => {
  let service: SchoolValidatorService;
  let schoolModel: any;

  const mockSchool = {
    _id: 'school-id-1',
    name: 'Test School',
    maxStudents: 100,
    dashboard: {
      studentCount: 50,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolValidatorService,
        {
          provide: getModelToken(School.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchoolValidatorService>(SchoolValidatorService);
    schoolModel = module.get(getModelToken(School.name));

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateSchoolName', () => {
    it('should validate a unique school name', async () => {
      schoolModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.validateSchoolName('New School')).resolves.not.toThrow();
      expect(schoolModel.findOne).toHaveBeenCalledWith({ name: 'New School' });
    });

    it('should throw if school name is empty', async () => {
      await expect(service.validateSchoolName('')).rejects.toThrow(InvalidOperationException);
      await expect(service.validateSchoolName('  ')).rejects.toThrow(InvalidOperationException);
    });

    it('should throw if school name already exists', async () => {
      schoolModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSchool),
      });

      await expect(service.validateSchoolName('Test School')).rejects.toThrow(InvalidOperationException);
    });

    it('should exclude current school when validating name for updates', async () => {
      schoolModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.validateSchoolName('Updated School', 'school-id-1')).resolves.not.toThrow();
      expect(schoolModel.findOne).toHaveBeenCalledWith({
        name: 'Updated School',
        _id: { $ne: 'school-id-1' },
      });
    });
  });

  describe('validateCapacity', () => {
    it('should validate school has capacity for additional students', async () => {
      schoolModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSchool),
      });

      await expect(service.validateCapacity('school-id-1', 10)).resolves.not.toThrow();
      expect(schoolModel.findById).toHaveBeenCalledWith('school-id-1');
    });

    it('should throw if school not found', async () => {
      schoolModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.validateCapacity('nonexistent-id', 10)).rejects.toThrow(InvalidOperationException);
    });

    it('should throw if school would exceed capacity', async () => {
      schoolModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSchool),
      });

      await expect(service.validateCapacity('school-id-1', 51)).rejects.toThrow(InvalidOperationException);
    });
  });
});