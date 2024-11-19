import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import React from "react";
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
import { FORMAT_DATE_FOURTH } from "utils/common-constants.utils";
import moment from "moment";

type PersonalDetailsProps = {
  contact: ContactType | null;
};

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ contact }) => {
  // Render
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
            {contact!.phoneNumber} / {contact!.phoneNumberBis}
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
              <span>
                {moment(contact!.birthday).format(FORMAT_DATE_FOURTH)}
              </span>
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
