export class ConnectionSettings {
	port: string;
	autoconnect: boolean = false;
	baud_rate: number;
	enable_hardware_flow_control: boolean = false;
	controller_type: 'Grbl' | 'TinyG' | 'Marlin' | 'Smoothie' = 'Grbl';
}
