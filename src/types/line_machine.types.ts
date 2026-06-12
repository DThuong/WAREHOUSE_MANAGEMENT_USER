export interface Line {
  id: number
  lineName: string
  areaPart: string
  machines: Machine[] | null
}

export interface Machine {
  id: number
  machineName: string
  lineId: number

  // Có API trả line, có API trả null, có API không trả field này
  line?: Line | null

  // POST /api/Machines đang trả lineName: null
  lineName?: string | null
}

// POST /api/Lines
export interface CreateLineRequest {
  lineName: string
  areaPart: string
}

// PUT /api/Lines/{id}
// Backend hiện tại chỉ nhận lineName
export interface UpdateLineRequest {
  lineName: string
}

// POST + PUT /api/Machines/{id}
export interface CreateAndUpdateMachineRequest {
  machineName: string
  lineId: number
}

// Nếu source cũ đang import chữ thường thì giữ alias này để không lỗi nhiều chỗ
export type line = Line
export type machine = Machine
export type createAndUpdateMachineRequest = CreateAndUpdateMachineRequest

// Cũ của bạn chỉ có lineName, nhưng POST Line bây giờ cần areaPart.
// Không nên dùng alias này cho cả create/update nữa.
export type createAndUpdateLineRequest = UpdateLineRequest
