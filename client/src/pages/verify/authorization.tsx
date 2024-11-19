import asyncComponent from "@crema/components/AppAsyncComponent";

const VerifyAuthorization = asyncComponent(
  () => import("../../modules/auth/VerifyAuthorization")
);
export default VerifyAuthorization;
