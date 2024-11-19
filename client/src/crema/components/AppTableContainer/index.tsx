import React from 'react';
import clsx from 'clsx';
import { StyledQueueAnim } from './index.styled';
import { TablePaginationConfig } from 'antd';

type AppTableContainerProps = {
  columns: any;
  data: Array<any>;
  pagination?: false | TablePaginationConfig | undefined;
  hoverColor?: boolean;
  className?: string;

  [x: string]: any;
};
const AppTableContainer: React.FC<AppTableContainerProps> = ({
  columns,
  data,
  pagination = false,
  hoverColor,
  className,
  ...rest
}) => {
  return (
    <StyledQueueAnim
      className={clsx({ hoverColor: hoverColor }, className)}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={pagination}
      {...rest}
    />
  );
};

export default AppTableContainer;
