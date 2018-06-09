import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user';

@Entity()
export class Dictionary {
    @PrimaryGeneratedColumn() id: number;
    @Column() guildId: string;
    @Column() word: string;
    @Column() definition: string;
    @Column({ nullable: true })
    example: string;
    @ManyToOne(type => User, user => user.definitions)
    user: User;
}
