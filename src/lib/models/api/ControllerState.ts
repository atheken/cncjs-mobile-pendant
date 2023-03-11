import type * as constants from './Constants';

export default interface ControllerState {
	status: {
		activeState: constants.GrblActiveStates | constants.SmoothieActiveStates | constants.TinygActiveStates;
		mpos: {
			x: number;
			y: number;
			z: number;
		};
		wpos: {
			x: number;
			y: number;
			z: number;
		};
		ov: number[];
		subState: number;
		wco: {
			x: string;
			y: string;
			z: string;
		};
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
			cooland: string;
		};
		tool: string;
		feedrate: string;
		spindle: string;
	};
}
