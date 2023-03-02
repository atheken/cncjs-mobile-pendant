import io from "socket.io-client";
import { writable, get, type Writable, type Readable } from "svelte/store";
import { ulid } from 'ulid';
import DirectoryListing from "./DirectoryListing";
import type MachineDeviceInterface from "./MachineDeviceInterface";

export class Coordinate {
    X:number
    Y:number
    Z:number
}

export class MachineStatus {
    work_coordinate:Coordinate
    machine_coordinate:Coordinate
    loaded_file:string | null
    grbl_status: string | null
}

export class SerialPort {
    port : string
    manufacturer:string
    inuse = false
}

export class StartupEvent {
    loadedcontrollers : string[]
    baudrates: number[]
    ports: SerialPort[]
}

export interface CommandRecord{
    id: string
    mtime: number
    enabled: boolean
    title: string
    commands: string
}

export class CommandQueryResult {
    records: CommandRecord[] = []
}

export class SigninResult {
    enabled:boolean
    token: string
    name: string
}

export class WorkflowState{
    socket:io.socket;
    status = writable("unknown");

    constructor(socket:io.socket){
        this.socket = socket;
        this.socket?.on("workflow:state", f => {
            this.status.set(f);
        });
    }
}

export class Controller {
    private _commands = writable<CommandQueryResult>();
    private _mdi_commands = writable<MachineDeviceInterface[]>();

    public static async Initialize() : Promise<Controller> {
        var c = new Controller();
        await c.configure();
        return c;
    }

    close_connection(): any {
        this.socket.emit("close", get(this.active_port)?.port)
    }
    open_connection(selected: SerialPort) {
        this.socket.emit("open", selected.port, { controllerType : "Grbl", "baudrate" : 115200 })    
    }

    private controller_id = ulid();
    private socket: io.socket;
    private token:string;

    ports = writable<SerialPort[]>([])
    active_port = writable<SerialPort>(null)
    connected_to_server = writable<boolean>(false);
    workflow_state: WorkflowState;

    private constructor(){
        // the object should be called with "configure()" before use. Use "Initialize" to construct one.
    }

    private async configure(){
         try{
            let token = null;
            let cnc = JSON.parse(localStorage.getItem("cnc") || "{}");
            token ||= cnc?.state?.session?.token;
            if(!token){
                let result = await (await fetch("../signin", {method : "POST"})).json() as SigninResult
                token = result.token;
            }

            this.token = token;
            
            this.socket = new io({
                autoConnect : false,
                query : {
                token,
            }});

            this.socket.on("serialport:list", p => {
                this.ports.set(p)
            });
            
            // initialize serial list.
            this.refresh_serial_list();

            this.socket.on("config:change", async ()=>{
                this._commands.set(await this.request_json(`../api/commands?${new URLSearchParams({"pagination" : "false"})}`));
                this._mdi_commands.set((await this.request_json('../api/mdi')).records);
            });
            
            this._commands.set(await this.request_json(`../api/commands?${new URLSearchParams({"pagination" : "false"})}`));
            this._mdi_commands.set((await this.request_json('../api/mdi')).records);

            ["connect_error", "connect_timeout", "error", "disconnect", "reconnect", "reconnect_attempt",
                "reconnecting", "reconnect_error", "reconnect_failed"]
                .forEach(f=> this.socket.on(f, ()=> this.connected_to_server.set(false) ));

            // listen for generic events so that this will handle them.
            ["startup","config:change","task:start","task:finish","task:error","serialport:list","serialport:change",
                "serialport:open","serialport:close","serialport:error","serialport:read","serialport:write",
                "gcode:load","gcode:unload","feeder:status","sender:status","workflow:state",
                "controller:settings","controller:state","message"
            ].forEach(r => this.socket.on(r, p => console.debug({"name" : r, "payload" : p})));

            this.socket.on("connect", () => this.connected_to_server.set(true));

            this.socket.on("serialport:open", f => {
                this.active_port.set(f);
            });

            this.socket.on("serialport:close", () => {
                this.active_port.set(null);
                this.refresh_serial_list();
            });

            this.workflow_state = new WorkflowState(this.socket);

            this.socket.connect();
        
        }catch(err){
            throw err;
        }
    }

    refresh_serial_list() {
        this.socket.emit("list");
    }

    write(command:string, appendNewline: boolean = false){
        let write = appendNewline ? "writeln" : "write";
        this.socket.emit(write, get(this.active_port).port, command, { _sender_ : this.controller_id });
    }

    get commands(): Readable<CommandQueryResult>  { return this._commands; }
    
    get mdi_commands() : Readable<MachineDeviceInterface[]> { return this._mdi_commands; }

    home() {
        this.socket.emit("command", this.port_path, "homing")
    }

    feedhold() {
        this.socket.emit("feedhold", this.port_path, "feedhold")
    }
    
    unlock() {
        this.socket.emit("command", this.port_path, "unlock")
    }

    reset() {
        this.socket.emit("command", this.port_path, "reset")
    }

    sleep(){
        this.socket.emit("command", this.port_path, "sleep")
    }

    cycle_start(){
        this.socket.emit("command", this.port_path, "cyclestart")
    }

    async execute_command(record:CommandRecord){
        await this.request_json(`/api/commands/run/${record.id}`, "POST");
    }

    execute_mdi(record:MachineDeviceInterface){
        this.socket.emit("command", this.port_path, "gcode", record.command)
    }

    async list_files(path:string = "") : Promise<DirectoryListing> {
        var result = await this.request_json("/api/watch/files", "POST", {body: JSON.stringify({path})});
        var retval = Object.assign(new DirectoryListing(), result);
        return retval;
    }

    private get port_path(): string {return get(this.active_port)?.port }

    async macros() : Promise<any[]> {
        try{
            return (await this.request_json('../api/macros')).records;
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }

    async request_json(url:string|RequestInfo, method:"GET"|"POST" = "GET", options:RequestInit = {}) : Promise<any> {
        
        let h = new Headers();
        h.set("Authorization", `Bearer ${this.token}`);
        h.set("Content-Type" , "application/json");
        options.headers = h;
        options.method = method;
        
        return await (await fetch(url, options)).json();
    }
}