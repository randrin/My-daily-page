import React from "react";
import { StyledClientLogo } from "./index.styled";
import { AboutUsClientsData } from "@crema/mockapi/fakedb/extraPages";

type ClientLogoProps = {
  client: AboutUsClientsData;
};

const ClientLogo = ({ client }: ClientLogoProps) => {
  return (
    <StyledClientLogo>
      <img src={client.srcImg} alt={client.name} />
    </StyledClientLogo>
  );
};

export default ClientLogo;
