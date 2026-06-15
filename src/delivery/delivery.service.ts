import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Delivery, DeliveryStatus } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

import { Order } from '../orders/entities/order.entity';
import { Rider } from '../riders/entities/rider.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepo: Repository<Delivery>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(Rider)
    private riderRepo: Repository<Rider>,
  ) {}

  async create(dto: CreateDeliveryDto) {
    const order = await this.orderRepo.findOneBy({ id: dto.orderId });
    if (!order) throw new NotFoundException('Order not found');

    const rider = await this.riderRepo.findOneBy({ id: dto.riderId });
    if (!rider) throw new NotFoundException('Rider not found');

    const delivery = this.deliveryRepo.create({
      order,
      rider,
      notes: dto.notes,
    });

    return this.deliveryRepo.save(delivery);
  }

  async findAll() {
    return this.deliveryRepo.find();
  }

  async findOne(id: string) {
    const delivery = await this.deliveryRepo.findOneBy({ id });
    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async update(id: string, dto: UpdateDeliveryDto) {
    const delivery = await this.findOne(id);

    if (dto.status === DeliveryStatus.PICKED) {
      delivery.pickupTime = new Date();
    }

    if (dto.status === DeliveryStatus.DELIVERED) {
      delivery.deliveredTime = new Date();
    }

    Object.assign(delivery, dto);

    return this.deliveryRepo.save(delivery);
  }

  async remove(id: string) {
    const delivery = await this.findOne(id);
    return this.deliveryRepo.remove(delivery);
  }
}