import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ReactPhotoGallery = asyncComponent(
  () => import("../../../modules/thirdParty/reactPhotoGallery"),
  { ssr: false }
);
export default AppPage(() => <ReactPhotoGallery />);
