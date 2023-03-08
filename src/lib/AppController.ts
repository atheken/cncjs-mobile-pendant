import io from 'socket.io-client';
import { ulid } from 'ulid';
import type { ConnectionSettings } from './models/local/ConnectionSettings';
import DirectoryListing from './models/local/DirectoryListing';
import type MachineDeviceInterface from './models/api/MachineDeviceInterface';
import type CommandInfo from './models/api/CommandInfo';
import type SerialPort from './models/api/SerialPort';
import type SigninResponse from './models/api/SigninResponse';
import type ListingResponse from './models/api/ListingResponse';
import { derived, get, writable, type Readable } from 'svelte/store';
import type SenderStatus from './models/api/SenderStatus';
import type ControllerState from './models/api/ControllerState';
import type FeederStatus from './models/api/FeederStatus';
import type { ControllerInfo, ControllerSettings, WorkflowState } from './models/api/ControllerInfo';

export class AppController {
	public static async Initialize(): Promise<AppController> {
		var c = new AppController();
		await c.configure();
		return c;
	}

	private _active_port = writable<SerialPort>(null);

	private _client_id = ulid();
	private _socket: io.socket;
	private _token: string;

	private _macros = writable<any[]>();
	private _commands = writable<ListingResponse<CommandInfo>>({ records: [] });
	private _mdi_commands = writable<ListingResponse<MachineDeviceInterface>>({ records: [] });
	private _controllers = writable<ControllerInfo[]>([]);
	private _ports = writable<SerialPort[]>([]);
	private _sender_status = writable<SenderStatus>(null);
	private _controller_state = writable<ControllerState>(null);
	private _workflow_state = writable<WorkflowState>(null);
	private _controller_settings = writable<ControllerSettings>(null);
	private _feeder_status = writable<FeederStatus>(null);

	// private _senderStatus = writable<SenderStatus>(null);
	// private _controllerState = writable<ControllerState>(null);

	private _controller = derived(
		[
			this._controllers,
			this._active_port,
			this._sender_status,
			this._controller_state,
			this._workflow_state,
			this._controller_settings,
			this._feeder_status
		],
		([controllers, port, sender, cstate, wstate, settings, feeder]) => {
			if (port) {
				let current = controllers?.find((c) => c.port == port?.port);
				if (current) {
					//patch the current settings.
					current.controller.state = cstate || current.controller.state;
					current.controller.settings = settings || current.controller.settings;

					current.sender = sender || current.sender;
					current.workflow = wstate || current.workflow;
					current.feeder = feeder || current.feeder;
					return Object.assign({}, current);
				}
			}
			return null;
		}
	);

	connected_to_server = writable<boolean>(false);

	get active_port(): Readable<SerialPort> {
		return this._active_port;
	}

	get ports(): Readable<SerialPort[]> {
		return this._ports;
	}

	async get_state(key: string = ''): Promise<any> {
		return await this.request_json('/api/state?' + new URLSearchParams({ key }));
	}

