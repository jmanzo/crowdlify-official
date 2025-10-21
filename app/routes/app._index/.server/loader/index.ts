import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../../../../shopify.server";
import { getProjects } from '../../../../models/Project.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
  
    const projects = await getProjects(session.shop);
    
    return {
        payload: projects
    };
};