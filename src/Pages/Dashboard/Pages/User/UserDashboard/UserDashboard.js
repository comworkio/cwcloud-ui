import * as moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import colors from "../../../../../Context/Colors";
import GlobalContext from "../../../../../Context/GlobalContext";
import axios from "../../../../../utils/axios";
import EnvironmentSection from "./EnvironmentSection/EnvironmentSection";
import ResourceItem from "./ResourceItem/ResourceItem";
import classes from "./UserDashboard.module.css";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import Translate from "react-translate-component";
import DoughnutChart from "../../../../../Components/Charts/DoughnutChart/DoughnutChart";
import CardComponent from "../../../../../Components/Cards/CardComponent/CardComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MAX_ENV_ITEMS_PER_TYPE = 6;

const UserDashboard = () => {
  const context = useContext(GlobalContext);
  const _mode = context.mode;
  const [vmEnvironments, setVmEnvironments] = useState([]);
  const [k8sEnvironments, setK8sEnvironments] = useState([]);
  const [k8sDeployments, setK8sDeployments] = useState([]);
  const [faasFunctions, setFaasFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState(0);
  const [instances, setInstances] = useState(0);
  const [registries, setRegistries] = useState(0);
  const [buckets, setBuckets] = useState(0);
  const [currentConsumptions, setCurrentConsumptions] = useState(null);
  const [currentDataConsumptions, setCurrentDataConsumptions] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const navigate = useNavigate();
  const showConsumptionsChart =
    process.env.REACT_APP_DISABLE_PAYMENT_FEATURE.includes("false") &&
    context.user.enabled_features.daasapi;
  const resourceItemStyle = showConsumptionsChart
    ? {}
    : { flex: "1 0 auto", marginRight: "10px", marginBottom: "10px" };

  useEffect(() => {
    context.setIsGlobal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchDaasData = () => {
      const startOfMonth = moment()
        .clone()
        .startOf("month")
        .format("YYYY/MM/DD");
      const endOfMonth = moment().clone().endOf("month").format("YYYY/MM/DD");

      const requests = [
        axios.get(
          `/environment/all?type=vm&page=0&limit=${MAX_ENV_ITEMS_PER_TYPE}`
        ),
        axios.get(`/user/statistics`),
        axios.get(`/consumption?from=${startOfMonth}&to=${endOfMonth}`),
      ];

      Promise.all(requests)
        .then(
          ([
            vmEnvironments,
            responseUserResources,
            responseCurrentConsumptions,
          ]) => {
            setVmEnvironments(vmEnvironments.data);
            setProjects(responseUserResources.data.projects);
            setInstances(responseUserResources.data.instances);
            setRegistries(responseUserResources.data.registries);
            setBuckets(responseUserResources.data.buckets);
            setCurrentConsumptions(responseCurrentConsumptions.data);
            setCurrentDataConsumptions(
              getPieData(
                responseCurrentConsumptions.data.map((c) => c.instance_name),
                responseCurrentConsumptions.data.map((c) => c.total_price)
              )
            );
            setLoading(false);
          }
        )
        .catch((error) => {
          console.error(error);
          // handle error here
        });
    };
    const fetchk8sData = () => {
      const requests = [
        axios.get(
          `/environment/all?type=k8s&page=0&limit=${MAX_ENV_ITEMS_PER_TYPE}`
        ),
        axios.get(`/kubernetes/deployment`),
      ];
      Promise.all(requests)
        .then(([k8sEnvironments, k8sDeployments]) => {
          setK8sEnvironments(k8sEnvironments.data);
          setK8sDeployments(k8sDeployments.data.length);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // handle error here
        });
    };
    const fetchFaasData = () => {
      const requests = [axios.get(`/faas/functions`)];
      Promise.all(requests)
        .then(([faasFunctions]) => {
          setFaasFunctions(faasFunctions.data.results.length);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // handle error here
        });
    };
    if (context.user.enabled_features.k8sapi) {
      fetchk8sData();
    }
    if (context.user.enabled_features.daasapi) {
      fetchDaasData();
    }
    if (context.user.enabled_features.faasapi) {
      fetchFaasData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.region]);

  const getPieData = (labels, data) => {
    if (labels === null || !labels) {
      labels = [];
    }

    if (data === null || !data) {
      data = [];
    }

    return {
      labels: labels,
      datasets: [
        {
          label: "Total Price",
          data: data,
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ].slice(0, labels.length),
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ].slice(0, labels.length),
          borderWidth: 2,
          hoverBackgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ].slice(0, labels.length),
          hoverBorderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ].slice(0, labels.length),
          hoverBorderWidth: 3,
        },
      ],
    };
  };

  const getTotalCurrentConsumptions = () => {
    if (!currentConsumptions) return 0.0;
    let total = 0;
    currentConsumptions.forEach((c) => {
      total += c.total_price;
    });
    return total.toFixed(4);
  };
  return (
    <Container
      fluid
      className={classes.container}
      style={{ padding: "0px 20px 20px 20px", overflow: "hidden" }}
    >
      <Row>
        {!(
          context.user.enabled_features.daasapi ||
          context.user.enabled_features.k8sapi ||
          context.user.enabled_features.faasapi
        ) && (
          <Col md="12" className="text-center">
            <CardComponent>
              <h1
                className={classes.mainTitleText}
                style={{
                  color: colors.mainText[_mode],
                  paddingBottom: "10px",
                  paddingLeft: "5px",
                }}
              >
                <Translate content="dashboard.userDashboard.resourceOverview.noFlagsActivated" />
              </h1>
            </CardComponent>
          </Col>
        )}
        <Col md={showConsumptionsChart ? "3" : "12"}>
          {(context.user.enabled_features.daasapi ||
            context.user.enabled_features.k8sapi ||
            context.user.enabled_features.faasapi) && (
            <h1
              className={classes.mainTitleText}
              style={{
                color: colors.mainText[_mode],
                paddingBottom: "10px",
                paddingLeft: "5px",
              }}
            >
              <Translate content="dashboard.userDashboard.resourceOverview.title" />
            </h1>
          )}
          <div
            style={{
              display: showConsumptionsChart ? "block" : "flex",
              flexWrap: "wrap",
            }}
          >
            {context.user.enabled_features.daasapi && (
              <>
                <ResourceItem
                  loading={loading}
                  icon="fa-solid fa-microchip"
                  resourceCount={instances}
                  onClick={() => navigate("/instances")}
                  resourceName={context.counterpart(
                    "dashboard.userDashboard.resourceOverview.instances"
                  )}
                  customStyles={resourceItemStyle}
                />
                <ResourceItem
                  loading={loading}
                  icon="fa-solid fa-layer-group"
                  onClick={() => navigate("/projects")}
                  resourceCount={projects}
                  resourceName={context.counterpart(
                    "dashboard.userDashboard.resourceOverview.projects"
                  )}
                  customStyles={resourceItemStyle}
                />
                <ResourceItem
                  loading={loading}
                  icon="fa-solid fa-cube"
                  onClick={() => navigate("/buckets")}
                  resourceCount={buckets}
                  resourceName={context.counterpart(
                    "dashboard.userDashboard.resourceOverview.buckets"
                  )}
                  customStyles={resourceItemStyle}
                />
                <ResourceItem
                  loading={loading}
                  icon="fa-brands fa-docker"
                  onClick={() => navigate("/registries")}
                  resourceCount={registries}
                  resourceName={context.counterpart(
                    "dashboard.userDashboard.resourceOverview.registries"
                  )}
                  customStyles={resourceItemStyle}
                />
              </>
            )}
            {context.user.enabled_features.k8sapi && (
              <ResourceItem
                loading={loading}
                icon="fa-solid fa-dharmachakra"
                onClick={() => navigate("/k8s-applications")}
                resourceCount={k8sDeployments}
                resourceName={context.counterpart(
                  "dashboard.userDashboard.resourceOverview.k8sApplications"
                )}
                customStyles={resourceItemStyle}
              />
            )}
            {context.user.enabled_features.faasapi && (
              <ResourceItem
                loading={loading}
                icon="fa-solid fa-code"
                onClick={() => navigate("/function/overview")}
                resourceCount={faasFunctions}
                resourceName={context.counterpart(
                  "dashboard.userDashboard.resourceOverview.functions"
                )}
                customStyles={resourceItemStyle}
              />
            )}
          </div>
        </Col>
        {showConsumptionsChart && (
          <Col md="9">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h1
                className={classes.mainTitleText}
                style={{ color: colors.mainText[_mode] }}
              >
                <Translate content="dashboard.userDashboard.consumptions.title" />
              </h1>
              <Link
                to={"/billing"}
                style={{
                  color: colors.menuText[_mode],
                  paddingRight: "20px",
                  textDecoration: "none",
                }}
              >
                <Translate content="navbar.billing" />
              </Link>
            </div>
            <DoughnutChart
              loading={loading}
              totalConsumptions={getTotalCurrentConsumptions()}
              data={currentDataConsumptions}
            />
          </Col>
        )}
      </Row>
      {(context.user.enabled_features.daasapi ||
        context.user.enabled_features.k8sapi) && (
        <Row>
          <Col style={{ marginTop: "20px" }}>
            <h1
              className={classes.mainTitleText}
              style={{ color: colors.mainText[_mode] }}
            >
              <Translate content="dashboard.userDashboard.availableEnvironments.title" />
            </h1>
          </Col>
        </Row>
      )}
      {context.user.enabled_features.daasapi && (
        <EnvironmentSection
          environments={vmEnvironments}
          type={"vm"}
          loading={loading}
          titleTranslationPath="dashboard.userDashboard.availableEnvironments.vmSubtitle"
          viewMoreLink="/dashboard/environments"
          maxItems={MAX_ENV_ITEMS_PER_TYPE}
        />
      )}
      {context.user.enabled_features.k8sapi && (
        <EnvironmentSection
          environments={k8sEnvironments}
          type={"k8s"}
          hidden={!context.user.enabled_features.k8sapi}
          loading={loading}
          titleTranslationPath="dashboard.userDashboard.availableEnvironments.k8sSubtitle"
          viewMoreLink="/dashboard/environments"
          maxItems={MAX_ENV_ITEMS_PER_TYPE}
        />
      )}
    </Container>
  );
};
export default UserDashboard;
