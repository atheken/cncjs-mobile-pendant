import type { AXES, ControllerType } from './Constants';

export default interface MachinePreference {
	id: string;
	probes: ProbeDefinition[];
	spindle_options: SpindleOptions[];
	type: ControllerType;
	serial_port: string;
	auto_connect: boolean;
	use_hardware_flow_control: boolean;
}

export interface MobilePendantPreferences {
	jog_unit: UnitSelector;
	jog_increments: number[];
	machine_preferences: MachinePreference[];
}

export enum UnitSelector {
	in = 'G20',
	mm = 'G21'
}

export interface ProbeDefinition {
	axis: AXES;
	command: 'G38.2' | 'G38.3' | 'G38.4' | 'G38.5';
	depth: number;
	feedrate: number;
	touchplate_thickness: number;
	retraction: number;
	execute_probe_on_tool_change: boolean;
}

export enum SpindleOptions {
	/**
	 * Allows setting the spindle speed (should be accompanied by a number: `S100`, etc).
	 */
	S,
	/**
	 * Turn on the spindle clockwise
	 */
	M3,
	/**
	 * Turn on the spindle counter-clockwise
	 */
	M4,
	/**
	 * Turn the spindle off.
	 */
	M5,

	/**
	 * Turn on coolant (mist)
	 */
	M7,
	/**
	 * Turn on coolant (flood)
	 */
	M8,
	/**
	 * Turn off coolant.
	 */
	M9
}
