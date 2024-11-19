import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Blog = asyncComponent(() => import("../../../modules/extraPages/Blog"));
export default AppPage(() => <Blog />);