	start_or_resume_gcode() {
		let onhold = get(this._controller)?.sender?.hold;
		let port = get(this._active_port)?.port;
		if (port) {
			if (onhold) {
				this.cncjs_command('command', port, 'gcode:resume');
			} else {
				this.cncjs_command('command', port, 'gcode:start');
			}
		}
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

	pause_gcode() {
		this.cncjs_command('command', get(this._active_port)?.port, 'gcode:pause');
	}

	unload_gcode() {
		this.cncjs_command('command', get(this._active_port)?.port, 'gcode:unload');
	}

	stop_gcode() {
		this.cncjs_command('command', get(this._active_port)?.port, 'gcode:stop', { force: true });
	}

	load_gcode(file: string, contents: string = null) {
		if (contents != null) {
			this.cncjs_command('command', get(this._active_port)?.port, 'gcode:load', file, contents);
		} else {
			this.cncjs_command('command', get(this._active_port)?.port, 'watchdir:load', file);
		}
	}

	close_connection(): any {
		this.cncjs_command('close', get(this._active_port)?.port);
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

	get commands(): Readable<ListingResponse<CommandInfo>> {
		return this._commands;
	}

	get mdi_commands(): Readable<ListingResponse<MachineDeviceInterface>> {
		return this._mdi_commands;
	}

	get macros(): Readable<any[]> {
		return this._macros;
	}

	//#region commands
	write(command: string, appendNewline: boolean = false) {
		if (get(this._active_port)?.port) {
			let write = appendNewline ? 'writeln' : 'write';
			this.cncjs_command(write, get(this._active_port)?.port, command, {
				_sender_: this._client_id
			});
		}
	}

	home() {
		this.cncjs_command('command', get(this._active_port)?.port, 'homing');
	}

	feedhold() {
		this.cncjs_command('feedhold', get(this._active_port)?.port, 'feedhold');
	}

	unlock() {
		this.cncjs_command('command', get(this._active_port)?.port, 'unlock');
	}

	reset() {
		this.cncjs_command('command', get(this._active_port)?.port, 'reset');
	}

	sleep() {
		this.cncjs_command('command', get(this._active_port)?.port, 'sleep');
	}

	cncjs_command(command, ...params: any[]) {
		this._socket.emit(command, ...params);
	}

	cycle_start() {
		this.cncjs_command('command', get(this._active_port)?.port, 'cyclestart');
	}

	async execute_command(record: CommandInfo) {
		await this.request_json(`/api/commands/run/${record.id}`, 'POST');
	}

	execute_mdi(record: MachineDeviceInterface) {
		this.cncjs_command('command', get(this._active_port)?.port, 'gcode', record.command);
	}

	//#endregion

	async list_files(path: string = ''): Promise<DirectoryListing> {
		var result = await this.request_json('/api/watch/files', 'POST', {
			body: JSON.stringify({ path })
		});
		var retval = Object.assign(new DirectoryListing(), result);
		return retval;
	}

	get controller(): Readable<ControllerInfo> {
		return this._controller;
	}

	private async configure() {
		try {
			await this.load_token();

			this.configure_socketio();

			this._socket.on('serialport:list', async (ports: SerialPort[]) => {
				this._ports.set(ports);
				this._active_port.set(ports.find((p) => p.inuse));
				this._controllers.set(await this.request_json('/api/controllers'));
			});

			// initialize serial list.
			this.refresh_serial_list();

			this._socket.on('config:change', async () => {
				await this.load_config();
			});

			await this.load_config();

			// listen for generic events so that this will handle them.
			['task:start', 'task:finish', 'task:error', 'serialport:error', 'serialport:write', 'message'].forEach((r) =>
				this._socket.on(r, (p) => console.debug({ name: r, payload: p }))
			);

			//// The following events should be used to update the machine controller:

			//this._socket.on('gcode:load', (name, _) => this._loaded_gcode.set(name));
			//this._socket.on('gcode:unload', () => this._loaded_gcode.set(null));

			this._socket.on('feeder:status', (f) => this._feeder_status.update(f));
			this._socket.on('sender:status', (s) => this._sender_status.update(s));
			this._socket.on('controller:state', (_, state) => this._controller_state.update(state));
			this._socket.on('workflow:state', (s) => this._workflow_state.update(s));
			this._socket.on('controller:settings', (s) => this._controller_settings.update(s));
			this._socket.on('serialport:change', async () =>
				this._controllers.update(await this.request_json('/api/controllers'))
			);
			this._socket.on('serialport:open', async () =>
				this._controllers.update(await this.request_json('/api/controllers'))
			);

			this.configure_serialport_handling();

			this.configure_update_timers();

			this._socket.connect();
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Periodically polls for updated informationf from the server.
	 */
	private configure_update_timers() {
		//setInterval(() => this.write('?'), 3000);
		//setInterval(async () => this._controllers.set(await this.request_json('/api/controllers')), 1000);
	}

	/**
	 * Load the Commands, MDI, and Macros from the API.
	 */
	private async load_config() {
		this._commands.set(await this.request_json(`/api/commands?${new URLSearchParams({ pagination: 'false' })}`));
		this._mdi_commands.set(await this.request_json('/api/mdi'));
		this._macros.set(await this.request_json('/api/macros'));
	}

	/**
	 * A helper method for getting content from the API.
	 * @param url The Api to call.
	 * @param method The http method to use.
	 * @param options Request options, per the standard Fetch API.
	 * @returns
	 */
	private async request_json<T>(
		url: string | RequestInfo,
		method: 'GET' | 'POST' = 'GET',
		options: RequestInit = {}
	): Promise<T> {
		let h = new Headers();
		h.set('Authorization', `Bearer ${this._token}`);
		h.set('Content-Type', 'application/json');
		options.headers = h;
		options.method = method;

		return (await (await fetch(url, options)).json()) as T;
	}

	/**
	 * Loads the token from the local storage context. If it's not set,
	 * the app automatically handles redirects to a signin page.
	 */
	private async load_token() {
		let token = null;
		let cnc = JSON.parse(localStorage.getItem('cnc') || '{}');
		token ||= cnc?.state?.session?.token;
		if (!token) {
			let result = (await (await fetch('/api/signin', { method: 'POST' })).json()) as SigninResponse;
			token = result.token;
		}

		this._token = token;
	}

	/** Configures socket.io and will set a connection status that can be monitored by the UI. */
	private configure_socketio() {
		this._socket = new io({
			autoConnect: false,
			query: {
				token: this._token
			}
		});

		// set the overall socket status to connected.
		this._socket.on('connect', () => this.connected_to_server.set(true));

		//TODO: configure listening for disconnects/reconnects, etc.

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
	}

	/** Configures serial ports event handling. */
	private configure_serialport_handling() {
		this._socket.on('serialport:open', (f) => {
			this._active_port.set(f);
		});

		this._socket.on('serialport:change', (f: SerialPort) => {
			// this code is potentially hazardous, as it is making an assumption that
			// cncjs is only connected to a single port, which may not be true
			if (f?.inuse) {
				this._active_port.set(f);
				// this.write('?');
				// this.write('$');
			} else {
				this._active_port.set(null);
			}
		});

		this._socket.on('serialport:error', (f) => {
			//this._active_port.set(f);
		});

		//this._socket.on('controller:state', (_, g) => this._controller_state.set(g));

		this._socket.on('serialport:close', () => {
			this._active_port.set(null);
			this.refresh_serial_list();
		});
	}

	/**
	 * Private, because this object must be configured asyncronously.
	 */
	private constructor() {
		// the object should be called with "configure()" before use. Use "Initialize" to construct one.
	}
}
