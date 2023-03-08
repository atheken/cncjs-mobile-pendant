import type SerialPort from '../api/SerialPort';

export default interface StartupEvent {
	loadedcontrollers: string[];
	baudrates: number[];
	ports: SerialPort[];
}
