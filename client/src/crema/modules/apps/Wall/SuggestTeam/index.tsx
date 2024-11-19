import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import { Avatar } from "antd";
import { LikeOutlined } from "@ant-design/icons";
import {
  StyledSuggestTeamBtn,
  StyledSuggestTeamCard,
  StyledSuggestTeamThumb,
  StyledSuggestTeamUser,
  StyledSuggestTeamUserContent,
} from "./index.styled";
import { SuggestTeamDataType } from "@crema/types/models/apps/Wall";

type SuggestionsProps = {
  data: SuggestTeamDataType;
};

const SuggestTeam: React.FC<SuggestionsProps> = ({ data }) => {
  const { icon, title, subTitle, mediaImg } = data;
  const { messages } = useIntl();

  return (
    <StyledSuggestTeamCard
      title={messages["wall.suggestTeams"]}
      extra={<a href="#/">{messages["common.viewAll"] as string}</a>}
      actions={[
        <StyledSuggestTeamBtn key={1} icon={<LikeOutlined />}>
          <IntlMessages id="wall.likeTeam" />
        </StyledSuggestTeamBtn>,
      ]}
    >
      <StyledSuggestTeamUser>
        <Avatar src={icon} alt="Face Book" />
        <StyledSuggestTeamUserContent>
          <h4>{title}</h4>
          <p>{subTitle}</p>
        </StyledSuggestTeamUserContent>
      </StyledSuggestTeamUser>
      <StyledSuggestTeamThumb>
        <img src={mediaImg} alt="F man" />
      </StyledSuggestTeamThumb>
    </StyledSuggestTeamCard>
  );
};

export default SuggestTeam;
