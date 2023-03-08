// import type { Readable, Subscriber, Unsubscriber } from 'svelte/store';

// export interface ReadableStore<T> {
// 	subscribe(subscription: (value: T) => void): () => void;
// 	get value(): T;
// }

// type Sub<T> = { run: (T) => void; invalidate: T };

// export default class ValueStore<T> implements Readable<T> {
// 	private _subscriptions = [];

// 	subscribe(run: Subscriber<T>, invalidate?: (value?: T) => void): Unsubscriber {
// 		this._subscriptions.push(run);
// 		return () => {
// 			this._subscriptions = this._subscriptions.filter((k) => k == run);
// 		};
// 	}

// 	constructor(initialValue: T = null) {
// 		this._value = initialValue;
// 	}

// 	private _value: T;

// 	/**
// 	 * The current value of this store.
// 	 */
// 	get value(): T {
// 		return this._value;
// 	}
// 	set(value: T) {
// 		this._value = value;
// 		this._subscriptions.forEach((element) => {
// 			element(value);
// 		});
// 	}
// }
