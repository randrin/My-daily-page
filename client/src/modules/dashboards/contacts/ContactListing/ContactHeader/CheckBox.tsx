import React from "react";
import { Checkbox } from "antd";
import { StyledContactHeaderCheckboxView } from "../index.styled";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useContactsContext } from "modules/apps/context/ContactsContextProvider";

type CheckBoxProps = {
  checkedContacts: string[];
  setCheckedContacts: (contactIds: string[]) => void;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  checkedContacts,
  setCheckedContacts,
}) => {
  const { contactList } = useContactsContext();
  const onHandleMasterCheckbox = (event: CheckboxChangeEvent) => {
    if (event.target.checked) {
      const contactIds = contactList?.data?.map((contact) => contact._id);
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
          checkedContacts.length < contactList?.data?.length
        }
        checked={
          contactList?.data?.length > 0 &&
          checkedContacts.length === contactList?.data?.length
        }
        onChange={onHandleMasterCheckbox}
      />
    </StyledContactHeaderCheckboxView>
  );
};

export default CheckBox;
