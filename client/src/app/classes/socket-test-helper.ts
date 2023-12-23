/* eslint-disable @typescript-eslint/no-explicit-any */
type CallbackSignature = (params: string) => void;
export class SocketTestHelper {
    private callbacks = new Map<string, CallbackSignature[]>();
    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)?.push(callback);
    }

    emit(event: string, ...params: string[]): void {
        const callbacks = this.callbacks.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            callback(params.join(' '));
        }
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: any): void {
        const callbacks = this.callbacks.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            callback(params || '');
        }
    }
}
