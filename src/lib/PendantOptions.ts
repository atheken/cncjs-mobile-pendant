export interface ProbeOption {
    axis:string
    command: string
    depth: number,
    feedrate: number,
    touchPlateThickness: number,
    retractionDistance: number,
    applyToolOffset: boolean
}

export class PendantOptions {
    probes:ProbeOption[]
    showDebug = true
}