// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, InputGroup, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";


function Currency() {

    const StatusTemplate = ({ value, idx }) => {
        return (
            <div style={{width:90}}>
            {value === 1 || value == 'Active'?
             <span key={idx} className="badge rounded-pill bg-success">Active</span>: <span className="badge rounded-pill bg-danger">Inactive</span>
      
          }
          </div>
        );
    };
      
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            // {
            //     Header: 'Symbol',
            //     accessor: 'symbol',
            // },
            {
                Header: 'Short Name',
                accessor: 'code',
            },
            {
                Header: 'Hundredth Unit',
                accessor: 'hundredthUnit',
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) =><StatusTemplate value={value}/>
            },
            {
                Header: 'Date Created',
                accessor: 'dateCreated'
            },
           
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                   <div>
                       <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti" ><i className="far fa-eye" style={{color:'blue'}}></i></span>
                       <span onClick={() => handleDelete(originalRow)} className="btn btn-light button-akiti" ><i className="far fa-trash-alt" style={{color:'red'}}></i></span>
                   </div>
                ),
                id: 'action',
                width: '10'
                
            }
        ],
        []
    );



   

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [currencies, setCurrencies] = useState([])
    const [selected,setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
   


    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) =>  {
            return {...item, symbol: item.code || 'N/A', short_name: item.code || 'N/A', dateCreated: convertDateUSA(item.dateCreated)}
        })
        setCurrencies(mappedData)
    
    }

    const onError = (error) => {
        showToast("error", "Could not save currency")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        console.log(error)
        showToast("error", "Could not get currencies")
        setShowLoading(false)
    }

    const onDeletError = (error) =>{
        console.log(error)
        showToast("error", error?.code, "Notice") 
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        refetch()
    }

    const onUpdateError = (error) =>{
        console.log(error)
        showToast("error", error?.code, "Notice") 
        setShowLoading(false)
    }

    const onUpdateSuccess = () => {
        showToast("success", "Successfully Updated")
        setShowEditModal(false)
        refetch()
    }


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, "currencies", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, "currency", onsuccess, onError)
    const {mutate: deleteMutate,} = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Currencies/${selected?.id}`,"currencies", onDeleteSuccess, onDeletError)
    const {mutate: updateMutate,} = usePut(`${process.env.REACT_APP_ADMIN_URL}/Currencies/${selected?.id}`,"currencies", onUpdateSuccess, onUpdateError)
  
    
    const handleDelete = (row) => {
        setSelected(row)
        deleteMutate(row.id)
        // console.log(row)
    }

    const handleEdit = (row) => {
        //console.log(row)
        setSelected(row)
        //formik.initialValues["key"] 
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
          });
        setShowEditModal(true)
    }

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        code: Yup.string().required('Short name is required'),
        hundredthUnit: Yup.string().required('Hundredth Unit is required'),
    });

    const initialValues = {
        name: '', code: '', hundredthUnit: ''
    };


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
           
            if(showEditModal){
                updateMutate({...values, status:status == true ? 'Active' : 'Inactive'})
            }else{
                mutate({...values, status:status == true ? 'Active' : 'Inactive'})
                //console.log("Add Mode:", values)
            }
          

        },
    });

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Currency Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Currency";

    const [disabled, setDisabled] = useState(true)

    if(isListLoading){
        return <LoadingSpinner/>
    }


    return (
        <>
          {showLoading ? <LoadingSpinner/>: null}

            <div className="page-content">
                <div className="container-fluid">
                <Breadcrumbs title="Administration" breadcrumbItem="Currency" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={currencies}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                            handleDelete = {handleDelete}
                           className="table-sm "
                        />
                    </CardBody>

                </Card>

            </div>


            {/* Add Modal */}
            <Modal
                isOpen={modal_backdrop}
                toggle={() => {
                    tog_backdrop();
                }}
                backdrop={'static'}
                id="staticBackdrop"
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="staticBackdropLabel">Add Currency</h5>

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
                                    <label className="form-label">Name <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control-sm form-control" 
                                            autoComplete="off" placeholder="Enter currency name"
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name}/>
                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col" hidden>
                                <div className={`mb-3 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                                    <label className="form-label">Symbol <i
                                        className="text-danger">*</i></label>
                                    <InputGroup>
                                                <div className="input-group-text " style={{cursor:'pointer'}} onClick={() => setDisabled(!disabled)} title="Toggle between auto generation of code or custom input"> {disabled ? 'Custom' : "Generate"} </div>
                                                <input  type="text" className="form-control-sm form-control" name="code" placeholder="Enter code" disabled={disabled}
                                                        onBlur={formik.handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.code} />
                                            </InputGroup>
                                     {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                </div>
                            </div>
                            <div className="col">
                                <div>
                                    <label className="form-label"> Short Name  <i
                                        className="text-danger">*</i></label>
                                    <input type="text" name="code" id="code" placeholder="Enter short name" className="form-control-sm form-control" autoComplete="off"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.code}/> 
                                        {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <div>
                                    <label className="form-label">Hundreth Unit <i
                                        className="text-danger">*</i> </label>
                                    <input type="text" className="form-control-sm form-control" id="hundredthUnit"
                                        autoComplete="off" placeholder="Enter hundredth unit"
                                        onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.hundredthUnit}/>
                                            {formik.touched.hundredthUnit && formik.errors.hundredthUnit && <div className="text-danger">{formik.errors.hundredthUnit}</div>}
                                </div>
                            </div>
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
                            {/* <div className="col">
                                <div >
                                    <label className="form-label">Status </label>
                                    <select  className="form-select form-select" name="status" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.status} >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                        
                                    </select>
                                </div>
                             </div> */}
                        </div>
                        {/* <div className="row">
                            <div className="col-6">
                                <div className="mb-3">
                                    <label className="form-label">&nbsp;</label>
                                    <div className="input-group input-group-sm">
                                        Reporting Currency &nbsp; &nbsp;<input
                                            className="form-check-input"
                                            type="checkbox"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.reportingCurrency}
                                            id="reportingCurrency"
                                            name="reportingCurrency"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>  */}

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light" onClick={() => {
                            setmodal_backdrop(false);
                        }}>Close</button>
                        <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>
                    </div>
                </form>

            </Modal>


            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                toggle={() => {
                    setShowEditModal(!showEditModal);
                }}
                backdrop={'static'}
                id="staticBackdrop"
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="staticBackdropLabel">Edit Currency</h5>

                    <div>
                       
                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            onClick={() => {
                                setShowEditModal(false);
                                formik.resetForm()
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
                                            autoComplete="off" placeholder="Enter currency name"
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name}/>
                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col" hidden>
                                <div className={`mb-3 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                                    <label className="form-label">Symbol <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control-sm form-control"
                                        autoComplete="off" placeholder="Enter symbol" 
                                        name="code"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.code}/>
                                     {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                </div>
                            </div>
                            <div className="col">
                                <div>
                                    <label className="form-label"> Short Name  <i
                                        className="text-danger">*</i></label>
                                    <input type="text" name="code" id="code" placeholder="Enter short name" className="form-control-sm form-control" autoComplete="off"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.code}/> 
                                        {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <div>
                                    <label className="form-label">Hundreth Unit <i
                                        className="text-danger">*</i> </label>
                                    <input type="text" className="form-control-sm form-control" id="hundredthUnit"
                                        autoComplete="off" placeholder="Enter hundredth unit"
                                        onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.hundredthUnit}/>
                                            {formik.touched.hundredthUnit && formik.errors.hundredthUnit && <div className="text-danger">{formik.errors.hundredthUnit}</div>}
                                </div>
                            </div>
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
                       

                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>
                    </div>
                </form>

            </Modal>


        </div>
        </>
      



    );
}
Currency.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Currency;