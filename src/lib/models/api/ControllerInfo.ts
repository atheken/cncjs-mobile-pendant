import type { FeederStatus } from '../../AppController';
import type SenderStatus from './SenderStatus';

export interface Coordinate {
	x: string;
	y: string;
	z: string;
}

export default class ControllerInfo {
	port: string;

	baudrate: number;
	rtscts: boolean;
	sockets: string[];
	ready: boolean;
	controller: {
		type: 'Grbl' | 'Marlin' | 'Smoothie' | 'TinyG';
		settings: {
			version: string;
			parameters: any;
			/**
			 * An object containing each of the lines produced from a '$$' command.
			 */
			settings: object;
		};
		state: {
			status: {
				activeState: 'Idle' | 'Running';
				mpos: Coordinate;
				wpos: Coordinate;
				/**
				 * The overrides for feed, spindle, and rapid.
				 */
				ov: [number, number, number];
				subState: number;
				wco: Coordinate;
				feedrate: number;
				spindle: number;
			};
			parserstate: {
				modal: {
					motion: string;
					wcs: string;
					plane: string;
					units: string;
					distance: string;
					feedrate: string;
					program: string;
					spindle: string;
					coolant: string;
				};
				tool: string;
				feedrate: string;
				spindle: string;
			};
		};
	};
	feeder: FeederStatus;
	sender: SenderStatus;
	workflow: {
		state: 'idle' | 'running';
	};
}
