import AppAnimate from "@crema/components/AppAnimate";
import AppLoader from "@crema/components/AppLoader";
import AppPageMeta from "@crema/components/AppPageMeta";
import AppRowContainer from "@crema/components/AppRowContainer";
import WidgetCardCount from "@crema/core/components/commons/WidgetCardCount";
import WidgetExpensesGraph from "@crema/core/components/commons/WidgetExpensesGraph";
import WidgetRolesPie from "@crema/core/components/commons/WidgetRolesPie";
import WidgetStatisticGraph from "@crema/core/components/commons/WidgetStatisticGraph";
import WidgetUsersPie from "@crema/core/components/commons/WidgetUsersPie";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { BirthdayCard, DateSelector } from "@crema/modules/dashboards/Widgets";
import { Col, Row } from "antd";
import { useDashboardContext } from "modules/apps/context/DashboardContextProvider";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { GoOrganization } from "react-icons/go";
import { TbReport } from "react-icons/tb";
import { useIntl } from "react-intl";

const Home = () => {
  // States
  const { messages } = useIntl();
  const {
    loading,
    users,
    roles,
    reports,
    expenses,
    categories,
    organizations,
    subcategories,
  } = useDashboardContext();
  const { user } = useAuthUser();

  // Render
  return (
    <>
      <AppPageMeta title="Back Office" />
      {loading ? (
        <AppLoader />
      ) : (
        <AppAnimate animation="transition.slideUpIn" delay={200}>
          <AppRowContainer>
            <Row>
              <Col xs={24} sm={12} lg={6} key={"Users"}>
                <WidgetCardCount
                  value={users.length}
                  name={messages["common.users"] as string}
                  icon={<FiUsers size={40} className="tt-expenses-primary" />}
                />
              </Col>
              <Col xs={24} sm={12} lg={6} key={"Organizations"}>
                <WidgetCardCount
                  value={organizations.length}
                  name={
                    messages["sidebar.app.dashboard.organizations"] as string
                  }
                  icon={
                    <GoOrganization
                      size={40}
                      className="tt-expenses-secondary"
                    />
                  }
                />
              </Col>
              <Col xs={24} sm={12} lg={6} key={"Reports"}>
                <WidgetCardCount
                  value={reports.length}
                  name={messages["common.reports"] as string}
                  icon={<TbReport size={40} className="tt-expenses-success" />}
                />
              </Col>
              <Col xs={24} sm={12} lg={6} key={"Categories"}>
                <WidgetCardCount
                  value={categories.length}
                  name={messages["common.categories"] as string}
                  icon={
                    <BiSolidCategoryAlt
                      size={40}
                      className="tt-expenses-warning"
                    />
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col xs={24} lg={16} key={"Expenses-Status"}>
                <WidgetExpensesGraph data={expenses} />
              </Col>
            </Row>
            <Row>
              <Col xs={24} lg={16} key={"Expenses-Graph"}>
                <WidgetStatisticGraph data={expenses} />
              </Col>
              <Col xs={24} lg={8} key={"Users-status"}>
                <WidgetUsersPie data={users} />
              </Col>
            </Row>
            <Row>
              <Col xs={24} lg={8} key={"Roles-status"}>
                <WidgetRolesPie roles={roles} users={users} />
              </Col>
              <Col xs={24} lg={8} key={"d"}>
                <DateSelector />
              </Col>
              <Col xs={24} lg={8} key={"f"}>
                <BirthdayCard />
              </Col>
            </Row>
          </AppRowContainer>
        </AppAnimate>
      )}
    </>
  );
};

export default Home;
