import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import { Input } from "antd";
import React from "react";
import { useIntl } from "react-intl";
import {
  StyledContactDetailModalItemTitle,
  StyledContactNote,
} from "./index.styled";

const { TextArea } = Input;

type NotesProps = {
  contact: ContactType | null;
};

const Notes: React.FC<NotesProps> = ({ contact }) => {
  // Desctructing
  const { messages } = useIntl();

  // Render
  return (
    <StyledContactNote>
      <StyledContactDetailModalItemTitle>
        <IntlMessages id="common.notes" />
      </StyledContactDetailModalItemTitle>
      <TextArea
        rows={3}
        placeholder={messages["common.notes"] as string}
        name="notes"
        disabled={true}
        value={contact!.notes}
      />
    </StyledContactNote>
  );
};
export default Notes;
