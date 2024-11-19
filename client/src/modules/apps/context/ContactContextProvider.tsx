import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { useRouter } from "next/router";
import type {
  ContactObjType,
  FolderObjType,
  LabelObjType,
} from "@crema/types/models/apps/Contact";

export type ContactContextType = {
  labelList: LabelObjType[];
  folderList: FolderObjType[];
  contactList: { data: ContactObjType[]; count: number };
  loading: boolean;
  page: number;
  pageView: string;
  all: string | string[] | undefined;
};

export type ContactActionContextType = {
  setContactData: (data: { data: ContactObjType[]; count: number }) => void;
  onPageChange: (data: number) => void;
  reCallAPI: () => void;
  setPageView: (data: string) => void;
  onChangePageView: (data: string) => void;
};

const ContextState: ContactContextType = {
  labelList: [],
  folderList: [],
  contactList: { data: [], count: 0 },
  loading: false,
  page: 0,
  pageView: "list",
  all: "",
};

const ContactContext = createContext<ContactContextType>(ContextState);
const ContactActionsContext = createContext<ContactActionContextType>({
  setContactData: (data: { data: ContactObjType[]; count: number }) => {},
  onPageChange: (data: number) => {},
  reCallAPI: () => {},
  setPageView: (data: string) => {},
  onChangePageView: (data: string) => {},
});

export const useContactContext = () => useContext(ContactContext);

export const useContactActionsContext = () => useContext(ContactActionsContext);

type Props = {
  children: ReactNode;
};

export const ContactContextProvider = ({ children }: Props) => {
  const [{ apiData: labelList }] = useGetDataApi<LabelObjType[]>(
    "/api/contactApp/labels/list",
    []
  );

  const [{ apiData: folderList }] = useGetDataApi<FolderObjType[]>(
    "/api/contactApp/folders/list",
    []
  );

  const [pageView, setPageView] = useState("list");
  const router = useRouter();
  const { all } = router.query;

  const [page, setPage] = useState(0);

  const [
    { apiData: contactList, loading },
    { setQueryParams, setData: setContactData, reCallAPI },
  ] = useGetDataApi<{ data: ContactObjType[]; count: number }>(
    "/api/contactApp/contact/List",
    { data: [], count: 0 },
    {},
    false
  );

  useEffect(() => {
    setPage(0);
  }, [all]);

  useEffect(() => {
    setQueryParams({
      type: all?.[0],
      name: all?.[1],
      page: page,
    });
  }, [all, page]);

  const onPageChange = (value: number) => {
    setPage(value);
  };

  const onChangePageView = (view: string) => {
    setPageView(view);
  };

  return (
    <ContactContext.Provider
      value={{
        all,
        labelList,
        folderList,
        contactList,
        loading,
        page,
        pageView,
      }}
    >
      <ContactActionsContext.Provider
        value={{
          setContactData,
          onPageChange,
          reCallAPI,
          setPageView,
          onChangePageView,
        }}
      >
        {children}
      </ContactActionsContext.Provider>
    </ContactContext.Provider>
  );
};
export default ContactContextProvider;
