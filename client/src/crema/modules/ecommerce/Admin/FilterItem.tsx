import AppCard from "@crema/components/AppCard";
import React from "react";
import AppRowContainer from "@crema/components/AppRowContainer";
import dayjs from "dayjs";
import { Col, DatePicker, InputNumber, Select, Switch } from "antd";
import { StyledFormWrapper } from "./index.styled";
import { FilterType } from "@crema/types/models/ecommerce/EcommerceApp";

const { Option } = Select;

const statusList = [
  {
    id: 1,
    name: "In Stock",
    value: true,
  },
  {
    id: 2,
    name: "Out of Stock",
    value: false,
  },
];

type Props = {
  filterData: FilterType;
  setFilterData: React.Dispatch<React.SetStateAction<FilterType>>;
};

const Filter = ({ filterData, setFilterData }: Props) => {
  return (
    <AppCard title="Filter ">
      <StyledFormWrapper>
        <AppRowContainer>
          <Col xs={24}>
            <Select
              placeholder="status"
              onChange={(value) => {
                setFilterData((prev) => ({
                  ...prev,
                  inStock: [value === 1],
                }));
              }}
            >
              {statusList.map((status) => (
                <Option key={status.id} value={status.id}>
                  {status.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <InputNumber
              placeholder="Start Price"
              onChange={(value) => {
                setFilterData((prev) => ({
                  ...prev,
                  mrp: { start: value ? +value : 0, end: filterData.mrp.end },
                }));
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <InputNumber
              placeholder="End Price"
              onChange={(value) => {
                setFilterData((prev) => ({
                  ...prev,
                  mrp: { start: filterData.mrp.start, end: value ? +value : 0 },
                }));
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <DatePicker
              defaultValue={filterData?.createdAt?.start as any}
              allowClear={false}
              onChange={(value) => {
                console.log(
                  "DatePickervalue",
                  value,
                  dayjs(value).format("DD MMM YYYY")
                );
                setFilterData((prev) => ({
                  ...prev,
                  createdAt: {
                    start: dayjs(value).format("DD MMM YYYY"),
                    end: filterData?.createdAt?.end,
                  },
                }));
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <DatePicker
              defaultValue={filterData?.createdAt?.end as any}
              allowClear={false}
              onChange={(value) =>
                setFilterData((prev) => ({
                  ...prev,
                  createdAt: {
                    start: filterData?.createdAt?.start,
                    end: dayjs(value).format("DD MMM YYYY"),
                  },
                }))
              }
            />
          </Col>
          <Col xs={24}>
            <Switch />
            <span className="notification">Notifications</span>
          </Col>
        </AppRowContainer>
      </StyledFormWrapper>
    </AppCard>
  );
};

export default Filter;
