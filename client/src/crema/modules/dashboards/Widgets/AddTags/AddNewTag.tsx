import React, { useState } from 'react';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import {
  StyledAddNewTagLink,
  StyledAddNewTagRow,
  StyledTagCheck,
  StyledTagClose,
} from './index.styled';

type AddNewTagProps = {
  onAddNewTag: (tag: string) => void;
};

const AddNewTag: React.FC<AddNewTagProps> = ({ onAddNewTag }) => {
  const [newTag, setNewTag] = useState('');

  const [isAddNewTag, setAddNewTag] = useState(false);

  const onAddTag = () => {
    onAddNewTag(newTag);
    setNewTag('');
    setAddNewTag(false);
  };
  const { messages } = useIntl();

  return (
    <>
      {isAddNewTag ? (
        <StyledAddNewTagRow>
          <div className="tag-form-field">
            <Input
              placeholder={messages['common.tag'] as string}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
          </div>
          <StyledTagCheck>
            <CheckOutlined onClick={onAddTag} className="pointer" />
          </StyledTagCheck>
          <StyledTagClose>
            <CloseOutlined
              onClick={() => setAddNewTag(false)}
              className="pointer"
            />
          </StyledTagClose>
        </StyledAddNewTagRow>
      ) : (
        <StyledAddNewTagLink onClick={() => setAddNewTag(true)}>
          <IntlMessages id="dashboard.addNewTag" />
        </StyledAddNewTagLink>
      )}
    </>
  );
};

export default AddNewTag;
