export class ConnectionSettings {
	port: string;
	autoconnect: boolean = false;
	baudrate: number;
	/**
	 * Enable or disable hardware flow control.
	 */
	rtscts: boolean = false;
	controllerType: 'Grbl' | 'TinyG' | 'Marlin' | 'Smoothie' = 'Grbl';
}
