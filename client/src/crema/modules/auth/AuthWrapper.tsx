import React from "react";
import AppAnimateGroup from "@crema/components/AppAnimateGroup";
import AppInfoView from "@crema/components/AppInfoView";
import AppLogo from "@crema/components/AppLayout/components/AppLogo";
import {
  StyledAuthCard,
  StyledAuthCardHeader,
  StyledAuthMainContent,
  StyledAuthWelContent,
  StyledAuthWellAction,
  StyledAuthWrap,
} from "./AuthWrapper.styled";

type Props = {
  children: React.ReactNode;
};
const AuthWrapper: React.FC<Props> = ({ children }) => {
  return (
    <AppAnimateGroup
      type="scale"
      animateStyle={{ flex: 1 }}
      delay={0}
      interval={10}
      duration={200}
    >
      <StyledAuthWrap key={"wrap"}>
        <StyledAuthCard>
          <StyledAuthMainContent>
            <StyledAuthCardHeader>
              <AppLogo />
            </StyledAuthCardHeader>
            {children}
          </StyledAuthMainContent>
          <StyledAuthWellAction>
            <StyledAuthWelContent>
              <h2>Welcome to Crema!</h2>
              <p>
                Crema is purely based on Ant Design components and follows Ant
                Design guidelines.
              </p>
            </StyledAuthWelContent>
          </StyledAuthWellAction>
        </StyledAuthCard>
      </StyledAuthWrap>
      <AppInfoView />
    </AppAnimateGroup>
  );
};
export default AuthWrapper;
