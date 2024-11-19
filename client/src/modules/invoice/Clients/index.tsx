import AppGrid from "@crema/components/AppGrid";
import AppLoader from "@crema/components/AppLoader";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { ClientItem } from "@crema/modules/invoice";
import { Button } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { StyledTypographyWrapper } from "../index.styled";
import { ClientType } from "@crema/types/models/invoice";

const Clients = () => {
  const router = useRouter();
  const [{ apiData: clientsList, loading }] = useGetDataApi<ClientType[]>(
    "/api/invoice/clients",
    [],
    {},
    true
  );

  return !isEmptyObject(clientsList) ? (
    <StyledTypographyWrapper>
      <div>
        <Button
          type="primary"
          style={{ display: "block", marginLeft: "auto", marginBottom: 12 }}
          onClick={() => router.push("/invoice/clients/add")}
        >
          Add Clients
        </Button>
      </div>
      <AppGrid
        responsive={{
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
        }}
        loading={loading}
        data={clientsList}
        renderItem={(client) => <ClientItem client={client} />}
      />
    </StyledTypographyWrapper>
  ) : (
    <AppLoader />
  );
};

export default Clients;
