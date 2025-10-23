import type { Project } from "@prisma/client";

export const isProjectPayload = (data: unknown): data is ProjectPayload => {
    return typeof data === "object" &&
        data !== null && 'name' in data && 'shop' in data &&
        'status' in data;
}

export type ProjectPayload = {
    popupStatus?: boolean;
    id?: number;
} & Omit<Project, 'platform' | 'createdAt' | 'updatedAt'>