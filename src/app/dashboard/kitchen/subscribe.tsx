"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";

const POLLING_FALLBACK_MS = 8000;

export function KitchenSubscriber({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const pusher = getPusherClient();
    if (pusher) {
      const channel = pusher.subscribe(`restaurant-${restaurantId}`);
      const refresh = () => router.refresh();
      channel.bind("order:created", refresh);
      channel.bind("order:updated", refresh);
      channel.bind("service-request:created", refresh);
      channel.bind("service-request:resolved", refresh);
      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`restaurant-${restaurantId}`);
      };
    }

    // Fallback : polling toutes les 8s si Pusher pas configuré
    const id = window.setInterval(() => router.refresh(), POLLING_FALLBACK_MS);
    return () => window.clearInterval(id);
  }, [restaurantId, router]);

  return null;
}
