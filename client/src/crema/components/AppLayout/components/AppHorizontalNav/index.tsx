import React from "react";
import { Menu } from "antd";
import { useRouter } from "next/router";
import { getRouteHorMenus } from "./HorizontalMenuUtils";
import { RouterConfigData } from "@crema/types/models/Apps";

type AppHorizontalNavProps = {
  className?: string;
  routesConfig?: RouterConfigData[];
};
const AppHorizontalNav = ({
  className,
  routesConfig,
}: AppHorizontalNavProps) => {
  const { pathname } = useRouter();

  const selectedKeys = pathname.substr(1);
  const defaultOpenKeys = selectedKeys.split("/")[0];
  return routesConfig ? (
    <Menu
      mode="horizontal"
      className={className}
      defaultOpenKeys={[defaultOpenKeys]}
      selectedKeys={[selectedKeys.split("/").join(":")]}
    >
      {getRouteHorMenus(routesConfig)}
    </Menu>
  ) : (
    <></>
  );
};

export default AppHorizontalNav;
