// tslint:disable
import { MigrationInterface, QueryRunner } from 'typeorm';

export class dictionaryCreate1527535040959 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "dictionary" ("guildId" varchar NOT NULL, "word" varchar NOT NULL, "definition" varchar NOT NULL, "example" varchar NOT NULL, "userId" varchar, PRIMARY KEY ("guildId", "word"))`
        );
        await queryRunner.query(
            `CREATE TABLE "temporary_dictionary" ("guildId" varchar NOT NULL, "word" varchar NOT NULL, "definition" varchar NOT NULL, "example" varchar NOT NULL, "userId" varchar, CONSTRAINT "FK_e2226a81571c419c00ff57f85b7" FOREIGN KEY ("userId") REFERENCES "user" ("id"), PRIMARY KEY ("guildId", "word"))`
        );
        await queryRunner.query(
            `INSERT INTO "temporary_dictionary"("guildId", "word", "definition", "example", "userId") SELECT "guildId", "word", "definition", "example", "userId" FROM "dictionary"`
        );
        await queryRunner.query(`DROP TABLE "dictionary"`);
        await queryRunner.query(`ALTER TABLE "temporary_dictionary" RENAME TO "dictionary"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "dictionary" RENAME TO "temporary_dictionary"`);
        await queryRunner.query(
            `CREATE TABLE "dictionary" ("guildId" varchar NOT NULL, "word" varchar NOT NULL, "definition" varchar NOT NULL, "example" varchar NOT NULL, "userId" varchar, PRIMARY KEY ("guildId", "word"))`
        );
        await queryRunner.query(
            `INSERT INTO "dictionary"("guildId", "word", "definition", "example", "userId") SELECT "guildId", "word", "definition", "example", "userId" FROM "temporary_dictionary"`
        );
        await queryRunner.query(`DROP TABLE "temporary_dictionary"`);
        await queryRunner.query(`DROP TABLE "dictionary"`);
    }
}
