import AppTableContainer from "@crema/components/AppTableContainer";
import { Avatar, Typography } from "antd";
import { rgba } from "polished";
import styled from "styled-components";

export const StyledFlex = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledText = styled(Typography.Text)`
  margin-top: 2px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledUserInfoAvatar = styled(Avatar)<{ photoRGA: string }>`
  font-size: 24px;
  background-color: ${(props) => props.photoRGA};
  width: 40px;
  right: 5px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledFormWrapper = styled.div`
  .ant-select,
  .ant-input-number {
    width: 100%;
  }

  .notification {
    margin-left: 10px;
  }
`;

export const StyledObjectStatus = styled.div`
  padding: 3px 5px;
  border-radius: 4px;
  text-align: center;
`;

export const StyledObjectTable = styled(AppTableContainer)`
  & .ant-table table {
    table-layout: auto !important;
  }

  & .ant-table-thead > tr > th {
    font-size: 13px;
    padding: 8px;
    font-weight: ${({ theme }) => theme.font.weight.bold};
    background-color: transparent;

    &:first-child {
      padding-left: 20px;

      [dir="rtl"] & {
        padding-left: 0;
        padding-right: 20px;
      }
    }

    &:last-child {
      padding-right: 20px;

      [dir="rtl"] & {
        padding-right: 0;
        padding-left: 20px;
      }
    }

    &.order-table-action {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${({ theme }) =>
        theme.palette.background.paper} !important;
    }
  }

  & .ant-table-tbody > tr > td {
    font-size: 13px;
    padding: 12px 8px;

    &:first-child {
      padding-left: 20px;

      [dir="rtl"] & {
        padding-left: 0;
        padding-right: 20px;
      }
    }

    &:last-child {
      padding-right: 20px;

      [dir="rtl"] & {
        padding-right: 0;
        padding-left: 20px;
      }
    }

    &.order-table-action {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${({ theme }) =>
        theme.palette.background.paper} !important;
    }
  }
  & .badge {
    padding: 3px 10px;
    border-radius: ${({ theme }) => theme.cardRadius};
    display: inline-block;
  }
`;

export const StyledExpenseListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.borderColor};
  padding: 7px 24px;
  cursor: pointer;
  position: relative;

  &.rootCheck {
    font-weight: ${({ theme }) => theme.font.weight.light};
    background-color: ${({ theme }) => rgba(theme.palette.primary.main, 0.2)};
  }
`;

export const StyledExpenseListItemCheckView = styled.span`
  margin-right: 16px;
  font-size: 13px;
  padding: 8px;
  padding-left: 20px;
  text-align: start;
  width: -webkit-fill-available;
  [dir="rtl"] & {
    margin-right: 0;
    margin-left: 16px;
  }
`;

export const StyledExpenseContentHeader = styled.div`
  display: flex;
  align-items: center;
  //justify-content: space-between;
  flex: 1;
`;

export const StyledExpenseContentItemHeader = styled.div`
  font-size: 13px;
  padding: 8px;
  padding-left: 20px;
  text-align: start;
  font-weight: 600;
  background-color: transparent;
  width: -webkit-fill-available;
`;
