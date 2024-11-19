import { ContactType } from "@crema/types/models/dashboards/ContactType";
import React, { useState } from "react";
import AddContactForm from "./AddContactForm";
import { StyledContactModal } from "./index.styled";

type CreateContactProps = {
  isContactDrawerOpen: boolean;
  setContactDrawerOpen: (data: boolean) => void;
  contact: ContactType;
  setContact: (data: ContactType) => void;
};

const CreateContact: React.FC<CreateContactProps> = ({
  isContactDrawerOpen,
  setContactDrawerOpen,
  contact,
  setContact,
}) => {
  // States
  const [userImage, setUserImage] = useState(
    contact && contact.photoURL
      ? contact.photoURL.secure_url
      : "/assets/images/placeholder.jpg"
  );

  // Functions
  const handleAddContactClose = () => {
    setContactDrawerOpen(!isContactDrawerOpen);
  };

  // Render
  return (
    <StyledContactModal
      open={isContactDrawerOpen}
      width={720}
      footer={false}
      onCancel={handleAddContactClose}
    >
      <AddContactForm
        selectContact={contact}
        setContact={setContact}
        setUserImage={setUserImage}
        userImage={userImage}
        handleAddContactClose={handleAddContactClose}
      />
    </StyledContactModal>
  );
};
export default CreateContact;
