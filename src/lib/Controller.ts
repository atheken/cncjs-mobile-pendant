import { io, Socket } from "socket.io-client";

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
    path : string
    manufacturer : string
}

export class StartupEvent {
    loadedcontrollers : string[]
    baudrates: number[]
    ports: SerialPort[]
}

export class Controller {

    socket: Socket;
    token: Promise<string>
    ports: Promise<SerialPort[]> = new Promise(f=>f)

    constructor(){
        this.token = new Promise(async (resolve, reject)=>{
            try{
            let token = null;
            let cnc = JSON.parse(localStorage.getItem("cnc") || "{}");
            token ||= cnc?.state?.session?.token;
            if(!token){
                let result = await (await fetch("../signin", {method : "POST"})).json() as SigninResult
                token = result.token;
            }
            resolve(token)
            }catch(err){
                reject(err);
            }
        });

        this.socket.on("startup",f => {
            this.ports = this.ports.then(p=> (JSON.parse(f) as StartupEvent).ports);
        });

        this.socket.on("serialport:list", p=> this.ports = this.ports.then(f=> JSON.parse(p) as SerialPort[]))

        // get token from local storage or request
        // a new one from the socket.io server.
    }

    refresh_list() {
        this.socket.emit("list");
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