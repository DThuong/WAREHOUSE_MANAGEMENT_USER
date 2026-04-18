export interface line { // this is an array includes objects
    id: number
    lineName: string
    machines: machine[]
}

export interface createAndUpdateLineRequest {
    lineName: string
}

export interface createAndUpdateMachineRequest {
  machineName: string
  lineId: number
}

export interface machine {
    id: number
    machineName: string
    lineId: number
}