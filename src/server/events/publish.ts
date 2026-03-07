import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { DomainEvent, DomainEventType } from "@/server/events/types";

type EventHandler = (event: DomainEvent) => void;

const MAX_RECENT_EVENTS = 250;

const globalStore = globalThis as typeof globalThis & {
  __bdGpsEventBus?: EventEmitter;
  __bdGpsEventHistory?: DomainEvent[];
};

const bus = globalStore.__bdGpsEventBus ?? new EventEmitter();
const history = globalStore.__bdGpsEventHistory ?? [];

if (!globalStore.__bdGpsEventBus) {
  bus.setMaxListeners(200);
  globalStore.__bdGpsEventBus = bus;
}
if (!globalStore.__bdGpsEventHistory) {
  globalStore.__bdGpsEventHistory = history;
}

export function createDomainEvent<T extends DomainEventType>(
  type: T,
  institutionId: string,
  payload: Extract<DomainEvent, { type: T }>["payload"],
): Extract<DomainEvent, { type: T }> {
  return {
    id: randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    institutionId,
    payload,
  } as Extract<DomainEvent, { type: T }>;
}

export function publishDomainEvent(event: DomainEvent) {
  history.push(event);
  if (history.length > MAX_RECENT_EVENTS) {
    history.splice(0, history.length - MAX_RECENT_EVENTS);
  }
  bus.emit("domain-event", event);
  bus.emit(`domain-event:${event.type}`, event);
}

export function subscribeDomainEvents(
  types: DomainEventType[],
  onEvent: EventHandler,
): () => void {
  const listener = (event: DomainEvent) => {
    if (types.includes(event.type)) {
      onEvent(event);
    }
  };

  bus.on("domain-event", listener);

  return () => {
    bus.off("domain-event", listener);
  };
}

export function getRecentDomainEvents(
  institutionId: string,
  types: DomainEventType[],
  since?: string,
  limit = 50,
) {
  const sinceMs = since ? Date.parse(since) : 0;

  return history
    .filter((event) => event.institutionId === institutionId)
    .filter((event) => types.includes(event.type))
    .filter((event) => (sinceMs ? Date.parse(event.timestamp) > sinceMs : true))
    .slice(-Math.max(1, Math.min(limit, 100)));
}
