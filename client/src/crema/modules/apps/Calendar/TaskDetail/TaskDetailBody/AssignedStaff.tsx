import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledTodoAssignedStaff,
  StyledTodoAssignedStaffInfo,
  StyledTodoAssignedStaffTitle,
  StyledTodoAvatar36,
} from "../index.styled";
import { StaffObjType } from "@crema/types/models/apps/Todo";

type Props = {
  assignedStaff: StaffObjType;
};

const AssignedStaff = ({ assignedStaff }: Props) => {
  return (
    <>
      {assignedStaff ? (
        <StyledTodoAssignedStaff>
          {assignedStaff.image ? (
            <StyledTodoAvatar36 src={assignedStaff.image} />
          ) : (
            <StyledTodoAvatar36 className="todo-avatar-name">
              {assignedStaff?.name.charAt(0)}
            </StyledTodoAvatar36>
          )}
          <StyledTodoAssignedStaffInfo>
            <p>
              <IntlMessages id="todo.assignedTo" />
            </p>
            <StyledTodoAssignedStaffTitle>
              {assignedStaff.name}
            </StyledTodoAssignedStaffTitle>
          </StyledTodoAssignedStaffInfo>
        </StyledTodoAssignedStaff>
      ) : (
        <StyledTodoAssignedStaff>
          <StyledTodoAvatar36 src={"/assets/images/placeholder.jpg"} />
          <StyledTodoAssignedStaffInfo>
            <StyledTodoAssignedStaffTitle>
              <IntlMessages id="todo.currentlyUnassigned" />
            </StyledTodoAssignedStaffTitle>
          </StyledTodoAssignedStaffInfo>
        </StyledTodoAssignedStaff>
      )}
    </>
  );
};

export default AssignedStaff;
