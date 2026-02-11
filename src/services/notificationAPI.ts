/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import type { Notification } from "@/types/notification.types";

export const notificationAPI = {
    getAll: async (): Promise<Notification[]> => {
        try {
            return await api.get<Notification[]>(`/api/Notification/user`);
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    },
    markasRead: async (id: number): Promise<void> => {
        try {
            await api.put<void>(`/api/Notification/read/${id}`);
        } catch (error: any) {
            console.error("Error marking notifications as read:", error);
        }
    },
    markAllRead: async (): Promise<void> => {
        try {
            await api.put<void>(`/api/Notification/read-all`);
        } catch (error: any) {
            console.error("Error marking notifications as read:", error);
        }
    },
    deleteAll: async (): Promise<void> => {
        try {
            await api.delete<void>(`/api/Notification/all`);
        } catch (error: any) {
            console.error("Error deleting notifications:", error);
        }
    },
};