import React, { useEffect, useState } from "react";
import { Grid } from "antd";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import AppContentView from "../../AppContentView";
import AppThemeSetting from "../../AppThemeSetting";
import AppFooter from "../components/AppFooter";
import clsx from "clsx";
import { FooterType } from "@crema/constants/AppEnums";
import { isEmpty } from "@crema/helpers/Common";
import { useLayoutContext } from "@crema/context/AppContextProvider/LayoutContextProvider";
import {
  StyledAppLayout,
  StyledAppLayoutMain,
  StyledMainScrollbar,
} from "./index.styled";
import { RouterConfigData } from "@crema/types/models/Apps";

const { useBreakpoint } = Grid;

type Props = {
  children: React.ReactNode;
  routesConfig: RouterConfigData[];
};
const DefaultLayout: React.FC<Props> = ({ children, routesConfig }) => {
  const width = useBreakpoint();
  const [isCollapsed, setCollapsed] = useState(false);
  const { footer, footerType } = useLayoutContext();

  const onToggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (!isEmpty(width)) {
      if (width.xl) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    }
  }, [width]);

  return (
    <StyledAppLayout
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
      })}
    >
      <AppSidebar isCollapsed={isCollapsed} routesConfig={routesConfig} />
      <StyledAppLayoutMain className="app-layout-main">
        <AppHeader
          isCollapsed={isCollapsed}
          onToggleSidebar={onToggleSidebar}
        />
        <StyledMainScrollbar>
          <AppContentView>{children}</AppContentView>
          <AppFooter />
        </StyledMainScrollbar>
      </StyledAppLayoutMain>
      <AppThemeSetting />
    </StyledAppLayout>
  );
};

export default React.memo(DefaultLayout);
