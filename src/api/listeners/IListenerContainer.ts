import type IListenerObject from '@/api/listeners/IListenerObject'

export default interface IListenerContainer {
    unsubscribe(listener: IListenerObject): void
}
