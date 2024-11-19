import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { useIntl } from "react-intl";
import ChangeStaff from "./ChangeStaff";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import { Input } from "antd";
import TaskLabel from "./TaskLabel";
import { FiSend } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineEdit } from "react-icons/ai";
import AppIconButton from "@crema/components/AppIconButton";
import {
  StyledDetailContent,
  StyledTodoDetailBtn,
  StyledTodoDetailContentHeader,
  StyledTodoDetailContentHeaderLabel,
  StyledTodoDetailContentHeaderLeft,
  StyledTodoDetailContentHeaderTag,
  StyledTodoDetailContentHeaderTagBtn,
  StyledTodoDetailFooter,
  StyledTodoDetailPara,
  StyledTodoDetailStaff,
  StyledTodoDetailStaffEdit,
  StyledTodoDetailStaffEditBtnView,
  StyledTodoDetailStaffRow,
  StyledTodoDetailStatus,
  StyledTodoDetailStatusPri,
  StyledTodoDetailTextAreaForm,
  StyledTodoDivider,
} from "../index.styled";
import { useGetDataApi, putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  CommentsLists,
  AssignedStaff,
  TodoDatePicker,
  TaskCreatedByInfo,
  TaskLabels,
} from "@crema/modules/apps/ToDo";
import { StaffObjType, TodoObjType } from "@crema/types/models/apps/Todo";
import { getDateObject, getFormattedDate } from "@crema/helpers/DateHelper";

