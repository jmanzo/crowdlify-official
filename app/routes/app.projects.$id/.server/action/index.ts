import type { ActionFunctionArgs } from "react-router";

import { authenticate } from 'app/shopify.server';
import db from 'app/db.server';
import { handleApiError } from "app/utils/handleApiErrors";
import { isProjectPayload } from "app/types/predicates/isProjectPayload";
import { upload } from "app/models/CSVUpload.server";
import { validateProjectData } from "app/helpers";

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);
    const { shop } = session;

    try {
        const formData = Object.fromEntries(await request.formData());
        
        if (formData.action === "delete") {
            await db.project.delete({ where: { id: Number(params.id) } });
            return redirect("/app");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, csvData, ...formFields } = formData || {};
        const data = {
            ...formFields,
            shop,
            popupStatus: Boolean(formFields.popupStatus)
        };

        if (isProjectPayload(data)) {
            const errors = await validateProjectData(data);

            if (errors) {
                return handleApiError({ status: 422, errors });
            }

            const project = params.id === "new"
                ? await db.project.create({ data })
                : await db.project.update({
                    where: { id: Number(params.id) }, data
                });
            
            if (csvData) {
                await upload(project.id, csvData);
            }
        
            return redirect(`/app/projects/${project.id}`);
        }

        return handleApiError({
            status: 404,
            errors: ['Data has bad formatting']
        });
    } catch (error) {
        return handleApiError({
            status: 500,
            errors: error,
        })
    }
}