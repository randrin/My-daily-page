import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import {
  ContactType,
  FolderType,
  LabelType,
} from "@crema/types/models/dashboards/ContactType";
import { Modal, message, notification } from "antd";
import { useRouter } from "next/router";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { MODE_ADD, MODE_EDIT } from "utils/common-constants.utils";
import {
  TAM_CONTACTS_URL,
  TAM_CONTACT_CREATE_URL,
  TAM_CONTACT_DELETE_URL,
  TAM_CONTACT_UPDATE_LABEL_URL,
  TAM_CONTACT_UPDATE_STARRED_URL,
  TAM_CONTACT_UPDATE_URL,
  TAM_FOLDERS_URL,
  TAM_FOLDER_CREATE_URL,
  TAM_FOLDER_DELETE_URL,
  TAM_FOLDER_UPDATE_URL,
  TAM_LABELS_URL,
  TAM_LABEL_CREATE_URL,
  TAM_LABEL_DELETE_URL,
  TAM_LABEL_UPDATE_URL,
} from "utils/end-points.utils";

export type ContactsContextType = {
  labelList: LabelType[];
  folderList: FolderType[];
  contactList: { data: ContactType[]; count: number };
  loading: boolean;
  labelLoading: boolean;
  folderLoading: boolean;
  isLabelDrawerOpen: boolean;
  isFolderDrawerOpen: boolean;
  isContactDrawerOpen: boolean;
  page: number;
  pageView: string;
  all: string | string[] | undefined;
  contact: any;
  folder: any;
  label: any;
  mode: string;
  modeLabel: string;
  modeFolder: string;
};

export type ContactsActionContextType = {
  setContactData: (data: { data: ContactType[]; count: number }) => void;
  onPageChange: (data: number) => void;
  reCallAPI: () => void;
  reCallAPILabel: () => void;
  reCallAPIFolder: () => void;
  setPageView: (data: string) => void;
  onChangePageView: (data: string) => void;
  setContactDrawerOpen: (data: boolean) => void;
  setLabelDrawerOpen: (data: boolean) => void;
  setFolderDrawerOpen: (data: boolean) => void;
  handleOnAddLabel: () => void;
  handleOnAddContact: () => void;
  setContact: (data: object) => void;
  setLabel: (data: object) => void;
  handleOnAddFolder: () => void;
  setFolder: (data: object) => void;
  handleOnSubmitLabel: () => void;
  handleOnSubmitFolder: () => void;
  handleOnSubmitContact: () => void;
  handlOnUpdateContact: (contactId: string, data: object) => void;
  handleOnUpdateLabel: (labelId: string, data: object) => void;
  handleOnUpdateFolder: (folderId: string, data: object) => void;
  handleOnEditContact: (data: object) => void;
  handleOnDeleteFolder: (folderId: string) => void;
  handleOnDeleteLabel: (labelId: string) => void;
  handleOnGetFolder: (folder: FolderType) => void;
  handleOnGetLabel: (label: LabelType) => void;
  handleOnChangeStarred: (contactId: string) => void;
  handleOnDeleteContact: (contactIds: string[]) => void;
  handleOnUpdateLabelContacts: (contactIds: string[], labelId: string) => void;
};

const ContextState: ContactsContextType = {
  labelList: [],
  folderList: [],
  contactList: { data: [], count: 0 },
  loading: false,
  labelLoading: false,
  folderLoading: false,
  isLabelDrawerOpen: false,
  isFolderDrawerOpen: false,
  isContactDrawerOpen: false,
  page: 0,
  pageView: "list",
  all: "",
  contact: {},
  folder: {},
  label: {},
  mode: MODE_ADD,
  modeLabel: MODE_ADD,
  modeFolder: MODE_ADD,
};

