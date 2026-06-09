import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ GET ALL USERS
  it('should return all users', async () => {
    mockUserRepository.find.mockResolvedValue([
      { id: '1', name: 'John' },
    ]);

    const result = await service.findAll();

    expect(result.length).toBe(1);
  });

  // ✅ GET USER BY ID
  it('should return user by id', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: '1',
      name: 'John',
    });

    const result = await service.findOne('1');

    expect(result).toBeDefined();
  });

  // ✅ DELETE USER
  it('should delete user', async () => {
    mockUserRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove('1');

    expect(result).toBeDefined();
  });
});