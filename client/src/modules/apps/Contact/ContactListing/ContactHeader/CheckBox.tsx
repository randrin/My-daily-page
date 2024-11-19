import React from 'react';
import { Checkbox } from 'antd';
import { StyledContactHeaderCheckboxView } from '../index.styled';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useContactContext } from '../../../context/ContactContextProvider';

type CheckBoxProps = {
  checkedContacts: number[];
  setCheckedContacts: (contactIds: number[]) => void;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  checkedContacts,
  setCheckedContacts,
}) => {
  const { contactList } = useContactContext();
  const onHandleMasterCheckbox = (event: CheckboxChangeEvent) => {
    if (event.target.checked) {
      const contactIds = contactList?.data?.map((contact) => contact.id);
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
