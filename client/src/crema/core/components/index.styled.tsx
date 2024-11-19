import AppCard from "@crema/components/AppCard";
import { rgba } from "polished";
import styled from "styled-components";

export const StyledWidgetCardCountStatistics = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const StyledWidgetCardCountStaticsThumb = styled.div`
  margin-right: 16px;

  [dir="rtl"] & {
    margin-right: 0;
    margin-left: 16px;
  }
`;

export const StyledWidgetCardCountStaticsContent = styled.div`
  width: calc(100% - 70px);

  & .title {
    font-size: ${({ theme }) => theme.font.size.lg};
    margin-bottom: 2px;
  }

  & p {
    margin-bottom: 0;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const StyledUserGraphWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: column;
  margin-left: -8px;
  margin-right: -8px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.sm}px) {
    flex-direction: row;
  }

  & text {
    fill: ${({ theme }) => theme.palette.text.primary};
  }
  & .user-item {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;

    @media screen and (min-width: ${({ theme }) => theme.breakpoints.sm}px) {
      width: 46%;
    }
    @media screen and (min-width: ${({ theme }) => theme.breakpoints.lg}px) {
      width: 45%;
    }
    @media screen and (min-width: ${({ theme }) => theme.breakpoints.xl}px) {
      width: 50%;
    }
  }
  & .user-graph-item {
    padding-left: 0;
    @media screen and (max-width: ${({ theme }) => theme.breakpoints.sm}px) {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    @media screen and (min-width: ${({ theme }) => theme.breakpoints.sm}px) {
      width: 54%;
    }
    @media screen and (min-width: ${({ theme }) => theme.breakpoints.lg}px) {
      width: 55%;
    }
    @media screen and (min-width: ${({ theme }) => theme.breakpoints.xl}px) {
      width: 50%;
    }
  }
`;

export const StyledListItem = styled.div`
  padding-right: 32px;
  padding-left: 8px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  & .user-wrapper {
    display: flex;
    align-items: center;
    width: -webkit-fill-available;
  }
  & .user-text {
    color: ${({ theme }) => theme.palette.text.secondary};
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    font-size: 14px !important;
    font-weight: 500;

    width: calc(100% - 20px);
    /* & > .muitypography-root {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: '100%';
    } */
  }
  & .dot-icon {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
  }
`;

export const StyledExpenseCard = styled(AppCard)`
  height: 100%;
`;

export const StyledExpenseAction = styled.div`
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  flex-direction: column;

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.sm}px) {
    align-items: center;
    flex-direction: row;
  }

  & .expense-action-view {
    display: none;
    align-items: center;
    flex-wrap: wrap;
    margin-right: 10px;
    @media screen and (min-width: ${({ theme }) => theme.breakpoints.sm}px) {
      display: flex;
    }
  }

  & .expense-action-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    line-height: 1;
    padding-bottom: 2px;
    &:not(:first-of-type) {
      border-left: solid 1px
        ${({ theme }) => rgba(theme.palette.text.secondary, 0.2)};
      margin-left: 16px;
      padding-left: 16px;
    }
  }
  & .dot-expense {
    height: 10px;
    width: 10px;
    margin-right: 4px;
    border-radius: 50%;
  }
`;