import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import React from "react";
import {
  StyledContactDetailModalItem,
  StyledContactDetailModalItemContent,
  StyledContactDetailModalItemTitle,
  StyledFiFacebookIcon,
  StyledOtherDetailItem,
  StyledOtherDetailItemContent,
  StyleFiInstagramIcon,
  StyleFiTwitterIcon,
} from "./index.styled";

type SocialMediaProps = {
  contact: ContactType | null;
};

const SocialMedia: React.FC<SocialMediaProps> = ({ contact }) => {
  // Render
  return (
    <StyledContactDetailModalItem>
      <StyledContactDetailModalItemTitle>
        <IntlMessages id="common.socialMedia" />
      </StyledContactDetailModalItemTitle>

      <StyledContactDetailModalItemContent>
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

export default SocialMedia;
