import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledContactDetailModalItem,
  StyledContactDetailModalItemContent,
  StyledContactDetailModalItemTitle,
  StyledFiFacebookIcon,
  StyledOtherDetailItem,
  StyledOtherDetailItemContent,
  StyleFiTwitterIcon,
} from "./index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type SocialMediaProps = {
  contact: ContactObjType | null;
};

const SocialMedia: React.FC<SocialMediaProps> = ({ contact }) => {
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
      </StyledContactDetailModalItemContent>
    </StyledContactDetailModalItem>
  );
};

export default SocialMedia;
