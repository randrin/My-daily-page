import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import React, { useEffect, useState } from "react";
import { StyledExpenseAction, StyledExpenseCard } from "../index.styled";
import { useIntl } from "react-intl";
import AppSelect from "@crema/components/AppSelect";
import moment from "moment";
import {
  FORMAT_DATE_ONE,
  StatusExpenseEnums,
} from "utils/common-constants.utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Props = {
  data: ExpenseType[];
};

type DataStaticProps = {
  month: string;
  valid: number;
  accounting: number;
};

const WidgetExpensesGraph = ({ data }: Props) => {
  // States
  const [yearSelected, setYearSelected] = useState(
    new Date().getFullYear().toString()
  );
  const [selectYears, setSelectYears] = useState([]);
  const [dataStatics, setDataStatics] = useState<DataStaticProps[]>([]);
  const { messages } = useIntl();

  // Init
  useEffect(() => {
    // Set up years selection
    const yearValues = data
      .map(
        (expense) =>
          moment(expense.createdAt).format(FORMAT_DATE_ONE).split("-")[0]
      )
      .filter((value, index, self) => self.indexOf(value) === index);
    setSelectYears(yearValues);

    // Set up data graph
    handleOnTransformDataExpenses();
  }, [data, yearSelected]);

  // Functions
  const handleOnTransformDataExpenses = () => {
    const dataGraph: DataStaticProps[] = [
      {
        month: "Jan",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "01"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "01"
        ),
      },
      {
        month: "Feb",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "02"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "02"
        ),
      },
      {
        month: "Mar",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "03"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "03"
        ),
      },
      {
        month: "Apr",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "04"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "04"
        ),
      },
      {
        month: "May",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "05"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "05"
        ),
      },
      {
        month: "Jun",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "06"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "06"
        ),
      },
      {
        month: "Jul",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "07"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "07"
        ),
      },
      {
        month: "Aug",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "08"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "08"
        ),
      },
      {
        month: "Sep",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "09"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "09"
        ),
      },
      {
        month: "Oct",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "10"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "10"
        ),
      },
      {
        month: "Nov",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "11"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "11"
        ),
      },
      {
        month: "Dec",
        valid: handleOnNumberExpenseByMonth(StatusExpenseEnums.VALID, "12"),
        accounting: handleOnNumberExpenseByMonth(
          StatusExpenseEnums.ACCOUNTING,
          "12"
        ),
      },
    ];
    setDataStatics(dataGraph);
  };

  const handleOnNumberExpenseByMonth = (status: string, month: string) => {
    return data
      .filter(
        (expense) =>
          moment(expense.createdAt).format(FORMAT_DATE_ONE).split("-")[1] ===
            month &&
          expense.status === status &&
          moment(expense.createdAt).format(FORMAT_DATE_ONE).split("-")[0] ===
            yearSelected
      )
      .map((expense) => expense.amount)
      .reduce((a, b) => a + b, 0);
  };

  const handleYearChange = (value: string) => {
    setYearSelected(value);
  };

  // Render
  return (
    <StyledExpenseCard
      title={messages["dashboard.expense.approved.accounting"]}
      extra={
        <StyledExpenseAction>
          <div className="expense-action-view">
            <div className="expense-action-item">
              <span
                className="dot-expense"
                style={{ backgroundColor: "#0A8FDC" }}
              />
              {messages["dashboard.expense.approved"] as string}
            </div>
            <div className="expense-action-item">
              <span
                className="dot-expense"
                style={{ backgroundColor: "#F04F47" }}
              />
              {messages["dashboard.expense.accounting"] as string}
            </div>
          </div>
          <AppSelect
            menus={selectYears}
            defaultValue={yearSelected}
            onChange={handleYearChange}
          />
        </StyledExpenseAction>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={dataStatics}
          margin={{ top: 50, right: 0, left: -5, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis tickLine={false} axisLine={false} begin={-100} />
          <Tooltip
            labelStyle={{ color: "black" }}
            contentStyle={{
              borderRadius: 12,
              borderColor: "#31354188",
              background: "#FFFFFFCA",
            }}
          />
          <CartesianGrid stroke="#eee" horizontal={true} vertical={false} />
          <Line
            type="monotone"
            dataKey="valid"
            stroke="#0A8FDC"
            dot={false}
            strokeWidth={2.5}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dot={false}
            strokeWidth={2.5}
            dataKey="accounting"
            stroke="#F04F47"
          />
        </LineChart>
      </ResponsiveContainer>
    </StyledExpenseCard>
  );
};

export default WidgetExpensesGraph;
