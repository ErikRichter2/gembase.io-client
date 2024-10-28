import IListenerObject from "@/api/listeners/IListenerObject";
import IListenerContainer from "@/api/listeners/IListenerContainer";

export default class ListenerObject<T> implements IListenerObject {
    private _callback: ((data: T) => void) | null = null;
    private _parent: IListenerContainer;

    constructor(parent: IListenerContainer, callback: (data: T) => void) {
        this._callback = callback;
        this._parent = parent;
    }

    dispatch(data: T) {
        if (this._callback !== null) {
            this._callback(data);
        }
    }

    unsubscribe() {
        this._callback = null;
        this._parent.unsubscribe(this);
    }
}
