import type ControllerState from './ControllerState';
import type FeederStatus from './FeederStatus';
import type SenderStatus from './SenderStatus';
import type * as constants from './Constants';


export interface Coordinate {
	x: string;
	y: string;
	z: string;
}

export interface WorkflowState {
	state: constants.WorkflowState
}

export interface ControllerSettings {
	version: string;
	parameters: any;
	/**
	 * An object containing each of the lines produced from a '$$' command.
	 */
	settings: object;
}

export interface ControllerInfo {
	port: string;
	baudrate: number;
	rtscts: boolean;
	sockets: string[];
	ready: boolean;
	controller: {
		type: constants.ControllerType
		settings: ControllerSettings;
		state: ControllerState;
	};
	feeder: FeederStatus;
	sender: SenderStatus;
	workflow: WorkflowState;
}