type TaskDetailBodyProps = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const TaskDetailBody: React.FC<TaskDetailBodyProps> = ({
  selectedTask,
  onUpdateSelectedTask,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();

  const { user } = useAuthUser();

  const [{ apiData: staffList }] = useGetDataApi<StaffObjType[]>(
    "/api/todo/staff/list",
    []
  );

  const [isEdit, setEdit] = useState(false);

  const [title, setTitle] = useState(selectedTask.title);
  const [content, setContent] = useState(selectedTask.content);

  const [comment, setComment] = useState("");

  const [scheduleDate, setScheduleDate] = useState(
    getDateObject(selectedTask.startDate)
  );

  const [selectedStaff, setStaff] = useState(selectedTask.assignedTo);

  const inputLabel = React.useRef(null);

  const [labelWidth, setLabelWidth] = React.useState(0);

  useEffect(() => {
    setLabelWidth(60);
  }, []);

  const onClickEditButton = () => {
    setEdit(true);
  };

  const onDoneEditing = () => {
    const task = selectedTask;
    task.content = content;
    task.title = title;
    task.startDate = getFormattedDate(scheduleDate);
    task.assignedTo = selectedStaff;
    putDataApi<{ task: TodoObjType }>(
      "/api/todoApp/task/",
      infoViewActionsContext,
      {
        task,
      }
    )
      .then((data) => {
        onUpdateSelectedTask(data.task);
        infoViewActionsContext.showMessage("Task Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
    console.log("onDoneEditing: ", task);
    setEdit(!isEdit);
  };

  const onAddComments = () => {
    const task = selectedTask;
    task.comments = task.comments.concat({
      comment: comment,
      name: user.displayName ? user.displayName : "User",
      image: user.photoURL.secure_url,
      date: dayjs().format("MMM DD"),
    });
    putDataApi<{ task: TodoObjType }>(
      "/api/todoApp/task/",
      infoViewActionsContext,
      {
        task,
      }
    )
      .then((data) => {
        onUpdateSelectedTask(data.task);
        infoViewActionsContext.showMessage("Task Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
    setComment("");
  };

  const handleStaffChange = (value: number) => {
    const newStaff = staffList.find(
      (staff: StaffObjType) => staff.id === value
    ) as StaffObjType;
    setStaff((staff) => {
      return { ...staff, ...newStaff };
    });
  };

  const { messages } = useIntl();

  return (
    <StyledDetailContent>
      <StyledTodoDetailContentHeader>
        <StyledTodoDetailContentHeaderLeft>
          {isEdit ? (
            <Input
              style={{ maxWidth: 200, marginRight: 20 }}
              placeholder={messages["todo.taskTitle"] as string}
              defaultValue={title}
              onChange={({ target: { value } }) => setTitle(value)}
            />
          ) : (
            <h2>{selectedTask.title}</h2>
          )}

          <StyledTodoDetailContentHeaderLabel className="ant-row ant-row-middle">
            {selectedTask.label ? (
              <TaskLabels labels={selectedTask.label} />
            ) : null}
          </StyledTodoDetailContentHeaderLabel>

          <StyledTodoDetailContentHeaderTag>
            <StyledTodoDetailContentHeaderTagBtn
              style={{
                color: selectedTask.priority.color,
                backgroundColor: selectedTask.priority.color + "10",
              }}
            >
              {selectedTask.priority.name}
            </StyledTodoDetailContentHeaderTagBtn>
          </StyledTodoDetailContentHeaderTag>
        </StyledTodoDetailContentHeaderLeft>

        <TaskCreatedByInfo
          createdBy={selectedTask.createdBy}
          createdOn={selectedTask.createdOn}
        />
      </StyledTodoDetailContentHeader>

      <StyledTodoDetailStaffEdit>
        <StyledTodoDetailStaffRow>
          {isEdit ? (
            <>
              <StyledTodoDetailStaff>
                <ChangeStaff
                  inputLabel={inputLabel}
                  labelWidth={labelWidth}
                  selectedStaff={selectedStaff}
                  handleStaffChange={handleStaffChange}
                />
              </StyledTodoDetailStaff>
              <TodoDatePicker
                scheduleDate={scheduleDate}
                setScheduleDate={setScheduleDate}
              />
            </>
          ) : (
            <AssignedStaff assignedStaff={selectedTask.assignedTo} />
          )}
        </StyledTodoDetailStaffRow>

        <StyledTodoDetailStaffEditBtnView>
          {!isEdit ? (
            <AppIconButton
              onClick={onClickEditButton}
              icon={<AiOutlineEdit />}
            />
          ) : (
            <AppIconButton
              onClick={onDoneEditing}
              icon={<AiOutlineCheckCircle />}
            />
          )}
        </StyledTodoDetailStaffEditBtnView>
      </StyledTodoDetailStaffEdit>

      <StyledTodoDivider />

      {!isEdit ? (
        <StyledTodoDetailPara>{content}</StyledTodoDetailPara>
      ) : (
        <StyledTodoDetailTextAreaForm>
          <Input.TextArea
            placeholder={messages["common.description"] as string}
            defaultValue={content}
            onChange={({ target: { value } }) => setContent(value)}
          />
        </StyledTodoDetailTextAreaForm>
      )}

      <StyledTodoDetailStatusPri>
        <StyledTodoDetailStatus>
          <TaskStatus
            selectedTask={selectedTask}
            onUpdateSelectedTask={onUpdateSelectedTask}
          />
        </StyledTodoDetailStatus>

        <StyledTodoDetailStatus>
          <TaskPriority
            selectedTask={selectedTask}
            onUpdateSelectedTask={onUpdateSelectedTask}
          />
        </StyledTodoDetailStatus>
        <StyledTodoDetailStatus>
          <TaskLabel
            selectedTask={selectedTask}
            onUpdateSelectedTask={onUpdateSelectedTask}
          />
        </StyledTodoDetailStatus>
      </StyledTodoDetailStatusPri>

      <StyledTodoDivider />

      <CommentsLists comments={selectedTask.comments} />

      <StyledTodoDetailFooter>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 2 }}
          placeholder={messages["common.writeComment"] as string}
          value={comment}
          onChange={({ target: { value } }) => setComment(value)}
        />
        <StyledTodoDetailBtn
          shape="circle"
          type="primary"
          disabled={!comment}
          onClick={onAddComments}
        >
          <FiSend />
        </StyledTodoDetailBtn>
      </StyledTodoDetailFooter>
    </StyledDetailContent>
  );
};

export default TaskDetailBody;
