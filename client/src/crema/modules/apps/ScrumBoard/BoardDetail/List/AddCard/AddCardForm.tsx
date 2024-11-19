import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import CardAttachments from "./CardAttachments";
import CardCheckedList from "./CardCheckedList";
import CardComments from "./CardComments";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { Avatar, Button, Col, Form, Input, Select } from "antd";
import AppRowContainer from "@crema/components/AppRowContainer";
import {
  StyledMultiSelect,
  StyledMultiSelectName,
  StyledScrumBoardAddCardForm,
  StyledScrumBoardAddCardFormContent,
  StyledScrumBoardAddCardFormFooter,
  StyledScrumBoardDatePicker,
  StyledScrumBoardScrollbar,
} from "./index.styled";
import { postDataApi, putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  BoardObjType,
  CardListObjType,
  CheckedListObjType,
  AttachmentObjType,
  LabelObjType,
  MemberObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";
import { AuthUserType } from "@crema/types/models/AuthUser";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

const { Option } = Select;
const { TextArea } = Input;

type AddCardFormProps = {
  board: BoardObjType;
  list: CardListObjType | null;
  checkedList: CheckedListObjType[];
  handleCancel: () => void;
  setCheckedList: (checkList: CheckedListObjType[]) => void;
  comments: any[];
  values?: any;
  setFieldValue?: (name: string, value: any) => void;
  setComments: (comments: any[]) => void;
  authUser: AuthUserType | null;
  attachments: AttachmentObjType[];
  setAttachments: (attachments: AttachmentObjType[]) => void;
  selectedLabels: LabelObjType[];
  setSelectedLabels: (lables: LabelObjType[]) => void;
  selectedMembers: MemberObjType[];
  setMembersList: (members: MemberObjType[]) => void;
  selectedCard: CardObjType | null;
  onCloseAddCard: () => void;
  isSubmitting?: boolean;
  setData?: any;
};

const AddCardForm: React.FC<AddCardFormProps> = ({
  board,
  list,
  checkedList,
  setCheckedList,
  handleCancel,
  comments,
  setComments,
  setSelectedLabels,
  authUser,
  attachments,
  setAttachments,
  selectedLabels,
  selectedMembers,
  setMembersList,
  selectedCard,
  onCloseAddCard,
  isSubmitting,
  setData,
}) => {
  const { messages } = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [{ apiData: labelList }] = useGetDataApi(
    "/api/scrumboard/label/list",
    []
  );
  const [{ apiData: memberList }] = useGetDataApi(
    "/api/scrumboard/member/list",
    []
  );

  console.log("board, list: ", board, list);
  const onDeleteCheckedItem = (id: number) => {
    const updatedList = checkedList.filter(
      (item: CheckedListObjType) => item.id !== id
    );
    setCheckedList(updatedList);
  };

  const onAddNewCheckedItem = () => {
    const item = {
      id: generateRandomUniqueNumber(),
      title: "",
    };
    const updatedList = checkedList.concat(item);
    setCheckedList(updatedList);
  };

  const onSetCheckedItemText = (title: string, id: number) => {
    const updatedList = checkedList.map((item) => {
      if (item.id === id) {
        item.title = title;
        return item;
      } else {
        return item;
      }
    });
    setCheckedList(updatedList);
  };

  const onAddNewComment = (comment: any) => {
    setComments(
      comments.concat({
        comment: comment,
        sender: {
          id: authUser!._id,
          name: authUser!.displayName ? authUser!.displayName : "User",
          image: authUser!.photoURL,
        },
        date: dayjs().format("MMM DD"),
      })
    );
  };

  const onDeleteAttachment = (id: number) => {
    const updatedAttachments = attachments.filter(
      (attachment) => attachment.id !== id
    );
    setAttachments(updatedAttachments);
  };

  const onFinish = (values: any) => {
    console.log("values", values);
    if (selectedCard) {
      const editedCard = {
        ...selectedCard,
        comments: comments,
        ...values,
        attachments: attachments,
        members: selectedMembers,
        label: selectedLabels,
        checkedList: checkedList.filter((item) => item.title !== ""),
      };
      putDataApi("/api/scrumboard/edit/card", infoViewActionsContext, {
        board,
        list,
        card: editedCard,
      })
        .then((data) => {
          setData(data);
          handleCancel();
          infoViewActionsContext.showMessage("Card Edited Successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    } else {
      const newCard = {
        id: generateRandomUniqueNumber(),
        attachments: attachments,
        checkedList: [],
        comments: comments,
        ...values,
        label: selectedLabels,
        members: selectedMembers,
      };
      postDataApi("/api/scrumboard/add/card", infoViewActionsContext, {
        board,
        list,
        card: newCard,
      })
        .then((data) => {
          setData(data);
          handleCancel();
          infoViewActionsContext.showMessage("Card Added Successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };

  const updateLabelList = (values: any) => {
    setSelectedLabels(
      labelList.filter((label: LabelObjType) => values.includes(label.id))
    );
  };

  const updateMemberList = (values: any) => {
    setMembersList(
      memberList.filter((member: MemberObjType) => values.includes(member.id))
    );
  };

  return (
    <StyledScrumBoardAddCardForm
      noValidate
      autoComplete="off"
      initialValues={{
        title: selectedCard?.title,
        desc: selectedCard?.desc,
        date:
          selectedCard && selectedCard.date
            ? dayjs(selectedCard.date, "DD-MM-YYYY")
            : "",
        label: selectedCard?.label.map((data) => data.id),
        members: selectedCard?.members.map((data) => data.id),
      }}
      onFinish={onFinish}
    >
      <StyledScrumBoardScrollbar>
        <StyledScrumBoardAddCardFormContent>
          <AppRowContainer>
            <Col xs={24} md={16}>
              <Form.Item name="title">
                <Input placeholder={messages["common.title"] as string} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="date">
                <StyledScrumBoardDatePicker />
              </Form.Item>
            </Col>
          </AppRowContainer>

          <Form.Item name="desc">
            <TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              placeholder={messages["common.description"] as string}
            />
          </Form.Item>

          <AppRowContainer>
            <Col xs={24} lg={12}>
              <Form.Item name="label">
                <Select
                  mode="multiple"
                  allowClear
                  maxTagCount={3}
                  style={{ width: "100%" }}
                  placeholder="Please select Label"
                  onChange={(value) => updateLabelList(value)}
                >
                  {labelList.map((label: LabelObjType) => (
                    <Option key={label.id} value={label.id}>
                      {label.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item name="members">
                <Select
                  mode="multiple"
                  maxTagCount={2}
                  placeholder="Please select Members"
                  onChange={(value) => updateMemberList(value)}
                >
                  {memberList.map((member: MemberObjType) => (
                    <Option key={member.id} value={member.id}>
                      <StyledMultiSelect>
                        {member.image ? (
                          <Avatar src={member.image} />
                        ) : (
                          <Avatar>{member.name.toUpperCase()}</Avatar>
                        )}
                        <StyledMultiSelectName>
                          {member.name}
                        </StyledMultiSelectName>
                      </StyledMultiSelect>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </AppRowContainer>

          <CardAttachments
            attachments={attachments}
            onDeleteAttachment={onDeleteAttachment}
          />

          {selectedCard ? (
            <CardCheckedList
              onAddNewCheckedItem={onAddNewCheckedItem}
              checkedList={checkedList}
              onDeleteCheckedItem={onDeleteCheckedItem}
              onSetCheckedItemText={onSetCheckedItemText}
            />
          ) : null}

          <CardComments comments={comments} onAddNewComment={onAddNewComment} />
        </StyledScrumBoardAddCardFormContent>
      </StyledScrumBoardScrollbar>
      <StyledScrumBoardAddCardFormFooter>
        <Button type="primary" ghost onClick={onCloseAddCard}>
          <IntlMessages id="common.cancel" />
        </Button>
        <Button type="primary" disabled={isSubmitting} htmlType="submit">
          <IntlMessages id="common.done" />
        </Button>
      </StyledScrumBoardAddCardFormFooter>
    </StyledScrumBoardAddCardForm>
  );
};

export default AddCardForm;
