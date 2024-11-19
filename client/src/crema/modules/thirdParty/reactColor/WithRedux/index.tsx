import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from './reducer';

import { SketchPicker } from 'react-color';

type WithReduxProps = {
  onChangeColor: (color: any) => void;
  color: string;
};
const WithRedux = ({ color, onChangeColor }: WithReduxProps) => {
  return <SketchPicker color={color} onChangeComplete={onChangeColor} />;
};

const mapStateToProps = (state: { color: string }) => ({
  color: state.color,
});

const mapDispatchToProps = {
  onChangeColor: appActions.changeColor,
};

export default connect(mapStateToProps, mapDispatchToProps)(WithRedux);
