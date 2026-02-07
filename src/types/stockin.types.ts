// stockin.types.ts
import type { User } from "./user.types"
import type { Item } from "./item.types"

export interface StockinDetail {
    id: number
    stockInId: number
    itemId: number
    quantity: number
    stockIn: Stockin | null
    item: Item
}

export interface Stockin {
    id: number
    accountId: number
    stockInDate: string
    note: string
    image: string[]
    account: User
    stockInDetails: StockinDetail[]
}

export interface CreateStockinDetail {
    itemId: number
    quantity: number
}

export interface CreateStockin {
    note: string
    items: CreateStockinDetail[]
}