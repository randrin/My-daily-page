import AppTableContainer from '@crema/components/AppTableContainer';
import styled from 'styled-components';

export const StyledAnChar = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  border-bottom: 1px solid ${({ theme }) => theme.palette.primary.main};
  display: inline-block;
`;

export const StyledBadgeRoot = styled.span`
  padding: 3px 10px;
  border-radius: 4px;
  display: inline-block;
`;

export const StyledOrderTable = styled(AppTableContainer)`
  & .ant-table-thead > tr > th {
    font-size: 13px;
    padding: 10px 8px;
    font-weight: ${({ theme }) => theme.font.weight.bold};
    background-color: transparent;
    line-height: 1.5;

    &:first-child {
      padding-left: 20px;

      [dir='rtl'] & {
        padding-left: 0;
        padding-right: 20px;
      }
    }

    &:last-child {
      padding-right: 20px;
      text-align: center;

      [dir='rtl'] & {
        padding-right: 0;
        padding-left: 20px;
      }
    }
  }

  & .ant-table-tbody > tr > td {
    font-size: 13px;
    padding: 10px 8px;
    line-height: 1.5;

    &:first-child {
      padding-left: 20px;

      [dir='rtl'] & {
        padding-left: 0;
        padding-right: 20px;
      }
    }

    &:last-child {
      padding-right: 20px;
      text-align: center;

      [dir='rtl'] & {
        padding-right: 0;
        padding-left: 20px;
      }
    }
  }
`;
