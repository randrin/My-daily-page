import { UtilContextProvider } from "modules/apps/context/UtilContextProvider";
import React, { ReactNode } from "react";
import InfoViewContextProvider from "./InfoViewContextProvider";
import LayoutContextProvider from "./LayoutContextProvider";
import LocaleContextProvider from "./LocaleContextProvider";
import SidebarContextProvider from "./SidebarContextProvider";
import ThemeContextProvider from "./ThemeContextProvider";

type AppContextProviderProps = {
  children: ReactNode;
};

const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  return (
    <ThemeContextProvider>
      <LocaleContextProvider>
        <InfoViewContextProvider>
          <LayoutContextProvider>
            <UtilContextProvider>
              <SidebarContextProvider>{children}</SidebarContextProvider>
            </UtilContextProvider>
          </LayoutContextProvider>
        </InfoViewContextProvider>
      </LocaleContextProvider>
    </ThemeContextProvider>
  );
};

export default AppContextProvider;
