import { Readable, ReadableOptions } from 'stream';

// Implement a subset of fs.ReadStream interface
export class ReadStream extends Readable {
    private _bytesRead = 0;
    private _closed = false;
    private _path: string;
    
    constructor(path: string, opts?: ReadableOptions) {
        super(opts);
        this._path = path;
    }
    
    public get bytesRead(): number {
        return this._bytesRead;
    }
    
    public get path(): string {
        return this._path;
    }
    
    public push(chunk: any, encoding?: string): boolean {
        if (chunk) {
            this._bytesRead += chunk.length;
        }
        return super.push(chunk, encoding as any);
    }

    public close(): void {
        if (!this._closed) {
            this._closed = true;
            this.destroy();
        }
    }
    
    // Add pending property for fs.ReadStream compatibility
    public get pending(): boolean {
        return false;
    }
}
