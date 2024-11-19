import React from "react";

import dayjs from "dayjs";
import clsx from "clsx";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { CheckOutlined } from "@ant-design/icons";
import { getStringFromHtml } from "@crema/helpers/StringHelper";
import {
  StyledMailListActionMobile,
  StyledMailListAvatarMobile,
  StyledMailListAvatarMobileView,
  StyledMailListContentMobile,
  StyledMailListDescMobile,
  StyledMailListItemMobile,
  StyledMailListMainContent,
  StyledMailListStarredMobile,
  StyledMailListSubTitleMobile,
  StyledMailListTimeMobile,
  StyleMailListTitleMobile,
} from "./index.styled";
import { StyledMailListDate } from "../index.styled";
import { LabelObjType, MailObjType } from "@crema/types/models/apps/Mail";

type MailListItemProps = {
  mail: MailObjType;
  checkedMails: number[];
  labelList?: LabelObjType[];
  onChangeCheckedMails: (check: boolean, id: number) => void;
  onChangeStarred: (checked: boolean, mail: MailObjType) => void;
  onViewMailDetail: (mail: MailObjType) => void;
};

const MailListItemMobile: React.FC<MailListItemProps> = ({
  mail,
  checkedMails,
  onChangeCheckedMails,
  onChangeStarred,
  onViewMailDetail,
}) => {
  const messages = mail!.messages!.length;

  const onGetMailDate = () => {
    const date = mail!.messages![messages - 1].sentOn;
    if (
      dayjs(date, "ddd, MMM DD, YYYY").format() ===
      dayjs("ddd, MMM DD, YYYY").format()
    ) {
      return dayjs(date).format("LT");
    } else {
      return date.split(",")[1];
    }
  };

  const getSenderName = () => {
    if (messages === 1) {
      return mail!.messages![0].sender.name;
    } else if (messages === 2) {
      return `${mail!.messages![0].sender.name}, ${
        mail!.messages![1].sender.name
      }(2)`;
    } else {
      return `${mail!.messages![0].sender.name}, ${
        mail!.messages![messages - 2].sender.name
      }, ${mail!.messages![messages - 1].sender.name}(${messages})`;
    }
  };

  const getDescription = () => {
    return mail!.messages![messages - 1].description;
  };

  return (
    <StyledMailListItemMobile
      key={mail.id}
      className={clsx("item-hover", {
        mailRead: mail.isRead,
      })}
      onClick={() => onViewMailDetail(mail)}
    >
      <StyledMailListAvatarMobileView
        className={clsx({
          checked: checkedMails.includes(mail.id),
        })}
        onClick={(event) => {
          event.stopPropagation();
          onChangeCheckedMails(!checkedMails.includes(mail.id), mail.id);
        }}
      >
        {checkedMails.includes(mail.id) ? (
          <CheckOutlined />
        ) : (
          <StyledMailListAvatarMobile>
            {getSenderName().charAt(0).toUpperCase()}
          </StyledMailListAvatarMobile>
        )}
      </StyledMailListAvatarMobileView>

      <StyledMailListContentMobile>
        <StyledMailListMainContent>
          <StyleMailListTitleMobile className="text-truncate">
            {getSenderName()}
          </StyleMailListTitleMobile>
          <StyledMailListSubTitleMobile className="text-truncate">
            {mail.subject}
          </StyledMailListSubTitleMobile>
          <StyledMailListDescMobile className="text-truncate">
            {getStringFromHtml(getDescription())}
          </StyledMailListDescMobile>
        </StyledMailListMainContent>

        <StyledMailListActionMobile>
          <StyledMailListTimeMobile>
            <StyledMailListDate className="text-truncate">
              {onGetMailDate()}
            </StyledMailListDate>
          </StyledMailListTimeMobile>

          <StyledMailListStarredMobile
            onClick={(event) => event.stopPropagation()}
          >
            <AppsStarredIcon
              item={mail}
              onChange={() => onChangeStarred(!mail.isStarred, mail)}
            />
          </StyledMailListStarredMobile>
        </StyledMailListActionMobile>
      </StyledMailListContentMobile>
    </StyledMailListItemMobile>
  );
};

export default MailListItemMobile;
