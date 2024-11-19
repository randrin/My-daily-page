import asyncComponent from "@crema/components/AppAsyncComponent";

const TemporalPasswordUser = asyncComponent(
  () => import("../../modules/auth/TemporalPassword")
);
export default TemporalPasswordUser;
