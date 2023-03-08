import io from 'socket.io-client';
import { writable, get, type Readable } from 'svelte/store';
import { ulid } from 'ulid';
import type { ConnectionSettings } from './ConnectionSettings';
import DirectoryListing from './models/local/DirectoryListing';
import type MachineDeviceInterface from './models/api/MachineDeviceInterface';
import type CommandInfo from './models/api/CommandInfo';
import type SenderStatus from './models/api/SenderStatus';
import type SerialPort from './models/api/SerialPort';
import type SigninResponse from './models/api/SigninResponse';

export interface CommandQueryResult {
	records: CommandInfo[];
}

export interface ControllerState {
	status: {
		activeState: string;
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

export interface FeederStatus {
	hold: boolean;
	holdReason: string;
	queue: number;
	pending: boolean;
	changed: boolean;
}

export type ConnectionStatus = 'pending' | 'connected' | 'disconnected' | 'unknown';

export class AppController {
	private _controllers = writable(null);

	get controllers(): Readable<any> {
		return this._controllers;
	}

	jog(x: number, y: number, z: number, multiplier: number, mode: 'relative' | 'absolute') {
		let location = x != null ? `X${x * multiplier} ` : '';
		location += y != null ? `Y${y * multiplier} ` : '';
		location += z != null ? `Z${z * multiplier} ` : '';

		if (mode == 'absolute') {
			this.write(`G0 ${location} `);
		} else {
			//this seems like it could lead to a race condition,
			// but this is how it's done in the main cncjs.
			this.write('G91');
			this.write(`G0 ${location}`);
			this.write('G90');
		}
	}

	public static async Initialize(): Promise<AppController> {
		var c = new AppController();
		await c.configure();
		return c;
	}

	private _connection_status = writable<ConnectionStatus>('unknown');
	private _active_port = writable<SerialPort>(null);

	private _controller_id = ulid();
	private _socket: io.socket;
	private _token: string;
	private _macros = writable<any[]>();

	private _controller_state = writable<ControllerState>();
	private _sender_status = writable<SenderStatus>();
	private _feeder_status = writable<FeederStatus>();
	private _commands = writable<CommandQueryResult>();
	private _mdi_commands = writable<MachineDeviceInterface[]>();

	ports = writable<SerialPort[]>([]);

	get active_port(): Readable<SerialPort> {
		return this._active_port;
	}

	get connection_status(): Readable<ConnectionStatus> {
		return this._connection_status;
	}

	connected_to_server = writable<boolean>(false);

	async get_state(key: string = ''): Promise<any> {
		return await this.request_json('/api/state?' + new URLSearchParams({ key }));
	}

	start_or_resume_gcode() {
		// if (get(this.controller_state) == 'paused') {
		// 	this.cncjs_command('command', this.port_path, 'gcode:resume');
		// } else {
		// 	this.cncjs_command('command', this.port_path, 'gcode:start');
		// }
	}

	pause_gcode() {
		this.cncjs_command('command', this.port_path, 'gcode:pause');
	}

	unload_gcode() {
		this.cncjs_command('command', this.port_path, 'gcode:unload');
	}

	stop_gcode() {
		this.cncjs_command('command', this.port_path, 'gcode:stop', { force: true });
	}

	load_gcode(file: string, contents: string = null) {
		if (contents != null) {
			this.cncjs_command('command', this.port_path, 'gcode:load', file, contents);
		} else {
			this.cncjs_command('command', this.port_path, 'watchdir:load', file);
		}
	}

	close_connection(): any {
		this.cncjs_command('close', get(this.active_port)?.port);
	}
	open_connection(settings: ConnectionSettings) {
		this.cncjs_command('open', settings.port, {
			controllerType: settings.controller_type,
			baudrate: settings.baud_rate,
			rtscts: settings.enable_hardware_flow_control
		});
	}

	refresh_serial_list() {
		this.cncjs_command('list');
	}

	write(command: string, appendNewline: boolean = false) {
		if (get(this._active_port)?.port) {
			let write = appendNewline ? 'writeln' : 'write';
			this.cncjs_command(write, get(this.active_port)?.port, command, {
				_sender_: this._controller_id
			});
		}
	}

	get commands(): Readable<CommandQueryResult> {
		return this._commands;
	}

	get mdi_commands(): Readable<MachineDeviceInterface[]> {
		return this._mdi_commands;
	}

	get macros(): Readable<any[]> {
		return this._macros;
	}

	home() {
		this.cncjs_command('command', this.port_path, 'homing');
	}

	feedhold() {
		this.cncjs_command('feedhold', this.port_path, 'feedhold');
	}

	unlock() {
		this.cncjs_command('command', this.port_path, 'unlock');
	}

	reset() {
		this.cncjs_command('command', this.port_path, 'reset');
	}

	sleep() {
		this.cncjs_command('command', this.port_path, 'sleep');
	}

	cncjs_command(command, ...params: any[]) {
		this._socket.emit(command, ...params);
	}

	cycle_start() {
		this.cncjs_command('command', this.port_path, 'cyclestart');
	}

	async execute_command(record: CommandInfo) {
		await this.request_json(`/api/commands/run/${record.id}`, 'POST');
	}

	execute_mdi(record: MachineDeviceInterface) {
		this.cncjs_command('command', this.port_path, 'gcode', record.command);
	}

	async list_files(path: string = ''): Promise<DirectoryListing> {
		var result = await this.request_json('/api/watch/files', 'POST', {
			body: JSON.stringify({ path })
		});
		var retval = Object.assign(new DirectoryListing(), result);
		return retval;
	}

	get sender_status(): Readable<SenderStatus> {
		return this._sender_status;
	}

	get controller_state(): Readable<ControllerState> {
		return this._controller_state;
	}

	private constructor() {
		// the object should be called with "configure()" before use. Use "Initialize" to construct one.
	}

	public get feeder_status(): Readable<FeederStatus> {
		return this._feeder_status;
	}

	private async configure() {
		try {
			let token = null;
			let cnc = JSON.parse(localStorage.getItem('cnc') || '{}');
			token ||= cnc?.state?.session?.token;
			if (!token) {
				let result = (await (await fetch('/api/signin', { method: 'POST' })).json()) as SigninResponse;
				token = result.token;
			}

			this._token = token;

			this._socket = new io({
				autoConnect: false,
				query: {
					token
				}
			});

			this._socket.on('serialport:list', (ports: SerialPort[]) => {
				this.ports.set(ports);
				this._active_port.set(ports.find((p) => p.inuse));
			});

			// initialize serial list.
			this.refresh_serial_list();

			this._socket.on('config:change', async () => {
				await this.load_config();
			});

			await this.load_config();
			[
				'connect_error',
				'connect_timeout',
				'error',
				'disconnect',
				'reconnect',
				'reconnect_attempt',
				'reconnecting',
				'reconnect_error',
				'reconnect_failed'
			].forEach((f) => this._socket.on(f, () => this.connected_to_server.set(false)));

			// listen for generic events so that this will handle them.
			[
				'task:start',
				'task:finish',
				'task:error',
				'serialport:change',
				'serialport:error',

				'serialport:write',
				'message'
			].forEach((r) => this._socket.on(r, (p) => console.debug({ name: r, payload: p })));

			this._socket.on('feeder:status', (f) => this._feeder_status.set(f));

			//this._socket.on('gcode:load', (name, _) => this._loaded_gcode.set(name));
			//this._socket.on('gcode:unload', () => this._loaded_gcode.set(null));

			//ignored events:
			['controller:settings', 'workflow:state'];

			this._socket.on('message', (m) => {
				console.debug(m);
			});

			this._socket.on('connect', () => this.connected_to_server.set(true));

			this._socket.on('sender:status', (s) => this._sender_status.set(s));

			this._socket.on('serialport:open', (f) => {
				this._active_port.set(f);
			});

			setInterval(() => this.write('?'), 5000);

			setInterval(async () => this._controllers.set(await this.request_json('/api/controllers')), 5000);

			this._socket.on('serialport:change', (f: SerialPort) => {
				// this code is potentially hazardous, as it is making an assumption that
				// cncjs is only connected to a single port, which may not be true
				if (f?.inuse) {
					this._active_port.set(f);
					this.write('?');
					this.write('$');
				} else {
					this._active_port.set(null);
				}
			});

			this._socket.on('serialport:error', (f) => {
				//this._active_port.set(f);
			});

			this._socket.on('controller:state', (_, g) => this._controller_state.set(g));

			this._socket.on('serialport:close', () => {
				this._active_port.set(null);
				this.refresh_serial_list();
			});

			this._socket.connect();
		} catch (err) {
			throw err;
		}
	}

	private get port_path(): string {
		return get(this.active_port)?.port;
	}

	private async load_config() {
		this._commands.set(await this.request_json(`/api/commands?${new URLSearchParams({ pagination: 'false' })}`));
		this._mdi_commands.set((await this.request_json('/api/mdi')).records);
		this._macros.set((await this.request_json('/api/macros')).records);
	}

	private async request_json(
		url: string | RequestInfo,
		method: 'GET' | 'POST' = 'GET',
		options: RequestInit = {}
	): Promise<any> {
		let h = new Headers();
		h.set('Authorization', `Bearer ${this._token}`);
		h.set('Content-Type', 'application/json');
		options.headers = h;
		options.method = method;

		return await (await fetch(url, options)).json();
	}
}
