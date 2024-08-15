// src/components/filter.
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, Table, Form, InputGroup } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { usePost } from "hook/usePost";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { truncate } from "lodash";
import useCustomAxios from "hook/useCustomAxios";
import { FaCalendar } from "react-icons/fa";
import Flatpickr from "react-flatpickr";


const StatusTemplate = ({ value, idx }) => {
    return (
        <>
            {value === 1 || value == 'Active' || value == 'Open' ?
                <span key={idx} className="badge rounded-pill bg-success">{value}</span> : <span className="badge rounded-pill bg-danger">{value}</span>

            }
        </>
    );
};

function UserRequest() {
    const columns = useMemo(
        () => [
            {
                Header: 'Request No.',
                accessor: 'requestNumber',
            },
            {
                Header: 'Request Date',
                accessor: 'requestDate',
            },
            {
                Header: 'Requesting for Employee',
                accessor: 'employee',
            },

            {
                Header: 'Required By Date',
                accessor: 'requiredByDate',
            },
           
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
                        <span onClick={() => { setSelected(originalRow), setshowAlert(true) }} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',
                width: '10'

            }
        ],
        []
    );
    const [activeTab, setActiveTab] = useState('Add Items')
    const [data, setData] = useState([])
    const [showAlert, setshowAlert] = useState(false)
    const [disabled, setDisabled] = useState(true)

    const ongetsuccess = (data) => {
        let mappedData = data?.map((item) => {
            return {
                ...item,
                requestDate: convertDateUSA(item?.requestDate),
                requiredByDate: convertDateUSA(item?.requiredByDate),
                employee: item?.requestEmployee?.firstName + ' ' + item?.requestEmployee?.lastName
            }
        }).filter((item) => item.status == "Open")
        setData(mappedData)

    }

    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const onError = (error) => {
        showToast("error", "Could not save Item")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        console.log(error)
        showToast("error", "Could not get Items LIst")
        setShowLoading(false)
    }

    const onDeletError = (error) => {
        console.log(error)
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        refetch()
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
    const onUnitsGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item?.id, code: item.code, name:'unitOfMeasure' }
        })
        setunitsOfMeasureDropDown(mappedData)
    }

    const onemployeesgetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.firstName} ${item.lastName}`, value: item.id, }
        })
        setEmployeeOptions(mappedData)

        //select employee based on logged in user
        let res = mappedData.find((item) => item.value == loggedInUser)
        setSelecteEmployee(res)
    }

    const onitemsgetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item?.id, name:'item' }
        })
        setItemsOptions(mappedData)
    }

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [employeesDropDown, setEmployeeOptions] = useState([])
    const [itemsDropDown, setItemsOptions] = useState([])
    const [unitsOfMeasureDropDown, setunitsOfMeasureDropDown] = useState([])
    const [selectedEmployee, setSelecteEmployee] = useState(null)
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [itemsList, setItemsList] = useState([{ id: Math.ceil(Math.random() * 1000000), item: {label:'Select', value:0}, quantity: "", description: "", unitOfMeasure: {label:'Select', value:0} }])
    const [loggedInUser, setLoggedInUser] = useState(null)
    const [requestDate, setrequestDate]= useState(null)
    const [requiredByDate, setrequiredByDate] = useState(null)

    const { isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UserRequests/GetAll`, "Purchase Requests", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/UserRequests`, "UserRequests", onsuccess, onError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Employees`, "Employees", onemployeesgetsuccess)
    const {} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Items`, "Items", onitemsgetsuccess)
    const { mutate: deleteMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/UserRequests/UpdateStatusById/Closed/${selected?.id}`, "UserRequests", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/UserRequests/${selected?.id}`, "UserRequests", onUpdateSuccess, onUpdateError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure/GetAll`, "UnitsOfMeasure", onUnitsGetSuccess)
    // const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/businessPartner`, "AccountTypes", onAccountTypesGetSuccess)
    const flatpickrRef = useRef(null);
    const flatpickrRef2 = useRef(null);

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    const openFlatpickr2 = () => {
        flatpickrRef2?.current?.flatpickr.open();
    };

    //fetching loggedin user
    useEffect(() => {
        let loggedInData = localStorage.getItem('oidc.user:https://spes.pscgh.com:442/erpIdp:Biz360 Web')
        let parsedData =  JSON.parse(loggedInData)
        let profile = parsedData?.profile
        //console.log(profile)
        if(profile){
           setLoggedInUser(profile.sub)
        }
    }, [])

    const validationSchema = Yup.object().shape({
        requestDate: Yup.string().required('Request Date is required'),
        requiredByDate: Yup.string().required('Required By Date is required'),
    });

    const initialValues = {
        requestDate: new Date().toISOString().substring(0,10),
        requiredByDate: new Date().toISOString().substring(0,10),
        requestEmployee: '',
        comments: "",
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here

            let payload = {
                "requestDate": requestDate,
                "requiredByDate": requiredByDate,
                "requestEmployee": {
                    "id": selectedEmployee.value
                },
                requestDetails: itemsList.map((item) => {
                    return {
                        "item": {
                            "id": item.item.value
                        },
                        "description": item.description,
                        "quantity": item.quantity,
                        "unitOfMeasure": {
                            "id": item.unitOfMeasure.value
                        }
                    }
                }),
                "comments": values.comments,
                "deletedDetailsIds": []

            }
            console.log({ payload })


            if (showEditModal) {
                updateMutate(payload)
            } else {
               mutate(payload)
            }
            resetForm()
        },
    });


    const handleDelete = (row) => {

        deleteMutate(row?.id)
        setshowAlert(false)
    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {
        setShowLoading(true)
        setSelected(row)
        axios.get(`${process.env.REACT_APP_ADMIN_URL}/UserRequests/${row?.id}`)
        .then((res) => {
            console.log(res.data.payload)
            let data = res.data.payload
            setShowEditModal(true)
            tog_backdrop()
            let editStatus = data.status == 'Inactive' ? false : true
            setStatus(editStatus)
            formik.setFieldValue("requestDate", data?.requestDate.substring(0,10))
            formik.setFieldValue("requiredByDate", data?.requiredByDate.substring(0,10))
            formik.setFieldValue("comments",data?.comments)
            setSelecteEmployee({id: data.requestEmployee?.id, label: `${data.requestEmployee?.firstName} ${data.requestEmployee?.lastName}`})
            let list = data?.requestDetails?.map((values) => {
                return {
                    "item": {
                        "value": values?.item?.id,
                        "label": values?.item?.name
                    },
                    "description": values.description,
                    "quantity": values.quantity,
                    "unitOfMeasure": {
                        "value": values?.unitOfMeasure?.id,
                        "label": values?.unitOfMeasure?.name,
                    }
                }
            })
            console.log(list)
            setItemsList(list)
        })
        .finally(() => {
            setShowLoading(false)
           
        })
    }


    const resetForm = () => {
        formik.setFieldValue('requestDate', '')
        formik.setFieldValue('requiredByDate', '')
        formik.setFieldValue('requestEmployee', 0)
        formik.setFieldValue('comments', '')
        setItemsList([{ id: Math.ceil(Math.random() * 1000000), item: {label:'Select', value:0}, quantity: "", description: "", unitOfMeasure: {label:'Select', value:0} }])
        setSelecteEmployee(null)

        console.log('resetting form')
    }
    const addItem = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), item: {label:'Select', value:0}, quantity: "", description: "", unitOfMeasure: {label:'Select', value:0} }
        setItemsList((prev) => [...prev, newOBJ]);
    };

    const handleFormChange = (e, index) => {
        let data = [...itemsList];
        if(e.target == undefined){  
            data[index][e.name].value = e.value;
            data[index][e.name].label = e.label;
            if(e.name == 'item'){
                console.log(data)
                data[index]['quantity'] = 1
            }
        }
        else{
            data[index][e.target.name] = e.target.value;

        }
        setItemsList((prev) => data)
    };




  
    const removeFields = (item) => {
        if(itemsList.length == 1){
            showToast('warning', 'You must have at least one tax band')
        }
        else{
            let data = itemsList.filter((x) => x.id != item.id)
            // console.log(data)
            setItemsList(data);
        }
        
    };


   

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const [showLoading, setShowLoading] = useState(false)
    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "User Request Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | User Request";

    if (isListLoading || showLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Master Data" breadcrumbItem="User Request" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={data}
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
                    size={activeTab == "Add Items" ? 'xl' : 'lg'}
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add User Request</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel">Edit User Request</h5>)}

                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    setShowEditModal(false)
                                    resetForm()
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body">

                        <div className="row mb-2">

                            <div className="col-3">
                                    <div className="mb-0">
                                        <label className="form-label">Request Date <i
                                            className="text-danger">*</i></label>
                                             <InputGroup>
                                                    <Flatpickr
                                                        value={requestDate}
                                                        // value={formik.values.dateOfBirth}
                                                        // name="dateOfBirth" onChange={formik.handleChange}
                                                        //onChange={() => console.log(flatpickrRef.current.flatpickr.selectedDates)}
                                                        onChange={(e) => setrequestDate(e[0].toISOString())}
                                                        className="form-control form-control-sm"
                                                        placeholder="dd M, yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d M, Y",
                                                            dateFormat: "Y-m-d"
                                                        }}
                                                        ref={flatpickrRef} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text" onClick={openFlatpickr}>
                                                            <FaCalendar />
                                                        </span>
                                                    </div>
                                                </InputGroup>
                                                {requestDate == null ? <div className="text-danger">{'Request Date is required'}</div> : null}
                                        {/* <input type="date" className="form-control-sm form-control" name="requestDate" onChange={formik.handleChange}
                                            value={formik.values.requestDate}
                                            autoComplete="off"  />
                                        {formik.touched.requestDate && formik.errors.requestDate && <div className="text-danger">{formik.errors.requestDate}</div>} */}
                                    </div>
                            </div>

                            <div className="col-3">
                                    <div className="mb-0">
                                        <label className="form-label">Required By Date <i
                                            className="text-danger">*</i></label>
                                             <InputGroup>
                                                    <Flatpickr
                                                        value={requiredByDate}
                                                        // value={formik.values.dateOfBirth}
                                                        // name="dateOfBirth" onChange={formik.handleChange}
                                                        //onChange={() => console.log(flatpickrRef.current.flatpickr.selectedDates)}
                                                        onChange={(e) => setrequiredByDate(e[0].toISOString())}
                                                        className="form-control form-control-sm"
                                                        placeholder="dd M, yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d M, Y",
                                                            dateFormat: "Y-m-d"
                                                        }}
                                                        ref={flatpickrRef2} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text" onClick={openFlatpickr2}>
                                                            <FaCalendar />
                                                        </span>
                                                    </div>
                                                </InputGroup>
                                                {requiredByDate == null ? <div className="text-danger">{'Required By Date is required'}</div> : null}
                                        {/* <input type="date" className="form-control-sm form-control" name="requiredByDate" onChange={formik.handleChange}
                                            value={formik.values.requiredByDate}
                                            autoComplete="off"  />
                                        {formik.touched.requiredByDate && formik.errors.requiredByDate && <div className="text-danger">{formik.errors.requiredByDate}</div>} */}
                                    </div>
                            </div>


                            <div className="col-1"></div>


                            <div className="col-3">
                                <div className="mb-3">
                                    <label className="form-label">Request Number </label>
                                    <InputGroup>
                                        <div className="input-group-text " style={{ cursor: 'pointer', height:27 }} onClick={() => setDisabled(!disabled)} title="Toggle between auto generation of code or custom input"> {disabled ? 'Custom' : "Generate"} </div>
                                        <input type="text" className="form-control-sm form-control" name="requestNumber" placeholder="Enter requestNumber" disabled={disabled}
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.code} />
                                    </InputGroup>
                                    {formik.touched.requestNumber && formik.errors.requestNumber && <div className="text-danger">{formik.errors.requestNumber}</div>}
                                </div>
                            </div>


                            <div className="col-2">
                                    <div className="mb-0">
                                        <label className="form-label">Status </label>
                                        <select className="form-select-sm form-select" disabled={showEditModal}>
                                            <option value={'Opened'}>Opened</option>
                                            <option value={'Closed'}>Closed</option>
                                            <option value={'Canceled'}>Canceled</option>
                                            <option value={'Draft'}>Draft</option>
                                        </select>

                                    </div>
                            </div>

                           


                               
                        </div>

                           

                         <div className="row mb-3">

                                <div className="col-6">
                                    <div className="mb-0">
                                        <label className="form-label">Requesting for Employee </label>
                                         <Select
                                            onChange={(e) => setSelecteEmployee(e)}
                                            name="assetClass"
                                            options={employeesDropDown}
                                            value={selectedEmployee}
                                            className="select2-selection row1" />
                                    </div>
                                </div>

                                <div className="col-1"></div>
                               

                                <div className="col-5">

                                    <div className="mb-0">
                                        <label className="form-label">Comments</label>
                                        <textarea className="form-control-sm form-control" name="comments" onChange={formik.handleChange}
                                            value={formik.values.comments}
                                            autoComplete="off"  />
                                    </div>
                                </div>
  
                        </div>


                         


                            {/* Tabbed Pane */}
                            <div className="row" >
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('Add Items')}>
                                            <a className={activeTab == 'Add Items' ? `nav-link active` : `nav-link`} href="#">Add Items</a>
                                        </li>

                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {activeTab == 'Add Items' ? (
                                            <div className="tab-pane fade show active " id="Add-Items-tab-pane" role="tabpanel" aria-labelledby="Add Items" tabIndex="0">
                                                {/* Tab 1 */}
                                                {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addItem}><i className="mdi mdi-plus me-1" /> Add Item/Service</button>
                                                </div> */}
                                                <Table className="table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th style={{width:'35%'}}>Item/Service</th>
                                                            <th style={{width:'15%'}}>Quantity</th>
                                                            <th style={{width:'20%'}}>Unit of Measure</th>
                                                            <th style={{width:'20%'}}>Description</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {itemsList?.map((form, key) => {
                                                            return (
                                                                <tr key={key}>
                                                                    <td>{key+1}</td>
                                                                    <td>
                                                                        
                                                                         <Select
                                                                            onChange={(e) => handleFormChange(e, key)}
                                                                            name="item"
                                                                            options={itemsDropDown}
                                                                            value={form.item}
                                                                            className="select2-selection row1" />
                                                                    </td><td><input type="number" className="form-control-sm form-control" autoComplete="off" name="quantity" value={form.quantity} onChange={(e) => handleFormChange(e, key)} /></td>
                                                                    <td>
                                                                    {/* <select className="form-select-sm form-select" name="unitOfMeasure">
                                                                            <option>Select Unit of Measure</option>
                                                                        </select> */}
                                                                         <Select
                                                                            onChange={(e) => handleFormChange(e, key)}
                                                                            name="unitOfMeasure"
                                                                            options={unitsOfMeasureDropDown}
                                                                            value={form.unitOfMeasure}
                                                                            className="select2-selection row1" />
                                                                    </td>
                                                                    <td>
                                                                        <textarea className="form-control-sm form-control" autoComplete="off" name="description" value={form.description} onChange={(e) => handleFormChange(e, key)}></textarea> 
                                                                    </td>
                                                                    <td style={{ width: '7%',textAlign:'right' }}>
                                                                        <span  type="button" className="text-primary" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}} title="Add Contact" onClick={addItem}>
                                                                                <i className="far  fas fa-plus" />
                                                                        </span>
                                                                        <span type="button"className="text-danger" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                                <i className="far  fas fa-trash" />
                                                                        </span>
                                                                    </td>
                                                                    
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </Table>
                                            </div>

                                           ): null}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                resetForm()
                                setShowEditModal(false)
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
UserRequest.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default UserRequest;