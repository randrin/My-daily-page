import AppCard from "@crema/components/AppCard";
import AppSelect from "@crema/components/AppSelect";
import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { FORMAT_DATE_ONE } from "utils/common-constants.utils";

type DataStaticsProps = {
  data: ExpenseType[];
};

type DataStaticProps = {
  month: string;
  number: number;
};

const WidgetStatisticGraph: React.FC<DataStaticsProps> = ({ data }) => {
  // States
  const [yearSelected, setYearSelected] = useState(
    new Date().getFullYear().toString()
  );
  const [selectYears, setSelectYears] = useState([]);
  const [dataStatics, setDataStatics] = useState<DataStaticProps[]>([]);

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

  // Desctructing
  const { messages } = useIntl();

  // Functions
  const handleOnTransformDataExpenses = () => {
    const dataGraph: DataStaticProps[] = [
      { month: "Jan", number: handleOnNumberExpenseByMonth("01") },
      { month: "Feb", number: handleOnNumberExpenseByMonth("02") },
      { month: "Mar", number: handleOnNumberExpenseByMonth("03") },
      { month: "Apr", number: handleOnNumberExpenseByMonth("04") },
      { month: "May", number: handleOnNumberExpenseByMonth("05") },
      { month: "Jun", number: handleOnNumberExpenseByMonth("06") },
      { month: "Jul", number: handleOnNumberExpenseByMonth("07") },
      { month: "Aug", number: handleOnNumberExpenseByMonth("08") },
      { month: "Sep", number: handleOnNumberExpenseByMonth("09") },
      { month: "Oct", number: handleOnNumberExpenseByMonth("10") },
      { month: "Nov", number: handleOnNumberExpenseByMonth("11") },
      { month: "Dec", number: handleOnNumberExpenseByMonth("12") },
    ];
    setDataStatics(dataGraph);
  };

  const handleOnNumberExpenseByMonth = (month: string) => {
    return data.filter(
      (expense) =>
        moment(expense.createdAt).format(FORMAT_DATE_ONE).split("-")[1] ===
          month &&
        moment(expense.createdAt).format(FORMAT_DATE_ONE).split("-")[0] ===
          yearSelected
    ).length;
  };

  const handleYearChange = (value: string) => {
    setYearSelected(value);
  };

  // Render
  return (
    <AppCard
      title={messages["dashboard.expense.statistics"] as string}
      extra={
        <div className="ant-row ant-row-middle">
          <AppSelect
            menus={selectYears}
            defaultValue={yearSelected}
            onChange={handleYearChange}
          />
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart
          data={dataStatics}
          margin={{ top: 50, right: 0, left: -5, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                className="statics-graph-color"
                stopOpacity={0.1}
              />
              <stop
                offset="95%"
                className="statics-graph-color"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <Tooltip labelStyle={{ color: "black" }} />
          <CartesianGrid
            strokeDasharray="2 10"
            horizontal={false}
            vertical={false}
          />
          <Area
            type="monotone"
            dataKey="number"
            className="statics-graph-color"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </AppCard>
  );
};

export default WidgetStatisticGraph;
