import styled from 'styled-components';

export const StyledCountryMapChart = styled.div`
  height: 224px;

  & .map-chart {
    width: 100%;
    height: 100%;
  }
`;

export const StyledEarningCountryFooter = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const StyledEarningCountryFooterItem = styled.div`
  padding-left: 18px;
  padding-right: 18px;
  margin-bottom: 8px;

  & h3 {
    font-size: 20px;
    font-weight: ${({theme}) => theme.font.weight.medium};
    margin-bottom: 4px;
  }

  & .dot {
    width: 8px;
    height: 8px;
    margin-right: 8px;

    [dir='rtl'] & {
      margin-right: 0;
      margin-left: 8px;
    }

    @media screen and (min-width: ${({theme}) => theme.breakpoints.xxl}px) {
      width: 10px;
      height: 10px;
    }
  }

  & p {
    color: ${({theme}) => theme.palette.text.secondary};
    font-size: ${({theme}) => theme.font.size.base};
    text-transform: capitalize;
    margin-bottom: 0;
  }
`;
