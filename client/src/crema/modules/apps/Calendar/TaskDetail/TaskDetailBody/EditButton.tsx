import React from 'react';
import { Button } from 'antd';

type EditButtonProps = {
  title: any;
  action?: () => void;
};

const EditButton = ({ action, title }: EditButtonProps) => {
  return (
    <Button shape="circle" type="primary" onClick={action} size="large">
      {title}
    </Button>
  );
};

export default EditButton;
