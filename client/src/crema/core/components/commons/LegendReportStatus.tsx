import { Col, Row } from "antd";
import { FaCheck, FaChevronLeft } from "react-icons/fa";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { useIntl } from "react-intl";

const LegendReportStatus = () => {
  // States
  const { messages } = useIntl();

  // Render
  return (
    <Row>
      <Col
        xs={8}
        lg={8}
        className="tt-expenses-warning tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <MdOutlineMoreHoriz />
        </span>
        <span>{messages["common.status.pending"] as string}</span>
      </Col>
      <Col
        xs={8}
        lg={8}
        className="tt-expenses-tomato tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <FaChevronLeft />
        </span>
        <span>{messages["common.status.rejected"] as string}</span>
      </Col>
      <Col
        xs={8}
        lg={8}
        className="tt-expenses-success tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <FaCheck />
        </span>
        <span>{messages["common.status.valid"] as string}</span>
      </Col>
    </Row>
  );
};

export default LegendReportStatus;
