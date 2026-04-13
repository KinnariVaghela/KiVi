import {
  Entity, PrimaryGeneratedColumn,
  Column, CreateDateColumn,
} from 'typeorm';

@Entity()
export class PasswordResetCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  code!: string; 

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'datetime' })
  expiresAt!: Date; 

  @Column({ type: 'boolean', default: false })
  used!: boolean; 
}
