import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne 
} from 'typeorm';
import { RiderWallet } from './rider-wallet.entity'; // 👈 Make sure this path matches your wallet entity file name

@Entity('wallet_transaction')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', default: 'credit' }) // 'credit' (money in) or 'debit' (money out)
  type!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Links many history log entries back to one specific rider wallet profile
  @ManyToOne(() => RiderWallet, (wallet) => wallet.id, { onDelete: 'CASCADE' })
  wallet!: RiderWallet;
}