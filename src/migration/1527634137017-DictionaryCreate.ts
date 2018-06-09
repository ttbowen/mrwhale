// tslint:disable
import { MigrationInterface, QueryRunner } from 'typeorm';

export class dictionaryCreate1527634137017 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "temporary_user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "discriminator" varchar NOT NULL, "avatarUrl" varchar NOT NULL, "totalExp" integer NOT NULL DEFAULT (0), "expLastUpdated" datetime NOT NULL)`
        );
        await queryRunner.query(
            `INSERT INTO "temporary_user"("id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated") SELECT "id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated" FROM "user"`
        );
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(
            `CREATE TABLE "dictionary" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildId" varchar NOT NULL, "word" varchar NOT NULL, "definition" varchar NOT NULL, "example" varchar, "userId" varchar)`
        );
        await queryRunner.query(
            `CREATE TABLE "temporary_user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "discriminator" varchar NOT NULL, "avatarUrl" varchar NOT NULL, "totalExp" integer NOT NULL DEFAULT (0), "expLastUpdated" datetime)`
        );
        await queryRunner.query(
            `INSERT INTO "temporary_user"("id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated") SELECT "id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated" FROM "user"`
        );
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_dictionary" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildId" varchar NOT NULL, "word" varchar NOT NULL, "definition" varchar NOT NULL, "example" varchar, "userId" varchar, CONSTRAINT "FK_e2226a81571c419c00ff57f85b7" FOREIGN KEY ("userId") REFERENCES "user" ("id"))`
        );
        await queryRunner.query(
            `INSERT INTO "temporary_dictionary"("id", "guildId", "word", "definition", "example", "userId") SELECT "id", "guildId", "word", "definition", "example", "userId" FROM "dictionary"`
        );
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`ALTER TABLE "temporary_dictionary" RENAME TO "dictionary"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "dictionary" RENAME TO "temporary_dictionary"`);
        await queryRunner.query(
            `CREATE TABLE "dictionary" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "guildId" varchar NOT NULL, "word" varchar NOT NULL, "definition" varchar NOT NULL, "example" varchar, "userId" varchar)`
        );
        await queryRunner.query(
            `INSERT INTO "dictionary"("id", "guildId", "word", "definition", "example", "userId") SELECT "id", "guildId", "word", "definition", "example", "userId" FROM "temporary_dictionary"`
        );
        await queryRunner.query(`DROP TABLE "temporary_dictionary"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(
            `CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "discriminator" varchar NOT NULL, "avatarUrl" varchar NOT NULL, "totalExp" integer NOT NULL DEFAULT (0), "expLastUpdated" datetime NOT NULL)`
        );
        await queryRunner.query(
            `INSERT INTO "user"("id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated") SELECT "id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated" FROM "temporary_user"`
        );
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(
            `CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "discriminator" varchar NOT NULL, "avatarUrl" varchar NOT NULL, "totalExp" integer NOT NULL DEFAULT (0), "expLastUpdated" datetime NOT NULL)`
        );
        await queryRunner.query(
            `INSERT INTO "user"("id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated") SELECT "id", "username", "discriminator", "avatarUrl", "totalExp", "expLastUpdated" FROM "temporary_user"`
        );
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }
}
