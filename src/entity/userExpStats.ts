import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserExpStats {
  @PrimaryColumn() userId: string;
  @PrimaryColumn() guildId: string;
  @Column({ default: 0 })
  exp: number;
  @Column({ nullable: true })
  lastLevelUp: Date;
}
