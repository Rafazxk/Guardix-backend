import db from "../../config/database.js";

interface CreateWebhookEventInput {
  eventId: string;
  event: string;
}

class WebhookEventRepository {
  async exists(eventId: string): Promise<boolean> {
    const result = await db.query(
      `
      SELECT 1
      FROM webhook_events
      WHERE event_id = $1
      LIMIT 1
      `,
      [eventId]
    );

    return result.rows.length > 0;
  }

  async create({
    eventId,
    event,
  }: CreateWebhookEventInput): Promise<void> {
    await db.query(
      `
      INSERT INTO webhook_events (
        event_id,
        event
      )
      VALUES ($1, $2)
      `,
      [eventId, event]
    );
  }
}

export default new WebhookEventRepository();