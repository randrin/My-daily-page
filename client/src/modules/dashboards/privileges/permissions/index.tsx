import { PlusOutlined } from "@ant-design/icons";
import AppCard from "@crema/components/AppCard";
import AppPageMeta from "@crema/components/AppPageMeta";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import IntlMessages from "@crema/helpers/IntlMessages";
import PermissionTable from "@crema/modules/dashboards/Permissions/permissionsTable";
import { PermissionType } from "@crema/types/models/dashboards/PermissionType";
import { Button, Col, Input, Modal, Row } from "antd";
import {
  usePermissionActionsContext,
  usePermissionContext,
} from "modules/apps/context/PermissionContextProvider";
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
import { useState } from "react";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { useIntl } from "react-intl";
import { MODE_ADD, PREFIX_PERMISSION } from "utils/common-constants.utils";

const Permissions = () => {
  // States
  const { permissions, loading, isAppDrawerOpen, permission, mode } =
    usePermissionContext();
  const {
    setAppDrawerOpen,
    handleOnSubmit,
    handleOnUpdate,
    setPermission,
    handleOnAddPermission,
  } = usePermissionActionsContext();
  const { messages } = useIntl();
  const [filterData, setFilterData] = useState("");
  const [page, setPage] = useState(0);

  // Desctruction
  const { code, description } = permission;
  const { TextArea } = Input;

  // Init

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const onGetFilteredItems = () => {
    if (filterData === "") {
      return permissions;
    } else {
      return permissions.filter(
        (permission: PermissionType) =>
          permission.code.toUpperCase().includes(filterData.toUpperCase()) ||
          permission.description
            .toUpperCase()
            .includes(filterData.toUpperCase())
      );
    }
  };

  const handleOnValidate = () => {
    return !!code?.length && !!description?.length ? false : true;
  };

  const handleOnKeyPress = (event: any) => {
    var keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode > 47 && keyCode < 58) {
      event.preventDefault();
    }
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppPageMeta
        title={messages["sidebar.app.dashboard.permissions"] as string}
      />
      <StyledContent>
        <StyledTitle5>
          {messages["sidebar.app.dashboard.permissions"] as string}
        </StyledTitle5>
        <Button type="primary" className="btn" onClick={handleOnAddPermission}>
          <PlusOutlined /> <IntlMessages id="common.permission" />
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
            <PermissionTable permissionData={list || []} loading={loading} />
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
                    ? "dashboard.permission.create"
                    : "dashboard.permission.update"
                ] as string
              }
              onOk={
                mode === MODE_ADD
                  ? handleOnSubmit
                  : () => handleOnUpdate(permission._id, permission)
              }
              onCancel={() => setAppDrawerOpen(!isAppDrawerOpen)}
              footer={[
                <Button
                  key="back"
                  className="tt-expenses-space-center"
                  onClick={() => {
                    setPermission({});
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
                      : () => handleOnUpdate(permission._id, permission)
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
                    {messages["common.code"] as string}{" "}
                    <StyledRequiredField>*</StyledRequiredField>
                  </label>
                  <Input
                    addonBefore={PREFIX_PERMISSION}
                    placeholder={messages["placeholder.input"] as string}
                    value={code
                      .toLocaleUpperCase()
                      .replace(" ", "_")
                      .replace(/[^\w\s]/gi, "_")
                      .replace("__", "_")}
                    size="large"
                    onKeyPress={handleOnKeyPress}
                    name="code"
                    onChange={(e) =>
                      setPermission({
                        ...permission,
                        code: e.target.value,
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
                      setPermission({
                        ...permission,
                        description: e.target.value,
                      })
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

export default Permissions;
