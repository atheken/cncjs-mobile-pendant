import io from "socket.io-client";
import { writable, type Writable } from "svelte/store";

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

export class Controller {

    socket: io.socket;
    token : Promise<string>;
    ports = writable<SerialPort[]>([])

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
        this.socket.connect();
    }

    refresh_serial_list() {
        this.socket.emit("list");
        console.info("requested serial list update");
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