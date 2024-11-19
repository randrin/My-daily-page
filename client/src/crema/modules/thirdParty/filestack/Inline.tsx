import React from 'react';
import { PickerInline } from 'filestack-react';
import { fileStackKey } from '@crema/constants/AppConst';

const options = { container: 'picker-container-1' };
const Inline = () => {
  return (
    <div id="picker-container-1">
      <PickerInline pickerOptions={options} apikey={fileStackKey} />
    </div>
  );
};

export default Inline;
