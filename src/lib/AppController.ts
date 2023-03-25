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
import type {
	ControllerInfo,
	ControllerSettings,
	WorkflowState
} from './models/api/ControllerInfo';
import type MacroInfo from './models/api/MacroInfo';
import type { MobilePendantPreferences } from './models/local/MachinePreference';
import type MachineDefinition from './models/api/MachineDefinition';
//import { io } from '../global';

export type ConnectionStatus =
	| 'disconnected'
	| 'connected'
	| 'error'
	| 'pending';

export class AppController {
	public static async Initialize(): Promise<AppController> {
		var c = new AppController();
		await c.configure();
		return c;
	}

	private _active_port = writable<ConnectionSettings>(null);

	private _client_id = ulid();
	private _socket: io.socket;
	private _token: string;

	private _macros = writable<ListingResponse<MacroInfo>>({ records: [] });
	private _commands = writable<ListingResponse<CommandInfo>>({ records: [] });
	private _mdi_commands = writable<ListingResponse<MachineDeviceInterface>>({
		records: []
	});

	private _machines = writable<ListingResponse<MachineDefinition>>({
		records: []
	});
	private _controllers = writable<ControllerInfo[]>([]);
	private _ports = writable<SerialPort[]>([]);
	private _sender_status = writable<SenderStatus>(null);
	private _controller_state = writable<ControllerState>(null);
	private _workflow_state = writable<WorkflowState>(null);
	private _controller_settings = writable<ControllerSettings>(null);
	private _feeder_status = writable<FeederStatus>(null);
	private _serial_connection_status =
		writable<ConnectionStatus>('disconnected');
	private _server_connection_status =
		writable<ConnectionStatus>('disconnected');

