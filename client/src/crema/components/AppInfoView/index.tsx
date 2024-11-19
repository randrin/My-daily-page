import React, { useEffect } from "react";
import { message } from "antd";

import AppLoader from "../AppLoader";

import {
  useInfoViewActionsContext,
  useInfoViewContext,
} from "@crema/context/AppContextProvider/InfoViewContextProvider";

const AppInfoView = () => {
  const { loading, error, displayMessage } = useInfoViewContext();
  const { clearInfoView } = useInfoViewActionsContext();

  useEffect(() => {
    if (error) {
      message.error(error);
      clearInfoView();
    }
  }, [error]);

  useEffect(() => {
    if (displayMessage) {
      message.success(displayMessage);
      clearInfoView();
    }
  }, [displayMessage]);

  return <>{loading ? <AppLoader /> : null}</>;
};

export default AppInfoView;
