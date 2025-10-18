import prisma from "../db.server";

export async function getProject(id: number) {
    const project = await prisma.project.findUnique({
        where: { id }
    });

    if (!project) return null;

    return project;
}