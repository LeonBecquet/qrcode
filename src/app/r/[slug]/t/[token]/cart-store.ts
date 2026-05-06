"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CartLineOption = {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  priceDeltaCents: number;
};

export type CartLine = {
  lineId: string;
  itemId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  quantity: number;
  options: CartLineOption[];
};

export type Cart = { lines: CartLine[] };

const EMPTY: Cart = { lines: [] };

function storageKey(token: string): string {
  return `qr_cart_${token}`;
}

function load(token: string): Cart {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Cart;
    if (!Array.isArray(parsed?.lines)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function save(token: string, cart: Cart) {
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(cart));
  } catch {
    // ignore quota / private mode
  }
}

export function lineUnitPriceCents(line: CartLine): number {
  return line.priceCentsSnapshot + line.options.reduce((s, o) => s + o.priceDeltaCents, 0);
}

export function lineSubtotalCents(line: CartLine): number {
  return lineUnitPriceCents(line) * line.quantity;
}

export function cartTotalCents(cart: Cart): number {
  return cart.lines.reduce((s, l) => s + lineSubtotalCents(l), 0);
}

export function cartItemCount(cart: Cart): number {
  return cart.lines.reduce((s, l) => s + l.quantity, 0);
}

class CartStore {
  private subscribers = new Set<() => void>();
  private snapshot: Cart = EMPTY;
  private hydrated = false;

  constructor(private token: string) {
    if (typeof window !== "undefined") {
      this.snapshot = load(token);
      this.hydrated = true;
    }
  }

  readonly subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    if (typeof window !== "undefined" && !this.hydrated) {
      this.snapshot = load(this.token);
      this.hydrated = true;
    }
    return () => {
      this.subscribers.delete(callback);
    };
  };

  readonly getSnapshot = (): Cart => this.snapshot;
  readonly getServerSnapshot = (): Cart => EMPTY;

  private notify() {
    for (const sub of this.subscribers) sub();
  }

  isHydrated(): boolean {
    return this.hydrated;
  }

  private mutate(next: Cart) {
    this.snapshot = next;
    save(this.token, next);
    this.notify();
  }

  addLine(line: Omit<CartLine, "lineId">) {
    this.mutate({
      lines: [...this.snapshot.lines, { ...line, lineId: crypto.randomUUID() }],
    });
  }

  updateQuantity(lineId: string, quantity: number) {
    this.mutate({
      lines: this.snapshot.lines
        .map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    });
  }

  removeLine(lineId: string) {
    this.mutate({
      lines: this.snapshot.lines.filter((l) => l.lineId !== lineId),
    });
  }

  clear() {
    this.mutate(EMPTY);
  }
}

const stores = new Map<string, CartStore>();

function getStore(token: string): CartStore {
  let store = stores.get(token);
  if (!store) {
    store = new CartStore(token);
    stores.set(token, store);
  }
  return store;
}

export function useCart(token: string) {
  const store = getStore(token);
  const cart = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const addLine = useCallback(
    (line: Omit<CartLine, "lineId">) => store.addLine(line),
    [store],
  );
  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => store.updateQuantity(lineId, quantity),
    [store],
  );
  const removeLine = useCallback((lineId: string) => store.removeLine(lineId), [store]);
  const clear = useCallback(() => store.clear(), [store]);

  return {
    cart,
    hydrated: store.isHydrated(),
    addLine,
    updateQuantity,
    removeLine,
    clear,
    totalCents: cartTotalCents(cart),
    itemCount: cartItemCount(cart),
  };
}
