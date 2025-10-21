import { ProjectStatus } from "@prisma/client"

type ProjectsTableProp = {
    projects: {
        id: number;
        name: string;
        status: ProjectStatus;
        createdAt: Date;
    }[]
}

export const ProjectsTable = ({ projects }: ProjectsTableProp) => (
    <s-table>
        <s-table-header-row>
        <s-table-header listSlot="primary">Name</s-table-header>
        <s-table-header listSlot="primary">Status</s-table-header>
        <s-table-header listSlot="primary">Created</s-table-header>
        </s-table-header-row>
        <s-table-body>
        {projects?.map((project) => (
            <s-table-row key={project.id}>
                <s-table-cell>
                <s-link href={`/app/projects/${project.id}`}>{ project.name }</s-link>
                </s-table-cell>
                <s-table-cell>{ project.status }</s-table-cell>
                <s-table-cell>{ new Date(project.createdAt).toLocaleDateString() }</s-table-cell>
            </s-table-row>
        ))}
        </s-table-body>
    </s-table>
)