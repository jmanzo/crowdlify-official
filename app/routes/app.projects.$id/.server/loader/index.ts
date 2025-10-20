import { LoaderFunctionArgs } from "react-router";

import { getProject } from "../../../../models/Project.server";
import { authenticate } from "../../../../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  if (params.id !== "new") {
    const project = await getProject(Number(params.id));

    if (project)
      return { payload: project };
  }
    
  return {
    payload: {
      name: "",
      image: "",
      description: "",
      message: "Here goes your message.",
      createdBy: "Author",
      firmness: "🎨 Set your variant",
      label: "Color",
      question: "Select your color for this project",
      status: "DRAFT"
    }
  };
};
