import { MessageType } from './MessageType';
import Util from '../../app/Util';
import { CloseEventClass } from './CloseEventClass';

export class Message {
    public static parse(buffer: ArrayBuffer): Message {
        const view = new Uint8Array(buffer);
        const dataView = new DataView(buffer);

        const type: MessageType = view[0];
        const channelId = dataView.getUint32(1, true); // true for little-endian
        const data: ArrayBuffer = buffer.slice(5);

        return new Message(type, channelId, data);
    }

    public static fromCloseEvent(id: number, code: number, reason?: string): Message {
        const reasonBuffer = reason ? Util.stringToUtf8ByteArray(reason) : new Uint8Array(0);
        const buffer = new ArrayBuffer(2 + 4 + reasonBuffer.byteLength);
        const dataView = new DataView(buffer);
        const uint8View = new Uint8Array(buffer);
        
        dataView.setUint16(0, code, true); // true for little-endian
        if (reasonBuffer.byteLength) {
            dataView.setUint32(2, reasonBuffer.byteLength, true);
            uint8View.set(reasonBuffer, 6);
        }
        return new Message(MessageType.CloseChannel, id, buffer);
    }

    public static createBuffer(type: MessageType, channelId: number, data?: ArrayBuffer | Uint8Array): ArrayBuffer {
        const dataLength = data ? (data instanceof Uint8Array ? data.byteLength : data.byteLength) : 0;
        const result = new ArrayBuffer(5 + dataLength);
        const view = new Uint8Array(result);
        const dataView = new DataView(result);
        
        view[0] = type;
        dataView.setUint32(1, channelId, true); // true for little-endian
        
        if (data && dataLength) {
            if (data instanceof Uint8Array) {
                view.set(data, 5);
            } else {
                view.set(new Uint8Array(data), 5);
            }
        }
        return result;
    }

    public constructor(
        public readonly type: MessageType,
        public readonly channelId: number,
        public readonly data: ArrayBuffer,
    ) {}

    public toCloseEvent(): CloseEvent {
        let code: number | undefined;
        let reason: string | undefined;
        if (this.data && this.data.byteLength) {
            const dataView = new DataView(this.data);
            code = dataView.getUint16(0, true); // true for little-endian
            
            if (this.data.byteLength > 6) {
                const length = dataView.getUint32(2, true);
                const slice = new Uint8Array(this.data.slice(6, 6 + length));
                reason = Util.utf8ByteArrayToString(slice);
            }
        }
        return new CloseEventClass('close', {
            code,
            reason,
            wasClean: code === 1000,
        });
    }

    public toBuffer(): ArrayBuffer {
        return Message.createBuffer(this.type, this.channelId, this.data);
    }
}
