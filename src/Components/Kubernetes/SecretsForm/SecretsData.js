import React from "react";
import { useContext } from "react";
import {
  Col,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
  Form,
} from "reactstrap";
import GlobalContext from "../../../Context/GlobalContext";
import colors from "../../../Context/Colors";
import Translate from "react-translate-component";
import CardComponent from "../../Cards/CardComponent/CardComponent";
import LoadingButton from "../../LoadingButton/LoadingButton";
// import classes from "./secrets.module.css";
import '../../../common.css';
import SecretsFormContext from "../../../Context/kubernetes/SecretsFormContext";

function SecretData(props) {
  const { counterpart, mode } = useContext(GlobalContext);
  const { data } = props;
  const { updateSecretData } = useContext(SecretsFormContext);
  const _mode = mode;

  return (
    <Row>
      <Col xs="6" md="5">
        <FormGroup>
          <Label for={`keyS-${data.id}`} style={{ color: colors.title[_mode] }}>
            {counterpart(
              "dashboard.kubernetesDashboardPages.storage.secrets.form.key"
            )}
          </Label>
          <Input
            id={`keyS-${data.id}`}
            className="blackableInput"
            style={{
              borderTopRightRadius: "0px",
              borderBottomRightRadius: "0px",
            }}
            value={data.key}
            onChange={(e) => {
              updateSecretData(data.id, {
                ...data,
                key: e.target.value,
              });
            }}
            placeholder={counterpart(
              "dashboard.kubernetesDashboardPages.storage.secrets.form.keyHolder"
            )}
          />
          <FormFeedback>
            <Translate content="common.message.thisFieldIsRequired" />
          </FormFeedback>
        </FormGroup>
      </Col>
      <Col xs="6" md="4">
        <FormGroup>
          <Label
            for={`valueS-${data.id}`}
            style={{ color: colors.title[_mode] }}
          >
            {counterpart(
              "dashboard.kubernetesDashboardPages.storage.secrets.form.value"
            )}
          </Label>
          <Input
            id={`valueS-${data.id}`}
            className="blackableInput"
            value={data.value}
            onChange={(e) => {
              updateSecretData(data.id, {
                ...data,
                value: e.target.value,
              });
            }}
            style={{
              borderTopLeftRadius: "0px",
              borderBottomLeftRadius: "0px",
            }}
            placeholder={counterpart(
              "dashboard.kubernetesDashboardPages.storage.secrets.form.valueHolder"
            )}
          />
          <FormFeedback>
            <Translate content="common.message.thisFieldIsRequired" />
          </FormFeedback>
        </FormGroup>
      </Col>
    </Row>
  );
}

export default function Rules() {
  const { secrets, addSecretData } = useContext(SecretsFormContext);

  return (
    <Form>
      <CardComponent>
        {secrets.map((rule) => (
          <SecretData key={rule.id} data={rule} />
        ))}
        <LoadingButton
          icon={"fa-solid fa-plus"}
          className="addButton"
          variant="contained"
          onClick={() => addSecretData()}
        >
          <Translate content="dashboard.kubernetesDashboardPages.storage.secrets.form.addData" />
        </LoadingButton>
      </CardComponent>
    </Form>
  );
}