const ContactsContext = createContext<ContactsContextType>(ContextState);
const ContactsActionsContext = createContext<ContactsActionContextType>({
  setContactData: (data: { data: ContactType[]; count: number }) => {},
  onPageChange: (data: number) => {},
  reCallAPI: () => {},
  reCallAPILabel: () => {},
  reCallAPIFolder: () => {},
  setPageView: (data: string) => {},
  onChangePageView: (data: string) => {},
  setContactDrawerOpen: (data: boolean) => {},
  setLabelDrawerOpen: (data: boolean) => {},
  setFolderDrawerOpen: (data: boolean) => {},
  handleOnAddLabel: () => {},
  handleOnAddContact: () => {},
  setContact: (data: object) => {},
  setLabel: (data: object) => {},
  handleOnAddFolder: () => {},
  setFolder: (data: object) => {},
  handleOnSubmitLabel: () => {},
  handleOnSubmitFolder: () => {},
  handleOnSubmitContact: () => {},
  handlOnUpdateContact: (contactId: string, data: object) => {},
  handleOnUpdateLabel: (labelId: string, data: object) => {},
  handleOnUpdateFolder: (folderId: string, data: object) => {},
  handleOnEditContact: (data: object) => {},
  handleOnDeleteFolder: (folderId: string) => {},
  handleOnDeleteLabel: (labelId: string) => {},
  handleOnGetFolder: (folder: FolderType) => {},
  handleOnGetLabel: (label: LabelType) => {},
  handleOnChangeStarred: (contactId: string) => {},
  handleOnDeleteContact: (contactIds: string[]) => {},
  handleOnUpdateLabelContacts: (contactIds: string[], labelId: string) => {},
});

export const useContactsContext = () => useContext(ContactsContext);
export const useContactsActionsContext = () =>
  useContext(ContactsActionsContext);

type Props = {
  children: ReactNode;
};

