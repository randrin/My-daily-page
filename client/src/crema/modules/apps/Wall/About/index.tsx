import React from "react";
import { useIntl } from "react-intl";
import AppList from "@crema/components/AppList";
import IntlMessages from "@crema/helpers/IntlMessages";
import { AiOutlineUser, AiOutlineEdit, AiOutlineMail } from "react-icons/ai";
import { BiPhone, BiErrorCircle } from "react-icons/bi";
import { FiThumbsUp } from "react-icons/fi";
import { MdPublic } from "react-icons/md";
import {
  StyledWallAboutBtn,
  StyledWallAboutBtnView,
  StyledWallAboutCard,
  StyledWallAboutItem,
  StyledWallAboutItemIcon,
} from "./index.styled";
import { AbutDataType } from "@crema/types/models/apps/Wall";

const getIconByName = (iconName: string) => {
  switch (iconName) {
    case "person":
      return <AiOutlineUser />;
    case "phone":
      return <BiPhone />;
    case "email":
      return <AiOutlineMail />;
    case "error":
      return <BiErrorCircle />;
    case "thumb":
      return <FiThumbsUp />;
    case "public":
      return <MdPublic />;
  }
};

const AboutItem = ({ item }: { item: AbutDataType }) => {
  const getLinkAddress = () => {
    switch (item.linkType) {
      case "link": {
        return <a href={item.text}>{item.text}</a>;
      }
      case "phone": {
        return <a href={`tel:${item.text}`}>{item.text}</a>;
      }
      case "email": {
        return <a href={`mailto:${item.text}`}>{item.text}</a>;
      }
      default:
        return <p>{item.text}</p>;
    }
  };

  return (
    <StyledWallAboutItem>
      <StyledWallAboutItemIcon>
        {getIconByName(item.icon)}
      </StyledWallAboutItemIcon>
      {getLinkAddress()}
      <StyledWallAboutBtnView>
        <StyledWallAboutBtn
          title={<IntlMessages id="common.edit" />}
          icon={<AiOutlineEdit />}
        />
      </StyledWallAboutBtnView>
    </StyledWallAboutItem>
  );
};

type AboutProps = {
  about: AbutDataType[];
};

const About: React.FC<AboutProps> = ({ about }) => {
  const { messages } = useIntl();
  return (
    <StyledWallAboutCard
      title={messages["wall.about"]}
      extra={<a href="#/">{messages["common.editPageInfo"] as string}</a>}
    >
      <AppList
        data={about}
        renderItem={(data, index) => <AboutItem key={index} item={data} />}
      />
    </StyledWallAboutCard>
  );
};

export default About;
