import React, { useContext, useState, useEffect } from 'react';
import axios from '../../../../../utils/axios';
import GlobalContext from '../../../../../Context/GlobalContext';
import colors from '../../../../../Context/Colors';
import { Col, Container, Row } from 'reactstrap';
// import classes from './ManageSupport.module.css';
import '../../../../../common.css'
import DataTable from '../../../../../Components/Table/DataTable';
import formateDate from '../../../../../utils/FormateDate';
import filteredListWithoutRemovedElement from "../../../../../utils/filter";
import { Link, useLocation } from 'react-router-dom';
import Translate from 'react-translate-component';
import DeleteModal from "../../../../../Components/Modal/DeleteModal";
import CustomDeleteIcon from '../../../../../Components/CustomIcon/CustomDeleteIcon';
import { toast } from 'react-toastify';
import AddTicketModal from '../../../../../Components/Modal/AddTicketModal';
import LoadingButton from '../../../../../Components/LoadingButton/LoadingButton';
import { Add } from '@mui/icons-material';
import { TextField } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CustomEditIcon from '../../../../../Components/CustomIcon/CustomEditIcon';
import TicketModal from '../../../../../Components/Modal/TicketModal';
import counterpart from 'counterpart';
import CustomLinkIcon from '../../../../../Components/CustomIcon/CustomLinkIcon';
import { isNotEmpty } from '../../../../../utils/common';

