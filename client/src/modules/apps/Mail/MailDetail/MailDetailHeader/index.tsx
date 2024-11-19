import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useRouter } from "next/router";
import { Dropdown } from "antd";
import { BiArchiveIn, BiArrowBack } from "react-icons/bi";
import { HiOutlineMailOpen } from "react-icons/hi";
import { FiMoreVertical } from "react-icons/fi";
import { MdLabelOutline } from "react-icons/md";
import { AiOutlineDelete, AiOutlineInfoCircle } from "react-icons/ai";
import AppIconButton from "@crema/components/AppIconButton";
import {
  StyledMailDetailActionHeader,
  StyledMailDetailArrow,
} from "../index.styled";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";

import type { LabelObjType, MailObjType } from "@crema/types/models/apps/Mail";
import { useMailContext } from "../../../context/MailContextProvider";

type MailDetailHeaderProps = {
  selectedMail: MailObjType;
  onUpdateSelectedMail: (data: MailObjType) => void;
};

const MailDetailHeader: React.FC<MailDetailHeaderProps> = ({
  selectedMail,
  onUpdateSelectedMail,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const { labelList } = useMailContext();
  const router = useRouter();

  const onClickBackButton = () => {
    router.back();
  };

  const onSelectLabel = (key: number) => {
    const mail = selectedMail;
    mail.label = labelList.find(
      (label: LabelObjType) => label.id.toString() === key.toString()
    ) as LabelObjType;
    putDataApi<MailObjType>("/api/mailApp/mail/", infoViewActionsContext, {
      mail,
    })
      .then(() => {
        onUpdateSelectedMail(mail);
        infoViewActionsContext.showMessage("Mail Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onChangeMailFolder = (type: number) => {
    putDataApi<MailObjType>(
      "/api/mailApp/update/folder",
      infoViewActionsContext,
      {
        mailIds: [selectedMail.id],
        type,
      }
    )
      .then(() => {
        selectedMail.folderValue = type;
        onUpdateSelectedMail(selectedMail);
        infoViewActionsContext.showMessage("Mail Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onChangeReadStatus = () => {
    const mail = selectedMail;
    mail.isRead = false;
    putDataApi<MailObjType>("/api/mailApp/mail/", infoViewActionsContext, {
      mail,
    })
      .then((data) => {
        onUpdateSelectedMail(data);
        router.back();
        infoViewActionsContext.showMessage(
          mail.isRead
            ? "Mail Marked as Read Successfully"
            : "Mail Marked as Unread Successfully"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onChangeStarredStatus = () => {
    const mail = selectedMail;
    mail.isStarred = !mail.isStarred;
    putDataApi<MailObjType>(
      "/api/mailApp/update/starred",
      infoViewActionsContext,
      {
        mailIds: [mail.id],
        status: mail.isStarred,
      }
    )
      .then(() => {
        onUpdateSelectedMail(mail);
        infoViewActionsContext.showMessage(
          mail.isStarred
            ? "Mail Marked as Starred Successfully"
            : "Mail Marked as Unstarred Successfully"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const menuItems = labelList.map((label: LabelObjType, index: number) => {
    return {
      key: index,
      label: <span onClick={() => onSelectLabel(label.id)}>{label.name}</span>,
    };
  });

  const menuMoveTo = [
    {
      key: "01",
      label: (
        <span onClick={onChangeReadStatus}>
          <IntlMessages id="mailApp.markAsUnread" />
        </span>
      ),
    },
    {
      key: "02",
      label: (
        <span onClick={onChangeStarredStatus}>
          {selectedMail.isStarred ? (
            <IntlMessages id="mailApp.markAsNotImportant" />
          ) : (
            <IntlMessages id="mailApp.markAsImportant" />
          )}
        </span>
      ),
    },
  ];

  if (!selectedMail) return null;
  return (
    <>
      <StyledMailDetailArrow
        title={<IntlMessages id="common.back" />}
        icon={<BiArrowBack />}
        onClick={onClickBackButton}
      />
      <h5 className="mb-0 text-truncate">
        {selectedMail.subject ? selectedMail.subject : null}
      </h5>
      <StyledMailDetailActionHeader>
        <AppIconButton
          title={<IntlMessages id="common.archive" />}
          icon={<BiArchiveIn />}
          onClick={() => onChangeMailFolder(127)}
        />

        <AppIconButton
          title={<IntlMessages id="common.reportSpam" />}
          icon={<AiOutlineInfoCircle />}
          onClick={() => onChangeMailFolder(125)}
        />

        <AppIconButton
          title={<IntlMessages id="common.trash" />}
          icon={<AiOutlineDelete />}
          onClick={() => onChangeMailFolder(126)}
        />

        <AppIconButton
          title={<IntlMessages id="mailApp.markAsUnread" />}
          icon={<HiOutlineMailOpen />}
          onClick={() => onChangeReadStatus()}
        />

        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <AppIconButton
            title={<IntlMessages id="common.label" />}
            icon={<MdLabelOutline />}
          />
        </Dropdown>

        <Dropdown menu={{ items: menuMoveTo }} trigger={["click"]}>
          <AppIconButton
            title={<IntlMessages id="common.more" />}
            icon={<FiMoreVertical />}
          />
        </Dropdown>
      </StyledMailDetailActionHeader>
    </>
  );
};

export default MailDetailHeader;
