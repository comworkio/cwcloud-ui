import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom'
import classes from "./EnvironmentItem.module.css"
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import formateDate from '../../../../../utils/FormateDate';
import DeleteModal from "../../../../../Components/Modal/DeleteModal"
import { toast } from 'react-toastify';
import axios from "../../../../../utils/axios"
import Skeleton from 'react-loading-skeleton'
import GlobalContext from '../../../../../Context/GlobalContext';
import CustomDeleteIcon from '../../../../../Components/CustomIcon/CustomDeleteIcon';
import colors from '../../../../../../Context/Colors';

function EnvironmentItem(props) {
    const context = useContext(GlobalContext);
    const _mode = context.mode;
    const [loading, setLoading] = useState(false)
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
    const { counterpart } = useContext(GlobalContext)
    const onPreDeleteHandler = () => {
        setShowConfirmDeleteModal(true)
    }

    const onDeleteHandler = () => {
        setLoading(true)
        axios.delete(`/admin/environment/${props.environment.id}`).then(response => {
            props.deleteEnvironment()
            toast.success(counterpart('dashboard.environmentOverview.message.successDelete'))
            setShowConfirmDeleteModal(false)
            setLoading(false)
        }).catch(err => {
            setShowConfirmDeleteModal(false)
            setLoading(false)
        })
    }
    if (props.loading)
        return (
            <tr >
                <th scope="row">
                    <Skeleton />
                </th>
                <td className="itemTitle"> <Skeleton /></td>
                <td className="itemTitle"> <Skeleton /></td>
                <td className="itemTitle"> <Skeleton /></td>
                <td className="itemTitle"> <Skeleton /></td>
                <td className="itemTitle">
                    <Skeleton />
                </td>
            </tr >
        )
    return (
        <tr >
            <DeleteModal resourceName={'environment'} isOpen={showConfirmDeleteModal} toggle={() => setShowConfirmDeleteModal(!showConfirmDeleteModal)} onDelete={onDeleteHandler} name={props.environment.name} loading={loading} />
            <th scope="row">
                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} title="open" placement="top-start">
                    <NavLink className={classes.linkstyle} to={`/environment/${props.environment.id}`}>
                        <h5 className={classes.itemTitleName} style={{color: colors.blue[_mode]}}>
                            {props.environment.id}
                        </h5>
                    </NavLink>
                </Tooltip>
            </th>
            <td className="itemTitle">{props.environment.name}</td>
            <td className="itemTitle">{props.environment.path}</td>
            <td className="itemTitle">{props.environment.is_private ? 'yes' : 'no'}</td>
            <td className="itemTitle">{formateDate(props.environment.created_at)}</td>
            <td className="itemTitle">
                <CustomDeleteIcon onClick={onPreDeleteHandler} />
            </td>
        </tr >
    )
}

export default EnvironmentItem