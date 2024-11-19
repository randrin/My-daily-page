import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { CategoryType } from "@crema/types/models/dashboards/CategoryType";
import { SubCategoryType } from "@crema/types/models/dashboards/SubCategoryType";
import { Modal, message, notification } from "antd";
import { MODE_ADD, MODE_EDIT } from "utils/common-constants.utils";
import {
  TAM_CATEGORIES_URL,
  TAM_SUB_CATEGORIES_URL,
  TAM_SUB_CATEGORY_CREATE_URL,
  TAM_SUB_CATEGORY_DELETE_URL,
  TAM_SUB_CATEGORY_STATUS_URL,
  TAM_SUB_CATEGORY_UPDATE_URL,
} from "utils/end-points.utils";
import { ReactNode, createContext, useContext, useState } from "react";
import { useIntl } from "react-intl";

export type SubCategoryContextType = {
  categories: CategoryType[];
  subcategories: SubCategoryType[];
  loading: boolean;
  isAppDrawerOpen: boolean;
  subCategory: any;
  mode: string;
};

const ContextState: SubCategoryContextType = {
  categories: [],
  subcategories: [],
  loading: false,
  isAppDrawerOpen: false,
  subCategory: {},
  mode: MODE_ADD,
};

export type SubCategoryActionContextType = {
  //setQueryParams: (data: object) => void;
  handleOnAddSubCategory: () => void;
  setSubCategory: (data: object) => void;
  handleOnSubmit: () => void;
  setAppDrawerOpen: (data: boolean) => void;
  handleOnGetSubCategory: (data: SubCategoryType) => void;
  handleOnUpdate: (data: object) => void;
  handleOnDelete: (categoryId: string) => void;
  handleOnEnabledOrDisabled: (categoryId: string) => void;
  onPageChange: (data: number) => void;
  reCallAPI: () => void;
  setPage: (data: number) => void;
};

const SubCategoryContext = createContext<SubCategoryContextType>(ContextState);
const SubCategoryActionsContext = createContext<SubCategoryActionContextType>({
  //setQueryParams: (data: object) => {},
  handleOnAddSubCategory: () => {},
  setSubCategory: (data: object) => {},
  handleOnSubmit: () => {},
  setAppDrawerOpen: (data: boolean) => {},
  handleOnGetSubCategory: (data: SubCategoryType) => {},
  handleOnUpdate: (data: object) => {},
  handleOnDelete: (subCategoryId: string) => {},
  handleOnEnabledOrDisabled: (subCategoryId: string) => {},
  onPageChange: (data: number) => {},
  reCallAPI: () => {},
  setPage: (data: number) => {},
});

export const useSubCategoryContext = () => useContext(SubCategoryContext);

export const useSubCategoryActionsContext = () =>
  useContext(SubCategoryActionsContext);

type Props = {
  children: ReactNode;
};

export const SubCategoryContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const [mode, setMode] = useState(MODE_ADD);
  const [page, setPage] = useState(0);
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const [subCategory, setSubCategory] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [subCategoryId, setSubCategoryId] = useState("");
  const [{ apiData: categories }] = useGetDataApi<{ data: CategoryType[] }>(
    TAM_CATEGORIES_URL
  );
  const [{ apiData, loading }, { setQueryParams, reCallAPI }] = useGetDataApi<{
    data: SubCategoryType[];
  }>(TAM_SUB_CATEGORIES_URL);

  // Destructing
  const confirm = Modal.confirm;

  // Functions
  const onPageChange = (value: number) => {
    setPage(value);
  };

  const handleOnAddSubCategory = () => {
    setMode(MODE_ADD);
    setAppDrawerOpen(!isAppDrawerOpen);
    setSubCategory({ title: "", description: "", category: "" });
  };

  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnSubmit = async () => {
    await jwtAxios
      .post(TAM_SUB_CATEGORY_CREATE_URL, subCategory)
      .then(({ data }) => {
        setSubCategory({ title: "", description: "", category: "" });
        reCallAPI();
        setAppDrawerOpen(false);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.add.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnUpdate = async (subCategory: object) => {
    await jwtAxios
      .put(`${TAM_SUB_CATEGORY_UPDATE_URL}/${subCategoryId}`, subCategory)
      .then(({ data }) => {
        reCallAPI();
        setAppDrawerOpen(false);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnEnabledOrDisabled = async (subCategoryId: string) => {
    await jwtAxios
      .put(`${TAM_SUB_CATEGORY_STATUS_URL}/${subCategoryId}`)
      .then(({ data }) => {
        reCallAPI();
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnDelete = async (subCategoryId: string) => {
    confirm({
      title: handleOnGetMessage("common.modal.confirm.delete.title"),
      content: handleOnGetMessage("common.modal.confirm.delete.content"),
      okText: handleOnGetMessage("common.yes"),
      okType: "primary",
      cancelButtonProps: {
        style: { background: "#d12420", color: "white", border: "none" },
      },
      cancelText: handleOnGetMessage("common.no"),
      async onOk() {
        await jwtAxios
          .delete(`${TAM_SUB_CATEGORY_DELETE_URL}/${subCategoryId}`)
          .then(({ data }) => {
            reCallAPI();
            // TODO: create a custom component notification
            notification.success({
              message: handleOnGetMessage("common.success"),
              description: handleOnGetMessage(
                "common.notification.delete.description"
              ),
            });
          })
          .catch((error: any) => {
            console.log("Error: ", error);
            message.error(
              error.response.data.message || error.response.data.message[0]
            );
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleOnGetSubCategory = (subCategory: SubCategoryType) => {
    setMode(MODE_EDIT);
    setAppDrawerOpen(!isAppDrawerOpen);
    setSubCategoryId(subCategory._id);
    setSubCategory({
      title: subCategory.title,
      description: subCategory.description,
      category: subCategory.category._id,
    });
  };

  // Render
  return (
    <SubCategoryContext.Provider
      value={{
        categories: categories?.data,
        subcategories: apiData?.data,
        loading,
        isAppDrawerOpen,
        subCategory,
        mode,
      }}
    >
      <SubCategoryActionsContext.Provider
        value={{
          handleOnAddSubCategory,
          setSubCategory,
          handleOnSubmit,
          setAppDrawerOpen,
          handleOnGetSubCategory,
          onPageChange,
          handleOnUpdate,
          handleOnDelete,
          handleOnEnabledOrDisabled,
          //setQueryParams,
          reCallAPI,
          setPage,
        }}
      >
        {children}
      </SubCategoryActionsContext.Provider>
    </SubCategoryContext.Provider>
  );
};

export default SubCategoryContextProvider;
