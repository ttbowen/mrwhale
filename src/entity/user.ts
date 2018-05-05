import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryColumn() id: string;
    @Column() username: string;
    @Column() discriminator: string;
    @Column() avatarUrl: string;
    @Column({ default: 0 })
    totalExp: number;
    @Column() expLastUpdated: Date;
}
