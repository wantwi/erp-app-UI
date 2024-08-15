// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { showToast } from "helpers/utility";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useDelete } from "hook/useDelete";
import useCustomAxios from "hook/useCustomAxios";
import { usePut } from "hook/usePut";



function ApprovalRules() {
    const StatusTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 1 || value == 'Active' ?
                    <span key={idx} className="badge rounded-pill bg-success">Active</span> :
                    (<span className="badge rounded-pill bg-danger">Inactive</span>) 
                     
                }
            </>
        );
    };
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Min # of Approvers',
                accessor: 'minApproverNumber',
            },
            {
                Header: 'Transaction Type',
                accessor: 'transactionType.name',
            },
            // {
            //     Header: 'Originators',
            //     accessor: 'base',
            // },
            // {
            //     Header: 'Approvers',
            //     accessor: 'effective_date',
            // },
         
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => { setshowAlert(true), setSelected(originalRow) }} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',
                width: '10'

            }
            
        ],
        []
    );



    const data = [];
    const [approvalsList, setApprovalsList] = useState([])
    const [status, setStatus] = useState(true)
    const [showAlert, setshowAlert] = useState(false)
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedApproversOptions, setSelectedApproversOptions] = useState([]);
    const [selectedOriginatorsOptions, setSelectedOriginatorsOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([])

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)

   

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return {
                ...item,

            }
        })
        setApprovalsList(mappedData)
    }

    const onGetError = (error) => {
        showToast("error", "Could not get list")
        setApprovalsList([])
    }

    const onsuccess = (data) => {
       // showToast("success", "Successfully saved")
    }

    const onError = (error) => {
        console.log(error)
        showToast("error", error.response.data.message)
        setShowLoading(false)
    }

    const onDeletError = (error) => {
        showToast("error", error.response.data.message)
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        refetch()
    }

    const onGetUsers = (data) => {
        let mappedData = data.map((item) => {
            return {
                "id": item.id,
                "value": item.id,
                "label": `${item.firstName} ${item.lastName}` 
            }
        })
        setUserOptions(mappedData)
    }

    const onUpdateError = (error) => {
        console.log(error)
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const onUpdateSuccess = () => {
        showToast("success", "Successfully Updated")
        setShowEditModal(false)
        tog_backdrop()
        refetch()
    }

    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Approval`, "Approval", onsuccess, onError)
    const { isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Approval`, "Approval", ongetsuccess, onGetError)
    const { data: users} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Users`,"users", onGetUsers)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Approval/${selected?.id}`, "Approval", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Approval/${selected?.id}`, "Approval", onUpdateSuccess, onUpdateError)
    const { data: transactionTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AppCodes?type=ApprovalType`, "ApprovalTypes")


    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
        if (value && value.some((o) => o.value === "0")) {
          return `${placeholderButtonLabel}: All`;
        } else {
          return `${placeholderButtonLabel}: ${value.length} selected`;
        }
      }
    
      function onChange(value, event) {
        if (event.action === "select-option" && event.option.value === "0") {
          this.setState(this.options);
        } else if (
          event.action === "deselect-option" &&
          event.option.value === "0"
        ) {
          this.setState([]);
        } else if (event.action === "deselect-option") {
          this.setState(value.filter((o) => o.value !== "0"));
        } else if (value.length === this.options.length - 1) {
          this.setState(this.options);
        } else {
          this.setState(value);
        }
      }
    

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        minApproverNumber: Yup.string().required('Min # of Approvers is required'),
       transactionTypeId: Yup.string().required("Transaction Type is required")
    });

    const initialValues = {
        name: '', minApproverNumber: '',  approverUsers: [], originUsers: [], transactionTypeId: '', status: true, useOrgStructure: false
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            let orginators = [] 
            selectedOriginatorsOptions.forEach((item) => orginators.push(item.value))
            let approvers = []
            selectedOriginatorsOptions.forEach((item) => approvers.push(item.value))
            let payload = {
                ...values,
                originUsers: orginators,
                approverUsers: approvers,
                status: status ? 'Active' : 'Inactive' ,
                useOrgStructure: values.useOrgStructure ? 'Yes' : 'No' 
            }

            console.log(values.transactionTypeId, 'ddd')

            if (showEditModal) {
                updateMutate(payload)
            } else {
                mutate(payload)
            }

            resetForm()

        },
    });

    const handleDelete = (row) => {

        deleteMutate(row.id)
        setshowAlert(false)
    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {
         //console.log(row)

        setShowEditModal(true)
        setSelected(row)
        formik.resetForm()
    
        axios.get(`${process.env.REACT_APP_ADMIN_URL}/Approval/${row?.id}`)
        .then((res) => {
            console.log(res.data.payload, "RESPONSE")
            let data = res.data.payload
            
            setmodal_backdrop(false);
           

             Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
             });
            //formik.initialValues["key"] 
            formik.setFieldValue("code", data?.code)
            formik.setFieldValue("name", data?.name)
            formik.setFieldValue("minApproverNumber", data?.minApproverNumber)
            formik.setFieldValue("approverUsers", data?.approverUsers)
            formik.setFieldValue("originUsers", data?.originUsers)
            formik.setFieldValue('transactionTypeId', row?.transactionType.id)
            formik.setFieldValue("useOrgStructure", data?.useOrgStructure == 'Yes' ? true : false)
            let status = data?.status == 'Active' ? true :  false
            setStatus(status)
           
        })
        .finally(() => {
            setShowLoading(false)
        })
    }

    const resetForm = () => {
     
            console.log('resetting form')
            formik.setFieldValue('name', '')
            formik.setFieldValue('code', '')
            formik.setFieldValue('minApproverNumber', '')
            formik.setFieldValue('approverUsers', [])
            formik.setFieldValue('originUsers', [])
            formik.setFieldValue('transactionTypeId', '')
            formik.setFieldValue('useOrgStructure', false)
    } 

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Approval Rule Successfully Created", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])

    //meta title
    document.title = "Biz-360 ERP | Approval Rules";


    if(isListLoading){
        return <LoadingSpinner message="loading..."/>
    }
    return (
        <>
          {showLoading ? <LoadingSpinner message="Saving..."/>: null}

            <div className="page-content">
                <div className="container-fluid">
                <Breadcrumbs title="Approval" breadcrumbItem="Approval Rules" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={approvalsList}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                         className="table-sm"
                        />
                    </CardBody>

                </Card>

            </div>


            {/* Modal */}
            <Modal
                isOpen={modal_backdrop}
                toggle={() => {
                    tog_backdrop();
                }}
                backdrop={'static'}
                id="staticBackdrop"
            >
                <div className="modal-header">
                    {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Approval Rule</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel">Edit Approval Rule</h5>)}

                    <div>
                        <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            onClick={() => {
                                setmodal_backdrop(false);
                                setShowEditModal(false);
                                resetForm()
                            }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                    </div>


                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body">

                        <div className="row">
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                    <label className="form-label">Name <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control-sm form-control" 
                                            autoComplete="off" placeholder="Enter name"
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name}/>
                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row">

                            <div className="col">
                                <div className={`mb-2 ${formik.touched.minApproverNumber && formik.errors.minApproverNumber ? 'has-error' : ''}`}>
                                    <label className="form-label">Min # of Approvers <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control-sm form-control"
                                        autoComplete="off" placeholder="Enter number" 
                                        name="minApproverNumber"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.minApproverNumber}/>
                                     {formik.touched.minApproverNumber && formik.errors.minApproverNumber && <div className="text-danger">{formik.errors.minApproverNumber}</div>}
                                </div>
                            </div>

                            <div className="col">
                                <div className={`mb-2 ${formik.touched.transactionTypeId && formik.errors.transactionTypeId ? 'has-error' : ''}`}>
                                    <label className="form-label">Transaction Type <i
                                        className="text-danger">*</i></label>
                                    <select  className="form-select-sm form-select" name="transactionTypeId" 
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.transactionTypeId} >
                                            <option value={''}>Select Type</option>
                                            {transactionTypes?.map((type, idx) => {
                                                return <option key={idx} value={type.id}>{type?.name}</option>
                                            })}
                                        
                                    </select>{formik.touched.transactionTypeId && formik.errors.transactionTypeId && <div className="text-danger">{formik.errors.transactionTypeId}</div>}
                                </div>
                             </div>
                        </div>

                        <div className="row">
                            <div className="col-6">
                                <div className="mb-3">
                                    <label className="form-label">&nbsp;</label>
                                    <div className="input-group input-group-sm">
                                        Use Org Structure for Appoval &nbsp; &nbsp;<input
                                            className="form-check-input"
                                            type="checkbox"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.useOrgStructure}
                                            name="useOrgStructure"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!formik.values.useOrgStructure && <div className="row">
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.originUsers && formik.errors.originUsers ? 'has-error' : ''}`}>
                                    <label className="form-label">Orginators <i
                                        className="text-danger">*</i></label>

                                        <ReactMultiSelectCheckboxes
                                           
                                           options={[{ label: "All", value: "0" }, ...userOptions]}
                                           placeholderButtonLabel="Select Users"
                                           getDropdownButtonLabel={getDropdownButtonLabel}
                                           value={selectedOriginatorsOptions}
                                           onChange={onChange}
                                           setState={setSelectedOriginatorsOptions}
                                           
                                           
                                           />
                                    {/* <select  className="form-select-sm form-select" name="originUsers" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.originUsers} >
                                            <option>Select Orginator(s)</option>
                                            {users.map((user) => {
                                                return <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                                            })}
                                           
                                        {formik.touched.originUsers && formik.errors.originUsers && <div className="text-danger">{formik.errors.originUsers}</div>}
                                    </select> */}
                                </div>
                            </div>
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.approverUsers && formik.errors.approverUsers ? 'has-error' : ''}`}>
                                    <label className="form-label">Approvers <i
                                        className="text-danger">*</i></label>
                                         <ReactMultiSelectCheckboxes
                                           
                                           options={[{ label: "All", value: "0" }, ...userOptions]}
                                           placeholderButtonLabel="Select Users"
                                           getDropdownButtonLabel={getDropdownButtonLabel}
                                           value={selectedApproversOptions}
                                           onChange={onChange}
                                           setState={setSelectedApproversOptions}
                                           />
                                </div>
                             </div>
                        </div>}

                        <div className="row">
                           
                        </div>

                        <div className="row">
                                <div >
                                    <label className="form-label">Status </label>
                                    <div className="form-check form-switch form-switch-md ">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="customSwitchsizemd"
                                            onChange={(e) => setStatus(!status)}
                                            defaultChecked={status}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="customSwitchsizemd"
                                        >
                                            {status ? 'Active' : 'Inactive'}
                                        </label>
                                    </div>

                                </div>
                        </div>
                      
                     
                     

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light" onClick={() => {
                            setmodal_backdrop(false);
                            setShowEditModal(false);
                            resetForm()
                        }}>Close</button>
                        {!showEditModal ? (<button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>) :
                                (<button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>)}
                        
                    </div>
                </form>

            </Modal>
            <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />

        </div>
        </>
      



    );
}
ApprovalRules.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default ApprovalRules;