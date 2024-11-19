import AppAsyncComponent from "@crema/components/AppAsyncComponent";
import AppPage from "@crema/core/AppLayout/AppPage";

const ContactUs = AppAsyncComponent(
  () => import("../modules/dashboards/contact-us"),
  { ssr: false }
);
export default AppPage(() => <ContactUs />);
