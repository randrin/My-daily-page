import { Col, Row } from "antd";
import React from "react";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { useIntl } from "react-intl";

const LegendExpenseStatus = () => {
  // States
  const { messages } = useIntl();

  // Render
  return (
    <Row>
      <Col
        xs={8}
        lg={5}
        className="tt-expenses-warning tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <MdOutlineMoreHoriz />
        </span>
        <span>{messages["common.status.pending"] as string}</span>
      </Col>
      <Col
        xs={4}
        lg={3}
        className="tt-expenses-tomato tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <FaChevronLeft />
        </span>
        <span>{messages["common.status.rejected"] as string}</span>
      </Col>
      <Col
        xs={8}
        lg={6}
        className="tt-expenses-primary tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <FaChevronRight />
        </span>
        <span>{messages["common.status.under.approved"] as string}</span>
      </Col>
      <Col
        xs={8}
        lg={6}
        className="tt-expenses-secondary tt-expenses-space-grid-center "
      >
        <span className="tt-expenses-space-center">
          <FaMoneyBillTransfer />
        </span>
        <span>{messages["common.status.accounting"] as string}</span>
      </Col>
      <Col
        xs={4}
        lg={4}
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

export default LegendExpenseStatus;
