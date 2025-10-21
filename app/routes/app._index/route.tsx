import {
  useLoaderData,
  useNavigate,
  type HeadersFunction,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { loader } from "./.server/loader";

import { $APP } from '../../constants/app/app';
import { EmptyState, ProjectsTable } from "./components";

export { loader };

export default function Index() {
  const navigate = useNavigate();
  const { payload: projects } = useLoaderData<typeof loader>();

  return (
    <s-page heading={`${$APP.APP_NAME} Application`}>
      <s-button variant="primary" slot="primary-action" onClick={() => navigate('/app/projects/new')}>
        Create Project
      </s-button>

      <s-section>
        <s-stack gap="base">
          {projects && projects.length > 0 ? (
            <ProjectsTable projects={projects} />
          ) : (
            <EmptyState />
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
