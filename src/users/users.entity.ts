import { Exclude } from 'class-transformer';
import { UserRole } from 'src/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })
  @Index('unique_username', ['username'], { unique: true })
  username: string;
  @Column()
  @Index('unique_email', ['email'], { unique: true })
  email: string;
  @Column({ select: false })
  @Exclude()
  password: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Column({ nullable: true })
  refreshToken: string;
  @Column({ default: false })
  isEmailVerified: boolean;
  @Column({ default: false })
  isAccountVerified: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
