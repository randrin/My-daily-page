import React, { useEffect, useState } from "react";
import ContactActions from "./ContactActions";
import PersonalDetails from "./PersonalDetails";
import OtherDetails from "./OtherDetails";
import { Col } from "antd";

import AppRowContainer from "@crema/components/AppRowContainer";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledContactDetailContent,
  StyledContactDetailModal,
  StyledContactDetailScrollbar,
  StyledContactModalHeader,
  StyledContactModalUser,
  StyledContactModalUserAvatar,
} from "./index.styled";
import {
  StyledContactFormBtn,
  StyledContactFormFooter,
} from "../CreateContact/index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type ContactDetailProps = {
  isShowDetail: boolean;
  selectedContact: ContactObjType | null;
  onShowDetail: (show: boolean) => void;
  onSelectContactsForDelete: (ids: number[]) => void;
  onOpenEditContact: (contact: ContactObjType | null) => void;
  onChangeStarred: (checked: boolean, item: any) => void;
};

const ContactDetail: React.FC<ContactDetailProps> = ({
  isShowDetail,
  selectedContact,
  onShowDetail,
  onSelectContactsForDelete,
  onOpenEditContact,
  onChangeStarred,
}) => {
  const [contact, setContact] = useState<ContactObjType | null>(
    selectedContact
  );

  useEffect(() => {
    setContact(selectedContact);
  }, [selectedContact]);

  const onDeleteContact = () => {
    onSelectContactsForDelete([contact!.id]);
    onShowDetail(false);
  };

  const onContactDetailClose = () => {
    onShowDetail(false);
  };

  return (
    <StyledContactDetailModal
      open={isShowDetail}
      // onOk={isShowDetail}
      footer={false}
      onCancel={() => onShowDetail(false)}
    >
      <StyledContactModalHeader>
        <ContactActions
          onChangeStarred={onChangeStarred}
          onDeleteContact={onDeleteContact}
          onOpenEditContact={onOpenEditContact}
          contact={contact}
        />
        <StyledContactModalUser>
          {contact!.image ? (
            <StyledContactModalUserAvatar src={contact!.image} />
          ) : (
            <StyledContactModalUserAvatar>
              {contact!.name[0].toUpperCase()}
            </StyledContactModalUserAvatar>
          )}
          <h4>{contact!.name}</h4>
        </StyledContactModalUser>
      </StyledContactModalHeader>

      <StyledContactDetailScrollbar>
        <StyledContactDetailContent>
          <AppRowContainer>
            <Col xs={24} md={12}>
              <PersonalDetails contact={contact} />
            </Col>
            <Col xs={24} md={12}>
              <OtherDetails contact={contact} />
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
