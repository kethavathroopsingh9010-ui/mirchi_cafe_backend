import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('top-products')
  topProducts() {
    return this.analyticsService.topProducts();
  }

  @Get('daily-revenue')
  dailyRevenue() {
    return this.analyticsService.dailyRevenue();
  }
}