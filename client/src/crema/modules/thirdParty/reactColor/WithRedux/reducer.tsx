export const CHANGE_COLOR = 'APP/CHANGE_COLOR';

export const actions = {
  changeColor: ({ hex }: any) => ({ type: CHANGE_COLOR, hex }),
};

const initialState = {
  color: '#F5A623',
};

type ActionType = {
  type: string;
  hex: string;
};

export const reducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case CHANGE_COLOR:
      return { ...state, color: action.hex };
    default:
      return state;
  }
};
