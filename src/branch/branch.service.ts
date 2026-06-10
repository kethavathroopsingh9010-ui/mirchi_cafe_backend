import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
  ) {}

  create(dto: CreateBranchDto) {
    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  findAll() {
    return this.branchRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const branch = await this.branchRepo.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, dto: CreateBranchDto) {
    await this.branchRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.branchRepo.delete(id);
  }
}