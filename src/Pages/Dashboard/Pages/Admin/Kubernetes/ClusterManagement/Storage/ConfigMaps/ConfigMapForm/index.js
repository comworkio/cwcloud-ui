import * as React from 'react';
import CardComponent from "../../../../../../../../../Components/Cards/CardComponent/CardComponent";
import { Col, Row } from "reactstrap"
import classes from "../../form.module.css";
import { NavLink, useNavigate } from "react-router-dom"
import GlobalContext from "../../../../../../../../../Context/GlobalContext";
import { Container } from 'reactstrap';
import Translate from 'react-translate-component';
import LoadingButton from "../../../../../../../../../Components/LoadingButton/LoadingButton";
import { useParams } from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import LabelsAnnotations from '../../../../../../../../../Components/Kubernetes/Common/LabelsAnnotations/LabelsAnnotations';
import Metadata from '../../../../../../../../../Components/Kubernetes/Common/Metadata/Metadata';
import ConfirmationModal from '../../../../../../../../../Components/Kubernetes/Common/ConfirmationModal/ConfirmationModal';
import { MetadataFormProvider } from '../../../../../../../../../Context/kubernetes/MetadataFormContext';
import useConfigMapFormYaml from '../../../../../../../../../Hooks/kubernetes/useConfigMapFormYaml';
import { ConfigMapProvider } from '../../../../../../../../../Context/kubernetes/ConfigMapFormContext';
import CMData from '../../../../../../../../../Components/Kubernetes/ConfigMapForm/CMData';
import BinaryData from '../../../../../../../../../Components/Kubernetes/ConfigMapForm/BinaryData';
import useCreateK8sObject from '../../../../../../../../../Hooks/kubernetes/useCreateK8sObject';
import { toast } from "react-toastify";
import { CustomTabPanel, ENV_INITAL_VALUE, a11yProps } from "../../../moduleConstants";
import ErrorCard from '../../../../../../../../../Components/Kubernetes/Common/ErrorCard/ErrorCard';
import EditorBox from '../../../../../../../../../Components/EditorBox/EditorBox';

