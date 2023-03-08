import { ConnectionSettings } from './ConnectionSettings';

export default class PendantState {
	private static _instance: PendantState;

	static get instance(): PendantState {
		if (!PendantState._instance) {
			PendantState._instance = new PendantState();
			var storedState = localStorage.getItem(PendantState.statekey);
			if (storedState) {
				PendantState._instance = Object.assign(PendantState._instance, JSON.parse(storedState));
			}
		}

		return PendantState._instance;
	}

	private static readonly statekey = 'mobilependantstate';

	private constructor() {}

	connection = new ConnectionSettings();

	save() {
		localStorage.setItem(PendantState.statekey, JSON.stringify(this));
	}
}
