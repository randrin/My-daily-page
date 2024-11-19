import React from "react";
import { Checkbox } from "antd";
import { StyledContactHeaderCheckboxView } from "../index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";
import { CheckboxChangeEvent } from "antd/es/checkbox";

type CheckBoxProps = {
  checkedContacts: number[];
  contactList: ContactObjType[];
  setCheckedContacts: (contactIds: number[]) => void;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  checkedContacts,
  contactList,
  setCheckedContacts,
}) => {
  const onHandleMasterCheckbox = (event: CheckboxChangeEvent) => {
    if (event.target.checked) {
      const contactIds = contactList.map((contact) => contact.id);
      setCheckedContacts(contactIds);
    } else {
      setCheckedContacts([]);
    }
  };

  return (
    <StyledContactHeaderCheckboxView>
      <Checkbox
        indeterminate={
          checkedContacts.length > 0 &&
          checkedContacts.length < contactList.length
        }
        checked={
          contactList.length > 0 &&
          checkedContacts.length === contactList.length
        }
        onChange={onHandleMasterCheckbox}
      />
    </StyledContactHeaderCheckboxView>
  );
};

export default CheckBox;
