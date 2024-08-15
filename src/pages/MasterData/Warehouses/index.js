// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
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


const StatusTemplate = ({ value, idx }) => {
    return (
        <>
            {value === 1 || value == 'Active' ?
                <span key={idx} className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

            }
        </>
    );
};

function Warehouses() {
    const columns = useMemo(
        () => [
            {
                Header: 'Code',
                accessor: 'code',
            },
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Notes',
                accessor: 'description'
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },
            {
                Header: 'Date Created',
                accessor: 'dateCreated'
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
    const [activeTab, setActiveTab] = useState('Add Territories')
    const [data, setData] = useState([])
    const [showAlert, setshowAlert] = useState(false)
    const [disabled, setDisabled] = useState(true)

    const ongetsuccess = (data) => {
        let mappedData = data.filter((item) => item.status != 2)
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
    const onAccountsGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.code} - ${item.name}`, value: item.id, code: item.code }
        })
        setAccountsOptions(mappedData)
    }

    const onAccountTypesGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setAccountTypesOptions(mappedData)
    }

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [formData, setFormData] = useState({ name: '', symbol: '', short_name: '' })
    const [accountsOptions, setAccountsOptions] = useState([])
    const [accountTypesOptions, setAccountTypesOptions] = useState([])
    const [formRows, setFormRows] = useState([]);
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)


    const { isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Warehouses`, "Warehouses", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Warehouses`, "Warehouses", onsuccess, onError)
    const { isLoading: isDeleting, mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Warehouses/${selected?.id}`, "Warehouses", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Warehouses/${selected?.id}`, "Warehouses", onUpdateSuccess, onUpdateError)
    const { data: accounts } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllAccounts`, "accounts", onAccountsGetSuccess)
    const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/businessPartner`, "AccountTypes", onAccountTypesGetSuccess)

    const validationSchema = Yup.object().shape({
        code: Yup.string().required('Code is required'),
    });

    const initialValues = {
        name: '',
        code: '',
        description: '',
        postalAddress: "",
        address: ""
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here

            let payload = {
                ...values,
                status: status == true ? '1' : '0',

            }
            console.log({ payload })


            if (showEditModal) {
                console.log(payload)
                updateMutate(payload)
            } else {
                mutate(payload)
            }

        },
    });


    const handleDelete = (row) => {

        deleteMutate(row.id)
        setshowAlert(false)
    }

    const handleEdit = (row) => {
        console.log(row)
        setSelected(row)
        setFormData(row)
        let editStatus = row.status == 0 ? false : true
        setStatus(editStatus)
        //formik.initialValues["key"] 
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
        });
        setShowEditModal(true)
        tog_backdrop();
    }

    const onAddFormRow = () => {

        let newOBJ = { id: Math.ceil(Math.random() * 1000000), accountType: '', accountName: '' }
        let updatedList = [...formRows, newOBJ]
        setFormRows((prev) => updatedList);

    };

    const onDeleteFormRow = index => {
        console.log(index)
        let data = [...formRows];
        let removed = data.splice(index, 1)
        console.log("Removed", removed)
        console.log("Remainder", data)
        setFormRows(data);
    }


    const handleFormChange = (e, index) => {

        let newObj = { id: Math.ceil(Math.random() * 1000000), accountType: '', accountName: '' }
        let data = [...formRows, newObj];


        data[index]['accountName'] = e.label;
        data[index]['accountType'] = e.value;

        setFormRows((prev) => data);

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
            showToast("success", "Business Partner Group Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Warehouses";

    if (isListLoading) {
        return <LoadingSpinner />
    }

    if (isDeleting) {
        return <LoadingSpinner message="Deleting record..." />
    }
    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Master Data" breadcrumbItem="Warehouses" />
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
                    size={activeTab == "Accounting" ? 'lg' : 'md'}
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Warehouse</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel">Edit Warehouse</h5>)}

                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    setShowEditModal(false)
                                    formik.resetForm()
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body">

                            <div className="row mb-3">
                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Code <i
                                            className="text-danger">*</i></label>
                                        <InputGroup>
                                            <div className="input-group-text " style={{ cursor: 'pointer', height:27 }} onClick={() => setDisabled(!disabled)} title="Toggle between auto generation of code or custom input"> {disabled ? 'Custom' : "Generate"} </div>
                                            <input type="text" className="form-control-sm form-control" name="code" placeholder="Enter code" disabled={disabled}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.code} />
                                        </InputGroup>
                                        {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Name <i
                                            className="text-danger">*</i></label>
                                        <input type="text" className="form-control-sm form-control" name="name" onChange={formik.handleChange}
                                            value={formik.values.name}
                                            autoComplete="off" placeholder="Enter name" />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">

                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Notes </label>
                                        <textarea className="form-control-sm form-control" name="description" onChange={formik.handleChange}
                                            value={formik.values.description}
                                            autoComplete="off" placeholder="Enter notes" />
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Address</label>
                                        <textarea className="form-control-sm form-control" name="postalAddress" onChange={formik.handleChange}
                                            value={formik.values.postalAddress}
                                            autoComplete="off" placeholder="Enter Postal Address" />
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">

                                <div className="col-6">
                                    <div className="mb-3">
                                        <label className="form-label">Status </label>
                                        <div className="form-check form-switch form-switch-md mb-3">
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


                            {/* Tabbed Pane */}
                            <div className="row">
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('Add Territories')}>
                                            <a className={activeTab == 'Add Territories' ? `nav-link active` : `nav-link`} href="#">Add Territories</a>
                                        </li>

                                        <li className="nav-item" onClick={() => setActiveTab('Accounting')}>
                                            <a className={activeTab == 'Accounting' ? `nav-link active` : `nav-link`} href="#">Accounting</a>
                                        </li>
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {activeTab == 'Add Territories' ? (
                                            <div className="tab-pane fade show active " id="Add Territories-tab-pane" role="tabpanel" aria-labelledby="Add Territories-tab" tabIndex="0">
                                                {/* Tab 1 */}
                                                <div className="row mb-3">
                                                    <div className="col">
                                                        List of locations with checkboxes for selection
                                                    </div>

                                                </div>


                                            </div>) :
                                            (<div className="tab-pane fade show active" id="financial-tab-pane" role="tabpanel"
                                                aria-labelledby="financial-tab" tabIndex="0">
                                                <Form className="repeater" encType="multipart/form-data">
                                                    <div>

                                                        <Table className="table mb-2">

                                                            <thead>
                                                                <tr>
                                                                    {/* <th>#</th> */}
                                                                    <th style={{ width: '40%' }}>Account Type</th>
                                                                    <th style={{ width: '50%' }}>Account Code & Name</th>
                                                                    {/* <th></th> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {/* {(formRows || []).map((formRow, key) => ( */}
                                                                {(accountTypesOptions || []).map((formRow, key) => (
                                                                    <tr key={key}>
                                                                        {/* <td>{key + 1}</td> */}
                                                                        <td >
                                                                            {/* <label htmlFor="name">Account Type</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleFormChange(e, key)}
                                                                                name="accountType"
                                                                                options={accountTypesOptions}
                                                                                value={formRow}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                        <td>
                                                                            {/* <label htmlFor="name">Account Name</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleFormChange(e, key)}
                                                                                name="accountName"
                                                                                options={accountsOptions}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>




                                                    </div>
                                                    {/* <input
                                                        type="button"
                                                        className="btn btn-success mt-3 mt-lg-0"
                                                        value="Add"
                                                        onClick={() => onAddFormRow()}
                                                    /> */}
                                                </Form>
                                            </div>)}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                formik.resetForm()
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
Warehouses.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Warehouses;