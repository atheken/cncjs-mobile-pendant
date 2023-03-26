import type { Readable } from 'svelte/store';
import type MachinePreference from './models/local/MachinePreference';

export class InterfacePreferences {}

export default class PreferencesController {
	async saveMachinePreference(pref: Partial<MachinePreference>) {
		throw 'Not Implemented';
	}
	async saveInterfacePreferences(pref: Partial<InterfacePreferences>) {
		throw 'Not Implemented';
	}

	get interfacePreference(): Readable<InterfacePreferences> {
		throw 'Not implemented';
	}

	machinePreference(machineId: string): Readable<MachinePreference> {
		throw '';
	}
}