function ConfigMapForm(props) {
    const { clusterId } = useParams();
    const context = React.useContext(GlobalContext);
    const [codeEditionActive, setCodeEditionActive] = React.useState(false)
    const navigate = useNavigate()
    const [value, setValue] = React.useState(0);
    const [showDiscardChangesModal, setShowDiscardChangesModal] = React.useState(false);
    const [discardModalCondition, setDiscardModalCondition] = React.useState(false);
    const [prevEnvironment, setPrevEnvironment] = React.useState(ENV_INITAL_VALUE)
    const { loading, yamlValue, setYamlValue, updateValues } = useConfigMapFormYaml();
    const { loading: createLoading, createObject, error } = useCreateK8sObject();
    const [isInvalid, setIsInvalid] = React.useState(false)

    React.useEffect(() => {
        if (codeEditionActive)
            setDiscardModalCondition(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yamlValue])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const addObjectHandler = () => {
        createObject(
            {
                cluster_id: clusterId,
                kind: "configmap",
            },
            yamlValue,
            () => {
                toast.success(
                    context.counterpart(
                        "dashboard.kubernetesDashboardPages.storage.configMaps.form.successCreate"
                    )
                );
                navigate(
                    `/kubernetes/cluster/${clusterId}/storage/configMaps/explore`
                );
            },
            () => {
                setIsInvalid(true)
            }
        );
    };

    return (
        <MetadataFormProvider update={updateValues} clusterId={clusterId}>
            <ConfigMapProvider update={updateValues}>
                <Container style={{ padding: "0" }}>
                    <ConfirmationModal
                        isOpen={showDiscardChangesModal}
                        toggle={() => setShowDiscardChangesModal(!showDiscardChangesModal)}
                        onConfirm={() => {
                            setYamlValue(prevEnvironment)
                            setShowDiscardChangesModal(false)
                            setCodeEditionActive(false)
                        }}
                        message={"dashboard.kubernetesDashboardPages.common.confirmDiscard"}
                        title={"dashboard.kubernetesDashboardPages.common.backToForm"}
                        onCancel={() => {
                            setShowDiscardChangesModal(false)
                        }}
                    />
                    <Row>
                        <Col>
                            <div className="goBack">
                                <NavLink to={`/kubernetes/cluster/${clusterId}/storage/configMaps/explore`} className="link">
                                    <i className={["fa-solid fa-arrow-left", `${classes.iconStyle}`].join(" ")}></i>
                                    <Translate content="dashboard.kubernetesDashboardPages.storage.configMaps.form.backToExplore" />
                                </NavLink>
                            </div>

                        </Col>
                    </Row>
                    {!codeEditionActive &&
                        <div>
                            <Row style={{ marginTop: "20px" }}>
                                <Col>
                                    <Metadata isInvalid={isInvalid} setIsInvalid={setIsInvalid} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <CardComponent
                                        containerStyles={props.containerStyles}
                                    >
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                <Tabs value={value} onChange={handleChange}>
                                                    <Tab label={context.counterpart("dashboard.kubernetesDashboardPages.storage.configMaps.form.data")} {...a11yProps(0)} />
                                                    <Tab label={context.counterpart("dashboard.kubernetesDashboardPages.storage.configMaps.form.binaryData")} {...a11yProps(1)} />
                                                    <Tab label={context.counterpart("dashboard.kubernetesDashboardPages.common.form.metadata")} {...a11yProps(2)} />
                                                </Tabs>
                                            </Box>
                                            <CustomTabPanel value={value} index={0}>
                                                <CMData />
                                            </CustomTabPanel>
                                            <CustomTabPanel value={value} index={1}>
                                                <BinaryData />
                                            </CustomTabPanel>
                                            <CustomTabPanel value={value} index={2}>
                                                <LabelsAnnotations />
                                            </CustomTabPanel>
                                        </Box>
                                    </CardComponent>
                                </Col>
                            </Row>
                        </div>
                    }
                    {
                        codeEditionActive &&
                        <Row style={{ marginTop: "20px", marginBottom: "20px" }}>
                            <Col style={{ padding: "0px" }}>
                                <EditorBox
                                    title={<Translate content="dashboard.kubernetesDashboardPages.storage.configMaps.form.title" />}
                                    language="yaml"
                                    value={yamlValue}
                                    textToCopy={yamlValue}
                                    onChange={(v) => setYamlValue(v)}
                                />
                            </Col>
                        </Row>
                    }
                    {
                        error && (
                            <ErrorCard error={error} />
                        )
                    }
                    <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
                        <Col style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {
                                codeEditionActive 
                                    ? <LoadingButton color={"error"} className={classes.actionButton} loading={loading} icon={"fa-solid fa-xmark"} 
                                        onClick={() => {
                                            if (discardModalCondition)
                                                setShowDiscardChangesModal(true);
                                            else {
                                                setCodeEditionActive(!codeEditionActive)
                                            }
                                        }}
                                    >
                                        <Translate content="common.button.cancel" />
                                    </LoadingButton>
                                    : <LoadingButton className={classes.actionButton} loading={loading} icon={"fa-solid fa-pen"} onClick={() => {
                                        setPrevEnvironment(yamlValue)
                                        setDiscardModalCondition(false);
                                        setCodeEditionActive(!codeEditionActive);
                                    }}>
                                        <Translate content="dashboard.kubernetesDashboardPages.common.editYaml" />
                                    </LoadingButton>
                            }
                            <LoadingButton
                                loading={createLoading}
                                icon={"fa-solid fa-floppy-disk"}
                                onClick={addObjectHandler}
                            >
                                <Translate content="common.button.create" />
                            </LoadingButton>
                        </Col>
                    </Row>
                </Container>
            </ConfigMapProvider>
        </MetadataFormProvider>
    )
}

export default ConfigMapForm;
