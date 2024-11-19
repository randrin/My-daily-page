import React, { ReactNode } from "react";
import AppCard from "@crema/components/AppCard";
import AppGrid from "@crema/components/AppGrid";
import {
  AiFillYoutube,
  AiOutlineGoogle,
  AiOutlineTwitter,
} from "react-icons/ai";
import { FaFacebookF, FaVimeoV } from "react-icons/fa";
import { FiDribbble } from "react-icons/fi";
import { GrLinkedinOption } from "react-icons/gr";
import { ImTumblr } from "react-icons/im";
import { StyledShareBadge } from "./index.styled";
import { ShareDataType } from "@crema/types/models/dashboards/Metrics";

type ShareProps = {
  data: ShareDataType[];
};

type iconByNameProps = {
  [key: string]: ReactNode;
};

const iconByName: iconByNameProps = {
  facebook: <FaFacebookF />,
  twitter: <AiOutlineTwitter />,
  dribbble: <FiDribbble />,
  vimeo: <FaVimeoV />,
  tumblr: <ImTumblr />,
  youtube: <AiFillYoutube />,
  linkedin: <GrLinkedinOption />,
  google: <AiOutlineGoogle />,
};

const Share: React.FC<ShareProps> = ({ data }) => {
  return (
    <AppCard heightFull title="Share">
      <AppGrid
        data={data}
        itemPadding={5}
        responsive={{
          xs: 4,
          sm: 5,
          md: 5,
          lg: 5,
          xl: 3,
          xxl: 4,
        }}
        renderItem={(data: any, index) => (
          <StyledShareBadge style={{ backgroundColor: data.color }} key={index}>
            {iconByName[data.icon] || iconByName["google"]}
            <span>{data.value}</span>
          </StyledShareBadge>
        )}
      />
    </AppCard>
  );
};

export default Share;
