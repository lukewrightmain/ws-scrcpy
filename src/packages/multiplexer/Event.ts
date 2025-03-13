export class Event2 {
    // Static constants need to be literal numbers for TypeScript 5.8 compatibility
    static readonly NONE = 0;
    static readonly CAPTURING_PHASE = 1;
    static readonly AT_TARGET = 2;
    static readonly BUBBLING_PHASE = 3;

    public cancelable: boolean;
    public bubbles: boolean;
    public composed: boolean;
    public type: string;
    public defaultPrevented: boolean;
    public timeStamp: number;
    public target: EventTarget | null;
    public readonly isTrusted: boolean = true;
    
    // Instance constants must be literal numbers for TypeScript 5.8
    readonly AT_TARGET: 2 = 2;
    readonly BUBBLING_PHASE: 3 = 3;
    readonly CAPTURING_PHASE: 1 = 1;
    readonly NONE: 0 = 0;
    
    // Typed as EventTarget to match DOM Event interface
    public currentTarget: EventTarget | null = null;

    constructor(type: string, options = { cancelable: true, bubbles: true, composed: false }) {
        const { cancelable, bubbles, composed } = { ...options };
        this.cancelable = !!cancelable;
        this.bubbles = !!bubbles;
        this.composed = !!composed;
        this.type = `${type}`;
        this.defaultPrevented = false;
        this.timeStamp = Date.now();
        this.target = null;
    }

    stopImmediatePropagation(): void {
        // this[kStop] = true;
    }

    preventDefault(): void {
        this.defaultPrevented = true;
    }

    get srcElement(): EventTarget | null {
        return this.target;
    }

    composedPath(): EventTarget[] {
        return this.target ? [this.target] : [];
    }
    
    get returnValue(): boolean {
        return !this.defaultPrevented;
    }
    
    get eventPhase(): 0 | 1 | 2 | 3 {
        return this.target ? Event2.AT_TARGET : Event2.NONE;
    }
    
    get cancelBubble(): boolean {
        return false;
        // return this.propagationStopped;
    }
    
    set cancelBubble(value: boolean) {
        if (value) {
            this.stopPropagation();
        }
    }
    
    stopPropagation(): void {
        // this.propagationStopped = true;
    }
    
    initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
        this.type = type;
        if (arguments.length > 1) {
            this.bubbles = !!bubbles;
        }
        if (arguments.length > 2) {
            this.cancelable = !!cancelable;
        }
    }
}

export const EventClass = typeof Event !== 'undefined' ? Event : Event2;
