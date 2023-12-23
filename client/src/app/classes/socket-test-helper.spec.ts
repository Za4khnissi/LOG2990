/* eslint-disable @typescript-eslint/no-explicit-any */
import { SocketTestHelper } from './socket-test-helper';

describe('SocketTestHelper', () => {
    let socketTestHelper: SocketTestHelper;
    const event = 'test';
    const unregisteredEvent = 'unregistered';
    const callback1 = jasmine.createSpy();
    const callback2 = jasmine.createSpy();

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketTestHelper.on(event, callback1);
        socketTestHelper.on(event, callback2);
    });

    it('should create an instance', () => {
        expect(socketTestHelper).toBeTruthy();
    });

    it('should register a callback for an event', () => {
        socketTestHelper.on(event, callback1);
        expect(socketTestHelper['callbacks'].get(event)).toContain(callback1);
    });

    it('should emit an event', () => {
        expect(() => socketTestHelper.emit(event)).not.toThrow();
    });

    it('should not call any callbacks for an unregistered event', () => {
        const callbackSpy = spyOn(callback1, 'call' as any).and.callThrough();
        socketTestHelper.emit(`${unregisteredEvent}`, '{}');
        expect(callbackSpy).not.toHaveBeenCalled();
    });

    it('should not call any callbacks for an unregistered event', () => {
        const callbackSpy = spyOn(callback1, 'call' as any).and.callThrough();
        socketTestHelper.peerSideEmit(`${unregisteredEvent}`, '{}');
        expect(callbackSpy).not.toHaveBeenCalled();
    });

    it('should disconnect', () => {
        expect(() => socketTestHelper.disconnect()).not.toThrow();
    });

    it('should call all callbacks for an event', () => {
        const params = { test: true };
        socketTestHelper.peerSideEmit(event, params);
        expect(callback1).toHaveBeenCalledWith(params);
        expect(callback2).toHaveBeenCalledWith(params);
    });

    it('should call all callbacks for an event with an empty string if no params are provided', () => {
        socketTestHelper.peerSideEmit(event);
        expect(callback1).toHaveBeenCalledWith('');
        expect(callback2).toHaveBeenCalledWith('');
    });
});