function ManageSupport() {
    const context = useContext(GlobalContext);
    const _mode = context.mode;
    const location = useLocation()
    const currentPath = location.pathname
    const is_admin = currentPath.includes("admin")
    const [tickets, setTickets] = useState([])
    const [filteredTickets, setFilteredTickets] = useState([])
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
    const [selectedDeletionItems, setSelectedDeletionItems] = useState([])
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [multiSelection, setMultiSelection] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [closedTickets, setClosedTickets] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showAddTicketModal, setShowAddTicketModal] = useState(false)
    const [showTicketModal, setShowTicketModal] = useState(false)
    const [environments, setEnvironments] = useState([])
    const [users, setUsers] = useState([])
    const [queryParam, setQueryParam] = useState("")

    const fetchData = async () => {
        context.setIsGlobal(true)
        if (context.user.enabled_features.daasapi && context.user.enabled_features.k8sapi) {
            setQueryParam("?type=all")
        }
        else if (context.user.enabled_features.k8sapi) {
            setQueryParam("?type=k8s")
        }
        else if (context.user.enabled_features.daasapi) {
            setQueryParam("?type=vm")
        }
        var api_support_url = is_admin ? '/admin/support' : '/support'
        var api_environment_url = is_admin ? '/admin/environment/all' : `/environment/all${queryParam}`
        axios.get(api_support_url)
            .then(res => {
                setTickets(res.data)
                setFilteredTickets(res.data)
            })
        if (isNotEmpty(queryParam)) {
            axios.get(api_environment_url)
            .then(res => {
                setEnvironments(res.data)
            })
        }
        if (is_admin) {
            const responseUsers = await axios.get("/admin/user/all")
            setUsers(responseUsers.data.result)
        }
    }

    const getUsername = (user_id) => {
        const user = users.find(user => user.id === user_id)
        return user ? user.email : ""
    }

    //? Currently this function is only dedicated for CWCloud PPD and Prod platforms
    const checkTicketOnGitlab = (gitlab_issue_id) => {
        const gitlab_url = process.env.REACT_APP_APIURL ? "https://gitlab.comwork.io" : "https://gitlab.com"
        if (gitlab_url.includes("comwork")) {
            const ticket_url = `${gitlab_url}/comwork/infrastructure/cwcloud-ui/-/issues/${gitlab_issue_id}`
            window.open(ticket_url, "_blank")
        }
    }

    useEffect(() => {
        fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showConfirmDeleteModal, showAddTicketModal, showTicketModal])

    useEffect(() => {
        if (!tickets)
            return
        if (closedTickets) {
            setFilteredTickets(tickets.filter((ticket) => ticket.status === "closed"))
        } else {
            setFilteredTickets(tickets.filter((ticket) => ticket.status !== "closed"))
        }
    }, [tickets, closedTickets])

    const columns = [
        { field: 'id', headerName: context.counterpart("dashboard.support.table.id"), width: 100, renderCell: (params) => <Link to={is_admin ? `/admin/support/${params.row.id}` : `/support/${params.row.id}` }>{`Ticket #${params.row.id}`}</Link> },
        { field: 'severity', headerName: context.counterpart("dashboard.support.severityText"), width: 100 },
        { field: 'subject', headerName: context.counterpart("dashboard.support.table.subject"), width: 200 },
        { field: 'selected_product', headerName: context.counterpart("dashboard.support.table.selected_product"), width: 100 },
        { field: 'created_at', headerName: context.counterpart("dashboard.support.table.created_at"), width: 150, renderCell: (params) => formateDate(params.row.created_at) },
        { field: 'last_update', headerName: context.counterpart("dashboard.support.table.last_update"), width: 150, renderCell: (params) => formateDate(params.row.created_at) },
        ...(is_admin ? [{
            field: 'created_by', 
            headerName: context.counterpart("dashboard.support.table.created_by"), 
            width: 200, 
            renderCell: (params) => getUsername(params.row.user_id)
        }] : []),
        {
            field: 'status', headerName: 'Status', width: 200, renderCell: (params) => {
                if (params.row.status === "await customer")
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ borderRadius: '50%', background: '#22C8A2', height: '15px', width: '15px', marginRight: '10px' }}></div>
                            <h5 style={{ fontSize: '10px', margin: '0', color: colors.mainText[_mode]}}>
                                <Translate content="dashboard.support.awaitCustomer" />
                            </h5>
                        </div>
                    )
                if (params.row.status === 'await agent')
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ borderRadius: '50%', background: '#FF8D69', height: '15px', width: '15px', marginRight: '10px' }}></div>
                            <h5 style={{ fontSize: '10px', color: colors.mainText[_mode], margin: '0' }}>
                                <Translate content="dashboard.support.awaitAgent" />
                            </h5>
                        </div>
                    )
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ borderRadius: '50%', background: 'red', height: '15px', width: '15px', marginRight: '10px' }}></div>
                        <h5 style={{ fontSize: '10px', color: colors.mainText[_mode], margin: '0' }}>
                            <Translate content="dashboard.support.closed" />
                        </h5>
                    </div >
                )
            }
        },
        {
            field: 'action', headerName: context.counterpart("dashboard.projectsPage.table.actions"), width: 200, renderCell: (params) => {
                const onDelete = (e) => {
                    e.stopPropagation();
                    onPreDeleteHandler(params.id)
                };
                const onUpdate = (e) => {
                    e.stopPropagation();
                    onPreUpdateHandler(params.id)
                };
                const onNavigate = (e) => {
                    e.stopPropagation();
                    checkTicketOnGitlab(params.row.gitlab_issue_id)
                }
                const showGitlabLink = is_admin && (process.env.REACT_APP_APIURL?.includes("cwcloud.tech") || process.env.REACT_APP_APIURL?.includes("cwcloud.tn"))
                return (
                    <React.Fragment>
                        {
                            is_admin &&
                            <>
                                <CustomDeleteIcon onClick={onDelete} style={{ marginRight: '10px' }} />
                                {showGitlabLink && (
                                    <CustomLinkIcon 
                                        onClick={onNavigate} 
                                        title={counterpart("common.button.seeOnGitlab")} 
                                    />
                                )}
                            </>
                        }
                        <CustomEditIcon onClick={onUpdate} />
                    </React.Fragment>
                )
            }
        }
    ];
    const onPreUpdateHandler = (ticketId) => {
        const ticketIndex = tickets.findIndex(p => p.id === ticketId)
        setSelectedTicket(tickets[ticketIndex])
        setShowTicketModal(true)
    }
    const onUpdateHandler = (ticket) => {
        setLoading(true)
        var api_url = is_admin ? `/admin/support/${ticket.id}` : `/support/${ticket.id}`
        var body = {
            severity: ticket.severity,
            product: ticket.selected_product,
            subject: ticket.subject,
            message: ticket.message
        }
        axios.patch(api_url, body)
            .then(res => {
                setLoading(false)
                setShowTicketModal(false)
            })
    }
    const onPreDeleteHandler = (ticketId) => {
        const ticketIndex = tickets.findIndex(p => p.id === ticketId)
        setSelectedTicket(tickets[ticketIndex])
        setShowConfirmDeleteModal(true)
    }
    const onDeleteHandler = () => {
        setLoadingDelete(true)
        axios.delete(`/admin/support/${selectedTicket.id}`).then(response => {
            setTickets(filteredListWithoutRemovedElement(selectedTicket.id, tickets))
            setFilteredTickets(filteredListWithoutRemovedElement(selectedTicket.id, filteredTickets))
            toast.success(context.counterpart('dashboard.support.successDelete'))
            setShowConfirmDeleteModal(false)
            setLoadingDelete(false)
        }).catch(err => {
            setShowConfirmDeleteModal(false)
            setLoadingDelete(false)

        })
    }
    const preDeleteSelectionHandler = (selectedItems) => {
        setMultiSelection(true)
        setShowConfirmDeleteModal(true)
        setSelectedDeletionItems(selectedItems)
    }
    const onDeleteSelectionHandler = async () => {
        setLoadingDelete(true)
        new Promise((r, j) => {
            const deletedTickets = []
            selectedDeletionItems.forEach((ticketId, index) => {
                axios.delete(`/admin/support/${ticketId}`)
                    .then(() => {
                        deletedTickets.push(ticketId)
                        if (index === selectedDeletionItems.length - 1) {
                            r(deletedTickets)
                        }
                    })
                    .catch(() => {
                        if (index === selectedDeletionItems.length - 1) {
                            r(deletedTickets)
                        }
                    })
            })
        })
            .then((delete_tickets) => {
                setTickets([...tickets.filter(p => !delete_tickets.includes(p.id))])
                toast.success(context.counterpart('dashboard.support.successMultiDelete'))
                setLoadingDelete(false)
                setShowConfirmDeleteModal(false)
            })
    }
    const addTicketHandler = async (ticket, files) => {
        setLoadingSubmit(true)
        var api_url = is_admin ? '/admin/support' : '/support'
        var ticket_id = 0
        axios.post(api_url, ticket)
            .then(res => {
                ticket_id = res.data.id
                setTickets([res.data, ...tickets])
                setLoadingSubmit(false)
                setShowAddTicketModal(false)
            })
            .then(() => {
                if (files.length > 0) {
                    const formData = new FormData()
                    files.forEach((file) => {
                        formData.append('files', file)
                    })
                    axios.post(`/support/attach-file/${ticket_id}`, formData)
                        .then(() => {
                            setLoadingSubmit(false)
                            setShowAddTicketModal(false)
                        })
                }
            }).catch(() => {
                setLoadingSubmit(false)
            })
    }
    const filtreTickets = (e) => {
        const searchQuery = e.target.value
        if (searchQuery === "") {
            var currentTickets = 
                closedTickets
                ? tickets.filter((ticket) => ticket.status === "closed") 
                : tickets.filter((ticket) => ticket.status !== "closed")
            setFilteredTickets(currentTickets)
            return
        } else {
            const filtered = filteredTickets.filter((ticket) => {
                return ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
            })
            setFilteredTickets(filtered)
        }
    }
    return (
        <Container fluid style={{ padding: "0px 20px 20px 20px" }} >
            <DeleteModal resourceName={'ticket'}
                multi={multiSelection}
                isOpen={showConfirmDeleteModal}
                toggle={() => setShowConfirmDeleteModal(!showConfirmDeleteModal)}
                onDelete={onDeleteHandler}
                onMultiDelete={onDeleteSelectionHandler}
                name={selectedTicket?.id.toString()}
                loading={loadingDelete} />
            <AddTicketModal isAdmin={is_admin} isOpen={showAddTicketModal} envs={environments} users={users} toggle={() => setShowAddTicketModal(!showAddTicketModal)} onSave={addTicketHandler} loading={loadingSubmit} />
            {
                selectedTicket && <TicketModal isOpen={showTicketModal} ticket={selectedTicket} envs={environments} users={users} onUpdate={onUpdateHandler} loading={loading} toggle={() => setShowTicketModal(!showTicketModal)} />
            }
            <Row style={{ marginTop: '10px', marginBottom: '20px' }}>
                <Col>
                    <h1 className="mainTitleText" style={{color: colors.mainText[_mode]}}>
                        Tickets
                    </h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div style={{width: "fit-content"}}>
                        <div className="toggleContainer" style={{ backgroundColor: colors.secondBackground[_mode], border: "1px solid "+colors.border[_mode], color: colors.mainText[_mode] }}>
                            <div
                                className={!closedTickets? "activeToggleItemContainer": "toggleItemContainer"}
                                onClick={() => setClosedTickets(false)}>
                                <h5 className="toggleItemText">
                                    <Translate content="dashboard.support.openedTickets" />
                                </h5>
                            </div>
                            <div
                                className={closedTickets? "activeToggleItemContainer": "toggleItemContainer"}
                                onClick={() => setClosedTickets(true)}>
                                <h5 className="toggleItemText">
                                    <Translate content="dashboard.support.closedTickets" />
                                </h5>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <LoadingButton style={{ width: '35px' }} onClick={() => setShowAddTicketModal(true)}>
                        <Add />
                    </LoadingButton>
                </Col>
            </Row>
            <Row style={{ marginTop: '20px' }}>
            <Col>
                    <div style={{ paddingBottom: "20px"  }} className="instanceCreation">
                        <TextField
                            onChange={(e) => filtreTickets(e) }
                            label={context.counterpart('dashboard.support.ticketTitle')}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SearchOutlinedIcon />
                                  </InputAdornment>
                                ),
                              }}
                            size="small"
                            fullWidth 
                        />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <DataTable
                        icon={'fa-solid fa-ticket'}
                        checkboxSelection
                        onDeleteSelection={preDeleteSelectionHandler}
                        columns={columns}
                        rows={filteredTickets} />
                </Col>
            </Row>
        </Container>
    );
}

export default ManageSupport;