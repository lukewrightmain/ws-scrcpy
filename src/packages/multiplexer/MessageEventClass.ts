import { Event2 } from './Event';

export class MessageEvent2 extends Event2 {
    public readonly data: any;
    public readonly origin: string;
    public readonly lastEventId: string;
    public readonly source: MessageEventSource | null;
    public readonly ports: ReadonlyArray<MessagePort>;
    
    constructor(
        type: string,
        { data = null, origin = '', lastEventId = '', source = null, ports = [] }: MessageEventInit = {},
    ) {
        super(type);
        this.data = data;
        this.origin = `${origin}`;
        this.lastEventId = `${lastEventId}`;
        this.source = source;
        this.ports = [...ports];
    }

    // Prefix unused parameters with underscore to indicate they're intentionally unused
    initMessageEvent(
        _type: string,
        _bubbles?: boolean,
        _cancelable?: boolean,
        _data?: any,
        _origin?: string,
        _lastEventId?: string,
        _source?: MessageEventSource | null,
        _ports?: MessagePort[],
    ): void {
        throw new Error('Deprecated method');
    }
}

export const MessageEventClass = typeof MessageEvent !== 'undefined' ? MessageEvent : MessageEvent2;
