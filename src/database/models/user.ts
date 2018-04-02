import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class User extends Model<User> {
    @PrimaryKey
    @Column
    id: string;
    @Column username: string;
    @Column discriminator: string;
    @Column avatarUrl: string;
    @Column totalExp: number;
    @Column expLastUpdated: Date;
}
