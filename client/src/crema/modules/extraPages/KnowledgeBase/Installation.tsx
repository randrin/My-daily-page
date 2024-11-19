import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import KBItem from "./KBItem";
import AppRowContainer from "@crema/components/AppRowContainer";
import { StyledKnowSection } from "./index.styled";
import AppAnimate from "@crema/components/AppAnimate";
import { InstallationData } from "@crema/mockapi/fakedb/extraPages";

type InstallationProps = {
  installationQueries: InstallationData[];
};

const Installation: React.FC<InstallationProps> = ({ installationQueries }) => {
  return (
    <StyledKnowSection>
      <AppAnimate animation="transition.slideLeftIn" delay={200}>
        <h3>
          <IntlMessages id="knowledge.installation" />
        </h3>
      </AppAnimate>
      <AppRowContainer>
        {installationQueries.map((data) => (
          <KBItem data={data} key={data.id} />
        ))}
      </AppRowContainer>
    </StyledKnowSection>
  );
};

export default Installation;
