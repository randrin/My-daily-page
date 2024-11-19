import { Col } from "antd";
import React, { useEffect, useState } from "react";
import ContactActions from "./ContactActions";
import OtherDetails from "./OtherDetails";
import PersonalDetails from "./PersonalDetails";
import AppRowContainer from "@crema/components/AppRowContainer";
import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import {
  StyledContactFormBtn,
  StyledContactFormFooter,
} from "../CreateContact/index.styled";
import {
  StyledContactDetailContent,
  StyledContactDetailModal,
  StyledContactDetailScrollbar,
  StyledContactModalHeader,
  StyledContactModalUser,
  StyledContactModalUserAvatar,
} from "./index.styled";
import Notes from "./Notes";

type ContactDetailProps = {
  isShowDetail: boolean;
  selectedContact: ContactType | null;
  onShowDetail: (show: boolean) => void;
  onSelectContactsForDelete: (ids: string[]) => void;
  onOpenEditContact: (contact: ContactType | null) => void;
  onChangeStarred: (contactId: string) => void;
};

const ContactDetail: React.FC<ContactDetailProps> = ({
  isShowDetail,
  selectedContact,
  onShowDetail,
  onSelectContactsForDelete,
  onOpenEditContact,
  onChangeStarred,
}) => {
  // States
  const [contact, setContact] = useState<ContactType | null>(selectedContact);

  // Init
  useEffect(() => {
    setContact(selectedContact);
  }, [selectedContact]);

  // Functions
  const onDeleteContact = () => {
    onSelectContactsForDelete([contact!._id]);
    onShowDetail(false);
  };

  const onContactDetailClose = () => {
    onShowDetail(false);
  };

  // Render
  return (
    <StyledContactDetailModal
      open={isShowDetail}
      footer={false}
      onCancel={() => onShowDetail(false)}
    >
      <StyledContactModalHeader>
        <ContactActions
          onChangeStarred={() => onChangeStarred(contact._id)}
          onDeleteContact={onDeleteContact}
          onOpenEditContact={onOpenEditContact}
          contact={contact}
        />
        <StyledContactModalUser>
          {contact!.photoURL ? (
            <StyledContactModalUserAvatar src={contact!.photoURL.secure_url} />
          ) : (
            <StyledContactModalUserAvatar>
              {contact!.firstName[0].toUpperCase()}
            </StyledContactModalUserAvatar>
          )}
          <h4>
            {contact!.displayName ??
              contact!.firstName + " " + contact!.lastName}
          </h4>
        </StyledContactModalUser>
      </StyledContactModalHeader>

      <StyledContactDetailScrollbar>
        <StyledContactDetailContent>
          <AppRowContainer className="d-flex">
            <Col xs={24} md={12}>
              <PersonalDetails contact={contact} />
            </Col>
            <Col xs={24} md={12}>
              <OtherDetails contact={contact} />
            </Col>
            <Col xs={24} md={24}>
              <Notes contact={contact} />
            </Col>
          </AppRowContainer>
        </StyledContactDetailContent>

        <StyledContactFormFooter>
          <StyledContactFormBtn
            type="primary"
            ghost
            onClick={onContactDetailClose}
          >
            <IntlMessages id="common.cancel" />
          </StyledContactFormBtn>
        </StyledContactFormFooter>
      </StyledContactDetailScrollbar>
    </StyledContactDetailModal>
  );
};

export default ContactDetail;
