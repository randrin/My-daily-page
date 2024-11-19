import React from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import {
  StyledDeliveryAddrCell,
  StyledDeliveryAddressItem,
  StyledDeliveryAddrRow,
  StyledDeliveryEditBtn,
  StyledDeliveryRadio,
} from "../index.styled";
import type { AddressesType } from "@crema/types/models/ecommerce/EcommerceApp";

type Props = {
  address: AddressesType;
  selectedAddress: AddressesType;
  setSelectAddress: (data: AddressesType) => void;
};
const AddressCell = ({ address, selectedAddress, setSelectAddress }: Props) => {
  const isActive = selectedAddress.id === address.id;
  return (
    <StyledDeliveryAddrCell
      onClick={() => setSelectAddress(address)}
      className="item-hover"
    >
      <StyledDeliveryAddrRow>
        <StyledDeliveryRadio checked={isActive}>
          {address.name}
        </StyledDeliveryRadio>
        <p className="mb-0">{address.mobile}</p>
        {isActive ? (
          <StyledDeliveryEditBtn size="small">
            <EditOutlined />
          </StyledDeliveryEditBtn>
        ) : null}
      </StyledDeliveryAddrRow>
      <StyledDeliveryAddressItem>
        {address.addressLine}, {address.city}, {address.pin}
      </StyledDeliveryAddressItem>
      {isActive ? (
        <StyledDeliveryAddressItem>
          <Button type="primary">Deliver Here</Button>
        </StyledDeliveryAddressItem>
      ) : null}
    </StyledDeliveryAddrCell>
  );
};

export default AddressCell;
