import React from "react";
import {
  StyledMailConnectionAvatar,
  StyledMailConnectionContent,
  StyledMailConnectionListItem,
  StyledMailConnectionTitle,
} from "./index.styled";
import { ConnectionObjType } from "@crema/types/models/apps/Mail";

type ConnectionListItemProps = {
  connection: ConnectionObjType;
};

const ConnectionListItem: React.FC<ConnectionListItemProps> = ({
  connection,
}) => {
  return (
    <>
      <StyledMailConnectionListItem key={connection.id}>
        <StyledMailConnectionAvatar alt="Remy Sharp" src={connection.image} />
        <StyledMailConnectionContent>
          <StyledMailConnectionTitle>
            {connection.name}
          </StyledMailConnectionTitle>
          <p>{connection.status}</p>
        </StyledMailConnectionContent>
      </StyledMailConnectionListItem>
    </>
  );
};

export default ConnectionListItem;
