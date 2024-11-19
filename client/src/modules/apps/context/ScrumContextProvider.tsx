import React, { ReactNode, createContext, useContext } from "react";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type {
  BoardObjType,
  LabelObjType,
  MemberObjType,
} from "@crema/types/models/apps/ScrumbBoard";

export type ScrumContextType = {
  boardList: BoardObjType[];
  labelList: LabelObjType[];
  memberList: MemberObjType[];
};

export type ScrumActionContextType = {
  setData: (data: BoardObjType[]) => void;
};

const ContextState: ScrumContextType = {
  boardList: [],
  labelList: [],
  memberList: [],
};

const ScrumContext = createContext<ScrumContextType>(ContextState);
const ScrumActionsContext = createContext<ScrumActionContextType>({
  setData: (data: BoardObjType[]) => {},
});

export const useScrumContext = () => useContext(ScrumContext);

export const useScrumActionsContext = () => useContext(ScrumActionsContext);

type Props = {
  children: ReactNode;
};

export const ScrumContextProvider = ({ children }: Props) => {
  const [{ apiData: boardList }, { setData }] = useGetDataApi<BoardObjType[]>(
    "/api/scrumboard/board/list",
    []
  );

  const [{ apiData: labelList }] = useGetDataApi<LabelObjType[]>(
    "/api/scrumboard/label/list",
    []
  );
  const [{ apiData: memberList }] = useGetDataApi<MemberObjType[]>(
    "/api/scrumboard/member/list",
    []
  );

  return (
    <ScrumContext.Provider
      value={{
        boardList,
        labelList,
        memberList,
      }}
    >
      <ScrumActionsContext.Provider
        value={{
          setData,
        }}
      >
        {children}
      </ScrumActionsContext.Provider>
    </ScrumContext.Provider>
  );
};
export default ScrumContextProvider;
