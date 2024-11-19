import styled from "styled-components";
import AppTableContainer from "@crema/components/AppTableContainer";

export const StyledUserId = styled.span`
  text-decoration: underline;
  color: ${({ theme }) => theme.palette.primary.main};
`;

export const StyledUserBadge = styled.span`
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.cardRadius};
  display: inline-block;
`;

export const StyledUserTable = styled(AppTableContainer)`
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
  }

  & .ant-table-tbody > tr > td {
    font-size: 13px;
    padding: 14px 8px;

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

    &.user-table-more {
      display: flex;
      justify-content: flex-end;
    }
  }
`;
