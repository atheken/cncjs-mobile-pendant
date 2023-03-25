export enum AXES {
	X = 'X',
	Y = 'Y',
	Z = 'Z',
	A = 'A',
	B = 'B',
	C = 'C'
}

// Imperial System
export const IMPERIAL_UNITS = 'in';
export const IMPERIAL_STEPS = [
	0.0001,
	0.0002,
	0.0003,
	0.0005,
	0.001,
	0.002,
	0.003,
	0.005,
	0.01,
	0.02,
	0.03,
	0.05,
	0.1,
	0.2,
	0.3,
	0.5,
	1, // Default
	2,
	3,
	5,
	10,
	20
];

// Metric System
export const METRIC_UNITS = 'mm';
export const METRIC_STEPS = [
	0.001,
	0.002,
	0.003,
	0.005,
	0.01,
	0.02,
	0.03,
	0.05,
	0.1,
	0.2,
	0.3,
	0.5,
	1, // Default
	2,
	3,
	5,
	10,
	20,
	30,
	50,
	100,
	200,
	300,
	500
];

// Controller
export enum ControllerType {
	GRBL = 'Grbl',
	MARLIN = 'Marlin',
	SMOOTHIE = 'Smoothie',
	TINYG = 'TinyG'
}

// Workflow State
export enum WorkflowState {
	IDLE = 'idle',
	PAUSED = 'paused',
	RUNNING = 'running'
}

// Grbl Active State
export enum GrblActiveStates {
	IDLE = 'Idle',
	RUN = 'Run',
	HOLD = 'Hold',
	DOOR = 'Door',
	HOME = 'Home',
	SLEEP = 'Sleep',
	ALARM = 'Alarm',
	CHECK = 'Check'
}

// Smoothie Active State
export enum SmoothieActiveStates {
	IDLE = 'Idle',
	RUN = 'Run',
	HOLD = 'Hold',
	DOOR = 'Door',
	HOME = 'Home',
	ALARM = 'Alarm',
	CHECK = 'Check'
}

export enum TinygActiveStates {
	// TinyG Machine State
	// https://github.com/synthetos/g2/wiki/Status-Reports#stat-values
	INITIALIZING = 0, // Machine is initializing
	READY = 1, // Machine is ready for use
	ALARM = 2, // Machine is in alarm state
	STOP = 3, // Machine has encountered program stop
	END = 4, // Machine has encountered program end
	RUN = 5, // Machine is running
	HOLD = 6, // Machine is holding
	PROBE = 7, // Machine is in probing operation
	CYCLE = 8, // Reserved for canned cycles (not used)
	HOMING = 9, // Machine is in a homing cycle
	JOG = 10, // Machine is in a jogging cycle
	INTERLOCK = 11, // Machine is in safety interlock hold
	SHUTDOWN = 12, // Machine is in shutdown state. Will not process commands
	PANIC = 13 // Machine is in panic state. Needs to be physically reset
}
