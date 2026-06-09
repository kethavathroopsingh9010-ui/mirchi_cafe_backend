import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },

        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //  REGISTER TEST
  it('should register a user', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    mockUserRepository.create.mockReturnValue({
      id: '1',
      name: 'John',
      email: 'john@test.com',
      password: 'hashedPassword',
    });

    mockUserRepository.save.mockResolvedValue({
      id: '1',
      name: 'John',
      email: 'john@test.com',
    });

    const result = await service.register({
      name: 'John',
      email: 'john@test.com',
      password: '123456',
    });

    expect(result).toBeDefined();
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  //  LOGIN TEST
  it('should login user and return token', async () => {
    const hashedPassword = await bcrypt.hash('123456', 10);

    mockUserRepository.findOne.mockResolvedValue({
      id: '1',
      email: 'john@test.com',
      password: hashedPassword,
    });

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({
      email: 'john@test.com',
      password: '123456',
    });

    expect(result).toHaveProperty('accessToken');
  });
});