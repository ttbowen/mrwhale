import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class UserExpStats extends Model<UserExpStats> {
    @PrimaryKey
    @Column
    userId: string;
    @PrimaryKey
    @Column
    guildId: string;
    @Column exp: number;
    @Column lastLevelUp: Date;
}
