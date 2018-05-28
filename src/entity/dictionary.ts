import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from './user';

@Entity()
export class Dictionary {
    @PrimaryColumn() guildId: string;
    @PrimaryColumn() word: string;
    @Column() definition: string;
    @Column() example: string;
    @ManyToOne(type => User, user => user.definitions)
    user: User;
}
