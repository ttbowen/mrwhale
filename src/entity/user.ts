import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Dictionary } from './dictionary';

@Entity()
export class User {
  @PrimaryColumn() id: string;
  @Column() username: string;
  @Column() discriminator: string;
  @Column() avatarUrl: string;
  @Column({ default: 0 })
  totalExp: number;
  @Column({ nullable: true })
  expLastUpdated: Date;
  @OneToMany(type => Dictionary, definition => definition.user)
  definitions: Dictionary[];
}
