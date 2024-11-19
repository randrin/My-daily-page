import AppCard from '@crema/components/AppCard';
import AppCircularProgress from '@crema/components/AppCircularProgress';
import styled from 'styled-components';

export const StyledRevenueCard = styled(AppCard)`
  & .ant-card-body {
    display: flex;
    flex-direction: column;
  }
`;

export const StyledRevCircularProgress = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`;

export const StyledRevCircularProgressContent = styled.div`
  font-size: ${({ theme }) => theme.font.size.base};
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  & h3 {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 18px;
    font-weight: ${({ theme }) => theme.font.weight.medium};
    margin-bottom: 5px;
  }

  & p {
    margin-bottom: 0;
  }
`;

export const StyledDollerIcon = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledAppProgressCircular = styled(AppCircularProgress)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledRevCirProgressContentBottom = styled.div`
  display: flex;
  justify-content: space-around;

  & p {
    margin-bottom: 2px;
    font-size: 18px;
    font-weight: ${({ theme }) => theme.font.weight.bold};
  }

  & span {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;
