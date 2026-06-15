import { Injectable } from '@nestjs/common';

@Injectable()
export class CommissionService {

  calculate(amount: number) {
    const platformCommission = Number((amount * 0.20).toFixed(2));

    const riderEarning = Number((amount * 0.10).toFixed(2));

    const branchEarning = Number(
      (amount - platformCommission - riderEarning).toFixed(2),
    );

    return {
      platformCommission,
      riderEarning,
      branchEarning,
    };
  }

  
  findAll() {
    return {
      message: 'Commission system is working',
      note: 'No DB storage implemented yet',
    };
  }
}