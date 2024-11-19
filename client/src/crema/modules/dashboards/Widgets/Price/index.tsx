import React from 'react';
import { Slider } from 'antd';
import AppCard from '@crema/components/AppCard';
import { useIntl } from 'react-intl';
import { StyledPriceText } from './index.styled';

const Price = () => {
  const [value, setValue] = React.useState<[number, number]>([20, 37]);

  const handleChange = (newValue: [number, number]) => {
    setValue(newValue);
  };
  const { messages } = useIntl();
  return (
    <AppCard title={messages['dashboard.price'] as string}>
      <StyledPriceText>{`$${value[0]}mi - $${value[1]}mi`}</StyledPriceText>

      <Slider onChange={handleChange} range defaultValue={value} />
    </AppCard>
  );
};

export default Price;
