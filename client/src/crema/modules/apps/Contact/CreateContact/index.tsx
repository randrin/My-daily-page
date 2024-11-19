import React, { useState } from "react";
import AddContactForm from "./AddContactForm";
import { StyledContactModal } from "./index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type CreateContactProps = {
  isAddContact: boolean;
  handleAddContactClose: () => void;
  selectContact?: ContactObjType | null;
  onUpdateContact?: (newContact: ContactObjType) => void;
  reCallAPI?: () => void;
};

const CreateContact: React.FC<CreateContactProps> = ({
  isAddContact,
  handleAddContactClose,
  selectContact,
  onUpdateContact,
  reCallAPI,
}) => {
  const [userImage, setUserImage] = useState(
    selectContact && selectContact.image
      ? selectContact.image
      : "/assets/images/placeholder.jpg"
  );

  return (
    <StyledContactModal
      open={isAddContact}
      // onOk={isAddContact}
      footer={false}
      onCancel={handleAddContactClose}
    >
      <AddContactForm
        selectContact={selectContact}
        setUserImage={setUserImage}
        userImage={userImage}
        onUpdateContact={onUpdateContact}
        handleAddContactClose={handleAddContactClose}
        reCallAPI={reCallAPI}
      />
    </StyledContactModal>
  );
};

export default CreateContact;
