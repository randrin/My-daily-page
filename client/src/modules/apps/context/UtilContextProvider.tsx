import { useGetDataApi } from "@crema/hooks/APIHooks";
import { CountryType } from "@crema/types/models/dashboards/CountryType";
import {
  TAM_COUNTRIES_URL
} from "utils/end-points.utils";
import { ReactNode, createContext, useContext } from "react";

export type UtilContextType = {
  countries: CountryType[];
};

const ContextState: UtilContextType = {
  countries: [],
};

export type UtilActionsContextType = {
  //handleOnListCountries: () => void;
};

const UtilContext = createContext<UtilContextType>(ContextState);
const UtilActionsContext = createContext<UtilActionsContextType>({
  //handleOnListCountries: () => {},
});

export const useUtilContext = () => useContext(UtilContext);

export const useUtilActionsContext = () => useContext(UtilActionsContext);

type Props = {
  children: ReactNode;
};

export const UtilContextProvider = ({ children }: Props) => {
  // States
  const [{ apiData: countries }] = useGetDataApi<{
    data: CountryType[];
  }>(TAM_COUNTRIES_URL);

  // Render
  return (
    <UtilContext.Provider
      value={{
        countries: countries?.data,
      }}
    >
      <UtilActionsContext.Provider value={{}}>
        {children}
      </UtilActionsContext.Provider>
    </UtilContext.Provider>
  );
};
