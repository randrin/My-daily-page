import { PlusOutlined } from "@ant-design/icons";
import AppCard from "@crema/components/AppCard";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import LegendUserStatus from "@crema/core/components/commons/LegendUserStatus";
import IntlMessages from "@crema/helpers/IntlMessages";
import FilterUsersItem from "@crema/modules/dashboards/users/FilterUsersItem";
import UsersTable from "@crema/modules/dashboards/users/usersTable";
import {
  FilterUserType,
  UserType,
} from "@crema/types/models/dashboards/UserType";
import {
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Radio,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import {
  useOrganizationActionsContext,
  useOrganizationContext,
} from "modules/apps/context/OrganizationContextProvider";
import {
  useUserActionsContext,
  useUserContext,
} from "modules/apps/context/UserContextProvider";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import {
  StyledOrderFooterPagination,
  StyledOrderHeader,
  StyledOrderHeaderInputView,
  StyledOrderHeaderPagination,
} from "modules/ecommerce/Orders/index.styled";
import moment from "moment";
import {
  FORMAT_DATE_FOURTH,
  GenderEnums,
  MODE_ADD,
  StatusEnums,
} from "utils/common-constants.utils";
import { useState } from "react";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { useIntl } from "react-intl";
import { StyledContent, StyledRequiredField } from "../index.styled";
import AppPageMeta from "@crema/components/AppPageMeta";
import { useRoleContext } from "modules/apps/context/RoleContextProvider";

const Users = () => {
  // States
  const { messages } = useIntl();
  const { users, loading, user, mode, isAppDrawerOpen } = useUserContext();
  const { organizations } = useOrganizationContext();
  const { reCallAPI } = useOrganizationActionsContext();
  const { roles } = useRoleContext();
  const {
    handleOnAddUser,
    handleOnSubmitUser,
    setUser,
    setAppDrawerOpen,
    handleOnUpdateUser,
  } = useUserActionsContext();
  const [page, setPage] = useState(0);
  const [filterData, setFilterData] = useState<FilterUserType>({
    fullName: "",
    status: "",
    defaultPassword: false,
    mrp: { start: 0, end: 30000 },
    createdAt: { start: "", end: "" },
  });

  // Destructing
  const { Option } = Select;
  const {
    firstName,
    lastName,
    email,
    role,
    phoneNumber,
    gender,
    dateOfBorn,
    groups,
  } = user;

  // Init

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const onGetFilteredItems = () => {
    if (filterData.fullName === "") {
      return users;
    } else {
      return users.filter((user: UserType) =>
        user.displayName
          .toUpperCase()
          .includes(filterData.fullName.toUpperCase())
      );
    }
  };

  const handleOnValidate = () => {
    return !!firstName?.length &&
      !!lastName?.length &&
      !!email?.length &&
      !!gender?.length &&
      !!role?.length &&
      groups?.length >= 1 &&
      !!moment(dateOfBorn).format(FORMAT_DATE_FOURTH)?.length &&
      !!phoneNumber
      ? false
      : true;
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppPageMeta title={messages["common.users"] as string} />
      <div className="tt-expenses-space-between">
        <StyledContent>
          <StyledTitle5>{messages["common.users"] as string}</StyledTitle5>
        </StyledContent>
        <StyledContent>
          <Button type="primary" className="btn" onClick={handleOnAddUser}>
            <PlusOutlined /> <IntlMessages id="common.user" />
          </Button>
        </StyledContent>
      </div>
      <AppRowContainer>
        <Col xs={24} lg={19}>
          <AppCard
            title={
              <AppsHeader>
                <StyledOrderHeader>
                  <StyledOrderHeaderInputView>
                    <Input
                      id="user-name"
                      placeholder={messages["common.searchHere"] as string}
                      type="search"
                      onChange={(event) =>
                        setFilterData({
                          ...filterData,
                          fullName: event.target.value,
                        })
                      }
                    />
                  </StyledOrderHeaderInputView>
                  <LegendUserStatus />
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
            <UsersTable userData={list || []} loading={loading} />
            <StyledOrderFooterPagination
              pageSize={10}
              count={list?.length}
              page={page}
              onChange={onChange}
            />
          </AppCard>
        </Col>
        <Col xs={24} lg={5}>
          <FilterUsersItem
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </Col>
      </AppRowContainer>
      {/* Add and Update User */}
      <Modal
        title={
          mode === MODE_ADD
            ? (messages["dashboard.user.create"] as string)
            : (messages["dashboard.user.update"] as string)
        }
        open={isAppDrawerOpen}
        onCancel={() => setAppDrawerOpen(!isAppDrawerOpen)}
        footer={[
          <Button
            key="back"
            onClick={() => setAppDrawerOpen(!isAppDrawerOpen)}
            className="tt-expenses-space-center"
          >
            <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
            {messages["common.back"] as string}
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="tt-expenses-space-center"
            onClick={
              mode === MODE_ADD
                ? handleOnSubmitUser
                : () => {
                    handleOnUpdateUser(user._id, user);
                    reCallAPI();
                  }
            }
            disabled={handleOnValidate()}
          >
            <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
            {messages["common.submit"] as string}
          </Button>,
        ]}
      >
        <Row>
          <Col xs={24} lg={12}>
            <label htmlFor="gender" className="label">
              {messages["common.gender"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <br />
            <Radio.Group
              onChange={(e) => setUser({ ...user, gender: e.target.value })}
              value={gender}
            >
              <Radio value={GenderEnums.MALE}>
                {messages["common.gender.male"] as string}
              </Radio>
              <Radio value={GenderEnums.FEMALE}>
                {messages["common.gender.female"] as string}
              </Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={24} lg={12}>
            <label htmlFor="firstName" className="label">
              {messages["common.firstname"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Input
              name="firstName"
              size="large"
              value={firstName}
              placeholder={messages["placeholder.input"] as string}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
          </Col>
          <Col xs={24} lg={12}>
            <label htmlFor="lastName" className="label">
              {messages["common.lastname"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Input
              name="lastName"
              size="large"
              value={lastName}
              placeholder={messages["placeholder.input"] as string}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24} lg={24}>
            <label htmlFor="email" className="label">
              {messages["common.email"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Input
              name="email"
              size="large"
              type="email"
              value={email}
              placeholder={messages["placeholder.input"] as string}
              onChange={(e) =>
                setUser({
                  ...user,
                  email: e.target.value,
                })
              }
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24} lg={24}>
            <label htmlFor="role" className="label">
              {messages["common.role"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Select
              size="large"
              value={role || undefined}
              showSearch
              showArrow
              style={{ width: "100%" }}
              placeholder={messages["placeholder.select"] as string}
              optionFilterProp="children"
              onChange={(e) => setUser({ ...user, role: e })}
            >
              {roles?.map((role, index) => (
                <Option key={index} value={role.title}>
                  <span className="tt-expenses-primary">
                    {
                      <IntlMessages
                        id={`common.role.${role.title.toLowerCase()}`}
                      />
                    }
                  </span>{" "}
                  - <i>{role.description}</i>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row>
          <Col xs={24} lg={24}>
            <label htmlFor="groups" className="label">
              {messages["sidebar.app.dashboard.organizations"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Select
              size="large"
              value={groups || undefined}
              showSearch
              showArrow
              mode="multiple"
              style={{ width: "100%" }}
              placeholder={messages["placeholder.select"] as string}
              optionFilterProp="children"
              onChange={(e) => setUser({ ...user, groups: e })}
            >
              {organizations
                ?.filter((org) => org.status === StatusEnums.ACTIVE)
                .map((org, index) => (
                  <Option key={index} value={org._id}>
                    {org.name}
                  </Option>
                ))}
            </Select>
          </Col>
        </Row>
        <Row className="pb-15">
          <Col xs={24} lg={12}>
            <label htmlFor="dateOfBorn" className="label">
              {messages["common.birthday"] as string}{" "}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <br />
            <DatePicker
              size="large"
              value={dayjs(dateOfBorn) || undefined}
              style={{ width: "100%" }}
              placeholder={messages["placeholder.select"] as string}
              name="dateOfBorn"
              onChange={(date, dateString) =>
                setUser({
                  ...user,
                  dateOfBorn: date,
                })
              }
              format={FORMAT_DATE_FOURTH}
            />
          </Col>
          <Col xs={24} lg={12}>
            <label htmlFor="phoneNumber" className="label">
              {messages["common.phone"] as string}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Input
              name="phoneNumber"
              size="large"
              value={phoneNumber}
              placeholder={messages["placeholder.input"] as string}
              onChange={(e) =>
                setUser({
                  ...user,
                  phoneNumber: e.target.value.replace(/\D/g, ""), // Accept only numbers
                })
              }
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default Users;
