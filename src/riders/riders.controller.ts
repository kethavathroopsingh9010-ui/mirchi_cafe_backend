import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
} from '@nestjs/common';

import { RidersService } from './riders.service';

@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  // CREATE RIDER
  @Post(':userId')
  create(@Param('userId') userId: string) {
    return this.ridersService.create(userId);
  }

  // GET ALL RIDERS
  @Get()
  findAll() {
    return this.ridersService.findAll();
  }

  // GET RIDER BY ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ridersService.findOne(id);
  }

  // ASSIGN ORDER
  @Patch('assign/:orderId/:riderId')
  assignOrder(
    @Param('orderId') orderId: string,
    @Param('riderId') riderId: string,
  ) {
    return this.ridersService.assignOrder(orderId, riderId);
  }

  // UPDATE LOCATION
  @Patch('location/:id')
  updateLocation(
    @Param('id') riderId: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.ridersService.updateLocation(
      riderId,
      body.lat,
      body.lng,
    );
  }

  // UPDATE AVAILABILITY
  @Patch('availability/:id')
  updateAvailability(
    @Param('id') riderId: string,
    @Body() body: { available: boolean },
  ) {
    return this.ridersService.updateAvailability(
      riderId,
      body.available,
    );
  }

  // UPDATE EARNINGS
  @Patch('earnings/:id')
  addEarnings(
    @Param('id') riderId: string,
    @Body() body: { amount: number },
  ) {
    return this.ridersService.addEarnings(
      riderId,
      body.amount,
    );
  }
}