export const ContactsContextProvider = ({ children }: Props) => {
  // States
  const infoViewActionsContext = useInfoViewActionsContext();
  const { messages } = useIntl();
  const [mode, setMode] = useState(MODE_ADD);
  const [modeLabel, setModeLabel] = useState(MODE_ADD);
  const [modeFolder, setModeFolder] = useState(MODE_ADD);
  const [isContactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [isLabelDrawerOpen, setLabelDrawerOpen] = useState(false);
  const [isFolderDrawerOpen, setFolderDrawerOpen] = useState(false);
  const [contact, setContact] = useState<ContactType>();
  const [folder, setFolder] = useState({
    name: "",
    icon: "",
  });
  const [label, setLabel] = useState({
    name: "",
    color: "",
  });

  const [
    { apiData: labelList, loading: labelLoading },
    { reCallAPI: reCallAPILabel },
  ] = useGetDataApi<{ data: LabelType[] }>(TAM_LABELS_URL);

  const [
    { apiData: folderList, loading: folderLoading },
    { reCallAPI: reCallAPIFolder },
  ] = useGetDataApi<{ data: FolderType[] }>(TAM_FOLDERS_URL);

  const [pageView, setPageView] = useState("list");
  const router = useRouter();
  const { all } = router.query;

  const [page, setPage] = useState(0);

  const [
    { apiData: contactList, loading },
    { setQueryParams, setData: setContactData, reCallAPI },
  ] = useGetDataApi<{ data: ContactType[]; count: number }>(
    TAM_CONTACTS_URL,
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

  // Destructing
  const confirm = Modal.confirm;

  // Functions
  const handleOnAddContact = () => {
    setMode(MODE_ADD);
    setContactDrawerOpen(!isContactDrawerOpen);
    setContact(null);
  };

  const handleOnEditContact = (contact: ContactType) => {
    setMode(MODE_EDIT);
    setContactDrawerOpen(!isContactDrawerOpen);
    setContact(contact);
  };

  const handleOnChangeStarred = async (contactId: string) => {
    await jwtAxios
      .put(`${TAM_CONTACT_UPDATE_STARRED_URL}/${contactId}`)
      .then(({ data }) => {
        reCallAPI();
        // TODO: create a custom component notification
        message.success(
          data.isStarred
            ? "common.notification.update.starred"
            : "common.notification.update.unstarred"
        );
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        infoViewActionsContext.fetchError(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handlOnUpdateContact = async (conatactId: string, contact: object) => {
    await jwtAxios
      .put(`${TAM_CONTACT_UPDATE_URL}/${conatactId}`, contact)
      .then(({ data }) => {
        reCallAPI();
        setContactDrawerOpen(!isContactDrawerOpen);
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

  const handleOnDeleteContact = async (contactIds: string[]) => {
    await jwtAxios
      .put(`${TAM_CONTACT_DELETE_URL}`, contactIds)
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
  };

  const handleOnUpdateLabelContacts = async (
    contactIds: string[],
    labelId: string
  ) => {
    await jwtAxios
      .put(`${TAM_CONTACT_UPDATE_LABEL_URL}/${labelId}`, contactIds)
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

  const handleOnAddLabel = () => {
    setModeLabel(MODE_ADD);
    setLabelDrawerOpen(!isLabelDrawerOpen);
    setLabel({ name: "", color: "" });
  };

  const handleOnAddFolder = () => {
    setModeFolder(MODE_ADD);
    setFolderDrawerOpen(!isFolderDrawerOpen);
    setFolder({ name: "", icon: "" });
  };

  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnSubmitLabel = async () => {
    await jwtAxios
      .post(TAM_LABEL_CREATE_URL, label)
      .then(({ data }) => {
        setLabel({ name: "", color: "" });
        reCallAPILabel();
        setLabelDrawerOpen(!isLabelDrawerOpen);
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

  const handleOnSubmitContact = async () => {
    await jwtAxios
      .post(TAM_CONTACT_CREATE_URL, contact)
      .then(({ data }) => {
        setContactDrawerOpen(!isContactDrawerOpen);
        setContact(null);
        reCallAPI();
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.add.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        infoViewActionsContext.fetchError(
          error.response.data.message || error.response.data.message[0]
        );
      });
  };

  const handleOnSubmitFolder = async () => {
    await jwtAxios
      .post(TAM_FOLDER_CREATE_URL, folder)
      .then(({ data }) => {
        setFolder({ name: "", icon: "" });
        reCallAPIFolder();
        setFolderDrawerOpen(!isFolderDrawerOpen);
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

  const handleOnUpdateFolder = async (folderId: string, folder: object) => {
    await jwtAxios
      .put(`${TAM_FOLDER_UPDATE_URL}/${folderId}`, folder)
      .then(({ data }) => {
        reCallAPIFolder();
        setFolderDrawerOpen(!isFolderDrawerOpen);
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

  const handleOnUpdateLabel = async (labelId: string, label: object) => {
    await jwtAxios
      .put(`${TAM_LABEL_UPDATE_URL}/${labelId}`, label)
      .then(({ data }) => {
        reCallAPILabel();
        setLabelDrawerOpen(!isLabelDrawerOpen);
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

  const handleOnDeleteFolder = async (folderId: string) => {
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
          .delete(`${TAM_FOLDER_DELETE_URL}/${folderId}`)
          .then(({ data }) => {
            reCallAPIFolder();
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

  const handleOnDeleteLabel = async (labelId: string) => {
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
          .delete(`${TAM_LABEL_DELETE_URL}/${labelId}`)
          .then(({ data }) => {
            reCallAPILabel();
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

  const handleOnGetFolder = (folder: any) => {
    setModeFolder(MODE_EDIT);
    setFolderDrawerOpen(!isFolderDrawerOpen);
    setFolder(folder);
  };

  const handleOnGetLabel = (label: LabelType) => {
    setModeLabel(MODE_EDIT);
    setLabelDrawerOpen(!isLabelDrawerOpen);
    setLabel(label);
  };

  // Render
  return (
    <ContactsContext.Provider
      value={{
        all,
        labelList: labelList?.data,
        folderList: folderList?.data,
        contactList,
        loading,
        labelLoading,
        folderLoading,
        isContactDrawerOpen,
        isFolderDrawerOpen,
        isLabelDrawerOpen,
        page,
        pageView,
        contact,
        folder,
        label,
        mode,
        modeLabel,
        modeFolder,
      }}
    >
      <ContactsActionsContext.Provider
        value={{
          setContactData,
          onPageChange,
          reCallAPI,
          reCallAPIFolder,
          reCallAPILabel,
          setPageView,
          onChangePageView,
          setContactDrawerOpen,
          setFolderDrawerOpen,
          setLabelDrawerOpen,
          setContact,
          setFolder,
          setLabel,
          handleOnAddContact,
          handleOnAddFolder,
          handleOnAddLabel,
          handleOnSubmitFolder,
          handleOnSubmitLabel,
          handleOnSubmitContact,
          handlOnUpdateContact,
          handleOnUpdateFolder,
          handleOnUpdateLabel,
          handleOnDeleteFolder,
          handleOnDeleteLabel,
          handleOnGetFolder,
          handleOnGetLabel,
          handleOnChangeStarred,
          handleOnDeleteContact,
          handleOnEditContact,
          handleOnUpdateLabelContacts,
        }}
      >
        {children}
      </ContactsActionsContext.Provider>
    </ContactsContext.Provider>
  );
};
export default ContactsContextProvider;
