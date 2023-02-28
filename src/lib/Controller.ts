import io from "socket.io-client";
import { writable, get } from "svelte/store";
import { ulid } from 'ulid';

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

export class Controller {
    close_connection(): any {
        this.socket.emit("close", get(this.active_port)?.port)
    }
    open_connection(selected: SerialPort) {
        this.socket.emit("open", selected.port, { controllerType : "Grbl", "baudrate" : 115200 })    
    }

    private controller_id = ulid();

    socket: io.socket;
    token : Promise<string>;
    ports = writable<SerialPort[]>([])
    active_port = writable<SerialPort>(null)

    constructor(){
        this.configure()
    }

    async configure(){
        
        this.token = new Promise(async (resolve, reject)=>{
            try{
            let token = null;
            let cnc = JSON.parse(localStorage.getItem("cnc") || "{}");
            token ||= cnc?.state?.session?.token;
            if(!token){
                let result = await (await fetch("../signin", {method : "POST"})).json() as SigninResult
                token = result.token;
            }
            resolve(token);
            }catch(err){
                reject(err);
            }
        });

        let t = await this.token;

        this.socket = new io({
            autoConnect : false,
            query : {
            token: t,
        }});

        this.socket.on("serialport:list", p => {
            this.ports.set(p)
        });
        this.socket.emit("probe");
        this.refresh_serial_list();


        // dump all packets to the debug console for inspection.
        this.socket.on("connection", function(packet, next){
            console.debug(packet);
            next();
        });

        this.socket.on("serialport:open", f => {
             this.active_port.set(f);
             this.write("$$");
        });

        this.socket.on("serialport:close", () => {
            this.active_port.set(null);
            this.refresh_serial_list();
        });

        this.socket.on("serialport:read", s=> {console.debug(s) })

        this.socket.connect();
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
            let results = await fetch('../api/commands', { headers : {
                "Authorization" : `Bearer ${await this.token}`
            }});
            return await results.json();
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }
}