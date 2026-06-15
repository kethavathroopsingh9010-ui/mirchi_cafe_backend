import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rider } from './entities/rider.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateRiderDto } from './dto/create-rider.dto'; // 1. Import the DTO

@Injectable()
export class RidersService {
  constructor(
    @InjectRepository(Rider)
    private riderRepo: Repository<Rider>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // Create Rider Profile - FIXED
  async create(userId: string, createRiderDto: CreateRiderDto) { // 2. Accept the DTO
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Destructure and map the non-nullable fields to the entity payload
    const rider = this.riderRepo.create({
      user,
      phone: createRiderDto.phone,
      vehicleNumber: createRiderDto.vehicleNumber,
      isAvailable: true,
      earnings: 0,
    });

    return await this.riderRepo.save(rider);
  }

  // Get All Riders
  async findAll() {
    return await this.riderRepo.find();
  }

  // Get Single Rider
  async findOne(id: string) {
    const rider = await this.riderRepo.findOne({
      where: { id },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return rider;
  }

  // Assign Order To Rider
  async assignOrder(orderId: string, riderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    const rider = await this.riderRepo.findOne({
      where: { id: riderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    order.rider = rider;

    return await this.orderRepo.save(order);
  }

  // Update Rider Location
  async updateLocation(
    riderId: string,
    lat: number,
    lng: number,
  ) {
    const rider = await this.riderRepo.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    rider.currentLat = lat;
    rider.currentLng = lng;

    return await this.riderRepo.save(rider);
  }

  // Update Availability
  async updateAvailability(
    riderId: string,
    available: boolean,
  ) {
    const rider = await this.riderRepo.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    rider.isAvailable = available;

    return await this.riderRepo.save(rider);
  }

  // Add Earnings
  async addEarnings(
    riderId: string,
    amount: number,
  ) {
    const rider = await this.riderRepo.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    rider.earnings += amount;

    return await this.riderRepo.save(rider);
  }
}