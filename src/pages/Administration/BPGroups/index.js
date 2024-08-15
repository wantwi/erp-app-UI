// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Form, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { usePost } from "hook/usePost";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import Select from "react-select";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import SweetAlert from "components/CustomBizERP/SweetAlert";

const StatusTemplate = ({ value, idx }) => {
    return (
        <>
            {value === 1 || value == 'Active' ?
                <span key={idx} className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

            }
        </>
    );
};
function BusinessPartnerGroups() {
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Description',
                accessor: 'description'
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },
            {
                Header: 'BP Count',
                accessor: 'recordCount'
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

    const onsuccess = (data) => {
        refetch()
        //showToast("success", "Successfully saved")
    }

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return {
                ...item,
                startDate: convertDateUSA(item.groupCountCycle?.startDate),
                endDate: convertDateUSA(item.groupCountCycle?.endDate),
                countCycleType: item.groupCountCycle?.countCycle == 0 ? 'Months' : item.groupCountCycle?.countCycle == 1 ? 'Weeks' : 'Days',
                countCycleValue: item.groupCountCycle?.countCycleValue,
                recurring: item.groupCountCycle?.recurring == 0 ? 'Yes' : 'No',
            }
        })
        setBusinessGroupsList(mappedData)
    }

    const onGetError = (error) => {
        showToast("error", "Could not get list")
        setBusinessGroupsList([])
    }

    const onError = (error) => {
        showToast("error", "Could not save")
        //setShowLoading(false)
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

    const [activeTab, setActiveTab] = useState('General')

    const data = [];

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [formData, setFormData] = useState({ countCycle: 0, countCycleValue: 0, recurring: 0, startDate: '', endDate: '' })
    const [status, setStatus] = useState(true)

    const [businessGroupsList, setBusinessGroupsList] = useState([])
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [accountsOptions, setAccountsOptions] = useState([])
    const [accountTypesOptions, setAccountTypesOptions] = useState([])
    const [formRows, setFormRows] = useState([]);
    const [showAlert, setshowAlert] = useState(false)

    const { isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Groups/BusinessGroup`, "BusinessPartnerGroups", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Groups/business`, "BusinessPartnerGroups", onsuccess, onError)
    const { isLoading: isDeleting, mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Groups/${selected?.id}`, "BusinessPartnerGroups", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Groups/Business/${selected?.id}`, "BusinessPartnerGroups", onUpdateSuccess, onUpdateError)
    const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/BusinessPartner`, "AccountTypes", onAccountTypesGetSuccess)
    const { data: accounts } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllAccounts`, "accounts", onAccountsGetSuccess)

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
    });

    const initialValues = {

        name: "",
        description: "",
        status: "0",
        bpType: ''

    };


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            let payload = {
                name: values.name,
                description: values.description,
                status: status == true ? '1' : '0',
                groupAccountings: formRows.map((item) => {
                    return {
                        accountType: {
                            id: item?.accountType?.value
                          },
                          account: {
                            id: item?.account?.value
                        }
                    }
                }),
                bpType: values.bpType,
            }
            if (showEditModal) {
                updateMutate(payload)
            } else {
                mutate(payload)
            }

            resetForm()

        },
    });

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const handleDelete = (row) => {
       
        deleteMutate(row.id)
        setshowAlert(false) // console.log(row)
    }

    const handleEdit = (row) => {
        console.log(row)
        setSelected(row)
        let editStatus = row.status == 0 ? false : true
        setStatus(editStatus)
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
        });
        setShowEditModal(true)
        tog_backdrop();
    }


    const handleAccountFormChange = (e, index) => {

        //console.log(e, index)
        let newObj = { id: Math.ceil(Math.random() * 1000000), accountType: accountTypesOptions[index],  account: e }
        let data = [...formRows, newObj];
        //console.log(data)
     
        setFormRows(data)
    };


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
    document.title = "Biz-360 ERP | Business Partner Groups";

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
                    <Breadcrumbs title="Administration" breadcrumbItem="Business Partner Groups" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={businessGroupsList}
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
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Business Partner Group</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel">Edit Business Partner Group</h5>)}

                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    formik.resetForm();
                                    setShowEditModal(false)
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body">

                            <div className="row">
                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Name <i
                                            className="text-danger">*</i></label>
                                        <input type="text" className="form-control-sm form-control" id="name" placeholder="Enter Business Partner Name" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label"> Description</label>
                                        <textarea id="description" name="description" placeholder="Enter description" className="form-control-sm form-control" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.description} ></textarea>
                                    </div>
                                </div>
                            </div>


                            {/* Tabbed Pane */}
                            <div className="row">
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('General')}>
                                            <a className={activeTab == 'General' ? `nav-link active` : `nav-link`} href="javascript:void(0);">General</a>
                                        </li>

                                        <li className="nav-item" onClick={() => setActiveTab('Accounting')}>
                                            <a className={activeTab == 'Accounting' ? `nav-link active` : `nav-link`} href="javascript:void(0);">Accounting</a>
                                        </li>
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {activeTab == 'General' ? (
                                            <div className="tab-pane fade show active " id="general-tab-pane" role="tabpanel" aria-labelledby="general-tab" tabIndex="0">
                                                {/* Tab 1 */}




                                                <div className="row mb-2">
                                                    <div className="col">
                                                        <div className="mb-2">
                                                            <label className="form-label"> Type</label>
                                                            <select className="form-select form-select-sm" name="bpType" id="bpType" onChange={formik.handleChange}
                                                                value={formik.values.bpType}>
                                                                <option value={''}>Select Type</option>
                                                                <option value={'CUSTOMER'}>Customer</option>
                                                                <option value={'VENDOR'}>Vendor</option>
                                                                <option value={'LEAD'}>Lead</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-2">
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

                                            </div>) :
                                            (<div className="tab-pane fade show active" id="financial-tab-pane" role="tabpanel"
                                                aria-labelledby="financial-tab" tabIndex="0">
                                                <Form className="repeater" encType="multipart/form-data">
                                                    <div>

                                                        <Table className="table-sm mb-2">

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
                                                                                isReadonly
                                                                                name="accountType"
                                                                                options={accountTypesOptions}
                                                                                value={formRow}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                        <td>
                                                                            {/* <label htmlFor="name">Account Name</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleAccountFormChange(e, key)}
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
                                setShowEditModal(false);
                                formik.resetForm()
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
BusinessPartnerGroups.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BusinessPartnerGroups;