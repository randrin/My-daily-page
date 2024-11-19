import IntlMessages from "@crema/helpers/IntlMessages";
import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import { Avatar, Checkbox, Tooltip } from "antd";
import clsx from "clsx";
import moment from "moment";
import {
  FORMAT_DATE_ONE,
  FORMAT_DATE_TWO,
  MODE_VIEW,
  StatusExpenseEnums
} from "utils/common-constants.utils";
import {
  Tt_FormatDate,
  Tt_GetUserAvatar,
} from "utils/common-functions.utils";
import { useState } from "react";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { IoMdAttach } from "react-icons/io";
import { MdOutlineMoreHoriz } from "react-icons/md";
import {
  StyledExpenseListItem,
  StyledExpenseListItemCheckView,
  StyledFlex,
  StyledUserInfoAvatar,
} from "../../index.styled";
import ExpenseActions from "./ExpenseActions";

type ExpenseListItemProps = {
  expense: ExpenseType;
  onChangeCheckedExpenses: (event: any, id: string) => void;
  checkedExpenses: string[];
  onViewExpenseDetail: (expense: ExpenseType) => void;
  key: string;
};

const getStatusExpense = (status: string) => {
  switch (status) {
    case StatusExpenseEnums.VALID: {
      return (
        <span className="tt-expenses-success">
          <FaCheck />
        </span>
      );
    }
    case StatusExpenseEnums.REJECTED: {
      return (
        <span className="tt-expenses-tomato">
          <FaChevronLeft />
        </span>
      );
    }
    case StatusExpenseEnums.PENDING: {
      return (
        <span className="tt-expenses-warning">
          <MdOutlineMoreHoriz />
        </span>
      );
    }
    case StatusExpenseEnums.UNDER_APPROVED: {
      return (
        <span className="tt-expenses-primary">
          <FaChevronRight />
        </span>
      );
    }
    case StatusExpenseEnums.ACCOUNTING: {
      return (
        <span className="tt-expenses-secondary">
          <FaMoneyBillTransfer />
        </span>
      );
    }
  }
};

const ExpenseListItem: React.FC<ExpenseListItemProps> = ({
  key,
  expense,
  onChangeCheckedExpenses,
  checkedExpenses,
  onViewExpenseDetail,
}) => {
  // states
  const [isChecked, setIsChecked] = useState(false);

  // Render
  return (
    <StyledExpenseListItem
      key={key}
      className={clsx("item-hover", {
        rootCheck: checkedExpenses.includes(expense._id),
      })}
      onClick={() => onViewExpenseDetail(expense)}
    >
      <Checkbox
        checked={checkedExpenses.includes(expense._id)}
        onClick={(event) => event.stopPropagation()}
        onChange={() => {
          setIsChecked(!isChecked);
          onChangeCheckedExpenses(!isChecked, expense._id);
        }}
      />
      <StyledExpenseListItemCheckView>
        <Tooltip
          title={
            expense.attachments.length === 0 ? (
              <IntlMessages id="common.no.attachments" />
            ) : (
              <span>
                {expense.attachments.length}{" "}
                <IntlMessages id="common.attachments" />
              </span>
            )
          }
        >
          <div
            //onClick={() => handleOnShowAttachments(expense.attachments)}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <IoMdAttach
              style={{
                fontSize: 16,
                color: expense.attachments.length === 0 ? "#d12420" : "#2a7a39",
              }}
            />
            <span style={{ fontWeight: "600" }}>
              ({expense.attachments.length})
            </span>
          </div>
        </Tooltip>
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        {expense.category.title}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        {expense.subcategory.title}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        {expense.transaction_date ? (
          <span>
            {Tt_FormatDate(
              moment(expense.transaction_date).format(FORMAT_DATE_ONE)
            )}{" "}
            <br />
            <i>{moment(expense.transaction_date).format(FORMAT_DATE_TWO)}</i>
          </span>
        ) : (
          "-"
        )}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        {expense.submission_date ? (
          <span>
            {Tt_FormatDate(
              moment(expense.submission_date).format(FORMAT_DATE_ONE)
            )}{" "}
            <br />
            <i>{moment(expense.submission_date).format(FORMAT_DATE_TWO)}</i>
          </span>
        ) : (
          "-"
        )}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        <StyledFlex>
          {expense.employee ? (
            <Tooltip title={expense.employee?.displayName}>
              {expense.employee?.photoURL ? (
                <Avatar
                  style={{
                    marginRight: 14,
                    width: 44,
                    height: 44,
                  }}
                  src={expense.employee?.photoURL.secure_url}
                />
              ) : (
                <StyledUserInfoAvatar photoRGA={expense.employee.photoRGA}>
                  {Tt_GetUserAvatar(expense.employee)}
                </StyledUserInfoAvatar>
              )}
              {/* <div
                style={{
                  flex: 2,
                }}
              >
                <Typography.Title
                  level={5}
                  style={{ fontSize: 14, marginBottom: 0 }}
                >
                  {expense.employee?.displayName}
                </Typography.Title>
                <StyledText>{expense.employee?.email}</StyledText>
              </div> */}
            </Tooltip>
          ) : (
            "-"
          )}
        </StyledFlex>
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        {expense.approvation_date ? (
          <span>
            {Tt_FormatDate(
              moment(expense.approvation_date).format(FORMAT_DATE_ONE)
            )}{" "}
            <br />
            <i>{moment(expense.approvation_date).format(FORMAT_DATE_TWO)}</i>
          </span>
        ) : (
          "-"
        )}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        <StyledFlex>
          {expense.approver ? (
            <Tooltip title={expense.approver?.displayName}>
              {expense.approver?.photoURL ? (
                <Avatar
                  style={{
                    marginRight: 14,
                    width: 44,
                    height: 44,
                  }}
                  src={expense.approver?.photoURL.secure_url}
                />
              ) : (
                <StyledUserInfoAvatar photoRGA={expense.approver.photoRGA}>
                  {Tt_GetUserAvatar(expense.approver)}
                </StyledUserInfoAvatar>
              )}
              {/* <div
                style={{
                  flex: 1,
                }}
              >
                <Typography.Title
                  level={5}
                  style={{ fontSize: 14, marginBottom: 0 }}
                >
                  {expense.approver?.displayName}
                </Typography.Title>
                <StyledText>{expense.approver?.email}</StyledText>
              </div> */}
            </Tooltip>
          ) : (
            "-"
          )}
        </StyledFlex>
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        {getStatusExpense(expense.status)}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        <b>{expense.amount.toLocaleString()}</b> {expense.currency}
      </StyledExpenseListItemCheckView>
      <StyledExpenseListItemCheckView>
        <ExpenseActions expense={expense} />
      </StyledExpenseListItemCheckView>
    </StyledExpenseListItem>
  );
};

export default ExpenseListItem;
