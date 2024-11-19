import { currencies, decisions } from "@crema/constants/AppConst";
import MultipleFileUpload from "@crema/core/components/upload/multiple";
import { UserType } from "@crema/types/models/dashboards/UserType";
import { Button, Col, DatePicker, Input, Modal, Row, Select } from "antd";
import { useCategoryContext } from "modules/apps/context/CategoryContextProvider";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "modules/apps/context/ExpenseContextProvider";
import { StyledRequiredField } from "modules/dashboards/index.styled";
import {
  FORMAT_DATE_THREE,
  MODE_ADD,
  StatusEnums,
  StatusExpenseEnums,
} from "utils/common-constants.utils";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle, LuClock4 } from "react-icons/lu";
import { useIntl } from "react-intl";
import dayjs from "dayjs";

type Props = {
  mode: string;
  users: UserType[];
  expense: any;
  isExpenseDrawerOpen: boolean;
  handleOnSubmitExpense: (status: string) => void;
  handleOnEditExpense: (status: string) => void;
  handleOnDenyExpense: () => void;
  setExpense: (data: any) => void;
  loading: boolean;
};

const AddExpense = ({
  mode,
  expense,
  users,
  isExpenseDrawerOpen,
  handleOnSubmitExpense,
  handleOnEditExpense,
  handleOnDenyExpense,
  setExpense,
  loading,
}: Props) => {
  // Context
  const { categories } = useCategoryContext();
  const { subcategories } = useExpenseContext();
  const { handleOnGetSubCategoriesByCategory } = useExpenseActionsContext();

  // States

  // Destruction
  const { messages } = useIntl();
  const { Option } = Select;
  const { TextArea } = Input;
  const {
    employee,
    category,
    subcategory,
    amount,
    currency,
    receipt,
    reimburse,
    comments,
    attachments,
    transaction_date,
  } = expense;

  // Init

  // Functions
  const handleOnValidate = () => {
    return !!employee?.length &&
      !!category?.length &&
      !!subcategory?.length &&
      !!amount &&
      //!!currency?.length &&
      !!receipt?.length &&
      //!!reimburse?.length &&
      !!transaction_date
      ? false
      : true;
  };

  // Render
  return (
    <Modal
      open={isExpenseDrawerOpen}
      title={
        messages[
          mode === MODE_ADD
            ? "dashboard.expense.create"
            : "dashboard.expense.update"
        ] as string
      }
      width={"720px"}
      maskClosable={false}
      onCancel={handleOnDenyExpense}
      footer={[
        <Button
          key="back"
          onClick={handleOnDenyExpense}
          className="tt-expenses-space-center"
        >
          <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
          {messages["common.back"] as string}
        </Button>,
        <Button
          key="submit_pending"
          type="primary"
          className="tt-expenses-space-center"
          loading={loading}
          onClick={() =>
            mode === MODE_ADD
              ? handleOnSubmitExpense(StatusExpenseEnums.PENDING)
              : handleOnEditExpense(StatusExpenseEnums.PENDING)
          }
          disabled={handleOnValidate()}
        >
          <LuClock4 className="tt-expenses-margin-btn-icon" />{" "}
          {messages["common.submit.wait"] as string}
        </Button>,
        <Button
          key="submit-under-approved"
          type="default"
          className="tt-expenses-background-success tt-expenses-space-center"
          loading={loading}
          onClick={() =>
            mode === MODE_ADD
              ? handleOnSubmitExpense(StatusExpenseEnums.UNDER_APPROVED)
              : handleOnEditExpense(StatusExpenseEnums.UNDER_APPROVED)
          }
          disabled={handleOnValidate()}
        >
          <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
          {messages["common.submit.sent"] as string}
        </Button>,
      ]}
    >
      <Row>
        <Col xs={12} lg={12}>
          <label htmlFor="employee" className="label">
            {messages["common.employee"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <Select
            size="large"
            value={employee || undefined}
            showSearch
            showArrow
            style={{ width: "100%" }}
            placeholder={messages["placeholder.select"] as string}
            optionFilterProp="children"
            onChange={(e) => setExpense({ ...expense, employee: e })}
          >
            {users?.map((user, index) => (
              <Option key={index} value={user._id}>
                {user.displayName}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={12}>
          <label htmlFor="category" className="label">
            {messages["common.category"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <Select
            size="large"
            value={category || undefined}
            showSearch
            showArrow
            style={{ width: "100%" }}
            placeholder={messages["placeholder.select"] as string}
            optionFilterProp="children"
            onChange={handleOnGetSubCategoriesByCategory}
          >
            {categories
              ?.filter((cat) => cat.status === StatusEnums.ACTIVE)
              .map((cat, index) => (
                <Option key={index} value={cat._id}>
                  {cat.title}
                </Option>
              ))}
          </Select>
        </Col>
        <Col xs={12} lg={12}>
          <label htmlFor="subcategory" className="label">
            {messages["common.subcategory"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <Select
            size="large"
            value={subcategory || undefined}
            showSearch
            showArrow
            disabled={!category}
            style={{ width: "100%" }}
            placeholder={messages["placeholder.select"] as string}
            optionFilterProp="children"
            onChange={(e) => setExpense({ ...expense, subcategory: e })}
          >
            {subcategories
              ?.filter((subcat) => subcat.status === StatusEnums.ACTIVE)
              .map((subcat, index) => (
                <Option key={index} value={subcat._id}>
                  {subcat.title}
                </Option>
              ))}
          </Select>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={12}>
          <label htmlFor="transaction_date" className="label">
            {messages["common.transaction.date"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <br />
          <DatePicker
            size="large"
            value={dayjs(transaction_date) || undefined}
            style={{ width: "100%" }}
            placeholder={messages["placeholder.select"] as string}
            name="transaction_date"
            onChange={(date, dateString) =>
              setExpense({
                ...expense,
                transaction_date: date,
              })
            }
            format={FORMAT_DATE_THREE}
          />
        </Col>
        <Col xs={6} lg={6}>
          <label htmlFor="receipt" className="label">
            {messages["common.receipt"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <Select
            size="large"
            value={receipt || undefined}
            showSearch
            showArrow
            style={{ width: "100%" }}
            placeholder={messages["placeholder.select"] as string}
            optionFilterProp="children"
            onChange={(e) => setExpense({ ...expense, receipt: e })}
          >
            {decisions.map((choice, index) => (
              <Option key={index} value={choice.value}>
                {choice.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={6} lg={6}>
          <label htmlFor="reimburse" className="label">
            {messages["common.reimburse"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <Select
            size="large"
            value={reimburse || undefined}
            disabled
            showSearch
            showArrow
            style={{ width: "100%" }}
            placeholder={messages["placeholder.select"] as string}
            optionFilterProp="children"
            onChange={(e) => setExpense({ ...expense, reimburse: e })}
          >
            {decisions.map((choice, index) => (
              <Option key={index} value={choice.value}>
                {choice.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={12}>
          <label htmlFor="amount" className="label">
            {messages["common.amount"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <div className="tt-expenses-d-flex">
            <Col xs={12} lg={12} className="tt-expenses-without-padding">
              <Input
                placeholder={messages["placeholder.input"] as string}
                value={amount}
                size="large"
                name="amount"
                onChange={(e) => {
                  const amount = e.target.value;
                  if (!amount || amount.match(/^\d{1,}(\.\d{0,2})?$/)) {
                    setExpense({
                      ...expense,
                      amount,
                    });
                  }
                }}
              />
            </Col>
            <Col xs={12} lg={12}>
              <Select
                size="large"
                value={currency || undefined}
                disabled
                showSearch
                showArrow
                style={{ width: "100%" }}
                placeholder={messages["placeholder.select"] as string}
                optionFilterProp="children"
                onChange={(e) => setExpense({ ...expense, currency: e })}
              >
                {currencies.map((currency, index) => (
                  <Option key={index} value={currency.value}>
                    {currency.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </div>
        </Col>
      </Row>
      <Row style={{ marginBottom: "0px !important" }}>
        <Col xs={24} lg={24}>
          <label htmlFor="attachments" className="label">
            {messages["common.attachments"] as string}{" "}
            <StyledRequiredField>*</StyledRequiredField>
          </label>
          <MultipleFileUpload items={expense} setItems={setExpense} />
        </Col>
      </Row>
      <Row>
        <Col xs={24} lg={24}>
          <label htmlFor="comments" className="label">
            {messages["common.comments"] as string}{" "}
          </label>
          <TextArea
            name="comments"
            placeholder={messages["placeholder.textarea"] as string}
            value={comments}
            rows={3}
            onChange={(e) =>
              setExpense({ ...expense, comments: e.target.value })
            }
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default AddExpense;
