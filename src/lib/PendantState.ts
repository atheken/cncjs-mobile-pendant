export class StateConnectionSettings {
    port:string
    autoconnect: boolean = false
}

export default class PendantState{
    private static  instance: PendantState
    private static readonly statekey = "mobilependantstate";
    static load() : PendantState {
        
        if(!PendantState.instance){
            PendantState.instance = new PendantState();
            var storedState = localStorage.getItem(PendantState.statekey);
            if(storedState){
                PendantState.instance = Object.assign(PendantState.instance, JSON.parse(storedState));
            }
        }
        
        return PendantState.instance
    }

    private constructor(){}

    connection= new StateConnectionSettings()

    save() {
        localStorage.setItem(PendantState.statekey, JSON.stringify(this));
    }
}