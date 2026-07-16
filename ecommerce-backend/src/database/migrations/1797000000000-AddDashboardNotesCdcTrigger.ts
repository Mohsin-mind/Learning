import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDashboardNotesCdcTrigger1797000000000 implements MigrationInterface {
  name = 'AddDashboardNotesCdcTrigger1797000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION notify_dashboard_notes_change()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      DECLARE
        payload jsonb;
      BEGIN
        payload := jsonb_build_object(
          'table', TG_TABLE_NAME,
          'operation', TG_OP,
          'id', COALESCE(NEW.id, OLD.id),
          'timestamp', extract(epoch from now())::bigint
        );

        PERFORM pg_notify('dashboard_notes_channel', payload::text);
        RETURN COALESCE(NEW, OLD);
      END;
      $$;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_dashboard_notes_cdc
      AFTER INSERT OR UPDATE OR DELETE ON dashboard_notes
      FOR EACH ROW
      EXECUTE FUNCTION notify_dashboard_notes_change();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_dashboard_notes_cdc ON dashboard_notes`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS notify_dashboard_notes_change`);
  }
}
