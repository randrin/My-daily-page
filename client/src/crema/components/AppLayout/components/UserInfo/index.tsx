import React from "react";
import { useRouter } from "next/router";
import clsx from "clsx";
import { Dropdown } from "antd";
import { FaChevronDown } from "react-icons/fa";
import { useThemeContext } from "@crema/context/AppContextProvider/ThemeContextProvider";
import { useAuthMethod, useAuthUser } from "@crema/hooks/AuthHooks";
import { useSidebarContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import {
  StyledCrUserDesignation,
  StyledCrUserInfo,
  StyledCrUserInfoAvatar,
  StyledCrUserInfoContent,
  StyledCrUserInfoInner,
  StyledUserArrow,
  StyledUsername,
  StyledUsernameInfo,
} from "./index.styled";
import IntlMessages from "@crema/helpers/IntlMessages";
import { LuUser } from "react-icons/lu";
import { TfiPowerOff } from "react-icons/tfi";

type UserInfoProps = {
  hasColor?: boolean;
};
const UserInfo: React.FC<UserInfoProps> = ({ hasColor }) => {
  // States
  const { themeMode } = useThemeContext();
  const { logout } = useAuthMethod();
  const { user } = useAuthUser();
  const router = useRouter();
  const { sidebarColorSet } = useSidebarContext();
  const { allowSidebarBgImage } = useSidebarContext();

  // Functions
  const getUserAvatar = () => {
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
  };

  // Init
  const items = [
    {
      key: 1,
      label: (
        <div
          className="tt-expenses-space-start"
          onClick={() => router.push("/my-profile")}
        >
          <LuUser className="tt-expenses-margin-btn-icon tt-expenses-primary" />
          <IntlMessages id="common.my.profile" />
        </div>
      ),
    },
    {
      key: 2,
      label: (
        <div className="tt-expenses-space-start" onClick={() => logout()}>
          <TfiPowerOff className="tt-expenses-margin-btn-icon tt-expenses-tomato" />
          <IntlMessages id="common.logout" />
        </div>
      ),
    },
  ];

  // Render
  return (
    <>
      {hasColor ? (
        <StyledCrUserInfo
          style={{
            backgroundColor: allowSidebarBgImage
              ? ""
              : sidebarColorSet.sidebarHeaderColor,
            color: sidebarColorSet.sidebarTextColor,
          }}
          className={clsx("cr-user-info", {
            light: themeMode === "light",
          })}
        >
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
            overlayStyle={{
              zIndex: 1052,
              minWidth: 150,
            }}
          >
            <StyledCrUserInfoInner className="ant-dropdown-link">
              {user.photoURL ? (
                <StyledCrUserInfoAvatar src={user.photoURL.secure_url} />
              ) : (
                <StyledCrUserInfoAvatar
                  style={{ backgroundColor: user.photoRGA }}
                >
                  {getUserAvatar()}
                </StyledCrUserInfoAvatar>
              )}
              <StyledCrUserInfoContent className="cr-user-info-content">
                <StyledUsernameInfo>
                  <StyledUsername
                    className={clsx("text-truncate", {
                      light: themeMode === "light",
                    })}
                  >
                    {user.displayName}
                  </StyledUsername>
                  <StyledUserArrow className="cr-user-arrow">
                    <FaChevronDown />
                  </StyledUserArrow>
                </StyledUsernameInfo>
                <StyledCrUserDesignation className="text-truncate">
                  <i className="tt-expenses-primary">
                    <IntlMessages
                      id={`common.role.${user.role?.toLocaleLowerCase()}`}
                    />
                  </i>
                </StyledCrUserDesignation>
              </StyledCrUserInfoContent>
            </StyledCrUserInfoInner>
          </Dropdown>
        </StyledCrUserInfo>
      ) : (
        <StyledCrUserInfo
          className={clsx("cr-user-info", {
            light: themeMode === "light",
          })}
        >
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
            overlayStyle={{
              zIndex: 1052,
              minWidth: 150,
            }}
          >
            <StyledCrUserInfoInner className="ant-dropdown-link">
              {user.photoURL ? (
                <StyledCrUserInfoAvatar src={user.photoURL.secure_url} />
              ) : (
                <StyledCrUserInfoAvatar
                  style={{ backgroundColor: user.photoRGA }}
                >
                  {getUserAvatar()}
                </StyledCrUserInfoAvatar>
              )}
              <StyledCrUserInfoContent className="cr-user-info-content">
                <StyledUsernameInfo>
                  <StyledUsername
                    className={clsx("text-truncate", {
                      light: themeMode === "light",
                    })}
                  >
                    {user.displayName}
                  </StyledUsername>
                  <StyledUserArrow className="cr-user-arrow">
                    <FaChevronDown />
                  </StyledUserArrow>
                </StyledUsernameInfo>
                <StyledCrUserDesignation className="text-truncate cr-user-designation">
                  <i className="tt-expenses-primary">
                    <IntlMessages
                      id={`common.role.${user.role?.toLocaleLowerCase()}`}
                    />
                  </i>
                </StyledCrUserDesignation>
              </StyledCrUserInfoContent>
            </StyledCrUserInfoInner>
          </Dropdown>
        </StyledCrUserInfo>
      )}
    </>
  );
};

export default UserInfo;
