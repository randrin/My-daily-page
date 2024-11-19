import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import { Input } from "antd";
import {
  StyledContactDetailModalItemTitle,
  StyledContactNote,
} from "./index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

const { TextArea } = Input;

type NotesProps = {
  contact: ContactObjType | null;
};

const Notes: React.FC<NotesProps> = ({ contact }) => {
  const { messages } = useIntl();

  return (
    <StyledContactNote>
      <StyledContactDetailModalItemTitle>
        <IntlMessages id="common.notes" />
      </StyledContactDetailModalItemTitle>

      <TextArea
        rows={4}
        placeholder={messages["common.notes"] as string}
        name="notes"
        value={contact!.notes}
      />
    </StyledContactNote>
  );
};
export default Notes;
