import { PlusOutlined } from "@ant-design/icons";
import AppCard from "@crema/components/AppCard";
import AppPageMeta from "@crema/components/AppPageMeta";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Button, Col, Input, Modal, Row, Select } from "antd";
import {
  useContactsActionsContext,
  useContactsContext,
} from "modules/apps/context/ContactsContextProvider";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import {
  StyledOrderFooterPagination,
  StyledOrderHeader,
  StyledOrderHeaderInputView,
  StyledOrderHeaderPagination,
} from "modules/ecommerce/Orders/index.styled";
import { useState } from "react";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { useIntl } from "react-intl";
import { LabelColorEnums, MODE_ADD } from "utils/common-constants.utils";
import { StyledContent, StyledRequiredField } from "../../index.styled";
import { MdLabelOutline } from "react-icons/md";
import LabelTable from "@crema/modules/dashboards/Contacts/Labels/LabelsTable";

const Labels = () => {
  // States
  const { labelList, labelLoading, isLabelDrawerOpen, label, modeLabel } =
    useContactsContext();
  const {
    setLabelDrawerOpen,
    handleOnSubmitLabel,
    handleOnUpdateLabel,
    setLabel,
    handleOnAddLabel,
  } = useContactsActionsContext();
  const { messages } = useIntl();
  const [filterData, setFilterData] = useState({
    title: "",
    description: "",
  });
  const [page, setPage] = useState(0);

  // Desctruction
  const { name, color } = label;
  const { Option } = Select;

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const searchFolder = (title: string) => {
    setFilterData({ ...filterData, title });
  };

  const handleOnValidate = () => {
    return !!name?.length && !!color?.length ? false : true;
  };
  // Render
  return (
    <>
      <AppPageMeta title={messages["common.labels"] as string} />
      <StyledContent>
        <StyledTitle5>{messages["common.labels"] as string}</StyledTitle5>
        <Button type="primary" className="btn" onClick={handleOnAddLabel}>
          <PlusOutlined /> <IntlMessages id="common.label" />
        </Button>
      </StyledContent>
      <AppRowContainer>
        <Col xs={24} lg={24}>
          <AppCard
            title={
              <AppsHeader>
                <StyledOrderHeader>
                  <StyledOrderHeaderInputView>
                    <Input
                      id="user-name"
                      placeholder={messages["common.searchHere"] as string}
                      type="search"
                      onChange={(event) => searchFolder(event.target.value)}
                    />
                  </StyledOrderHeaderInputView>
                  <StyledOrderHeaderPagination
                    pageSize={10}
                    count={labelList?.length}
                    page={page}
                    onChange={onChange}
                  />
                </StyledOrderHeader>
              </AppsHeader>
            }
          >
            <LabelTable labelData={labelList || []} loading={labelLoading} />
            <StyledOrderFooterPagination
              pageSize={10}
              count={labelList?.length}
              page={page}
              onChange={onChange}
            />
            <Modal
              open={isLabelDrawerOpen}
              title={
                messages[
                  modeLabel === MODE_ADD
                    ? "dashboard.label.create"
                    : "dashboard.label.update"
                ] as string
              }
              onOk={
                modeLabel === MODE_ADD
                  ? handleOnSubmitLabel
                  : () => handleOnUpdateLabel(label._id, label)
              }
              onCancel={() => setLabelDrawerOpen(!isLabelDrawerOpen)}
              footer={[
                <Button
                  key="back"
                  className="tt-expenses-space-center"
                  onClick={() => {
                    setLabel({});
                    setLabelDrawerOpen(!isLabelDrawerOpen);
                  }}
                >
                  <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
                  {messages["common.back"] as string}
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  className="tt-expenses-space-center"
                  loading={labelLoading}
                  onClick={
                    modeLabel === MODE_ADD
                      ? handleOnSubmitLabel
                      : () => handleOnUpdateLabel(label._id, label)
                  }
                  disabled={handleOnValidate()}
                >
                  <LuCheckCircle className="tt-expenses-margin-btn-icon" />
                  {messages["common.submit"] as string}
                </Button>,
              ]}
            >
              <Row>
                <Col xs={24} lg={16}>
                  <label htmlFor="name" className="label">
                    {messages["common.name"] as string}{" "}
                    <StyledRequiredField>*</StyledRequiredField>
                  </label>
                  <Input
                    placeholder={messages["placeholder.input"] as string}
                    value={name?.charAt(0).toLocaleUpperCase() + name?.slice(1)}
                    size="large"
                    name="name"
                    onChange={(e) =>
                      setLabel({
                        ...label,
                        name: e.target.value,
                      })
                    }
                  />
                </Col>
                <Col xs={24} lg={8}>
                  <label htmlFor="color" className="label">
                    {messages["common.color"] as string}{" "}
                    <StyledRequiredField>*</StyledRequiredField>
                  </label>
                  <Select
                    size="large"
                    value={color || undefined}
                    showSearch
                    showArrow
                    style={{ width: "100%" }}
                    placeholder={<IntlMessages id="placeholder.select" />}
                    optionLabelProp="label"
                    optionFilterProp="label"
                    onChange={(e) =>
                      setLabel({
                        ...label,
                        color: e,
                      })
                    }
                  >
                    {Object.values(LabelColorEnums)?.map((cor, index) => (
                      <Option
                        key={index}
                        value={cor}
                        label={
                          <div className="tt-expenses-space-start">
                            <span className="ml-4">
                              {<MdLabelOutline style={{ color: `${cor}` }} />}
                            </span>
                          </div>
                        }
                      >
                        <div className="tt-expenses-space-start">
                          <span className="ml-4">
                            {<MdLabelOutline style={{ color: `${cor}` }} />}
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Modal>
          </AppCard>
        </Col>
      </AppRowContainer>
    </>
  );
};

export default Labels;
