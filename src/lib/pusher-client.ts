"use client";

import PusherJs from "pusher-js";

let _client: PusherJs | null = null;

export function getPusherClient(): PusherJs | null {
  if (typeof window === "undefined") return null;
  if (_client) return _client;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;

  _client = new PusherJs(key, { cluster, forceTLS: true });
  return _client;
}
