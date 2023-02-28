import io from "socket.io-client";
import { writable, get } from "svelte/store";
import { ulid } from 'ulid';
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

export class CommandRecord{
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

            ["connect_error", "connect_timeout", "error", "disconnect", "reconnect", "reconnect_attempt",
                "reconnecting", "reconnect_error", "reconnect_failed"]
                .forEach(f=> this.socket.on(f, ()=> this.connected_to_server.set(false) ))

            this.socket.on("connect", () => this.connected_to_server.set(true));

            this.socket.on("serialport:open", f => {
                this.active_port.set(f);
                this.write("$$");
            });

            this.socket.on("serialport:close", () => {
                this.active_port.set(null);
                this.refresh_serial_list();
            });

            this.socket.on("serialport:read", s=> {console.debug(s) })

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

    async commands() : Promise<CommandQueryResult> {
        try{
            let results = await fetch(`../api/commands?${new URLSearchParams({"pagination" : "false"})}`, { headers : {
                "Authorization" : `Bearer ${await this.token}`
            }});
            return await results.json();
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }

    async mdi_commands() : Promise<MachineDeviceInterface[]> {
        try{
            let results = await fetch('../api/mdi', { headers : {
                "Authorization" : `Bearer ${await this.token}`
            }});
            return (await results.json()).records;
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }

    async macros() : Promise<any[]> {
        try{
            let results = await fetch('../api/macros', { headers : {
                "Authorization" : `Bearer ${await this.token}`
            }});
            return (await results.json()).records;
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }

}