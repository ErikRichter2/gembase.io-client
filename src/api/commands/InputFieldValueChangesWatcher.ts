export class InputFieldValueChangesWatcher {
    private static _watchers = new Map<HTMLInputElement, InputFieldValueChangesWatcher>();
    private readonly _initialValue: string;
    private readonly _callback: (handler: InputFieldValueChangesWatcher) => void;
    private readonly _el: HTMLInputElement;
    readonly data: any;
    private _wasCommit = false;

    constructor(el: HTMLInputElement,
                data: any,
                initialValue: string,
                callback: (handler: InputFieldValueChangesWatcher) => void) {
        this._initialValue = initialValue;
        this._callback = callback;
        this._el = el;
        this.data = data;
        this._el.addEventListener('focusout', InputFieldValueChangesWatcher.onFocusOut);
    }

    static update(
        eventTarget: EventTarget | null,
        data: any,
        initialValue: string,
        callback: (handler: InputFieldValueChangesWatcher) => void) {
        if (eventTarget === null) {
            return;
        }
        const el = (eventTarget as HTMLInputElement);
        let handler = this._watchers.get(el);
        if (handler === undefined) {
            handler = new InputFieldValueChangesWatcher(el, data, initialValue, callback);
            this._watchers.set(el, handler);
        }
    }

    private static onFocusOut(event: FocusEvent) {
        if (event.target === undefined) {
            return;
        }
        const el = (event.target as HTMLInputElement);
        InputFieldValueChangesWatcher._watchers.get(el)?.commit();
    }

    get initialValue(): string {
        return this._initialValue;
    }

    get value(): string {
        return this._el.value;
    }

    private commit() {
        if (this._wasCommit) {
            return;
        }
        this._wasCommit = true;
        InputFieldValueChangesWatcher._watchers.delete(this._el);
        this._el.removeEventListener('focusout', InputFieldValueChangesWatcher.onFocusOut);
        if (this._callback !== null) {
            this._callback(this);
        }
    }
}