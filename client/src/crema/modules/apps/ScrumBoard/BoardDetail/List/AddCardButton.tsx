import React from 'react';
import IntlMessages from '@crema/helpers/IntlMessages';

import {
  StyledSCrumBoardAddBtnCard,
  StyledScrumBoardAddBtnCardText,
  StyledScrumBoardAddCardBtnUser,
  StyledScrumBoardAddCardUserAvatar,
  StyledScrumBoardMdAdd,
} from './index.styled';

type AddCardButtonProps = {
  laneId: string;
  t: (laneId: string) => void;
}

const AddCardButton: React.FC<AddCardButtonProps> = (props) => {
  return (
    <StyledSCrumBoardAddBtnCard onClick={() => props.t(props.laneId)}>
      <StyledScrumBoardAddCardBtnUser>
        <StyledScrumBoardAddCardUserAvatar>
          <StyledScrumBoardMdAdd />
        </StyledScrumBoardAddCardUserAvatar>
        <StyledScrumBoardAddBtnCardText>
          <IntlMessages id='scrumboard.addACard' />
        </StyledScrumBoardAddBtnCardText>
      </StyledScrumBoardAddCardBtnUser>
    </StyledSCrumBoardAddBtnCard>
  );
};

export default AddCardButton;

