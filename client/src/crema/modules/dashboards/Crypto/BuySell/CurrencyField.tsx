import React from "react";
import { Fonts } from "@crema/constants/AppEnums";
import { StyledCurrencyWrapper, StyledInput } from "./index.styled";

type Props = {
  value: number;
  onChange: (arg: any) => any;
  coinColor: string;
  shortName: string;
  hideUSD?: boolean;
};
const CurrencyField = ({
  value,
  onChange,
  coinColor,
  shortName,
  hideUSD = false,
}: Props) => {
  const [active, setActive] = React.useState(false);

  return (
    <StyledCurrencyWrapper className={active ? "active" : ""}>
      <p className="label">Amount ({shortName})</p>
      <StyledInput
        value={value}
        bordered={false}
        onChange={(valueType) => onChange(valueType)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        addonBefore={
          hideUSD ? (
            ""
          ) : (
            <span
              style={{
                paddingTop: 15,
                fontWeight: Fonts.MEDIUM,
                fontSize: 14,
              }}
            >
              $
            </span>
          )
        }
        addonAfter={
          <span
            style={{
              color: coinColor,
              paddingTop: 15,
            }}
          >
            {shortName}
          </span>
        }
      />
    </StyledCurrencyWrapper>
  );
};

export default CurrencyField;
