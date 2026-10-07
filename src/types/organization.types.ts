export interface AreaPart {
  id: number
  areaPartName: string
  departmentId: number
  departmentName: string
  factoryPartId: number
  factoryPartName: string
  machineCount: number
}

export interface Machine {
  id: number
  machineName: string
  areaPartId: number
  areaPartName: string
  departmentId: number
  departmentName: string
  factoryPartId: number
  factoryPartName: string
  managementCode?: string
  modelMachine?: string
  serialNumber?: string
  dateInput?: string
  vendor?: string
  images?: string[]
}

export interface Plant {
  id: number
  plantName: string
  factoryPartCount?: number
}

export interface FactoryPart {
  id: number
  factoryPartName: string
  plantId: number
  plantName?: string
  departmentCount?: number
}

export interface Department {
  id: number
  departmentName: string
  factoryPartId: number
  factoryPartName?: string
  areaPartCount?: number
}
