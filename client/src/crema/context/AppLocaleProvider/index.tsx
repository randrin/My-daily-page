import React, { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { IntlGlobalProvider } from "@crema/helpers/Common";
import AppLocale from "@crema/services/localization";
import { useLocaleContext } from "../AppContextProvider/LocaleContextProvider";

interface AppLocaleProviderProps {
  children: ReactNode;
}

const AppLocaleProvider: React.FC<AppLocaleProviderProps> = (props) => {
  const { locale } = useLocaleContext();
  const currentAppLocale = AppLocale[locale.locale];

  return (
    <IntlProvider
      locale={currentAppLocale.locale}
      messages={currentAppLocale.messages}
    >
      <IntlGlobalProvider>{props.children}</IntlGlobalProvider>
    </IntlProvider>
  );
};

export default AppLocaleProvider;
