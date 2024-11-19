import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useLayoutActionsContext } from "@crema/context/AppContextProvider/LayoutContextProvider";
import { useSidebarActionsContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import AuthWrapper from "./AuthWrapper";

// eslint-disable-next-line react/display-name
const withLayout = (ComposedComponent: any) => (props: any) => {
  const { updateNavStyle } = useLayoutActionsContext();
  const { updateMenuStyle, setSidebarBgImage } = useSidebarActionsContext();
  const router = useRouter();

  useEffect(() => {
    if (router.query.layout) updateNavStyle(router.query.layout as string);
    if (router.query.menuStyle)
      updateMenuStyle(router.query.menuStyle as string);
    if (router.query.sidebarImage) setSidebarBgImage(true);
  }, [
    router.query.layout,
    router.query.menuStyle,
    router.query.sidebarImage,
    setSidebarBgImage,
    updateMenuStyle,
    updateNavStyle,
  ]);
  return (
    <AuthWrapper>
      <ComposedComponent {...props} />
    </AuthWrapper>
  );
};

export default withLayout;
