import * as React from "react";
import PortfolioCard from "./PortfolioCard";
import { useRouter } from "next/router";
import AppGrid from "@crema/components/AppGrid";
import { StyledTabs } from "../index.styled";
import {
  PortfolioType,
  PortfolioTypes,
} from "@crema/types/models/extrapages/Portfolio";
import { useIntl } from "react-intl";

type Props = {
  portfolio: PortfolioType;
};

const PortfolioTabs = ({ portfolio }: Props) => {
  const [value, setValue] = React.useState("0");
  const router = useRouter();

  const { messages } = useIntl();

  const onTabsChange = (activeKey: string) => {
    setValue(activeKey);
  };

  const onViewPortfolioDetail = (data: PortfolioTypes) => {
    router.push(`/extra-pages/portfolio/${data.id}`);
  };

  const tabs = [
    {
      key: "1",
      label: messages["common.all"] as string,
      children: (
        <AppGrid
          data={portfolio.all}
          responsive={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
          }}
          renderItem={(data, index) => (
            <PortfolioCard
              key={index}
              onViewPortfolioDetail={onViewPortfolioDetail}
              portfolio={data}
            />
          )}
        />
      ),
    },
    {
      key: "2",
      label: messages["extra.branding"] as string,
      children: (
        <AppGrid
          data={portfolio.branding}
          responsive={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
          }}
          renderItem={(data, index) => (
            <PortfolioCard
              key={index}
              onViewPortfolioDetail={onViewPortfolioDetail}
              portfolio={data}
            />
          )}
        />
      ),
    },
    {
      key: "3",
      label: messages["extra.graphics"] as string,
      children: (
        <AppGrid
          data={portfolio.graphics}
          responsive={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
          }}
          renderItem={(data, index) => (
            <PortfolioCard
              key={index}
              onViewPortfolioDetail={onViewPortfolioDetail}
              portfolio={data}
            />
          )}
        />
      ),
    },
    {
      key: "4",
      label: messages["extra.logos"] as string,
      children: (
        <AppGrid
          data={portfolio.logos}
          responsive={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
          }}
          renderItem={(data, index) => (
            <PortfolioCard
              key={index}
              onViewPortfolioDetail={onViewPortfolioDetail}
              portfolio={data}
            />
          )}
        />
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <StyledTabs
        defaultActiveKey={value}
        onChange={onTabsChange}
        items={tabs}
      />
    </div>
  );
};

export default PortfolioTabs;
