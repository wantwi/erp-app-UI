// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useGet } from "hook/useGet";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";

function PaymentTerms() {

    const StatusTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 1 || value == 'Active' ?
                    <span key={idx} className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

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
                Header: 'Term Option',
                accessor: 'termOption',
                accessor: (originalRow, rowIndex) => (
                    <div>
                        {originalRow.termOption == 0 ? 'Day' : 'Month'}
                    </div>
                ),
            },
            {
                Header: 'Term Value',
                accessor: 'termValue',
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
                        <span onClick={() => { setshowAlert(true), setSelected(originalRow) }} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',
                width: '10'

            }
        ],
        []
    );



 
    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [status, setStatus] = useState(true)
    const [hasHolidays, setHasHolidays] = useState(true)
    const [hasWeeekends, sethasWeeekends] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAlert, setshowAlert] = useState(false)
    const [paymentList, setPaymentList] = useState([])
    const [selected, setSelected] = useState(null)



    const ongetsuccess = (data) => {
        //let mappedData = data.filter((item) => item.status != 2)
        setPaymentList(data)

    }

    const onGetError = (error) => {
        console.log(error)
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
        formik.resetForm()
        refetch()
    }

    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/PaymentTerms`, "PaymentTerms", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/PaymentTerms`, "PaymentTerms")
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/PaymentTerms/${selected?.id}`, "PaymentTerms", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/PaymentTerms/${selected?.id}`, "PaymentTerms", onUpdateSuccess, onUpdateError)



    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        termOption: Yup.string().required('Term Option is required'),
        termValue: Yup.string().required('Term Value is required'),
    });

    const initialValues = {
        name: '', termOption: '', termValue: 0
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            
            let payload = {...values, status: status == true ? '1' : '0',}
            console.log(payload)
           
            
            if (showEditModal) {
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
        let statusBool = row.status == 0 ? false : true
        setStatus(statusBool)
        //formik.initialValues["key"] 
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
        });
        setShowEditModal(true)
        setmodal_backdrop(true);
    }

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Payment Terms";
    if (isListLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Payment Terms" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={paymentList}
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
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Payment Term</h5>) :
                         (<h5 className="modal-title" id="staticBackdropLabel">Edit Payment Term</h5>)}

                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    formik.resetForm()
                                    setShowEditModal(false)
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
                                            value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-2">

                                <div className="col">
                                    <div >
                                        <label className="form-label">Term Options <i
                                            className="text-danger">*</i></label>
                                        <select className="form-select-sm form-select" name="termOption" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.termOption} >
                                            <option>Select Option</option>
                                            <option value={0}>Days</option>
                                            <option value={1}>Months</option>

                                        </select>
                                    </div>
                                </div>

                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.termValue && formik.errors.termValue ? 'has-error' : ''}`}>
                                        <label className="form-label">Term Value <i
                                            className="text-danger">*</i></label>
                                        <input type="number" className="form-control-sm form-control"
                                            autoComplete="off" placeholder="Enter value"
                                            name="termValue"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.termValue} />
                                        {formik.touched.termValue && formik.errors.termValue && <div className="text-danger">{formik.errors.termValue}</div>}
                                    </div>
                                </div>
                            </div>



                            <div className="row mb-2">

                                <div className="col">
                                    <div >
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

                                <div className="col">
                                    <div >
                                        <label className="form-label">Include Weekends </label>
                                        <div className="form-check form-switch form-switch-md mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="customSwitchsizemd"
                                                onChange={(e) => sethasWeeekends(!hasWeeekends)}
                                                defaultChecked={status}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="customSwitchsizemd"
                                            >
                                                {hasWeeekends ? 'Yes' : 'No'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="col">
                                    <div >
                                        <label className="form-label">Include Holidays </label>
                                        <div className="form-check form-switch form-switch-md mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="customSwitchsizemd"
                                                onChange={(e) => setHasHolidays(!hasHolidays)}
                                                defaultChecked={status}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="customSwitchsizemd"
                                            >
                                                {hasHolidays ? 'Yes' : 'No'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>


                             



                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                            }}>Close</button>
                             {!showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>}
                            {showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>}
                        </div>
                    </form>

                </Modal>
                <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />

            </div>
        </>




    );
}
PaymentTerms.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default PaymentTerms;