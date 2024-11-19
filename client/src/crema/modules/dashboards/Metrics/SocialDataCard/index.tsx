import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";

import { HeartFilled, MessageOutlined } from "@ant-design/icons";
import {
  StyledSocialData,
  StyledSocialDataCard,
  StyledSocialDataItem,
  StyledSocialDataLike,
} from "./index.styled";
import { SocialDataType } from "@crema/types/models/dashboards/Metrics";

type SocialDataCardProps = {
  data: SocialDataType;
};

const SocialDataCard: React.FC<SocialDataCardProps> = ({ data }) => {
  return (
    <StyledSocialDataCard heightFull>
      <StyledSocialData>
        <StyledSocialDataLike>
          <HeartFilled />
          <h3>{data.likes}</h3>
          <p className="text-truncate">
            <IntlMessages id="common.likes" />
          </p>
        </StyledSocialDataLike>

        <StyledSocialDataItem>
          <MessageOutlined />
          <h3>{data.comments}</h3>
          <p className="text-truncate">
            <IntlMessages id="common.comments" />
          </p>
        </StyledSocialDataItem>
      </StyledSocialData>
    </StyledSocialDataCard>
  );
};

export default SocialDataCard;
