import { useLoaderData } from "react-router";
import { loader } from "./.server/loader";

export { loader };

export default function Proxy() {
  const { shop, loggedInCustomerId } = useLoaderData();

  return <div>{`Hello world from ${loggedInCustomerId || "not-logged-in"} on ${shop}`}</div>;
}