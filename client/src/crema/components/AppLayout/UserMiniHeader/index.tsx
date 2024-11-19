import React from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import AppContentView from "../../AppContentView";
import AppThemeSetting from "../../AppThemeSetting";
import clsx from "clsx";
import { FooterType, LayoutType } from "@crema/constants/AppEnums";
import AppFooter from "../components/AppFooter";
import { useLayoutContext } from "@crema/context/AppContextProvider/LayoutContextProvider";
import {
  StyledAppLayoutMinibar,
  StyledAppLayoutMinibarMain,
  StyledUserMiniHeaderScrollbar,
} from "./index.styled";
import { RouterConfigData } from "@crema/types/models/Apps";

type Props = {
  children: React.ReactNode;
  routesConfig: RouterConfigData[];
};
const UserMiniHeader: React.FC<Props> = ({ children, routesConfig }) => {
  const { footer, layoutType, footerType } = useLayoutContext();

  return (
    <StyledAppLayoutMinibar
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
        boxedLayout: layoutType === LayoutType.BOXED,
      })}
    >
      <AppSidebar routesConfig={routesConfig} />
      <StyledAppLayoutMinibarMain className="app-layout-userMiniHeader-main">
        <AppHeader />
        <StyledUserMiniHeaderScrollbar>
          <AppContentView>{children}</AppContentView>
          <AppFooter />
        </StyledUserMiniHeaderScrollbar>
      </StyledAppLayoutMinibarMain>
      <AppThemeSetting />
    </StyledAppLayoutMinibar>
  );
};

export default UserMiniHeader;
