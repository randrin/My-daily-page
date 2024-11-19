import { useSidebarContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { StyledFlex, StyledText } from "@crema/modules/dashboards/index.styled";
import { Avatar, Image, Typography } from "antd";
import React, { useEffect } from "react";
import { StyledAppLogo } from "./index.styled";

type AppLogoProps = {
  hasSidebarColor?: boolean;
};
const AppLogo: React.FC<AppLogoProps> = ({ hasSidebarColor }) => {
  // States
  const { user } = useAuthUser();
  const { sidebarColorSet } = useSidebarContext();

  // Init
  useEffect(() => {
    if (user) {
      //window.location.reload()
    }
  }, [user]);

  // Render
  return (
    <>
      {!user ? (
        <StyledAppLogo>
          {hasSidebarColor && sidebarColorSet.mode === "dark" ? (
            <Image
              preview={false}
              width={100}
              src="/assets/images/logo-white-with-name.png"
              alt="crema-logo"
            />
          ) : (
            <Image
              preview={false}
              width={100}
              src="/assets/images/logo-with-name.png"
              alt="crema-logo"
            />
          )}
        </StyledAppLogo>
      ) : (
        <StyledFlex>
          <Avatar
            style={{
              marginRight: 14,
              width: 50,
              height: 50,
            }}
            src={
              user.currentOrganization?.logo
                ? user.currentOrganization?.logo?.secure_url
                : "/assets/icon/default-org.jpg"
            }
          />
          <div
            style={{
              flex: 1,
            }}
          >
            <Typography.Title
              level={3}
              className="tt-expenses-primary"
              style={{ fontSize: 16, marginBottom: 0 }}
            >
              {user.currentOrganization?.name}
            </Typography.Title>
            <StyledText>{user.currentOrganization?.code}</StyledText>
          </div>
        </StyledFlex>
      )}
    </>
  );
};

export default AppLogo;
