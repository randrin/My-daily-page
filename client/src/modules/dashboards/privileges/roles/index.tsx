import { PlusOutlined } from "@ant-design/icons";
import AppCard from "@crema/components/AppCard";
import AppPageMeta from "@crema/components/AppPageMeta";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import IntlMessages from "@crema/helpers/IntlMessages";
import RoleTable from "@crema/modules/dashboards/Role/rolesTable";
import { RoleType } from "@crema/types/models/dashboards/RoleType";
import { Button, Col, Input, Modal, Row } from "antd";
import {
  useRoleActionsContext,
  useRoleContext,
} from "modules/apps/context/RoleContextProvider";
import {
  StyledContent,
  StyledRequiredField,
} from "modules/dashboards/index.styled";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import {
  StyledOrderFooterPagination,
  StyledOrderHeader,
  StyledOrderHeaderInputView,
  StyledOrderHeaderPagination,
} from "modules/ecommerce/Orders/index.styled";
import React, { useState } from "react";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { useIntl } from "react-intl";
import { MODE_ADD } from "utils/common-constants.utils";

const Roles = () => {
  // States
  const { roles, loading, isAppDrawerOpen, role, mode } = useRoleContext();
  const {
    setAppDrawerOpen,
    handleOnSubmit,
    handleOnUpdate,
    setRole,
    handleOnAddRole,
  } = useRoleActionsContext();
  const { messages } = useIntl();
  const [filterData, setFilterData] = useState("");
  const [page, setPage] = useState(0);

  // Desctruction
  const { title, description } = role;
  const { TextArea } = Input;

  // Init

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const onGetFilteredItems = () => {
    if (filterData === "") {
      return roles;
    } else {
      return roles.filter(
        (role: RoleType) =>
          role.title.toUpperCase().includes(filterData.toUpperCase()) ||
          role.description.toUpperCase().includes(filterData.toUpperCase())
      );
    }
  };

  const handleOnValidate = () => {
    return !!title?.length && !!description?.length ? false : true;
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppPageMeta title={messages["sidebar.app.dashboard.roles"] as string} />
      <StyledContent>
        <StyledTitle5>
          {messages["sidebar.app.dashboard.roles"] as string}
        </StyledTitle5>
        <Button type="primary" className="btn" onClick={handleOnAddRole}>
          <PlusOutlined /> <IntlMessages id="common.role" />
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
                      onChange={(event) => setFilterData(event.target.value)}
                    />
                  </StyledOrderHeaderInputView>
                  <StyledOrderHeaderPagination
                    pageSize={10}
                    count={list?.length}
                    page={page}
                    onChange={onChange}
                  />
                </StyledOrderHeader>
              </AppsHeader>
            }
          >
            <RoleTable roleData={list || []} loading={loading} />
            <StyledOrderFooterPagination
              pageSize={10}
              count={list?.length}
              page={page}
              onChange={onChange}
            />
            <Modal
              open={isAppDrawerOpen}
              title={
                messages[
                  mode === MODE_ADD
                    ? "dashboard.role.create"
                    : "dashboard.role.update"
                ] as string
              }
              onOk={
                mode === MODE_ADD
                  ? handleOnSubmit
                  : () => handleOnUpdate(role._id, role)
              }
              onCancel={() => setAppDrawerOpen(!isAppDrawerOpen)}
              footer={[
                <Button
                  key="back"
                  className="tt-expenses-space-center"
                  onClick={() => {
                    setRole({});
                    setAppDrawerOpen(!isAppDrawerOpen);
                  }}
                >
                  <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
                  {messages["common.back"] as string}
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  className="tt-expenses-space-center"
                  loading={loading}
                  onClick={
                    mode === MODE_ADD
                      ? handleOnSubmit
                      : () => handleOnUpdate(role._id, role)
                  }
                  disabled={handleOnValidate()}
                >
                  <LuCheckCircle className="tt-expenses-margin-btn-icon" />
                  {messages["common.submit"] as string}
                </Button>,
              ]}
            >
              <Row>
                <Col xs={24} lg={24}>
                  <label htmlFor="title" className="label">
                    {messages["common.role"] as string}{" "}
                    <StyledRequiredField>*</StyledRequiredField>
                  </label>
                  <Input
                    placeholder={messages["placeholder.input"] as string}
                    value={
                      title?.charAt(0).toLocaleUpperCase() + title?.slice(1)
                    }
                    size="large"
                    name="title"
                    onChange={(e) =>
                      setRole({
                        ...role,
                        title: e.target.value,
                      })
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={24} lg={24}>
                  <label htmlFor="description" className="label">
                    {messages["common.description"] as string}{" "}
                  </label>
                  <TextArea
                    name="description"
                    placeholder={messages["placeholder.textarea"] as string}
                    value={description}
                    rows={3}
                    onChange={(e) =>
                      setRole({ ...role, description: e.target.value })
                    }
                  />
                </Col>
              </Row>
            </Modal>
          </AppCard>
        </Col>
      </AppRowContainer>
    </>
  );
};

export default Roles;
