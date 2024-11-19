import React, { useState } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { AiOutlineDelete } from "react-icons/ai";
import { Dropdown } from "antd";
import { MdLabelOutline } from "react-icons/md";
import AppIconButton from "@crema/components/AppIconButton";
import { StyledContactCheckedAction } from "../index.styled";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";

import type { ContactObjType } from "@crema/types/models/apps/Contact";

type ContactCheckedActionsProps = {
  checkedContacts: number[];
  setCheckedContacts: (checkedContacts: number[]) => void;
  onUpdateContacts: (checkedContacts: ContactObjType[]) => void;
  onSelectContactsForDelete: (checkedContacts: number[]) => void;
};

const ContactCheckedActions: React.FC<ContactCheckedActionsProps> = ({
  checkedContacts,
  setCheckedContacts,
  onUpdateContacts,
  onSelectContactsForDelete,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();

  const [isLabelOpen, onOpenLabel] = useState(false);

  const onLabelOpen = () => {
    onOpenLabel(true);
  };

  const onLabelClose = () => {
    onOpenLabel(false);
  };

  const onSelectLabel = (key: number) => {
    console.log("key", key);
    putDataApi("/api/contactApp/update/label", infoViewActionsContext, {
      contactIds: checkedContacts,
      type: +key,
    })
      .then((data) => {
        onUpdateContacts(data as ContactObjType[]);
        setCheckedContacts([]);
        onLabelClose();
        infoViewActionsContext.showMessage("Contact Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const items = [
    {
      key: 1,
      label: (
        <span key={311} onClick={() => onSelectLabel(311)}>
          <IntlMessages id="common.crema" />
        </span>
      ),
    },
    {
      key: 2,
      label: (
        <span key={312} onClick={() => onSelectLabel(312)}>
          <IntlMessages id="common.personal" />
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span key={313} onClick={() => onSelectLabel(313)}>
          <IntlMessages id="common.work" />
        </span>
      ),
    },
  ];

  return (
    <StyledContactCheckedAction>
      <AppIconButton
        icon={<AiOutlineDelete />}
        title={<IntlMessages id="common.delete" />}
        onClick={() => onSelectContactsForDelete(checkedContacts)}
      />

      <Dropdown
        onOpenChange={onLabelOpen}
        open={isLabelOpen}
        menu={{ items }}
        trigger={["click"]}
      >
        <AppIconButton
          icon={<MdLabelOutline />}
          title={<IntlMessages id="common.label" />}
        />
      </Dropdown>
    </StyledContactCheckedAction>
  );
};

export default ContactCheckedActions;
