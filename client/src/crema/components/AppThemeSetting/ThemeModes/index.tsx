import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledThemeColorSetting,
  StyledThemeColorSettingTitle,
} from "../ThemeColors/index.styled";
import { ThemeMode } from "@crema/constants/AppEnums";
import {
  useThemeActionsContext,
  useThemeContext,
} from "@crema/context/AppContextProvider/ThemeContextProvider";
import { useSidebarActionsContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import {
  DarkSidebar,
  LightSidebar,
  SidebarData,
} from "@crema/constants/defaultConfig";
import clsx from "clsx";
import styled from "styled-components";
import { Radio } from "antd";

const ToggleButtonGroup = styled(Radio.Group)``;
const StyledToggleButton = styled(Radio.Button)``;

const ThemeModes = () => {
  const { updateThemeMode } = useThemeActionsContext();
  const { updateSidebarColorSet } = useSidebarActionsContext();
  const { themeMode, theme } = useThemeContext();

  const onModeChange = (themeMode: ThemeMode) => {
    if (themeMode) {
      updateThemeMode(themeMode);
      if (themeMode === ThemeMode.LIGHT) {
        updateSidebarColorSet({
          sidebarBgColor: LightSidebar.sidebarBgColor,
          sidebarTextColor: LightSidebar.sidebarTextColor,
          sidebarMenuSelectedBgColor: LightSidebar.sidebarMenuSelectedBgColor,
          sidebarMenuSelectedTextColor:
            LightSidebar.sidebarMenuSelectedTextColor,
          sidebarHeaderColor: LightSidebar.sidebarHeaderColor,
        } as SidebarData);
      } else {
        updateSidebarColorSet({
          sidebarBgColor: DarkSidebar.sidebarBgColor,
          sidebarTextColor: DarkSidebar.sidebarTextColor,
          sidebarMenuSelectedBgColor: DarkSidebar.sidebarMenuSelectedBgColor,
          sidebarMenuSelectedTextColor:
            DarkSidebar.sidebarMenuSelectedTextColor,
          sidebarHeaderColor: DarkSidebar.sidebarHeaderColor,
        } as SidebarData);
      }
    }
  };

  return (
    <StyledThemeColorSetting>
      <StyledThemeColorSettingTitle>
        <IntlMessages id="customizer.themeMode" />
      </StyledThemeColorSettingTitle>

      <ToggleButtonGroup
        value={themeMode}
        onChange={(e) => onModeChange(e.target.value)}
        aria-label="text alignment"
      >
        <StyledToggleButton
          className={clsx({
            active: themeMode === ThemeMode.LIGHT,
          })}
          aria-label="left aligned"
        >
          <IntlMessages id="customizer.light" />
        </StyledToggleButton>

        <StyledToggleButton
          className={clsx({
            active:
              themeMode === ThemeMode.DARK ||
              theme.palette.type === ThemeMode.DARK,
          })}
          aria-label="centered"
        >
          <IntlMessages id="customizer.dark" />
        </StyledToggleButton>
      </ToggleButtonGroup>
    </StyledThemeColorSetting>
  );
};

export default ThemeModes;
