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

export class SerialDevice {
    device_name: string
    device_type = "grbl"
    baud_rate: 4800 | 9600 | 115200
    auto_connect: false
    use_error_correction: false
}


export class Controller {

    socket: Socket;
    token: Promise<string>

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
        // get token from local storage or request
        // a new one from the socket.io server.
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

    async list_devices(): Promise<SerialDevice[]> {
        return [];
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