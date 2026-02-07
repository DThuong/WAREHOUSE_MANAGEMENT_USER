import type { User } from "./user.types";

export interface Notification{
    id: number
    message: string
    type: string
    accountId: number
    isRead: boolean
    createdAt: string
    account: User
}