import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyleAiOutlineGlobalIcon,
  StyleAiOutlineShoppingIcon,
  StyledContactDetailModalItem,
  StyledContactDetailModalItemContent,
  StyledContactDetailModalItemTitle,
  StyledOtherDetailItem,
  StyledOtherDetailItemContent,
  StyleFiMailIcon,
  StyleFiPhoneIcon,
} from "./index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type PersonalDetailsProps = {
  contact: ContactObjType | null;
};

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ contact }) => {
  return (
    <StyledContactDetailModalItem>
      <StyledContactDetailModalItemTitle>
        <IntlMessages id="contactApp.personalDetails" />
      </StyledContactDetailModalItemTitle>

      <StyledContactDetailModalItemContent>
        <StyledOtherDetailItem>
          <StyleFiMailIcon />
          <StyledOtherDetailItemContent>
            {contact!.email}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleFiPhoneIcon />
          <StyledOtherDetailItemContent>
            {contact!.contact}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleAiOutlineGlobalIcon />
          <StyledOtherDetailItemContent>
            {contact!.website ? (
              contact!.website
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleAiOutlineShoppingIcon />
          <StyledOtherDetailItemContent>
            {contact!.birthday ? (
              contact!.birthday
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>
      </StyledContactDetailModalItemContent>
    </StyledContactDetailModalItem>
  );
};

export default PersonalDetails;