	private _preferences = writable<MobilePendantPreferences>();

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
					return current;
				}
			}
			return null;
		}
	);

	get active_port(): Readable<ConnectionSettings> {
		return this._active_port;
	}

	get ports(): Readable<SerialPort[]> {
		return this._ports;
	}

	get server_connection_status(): Readable<ConnectionStatus> {
		return this._server_connection_status;
	}

	get serial_connection_status(): Readable<ConnectionStatus> {
		return this._serial_connection_status;
	}

	async get_state(key: string = ''): Promise<any> {
		try {
			return await this.request_json(
				'/api/state?' + new URLSearchParams({ key })
			);
		} catch {
			console.log(`State for key ${key} not found, returning null.`);
			return null;
		}
	}

	async set_state(key: string = '', payload: any): Promise<any> {
		return await this.request_json(
			'/api/state?' + new URLSearchParams({ key }),
			'POST',
			{ body: JSON.stringify(payload) }
		);
	}

	get pendant_prefs(): Readable<MobilePendantPreferences> {
		return this._preferences;
	}

	async save_pendant_prefs(prefs: MobilePendantPreferences) {
		await this.set_state('mobile_pendant_prefs', prefs);
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

	jog(
		x: number,
		y: number,
		z: number,
		multiplier: number,
		mode: 'relative' | 'absolute'
	) {
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
		this.cncjs_command('command', get(this._active_port)?.port, 'gcode:stop', {
			force: true
		});
	}

	load_gcode(file: string, contents: string = null) {
		if (contents != null) {
			this.cncjs_command(
				'command',
				get(this._active_port)?.port,
				'gcode:load',
				file,
				contents
			);
		} else {
			this.cncjs_command(
				'command',
				get(this._active_port)?.port,
				'watchdir:load',
				file
			);
		}
	}

	close_connection(): any {
		this.cncjs_command('close', get(this._active_port)?.port);
	}

	open_connection(settings: ConnectionSettings) {
		this._serial_connection_status.set('pending');
		this.cncjs_command('open', settings.port, settings);
		this._active_port.set(settings);
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

	get macros(): Readable<ListingResponse<MacroInfo>> {
		return this._macros;
	}

	get machines(): Readable<ListingResponse<MachineDefinition>> {
		return this._machines;
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
		this.cncjs_command(
			'command',
			get(this._active_port)?.port,
			'gcode',
			record.command
		);
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

	execute_macro(macro: MacroInfo) {
		let p = get(this._active_port)?.port;
		let controller = get(this._controller);
		if (controller?.port) {
			this._socket.emit(
				'command',
				controller?.port,
				'macro:run',
				macro.id,
				controller?.sender?.context
			);
		}
	}

	private async configure() {
		try {
			await this.load_token();

			this.configure_socketio();

			this._socket.on('serialport:list', async (ports: SerialPort[]) => {
				this._ports.set(ports);
				let currentport = get(this._active_port)?.port;

				// if none of the ports match the one
				// we're currently on, we need update our state to no longer reference it..
				if (!ports.find((p) => p.port == currentport)) {
					this._active_port.set(null);
				}
				this._controllers.set(await this.request_json('/api/controllers'));
			});

			this._socket.on('config:change', async () => {
				await this.load_config();
			});

			await this.load_config();

			// listen for generic events so that this will handle them.
			['task:start', 'task:finish', 'task:error', 'message'].forEach((r) =>
				this._socket.on(r, (p) => console.debug({ name: r, payload: p }))
			);

			//// The following events should be used to update the machine controller:

			//this._socket.on('gcode:load', (name, _) => this._loaded_gcode.set(name));
			//this._socket.on('gcode:unload', () => this._loaded_gcode.set(null));

			this._socket.on('feeder:status', (f) => this._feeder_status.set(f));
			this._socket.on('sender:status', (s) => this._sender_status.set(s));
			this._socket.on('controller:state', (_, state) =>
				this._controller_state.set(state)
			);
			this._socket.on('workflow:state', (s) =>
				this._workflow_state.set({ state: s })
			);
			this._socket.on('controller:settings', (s) =>
				this._controller_settings.set(s)
			);

			// listen for connection events, these will establish this client as a serial port listener.
			this._server_connection_status.subscribe((k) => {
				let port = get(this._active_port);
				if (k == 'connected' && port?.port) {
					this.open_connection(port);
				}
				this.refresh_serial_list();
			});

			this.configure_serialport_handling();

			this._socket.connect();
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Load the Commands, MDI, and Macros from the API.
	 */
	private async load_config() {
		this._commands.set(
			await this.request_json(
				`/api/commands?${new URLSearchParams({ pagination: 'false' })}`
			)
		);
		this._mdi_commands.set(
			await this.request_json(
				`/api/mdi?${new URLSearchParams({ pagination: 'false' })}`
			)
		);
		this._macros.set(
			await this.request_json(
				`/api/macros?${new URLSearchParams({ pagination: 'false' })}`
			)
		);

		let x = await this.get_state('mobile_pendant_prefs');
		this._preferences.set(x);

		this._machines.set(
			await this.request_json(
				`/api/machines?${new URLSearchParams({ pagination: 'false' })}`
			)
		);
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

		let response = await fetch(url, options);

		if (response.status < 400) {
			return (await response.json()) as T;
		} else if (response.status == 404) {
			return null;
		} else {
			throw `Request failed with status: [${response.status}] '${response.statusText}')`;
		}
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
			let result = (await (
				await fetch('/api/signin', { method: 'POST' })
			).json()) as SigninResponse;
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

		let io_events = {
			error: [
				'connect_error',
				'connect_timeout',
				'error',
				'reconnect_error',
				'reconnect_failed'
			],
			connected: ['reconnect', 'connect'],
			pending: ['reconnect_attempt', 'reconnecting'],
			disconnected: ['disconnect']
		};

		Object.keys(io_events).forEach((key: ConnectionStatus) => {
			io_events[key].forEach((event) =>
				this._socket.on(event, () => this._server_connection_status.set(key))
			);
		});
	}

	/** Configures serial ports event handling. */
	private configure_serialport_handling() {
		this._socket.on('serialport:change', (f: SerialPort) => {
			// if (f?.inuse) {
			// 	this._active_port.set(f);
			// } else {
			// 	this._active_port.set(null);
			// }
		});

		////Do we want to stream the serial port content to the screen?
		//['serialport:write'];

		this._socket.on('serialport:error', (f) => {
			if (f.port == get(this._active_port)?.port) {
				this._serial_connection_status.set('error');
			}
		});

		this._socket.on('serialport:close', async (f) => {
			if (f.port == get(this._active_port)?.port) {
				this._serial_connection_status.set('disconnected');
				this._active_port.set(null);
				this.refresh_serial_list();
				this._controllers.set(await this.request_json('/api/controllers'));
			}
		});

		this._socket.on('serialport:change', async () =>
			this._controllers.set(await this.request_json('/api/controllers'))
		);

		this._socket.on('serialport:open', async (s) => {
			if (s.port == get(this._active_port)?.port) {
				this._serial_connection_status.set('connected');
			}
			this._controllers.set(await this.request_json('/api/controllers'));
		});
	}

	/**
	 * Private, because this object must be configured asyncronously.
	 */
	private constructor() {
		// the object should be called with "configure()" before use. Use "Initialize" to construct one.
	}
}
