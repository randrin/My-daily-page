import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import React from "react";
import {
  StyleAiOutlineHomeIcon,
  StyleFiInstagramIcon,
  StyleFiTwitterIcon,
  StyleRiFoldersLineIcon,
  StyledContactDetailModalItem,
  StyledContactDetailModalItemContent,
  StyledContactDetailModalItemTitle,
  StyledFiFacebookIcon,
  StyledOtherDetailItem,
  StyledOtherDetailItemContent,
} from "./index.styled";

type OtherDetailsProps = {
  contact: ContactType | null;
};

const OtherDetails: React.FC<OtherDetailsProps> = ({ contact }) => {
  // Render
  return (
    <StyledContactDetailModalItem>
      <StyledContactDetailModalItemTitle>
        <IntlMessages id="common.otherDetails" />
      </StyledContactDetailModalItemTitle>

      <StyledContactDetailModalItemContent>
        <StyledOtherDetailItem>
          <StyleRiFoldersLineIcon />
          <StyledOtherDetailItemContent>
            {contact!.companyName ? (
              contact!.companyName
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleAiOutlineHomeIcon />
          <StyledOtherDetailItemContent>
            {contact!.companyAddress ? (
              contact!.companyAddress
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>
        <StyledOtherDetailItem>
          <StyledFiFacebookIcon />
          <StyledOtherDetailItemContent>
            {contact!.facebookId ? (
              contact!.facebookId
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleFiTwitterIcon />
          <StyledOtherDetailItemContent>
            {contact!.twitterId ? (
              contact!.twitterId
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleFiInstagramIcon />
          <StyledOtherDetailItemContent>
            {contact!.instagramId ? (
              contact!.instagramId
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>
      </StyledContactDetailModalItemContent>
    </StyledContactDetailModalItem>
  );
};

export default OtherDetails;
