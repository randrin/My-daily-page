import { Typography } from 'antd';
import styled from 'styled-components';

export const StyledFlex = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledFlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
`;

export const StyledAvatar = styled.span`
  margin-right: 14px;
  height: 46px;
  width: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: '50%';
`;

export const StyledText = styled(Typography.Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  margin-top: 2px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const StyledToggleContainer = styled.div`
  position: relative;
  @media only screen and (min-width: 1200px) and (max-width: 1579px) {
    display: 'none';
  }
`;

export const StyledSuccessContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme }) => theme.palette.success.main};
`;

export const StyledPercentText = styled.span`
  margin-left: 1px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
  font-size: 14px;
`;

export const StyledSecondaryText = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
