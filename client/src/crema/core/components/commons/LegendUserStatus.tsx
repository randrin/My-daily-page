import { Col, Row } from "antd";
import { GoDotFill } from "react-icons/go";
import { useIntl } from "react-intl";

const LegendUserStatus = () => {
  // States
  const { messages } = useIntl();

  // Render
  return (
    <Row>
      <Col
        xs={24}
        lg={5}
        className="tt-expenses-sliver tt-expenses-space-grid-center tt-expenses-without-margin"
      >
        <span className="tt-expenses-space-center">
          <GoDotFill />
        </span>
        <span>{messages["common.status.never.connected"] as string}</span>
      </Col>
      <Col
        xs={24}
        lg={5}
        className="tt-expenses-warning tt-expenses-space-grid-center tt-expenses-without-margin"
      >
        <span className="tt-expenses-space-center">
          <GoDotFill />
        </span>
        <span>{messages["common.status.pending"] as string}</span>
      </Col>
      <Col
        xs={24}
        lg={5}
        className="tt-expenses-tomato tt-expenses-space-grid-center tt-expenses-without-margin"
      >
        <span className="tt-expenses-space-center">
          <GoDotFill />
        </span>
        <span>{messages["common.status.disabled"] as string}</span>
      </Col>
      <Col
        xs={24}
        lg={4}
        className="tt-expenses-success tt-expenses-space-grid-center tt-expenses-without-margin"
      >
        <span className="tt-expenses-space-center">
          <GoDotFill />
        </span>
        <span>{messages["common.status.active"] as string}</span>
      </Col>
      <Col
        xs={24}
        lg={5}
        className="tt-expenses-primary tt-expenses-space-grid-center tt-expenses-without-margin"
      >
        <span className="tt-expenses-space-center">
          <GoDotFill />
        </span>
        <span>{messages["common.status.archived"] as string}</span>
      </Col>
    </Row>
  );
};

export default LegendUserStatus;
