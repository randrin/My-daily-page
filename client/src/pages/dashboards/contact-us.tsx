import asyncComponent from "@crema/components/AppAsyncComponent";
import AppPage from "@crema/core/AppLayout/AppPage";

const ContactUs = asyncComponent(
  () => import("../../modules/dashboards/contact-us")
);
export default AppPage(() => <ContactUs />);
