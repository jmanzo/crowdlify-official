import prisma from "../db.server";

export async function getProject(id: number) {
    const project = await prisma.project.findUnique({
        where: { id }
    });

    if (!project) return null;

    return project;
}

export async function getProjects(shop: string) {
    const project = await prisma.project.findMany({
        where: { shop },
        select: {
            id: true,
            name: true,
            status: true, 
            createdAt: true
        }
    });

    if (!project) return null;

    return project;
}