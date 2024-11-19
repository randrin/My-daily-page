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
  StyleAiOutlineHomeIcon,
  StyleRiFoldersLineIcon,
} from "./index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type OtherDetailsProps = {
  contact: ContactObjType | null;
};

const OtherDetails: React.FC<OtherDetailsProps> = ({ contact }) => {
  return (
    <StyledContactDetailModalItem>
      <StyledContactDetailModalItemTitle>
        <IntlMessages id="common.otherDetails" />
      </StyledContactDetailModalItemTitle>

      <StyledContactDetailModalItemContent>
        <StyledOtherDetailItem>
          <StyleRiFoldersLineIcon />
          <StyledOtherDetailItemContent>
            {contact!.company ? (
              contact!.company
            ) : (
              <IntlMessages id="common.na" />
            )}
          </StyledOtherDetailItemContent>
        </StyledOtherDetailItem>

        <StyledOtherDetailItem>
          <StyleAiOutlineHomeIcon />
          <StyledOtherDetailItemContent>
            {contact!.address ? (
              contact!.address
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
      </StyledContactDetailModalItemContent>
    </StyledContactDetailModalItem>
  );
};

export default OtherDetails;
