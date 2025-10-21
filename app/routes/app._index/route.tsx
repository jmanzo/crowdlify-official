import {
  useLoaderData,
  useNavigate,
  type HeadersFunction,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { loader } from "./.server/loader";

import { $APP } from '../../constants/app/app';

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
          <s-table>
            <s-table-header-row>
              <s-table-header>Name</s-table-header>
              <s-table-header>Status</s-table-header>
              <s-table-header>Created</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {
                projects?.map((project) => (
                  <s-table-row key={project.id}>
                    <s-table-cell>
                      <s-link href={`/app/projects/${project.id}`}>{ project.name }</s-link>
                    </s-table-cell>
                    <s-table-cell>{ project.status }</s-table-cell>
                    <s-table-cell>{ new Date(project.createdAt).toLocaleDateString() }</s-table-cell>
                  </s-table-row>
                ))
              }
            </s-table-body>
          </s-table>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
