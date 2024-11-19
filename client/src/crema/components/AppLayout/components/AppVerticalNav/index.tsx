import React, { useEffect, useState } from "react";
import { getRouteMenus } from "./VerticalMenuUtils";
import clsx from "clsx";
import defaultConfig from "@crema/constants/defaultConfig";
import { useSidebarContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import { MenuStyle } from "@crema/constants/AppEnums";
import { StyledVerticalNav } from "./index.styled";
import { useRouter } from "next/router";
import { RouterConfigData } from "@crema/types/models/Apps";
import { useIntl } from "react-intl";

type Props = {
  routesConfig: RouterConfigData[];
};

const AppVerticalNav: React.FC<Props> = ({ routesConfig }) => {
  const { menuStyle, sidebarColorSet } = useSidebarContext();
  const { pathname } = useRouter();
  const selectedKeys = pathname.substr(1).split("/");
  const [openKeys, setOpenKeys] = useState([selectedKeys[0]]);

  useEffect(() => {
    setOpenKeys([selectedKeys[selectedKeys.length - 2]]);
  }, []);

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find(
      (key: string) => openKeys.indexOf(key) === -1
    );
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const { messages } = useIntl();
  return (
    <StyledVerticalNav
      theme={sidebarColorSet.mode}
      color={sidebarColorSet.sidebarMenuSelectedTextColor}
      mode="inline"
      className={clsx({
        "menu-rounded": menuStyle === MenuStyle.ROUNDED,
        "menu-rounded rounded-menu-reverse":
          menuStyle === MenuStyle.ROUNDED_REVERSE,
        "menu-rounded standard-menu": menuStyle === MenuStyle.STANDARD,
        "menu-rounded curved-menu": menuStyle === MenuStyle.CURVED_MENU,
        "bg-color-menu":
          sidebarColorSet.sidebarBgColor !==
          defaultConfig.sidebar.colorSet.sidebarBgColor,
      })}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      selectedKeys={[selectedKeys[selectedKeys.length - 1]]}
      defaultSelectedKeys={[selectedKeys[selectedKeys.length - 1]]}
      items={getRouteMenus(routesConfig, messages)}
    />
  );
};

export default AppVerticalNav;
