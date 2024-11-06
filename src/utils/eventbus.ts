/** How to use this eventbus
 * import { useEventBus, EventNames } from '@/utils/eventBus';

// In setup:
const eventBus = useEventBus();

// Emit events
eventBus.emit(EventNames.COMPONENT_UPDATED, componentData);

// Listen to events
eventBus.on(EventNames.COMPONENT_SELECTED, (component) => {
  // Handle event
});

// Or use the composable helper
useEventListener(EventNames.THEME_CHANGED, (isDark) => {
  // Handle theme change
});
 */

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, watch } from 'vue';

interface EventBus {
    emit: (event: string, ...args: any[]) => void;
    on: (event: string, callback: Function) => void;
    off: (event: string, callback: Function) => void;
}

class EventBusImpl implements EventBus {
    private events: Map<string, Set<Function>>;

    constructor() {
        this.events = new Map();
    }

    emit(event: string, ...args: any[]) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    }

    on(event: string, callback: Function) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(callback);
    }

    off(event: string, callback: Function) {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.events.delete(event);
            }
        }
    }
}

// Create a singleton instance
const eventBus = new EventBusImpl();

// Composable for using event bus in components
export function useEventBus() {
    return eventBus;
}

// Event names constants to avoid typos
export const EventNames = {
    COMPONENT_CODE_UPDATED: 'component:code-updated',
    COMPONENT_SELECTED: 'component:selected',
    COMPONENT_DELETED: 'component:deleted',
    COMPONENT_CREATED: 'component:created',
    COMPONENT_UPDATED: 'component:updated',
    VERSION_RESTORED: 'version:restored',
    PREVIEW_RESIZE: 'preview:resize',
    SIDEBAR_TOGGLE: 'sidebar:toggle',
    VERSION_HISTORY_TOGGLE: 'version-history:toggle',
    TAB_CHANGED: 'tab:changed',
    THEME_CHANGED: 'theme:changed',
} as const;

// Type for event names
export type EventName = typeof EventNames[keyof typeof EventNames];

// Helper composable for reactive event listening
export function useEventListener(event: EventName, callback: Function) {
    const cleanup = ref<Function | null>(null);

    watch(() => event, (newEvent, oldEvent) => {
        if (cleanup.value) {
            cleanup.value();
            cleanup.value = null;
        }

        if (newEvent) {
            eventBus.on(newEvent, callback);
            cleanup.value = () => eventBus.off(newEvent, callback);
        }
    }, { immediate: true });

    return () => {
        if (cleanup.value) {
            cleanup.value();
            cleanup.value = null;
        }
    };
}

export default eventBus;
