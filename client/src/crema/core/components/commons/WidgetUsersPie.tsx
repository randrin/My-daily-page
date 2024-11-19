import AppCard from "@crema/components/AppCard";
import { List } from "antd";
import { StyledListItem, StyledUserGraphWrapper } from "../index.styled";
import { useIntl } from "react-intl";
import { UserType } from "@crema/types/models/dashboards/UserType";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Fonts } from "@crema/constants/AppEnums";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusEnums } from "utils/common-constants.utils";

type DataProps = {
  data: UserType[];
};

type DataUserProps = {
  name: string;
  value: number;
  color: string;
};

const getBackgroundColorStatus = (status: string) => {
  switch (status) {
    case StatusEnums.ACTIVE: {
      return "tt-expenses-background-success";
    }
    case StatusEnums.DISABLED: {
      return "tt-expenses-background-tomato";
    }
    case StatusEnums.PENDING: {
      return "tt-expenses-background-warning";
    }
    case StatusEnums.NEVER_CONNECTED: {
      return "tt-expenses-background-sliver";
    }
    case StatusEnums.ARCHIVED: {
      return "tt-expenses-background-primary";
    }
  }
};

const getColorStatus = (status: string) => {
  switch (status) {
    case StatusEnums.ACTIVE: {
      return "#2a7a39";
    }
    case StatusEnums.DISABLED: {
      return "#d12420";
    }
    case StatusEnums.PENDING: {
      return "#fa9600";
    }
    case StatusEnums.NEVER_CONNECTED: {
      return "#e0e0e1";
    }
    case StatusEnums.ARCHIVED: {
      return "#00b5ec";
    }
  }
};

const WidgetUsersPie: React.FC<DataProps> = ({ data }) => {
  // States
  const [usersData, setUsersData] = useState<DataUserProps[]>([]);

  // Desctructing
  const { messages } = useIntl();

  // Init
  useEffect(() => {
    const dataPies: DataUserProps[] = [];
    Object.values(StatusEnums).map((status) => {
      const dataPie: DataUserProps = {
        name: messages[
          `common.status.${status.replaceAll("_", ".").toLocaleLowerCase()}`
        ] as string,
        value: data.filter((user) => user.status === status).length,
        color: getColorStatus(status),
      };
      dataPies.push(dataPie);
    });
    setUsersData(dataPies);
  }, []);

  // Render
  return (
    <AppCard
      title={messages["dashboard.user.total"] as string}
      extra={
        <Link href={"/dashboards/users"}>
          {messages["common.viewAll"] as string}
        </Link>
      }
    >
      <StyledUserGraphWrapper>
        <div className="user-item user-graph-item">
          <ResponsiveContainer height={250}>
            <PieChart>
              <text
                x="50%"
                fontWeight={Fonts.MEDIUM}
                fontSize={20}
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {data.length}
              </text>
              <text
                x="50%"
                fontWeight={Fonts.MEDIUM}
                fontSize={20}
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {messages["common.users"] as string}
              </text>
              <Pie
                data={usersData}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="80%"
                outerRadius="95%"
              >
                {Object.values(StatusEnums).map((status, index) => (
                  <Cell key={index} fill={getColorStatus(status)} />
                ))}
              </Pie>
              <Tooltip
                labelStyle={{ color: "black" }}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#31354188",
                  background: "#FFFFFFCA",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="user-item">
          <List>
            {Object.values(StatusEnums).map((status, index) => {
              return (
                <StyledListItem key={index}>
                  <div className="user-wrapper">
                    <div
                      style={{ backgroundColor: "red" }}
                      className={`dot-icon ${getBackgroundColorStatus(status)}`}
                    />
                    <div className="user-text">
                      <IntlMessages
                        id={`common.status.${status
                          .replaceAll("_", ".")
                          .toLocaleLowerCase()}`}
                      />
                    </div>
                  </div>
                </StyledListItem>
              );
            })}
          </List>
        </div>
      </StyledUserGraphWrapper>
    </AppCard>
  );
};
export default WidgetUsersPie;
