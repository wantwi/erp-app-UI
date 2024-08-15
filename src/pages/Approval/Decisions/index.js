// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";


function ApprovalDecisions() {
    const columns = useMemo(
        () => [
            {
                Header: 'Date Requested',
                accessor: 'name',
            },
            {
                Header: 'Type',
                accessor: 'type',
            },
            {
                Header: 'Document No.',
                accessor: 'docNo',
            },
            {
                Header: 'Partner',
                accessor: 'base',
            },
            {
                Header: 'Requested By',
                accessor: 'effective_date',
            },
            {
                Header: 'Status',
                accessor: 'status'
            },
            // {
            //     Header: 'Date Created',
            //     accessor: 'dateCreated'
            // },
        ],
        []
    );



    const data = [];

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)

   


    const onsuccess = (data) => {
        showToast("success", "Successfully saved")
    }

    const onError = (error) => {
        showToast("error", "Could not save tax table")
        setShowLoading(false)
    }
    const { mutate, isSuccess, isLoading } = usePost("/api/TaxTable", "taxTable", onsuccess, onError)

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        percentage: Yup.string().required('Percentage is required'),
        type: Yup.string().required('Symbol is required'),
        effectiveDate: Yup.date().required('Date is required'),
        glAccount: Yup.string().required('GL Account is required'),
        
    });

    const initialValues = {
        name: '', percentage: '', type: '', base: '', effectiveDate: '', glAccount: '', status: false
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            mutate(values)
            console.log(values)

        },
    });

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Tax Setup Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Approval Decisions";


    return (
        <>
          {showLoading ? <LoadingSpinner message="Saving..."/>: null}

            <div className="page-content">
                <div className="container-fluid">
                <Breadcrumbs title="Approval" breadcrumbItem="Approval Decisions" />
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
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="staticBackdropLabel">Add Approval Decision</h5>

                    <div>
                        <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            onClick={() => {
                                setmodal_backdrop(false);
                            }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                    </div>


                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body">

                        <div className="row">
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                    <label className="form-label">Document Number <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control form-control" 
                                            autoComplete="off" placeholder="Enter doc no."
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name}/>
                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                </div>
                            </div>

                            <div className="col">
                                <div className={`mb-3 ${formik.touched.percentage && formik.errors.percentage ? 'has-error' : ''}`}>
                                    <label className="form-label">Partner <i
                                        className="text-danger">*</i></label>
                                     <select  className="form-select form-select" name="status" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.status} >
                                        <option>Select Partner</option>
                                        
                                    </select>
                                     {formik.touched.percentage && formik.errors.percentage && <div className="text-danger">{formik.errors.percentage}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                           
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.type && formik.errors.type ? 'has-error' : ''}`}>
                                    <label className="form-label">Type <i
                                        className="text-danger">*</i></label>
                                    <select  className="form-select form-select" name="type" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.type} >
                                            <option>Select Type</option>
                                           
                                        {formik.touched.type && formik.errors.type && <div className="text-danger">{formik.errors.type}</div>}
                                    </select>
                                </div>
                             </div>
                            
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.base && formik.errors.base ? 'has-error' : ''}`}>
                                    <label className="form-label">Requested Date </label>
                                    <input type="date" className="form-control form-control" name="effectiveDate"
                                        autoComplete="off" 
                                        onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.effectiveDate}/>
                                            {formik.touched.effectiveDate && formik.errors.effectiveDate && <div className="text-danger">{formik.errors.effectiveDate}</div>}
                                </div>
                            </div>

                            <div className="col">
                                <div >
                                    <label className="form-label">Status <i
                                        className="text-danger">*</i></label>
                                    <select  className="form-select form-select" name="status" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.status} >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                        
                                    </select>
                                </div>
                             </div>
                        </div>
                        
                      

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light" onClick={() => {
                            setmodal_backdrop(false);
                        }}>Close</button>
                        <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>
                    </div>
                </form>

            </Modal>


        </div>
        </>
      



    );
}
ApprovalDecisions.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default ApprovalDecisions;