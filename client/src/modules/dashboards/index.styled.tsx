import styled from "styled-components";

export const StyledRequiredField = styled.span`
  color: red;
  left: 5px;
  position: relative;
`;

export const StyledContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  .tt_detail-expense-box {
    display: flex;
    align-items: center;
    justify-content: center;
    .btn {
      right: 10px;
      position: relative;
      cursor: pointer;
    }
  }
`;

export const StyledCategoryContainer = styled.div`
  .tt-category-row {
    margin-bottom: 15px;
    // .tt-category-col {
    //   display: grid;
    //   align-items: center;
    //   justify-content: start;
    //   .label {
    //     margin-bottom: 5px;
    //   }
    // }
  }
`;

export const StyledDetailReportContainer = styled.div`
  background-color: #ffff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  .tt_detail-expense {
    margin-bottom: 15px;
    .tt_detail-expense-description {
      font-weight: 800;
      font-size: 18px;
    }
    .tt_detail-expense-value {
      position: relative;
      left: 15px;
    }
    .tt_detail-expense-right {
      text-align: right;
    }
`;


export const StyledSendMessage = styled.div`
  max-width: 500px;
  margin-bottom: 20px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.md}px) {
    margin-bottom: 24px;
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.lg}px) {
    margin-bottom: 28px;
  }
`;

export const StyledSendMessageTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: ${({ theme }) => theme.font.weight.bold};

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.md}px) {
    font-size: 20px;
  }
`;

export const StyledContactAddress = styled.div`
  position: relative;

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.lg}px) {
    margin-left: 20px;

    [dir='rtl'] & {
      margin-left: 0;
      margin-right: 20px;
    }
  }
`;

export const StyledContactAddressItem = styled.div`
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: ${({ theme }) => theme.sizes.borderRadius.base};
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 14px 20px;

  & p {
    margin-bottom: 0;
  }
`;

export const StyledAvatarIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.primary.main};
  border-radius: ${({ theme }) => theme.sizes.borderRadius.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;

  [dir='rtl'] & {
    margin-right: 0;
    margin-left: 14px;
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.md}px) {
    margin-right: 16px;
    width: 48px;
    height: 48px;

    [dir='rtl'] & {
      margin-right: 0;
      margin-left: 16px;
    }
  }

  & svg {
    font-size: 20px;
  }
`;