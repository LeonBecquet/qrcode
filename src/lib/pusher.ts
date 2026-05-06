import Pusher from "pusher";
import { env } from "@/lib/env";

let _pusher: Pusher | null = null;

function getPusher(): Pusher | null {
  if (_pusher) return _pusher;
  if (
    !env.PUSHER_APP_ID ||
    !env.PUSHER_KEY ||
    !env.PUSHER_SECRET ||
    !env.PUSHER_CLUSTER
  ) {
    return null;
  }
  _pusher = new Pusher({
    appId: env.PUSHER_APP_ID,
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: env.PUSHER_CLUSTER,
    useTLS: true,
  });
  return _pusher;
}

export function restaurantChannel(restaurantId: string): string {
  return `restaurant-${restaurantId}`;
}

export function publicTableChannel(tableId: string): string {
  return `table-${tableId}`;
}

export type RestaurantEvent =
  | "order:created"
  | "order:updated"
  | "service-request:created"
  | "service-request:resolved";

export type TableEvent = "order:updated";

/**
 * Trigger un event sur le canal du resto pour notifier le staff.
 * No-op silencieux si Pusher pas configuré (le polling client compense).
 */
export async function triggerRestaurantEvent(
  restaurantId: string,
  event: RestaurantEvent,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(restaurantChannel(restaurantId), event, payload);
  } catch (err) {
    console.error("[pusher] trigger restaurant failed:", err);
  }
}

/**
 * Trigger un event sur le canal d'une table (pour le suivi client).
 */
export async function triggerTableEvent(
  tableId: string,
  event: TableEvent,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(publicTableChannel(tableId), event, payload);
  } catch (err) {
    console.error("[pusher] trigger table failed:", err);
  }
}
