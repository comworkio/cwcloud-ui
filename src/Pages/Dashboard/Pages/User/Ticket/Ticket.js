import {useContext, useState, useEffect} from 'react';
import { Container } from 'reactstrap';
// import classes from "./Ticket.module.css";
import '../../../../../common.css';
import { Row, Col } from "reactstrap";
import { NavLink, useLocation, useParams } from "react-router-dom";
import axios from "../../../../../utils/axios";
import { MenuItem, Select, TextField } from '@mui/material';
import GlobalContext from '../../../../../Context/GlobalContext';
import colors from '../../../../../Context/Colors';
import TicketReply from '../../../../../Components/TicketReply/TicketReply';
import LoadingButton from '../../../../../Components/LoadingButton/LoadingButton';
import Translate from 'react-translate-component';
import formateDate from '../../../../../utils/FormateDate';
import { isBlank, sortObjectsByDate } from '../../../../../utils/common';
import { BarLoader } from 'react-spinners';
import TicketDescription from '../../../../../Components/TicketReply/TicketDescription';

function Ticket() {
    const context = useContext(GlobalContext)
    const _mode = context.mode;
    const location = useLocation()
    const currentPath = location.pathname
    const is_admin = currentPath.includes('admin')
    const nextPath = is_admin ? '/admin/support' : '/support'
    const { ticketId } = useParams()
    const [ticket, setTicket] = useState(null)
    const [loadingReply, setLoadingReply] = useState(false)
    const [replies, setReplies] = useState([])
    const [replyMessage, setReplyMessage] = useState('')
    const [replyStatus, setReplyStatus] = useState('await customer')

    useEffect(() => {
        context.setIsGlobal(true)
        var api_url = is_admin ? `/admin/support/${ticketId}` : `/support/${ticketId}`
        axios.get(api_url)
            .then(res => {
                setTicket(res.data)
                var replies = sortObjectsByDate(res.data.replies)
                setReplies(replies)
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context, ticketId, loadingReply])

    const getStatusIcon = () => {
        if (ticket.status === "await customer")
            return (
                <div style={{ display: 'inline-block', borderRadius: '50%', background: '#22C8A2', height: '15px', width: '15px', marginRight: '15px' }}></div>
            )
        if (ticket.status === 'await agent')
            return (
                <div style={{ display: 'inline-block', borderRadius: '50%', background: '#FF8D69', height: '15px', width: '15px', marginRight: '15px' }}></div>
            )
        return (
            <div style={{ display: 'inline-block', borderRadius: '50%', background: 'red', height: '15px', width: '15px', marginRight: '15px' }}></div>
        )
    }

    const replyHandler = () => {
        setLoadingReply(true)
        var api_url = is_admin
            ? `/admin/support/${ticket.id}`
            : `/support/${ticket.id}`
        axios.post(api_url, { message: replyMessage, status: replyStatus })
            .then(res => {
                setLoadingReply(false)
                if (isBlank(replyMessage) || isBlank(res.data.reply)) {
                    setTicket({ ...ticket, status: replyStatus })
                } else {
                    setTicket({ ...ticket, status: replyStatus, replies: [{ ...res.data.reply }, ...ticket.replies] })
                    setReplyMessage("")
                }
            })
    }
    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            replyHandler()
        }
    }
    const findSeverity = (severity) => {
        return context.counterpart(`dashboard.support.severity.${severity}`)
    }
    if (!ticket)
        return null
    return (
        <Container fluid>
            <div className="goBack">
                <NavLink to={nextPath} className="link">
                    <i className="fa-solid fa-arrow-left iconStyle"></i>
                    <Translate content="dashboard.support.back" />
                </NavLink>
            </div>
            <Row style={{ marginTop: '20px' }}>
                <Col>
                    <h5 style={{ width: '100%', margin: '0', color: colors.mainText[_mode] }}>{getStatusIcon()} {`Ticket ${ticket.id} - ${ticket.subject}`}</h5>
                </Col>
            </Row>
            <Row style={{ marginTop: '10px' }}>
                <Col>
                    <h5 style={{ fontSize: '12px', fontWeight: '400', color: colors.title[_mode] }}>
                        {`${findSeverity(ticket.severity)} ${context.counterpart("dashboard.support.severityText")}`} | {ticket.selected_product} | <Translate content="dashboard.table.createdAt" /> : {formateDate(ticket.created_at)} | <Translate content="dashboard.table.updatedAt" /> : {formateDate(ticket.last_update)}
                    </h5>
                </Col>
            </Row>
            {ticket.user && 
                <Row style={{ marginTop: '10px' }}>
                    <Col>
                        <h5 style={{ fontSize: '12px', fontWeight: '400', color: colors.secondText[_mode] }}>
                            {`${context.counterpart("dashboard.support.createdBy")}: ${ticket.user.email}`}
                        </h5>
                    </Col>
                </Row>
            }
            <TicketDescription reply={{ ...ticket, change_date: ticket.created_at }} />
            <hr style={{ width: '100%', border: '1px solid #E5E5E5' }} />
            <Row style={{ marginTop: '30px', marginBottom: '30px' }}>
                <Col>
                    {replies?.map(reply => (
                        <TicketReply ticket_id={ticket.id} key={reply.id} reply={reply} />
                    ))}
                    {
                        loadingReply &&
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "20px"}}>
                                <BarLoader
                                    color={colors.title[_mode]}
                                    loading={loadingReply}
                                    size={10}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <Row>
                        <Col>
                            <TextField
                                label={context.counterpart("dashboard.support.enterMessage")}
                                placeholder={context.counterpart("dashboard.support.updateFromKeyboardTip")}
                                multiline
                                minRows={3}
                                style={{ width: '100%', color: colors.mainText[_mode]}}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </Col>
                    </Row>
                    {
                        is_admin &&
                        <Row style={{ marginTop: '20px' }}>
                            <Col>
                                <Select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                                    <MenuItem value={'await agent'}>
                                        <Translate content="dashboard.support.awaitAgent" />
                                    </MenuItem>
                                    <MenuItem value={'await customer'}>
                                        <Translate content="dashboard.support.awaitCustomer" />
                                    </MenuItem>
                                    <MenuItem value={'closed'}>
                                        <Translate content="dashboard.support.closed" />
                                    </MenuItem>
                                </Select>
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: "10px" }}>
                            <LoadingButton loading={loadingReply} onClick={replyHandler}>
                                <Translate content={is_admin ? "common.button.update" : "dashboard.support.reply"} />
                            </LoadingButton>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container >
    )
}

export default Ticket