import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { CreateProfileDto } from '../dtos/create-profile.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { ProfileNotFoundException } from '../exceptions/user.exceptions';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository: ProfileRepository;

  const mockProfile = {
    _id: 'profile-id-1',
    userId: 'user-id-1',
    bio: 'Test bio',
    avatar: 'avatar.jpg',
    theme: 'light',
    isBlocked: false
  };

  const mockProfileRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: mockProfileRepository
        }
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    profileRepository = module.get<ProfileRepository>(ProfileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProfileByUserId', () => {
    it('should return a profile by user id', async () => {
      mockProfileRepository.findByUserId.mockResolvedValueOnce(mockProfile);

      const result = await service.findProfileByUserId('user-id-1');
      
      expect(profileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw ProfileNotFoundException if profile not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValueOnce(null);

      await expect(service.findProfileByUserId('nonexistent-id')).rejects.toThrow(ProfileNotFoundException);
    });
  });

  describe('createProfile', () => {
    it('should create a profile with default theme', async () => {
      const createProfileDto: CreateProfileDto & { userId: string } = {
        userId: 'user-id-1',
        bio: 'New bio',
        avatar: 'new-avatar.jpg',
        theme: 'dark' // This will be overridden by the service
      };

      // The expected data that should be passed to create
      const expectedCreateData = {
        userId: 'user-id-1',
        bio: 'New bio',
        avatar: 'new-avatar.jpg',
        theme: 'light' // Service sets this default
      };

      mockProfileRepository.create.mockResolvedValueOnce({
        ...mockProfile,
        bio: createProfileDto.bio,
        avatar: createProfileDto.avatar,
        theme: 'light' // Service returns with light theme
      });

      const result = await service.createProfile(createProfileDto);
      
      expect(profileRepository.create).toHaveBeenCalledWith(expectedCreateData);
      expect(result).toEqual({
        ...mockProfile,
        bio: createProfileDto.bio,
        avatar: createProfileDto.avatar,
        theme: 'light'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update a profile', async () => {
      const updateProfileDto: UpdateProfileDto = {
        bio: 'Updated bio',
        theme: 'dark'
      };

      // Mock findByUserId to return a profile (profile exists)
      mockProfileRepository.findByUserId.mockResolvedValueOnce(mockProfile);
      
      mockProfileRepository.update.mockResolvedValueOnce({
        ...mockProfile,
        ...updateProfileDto
      });

      const result = await service.updateProfile('user-id-1', updateProfileDto);
      
      expect(profileRepository.findByUserId).toHaveBeenCalledWith('user-id-1');
      expect(profileRepository.update).toHaveBeenCalledWith('user-id-1', updateProfileDto);
      expect(result).toEqual({
        ...mockProfile,
        ...updateProfileDto
      });
    });

    it('should throw ProfileNotFoundException if profile not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValueOnce(null);

      await expect(service.updateProfile('nonexistent-id', {})).rejects.toThrow(ProfileNotFoundException);
    });
  });
});