import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryColumn() id: string;
    @Column() username: string;
    @Column() discriminator: string;
    @Column() avatarUrl: string;
    @Column() totalExp: number;
    @Column() expLastUpdated: Date;
}
