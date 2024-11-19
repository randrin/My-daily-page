import React from "react";
import WhatsHappenItem from "./WhatsHappenItem";
import { useIntl } from "react-intl";
import { StyledWhatHappenCard } from "./index.styled";
import { WhatsHappenDataType } from "@crema/types/models/apps/Wall";

type WhatsHappenProps = {
  whatsHappen: WhatsHappenDataType[];
};
const WhatsHappen: React.FC<WhatsHappenProps> = ({ whatsHappen }) => {
  const { messages } = useIntl();

  return (
    <StyledWhatHappenCard
      className="no-card-space-ltr-rtl"
      title={messages["wall.whatsHappening"]}
      extra={<a href="#/">{messages["common.viewAll"] as string}</a>}
    >
      <div>
        {whatsHappen.map((data) => (
          <WhatsHappenItem data={data} key={data.id} />
        ))}
      </div>
    </StyledWhatHappenCard>
  );
};

export default WhatsHappen;
