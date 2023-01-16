import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('messages')
class Message {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  status: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  message: string;

  @Column()
  media_path: string;

  @Column('datetime')
  schedule_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Message;
