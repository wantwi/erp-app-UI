// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, InputGroup, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { commaRemover, convertDateUSA, moneyInTxt, showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import CurrencyInput from "react-currency-input-field";
import SweetAlert from "components/CustomBizERP/SweetAlert";


function PayGrade() {

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
           
            {
                Header: 'Max Amount',
                accessor: 'maximumAmount',
            },
            {
                Header: 'Min Amount',
                accessor: 'minimumAmount',
            },
            {
                Header: 'Frequency',
                accessor: 'frequency.name',
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) =><StatusTemplate value={value}/>
            },
           
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                   <div>
                       <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti" ><i className="far fa-eye" style={{color:'blue'}}></i></span>
                       <span  onClick={() => {  setSelected(originalRow), setshowAlert(true) }} className="btn btn-light button-akiti" ><i className="far fa-trash-alt" style={{color:'red'}}></i></span>
                   </div>
                ),
                id: 'action',
                width: '10'
                
            }
        ],
        []
    );



   

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [payGrades, setpayGrades] = useState([])
    const [payLevelFrequencies, setpayLevelFrequencies] = useState([])
    const [selected,setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [showAlert, setshowAlert] = useState(false)


    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) =>  {
            return {...item, maximumAmount: moneyInTxt(item.maximumAmount), minimumAmount: moneyInTxt(item.minimumAmount), dateCreated: convertDateUSA(item.dateCreated)}
        })
        setpayGrades(mappedData)
    
    }
    const ongetpaylevelssuccess = (data) => {
        setpayLevelFrequencies(data)
    }

    const onError = (error) => {
        showToast("error", "Could not save pay grade")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        console.log(error)
        showToast("error", "Could not get pay grade")
        setShowLoading(false)
    }

    const onDeletError = (error) =>{
        console.log(error)
        showToast("error", error?.code, "Notice") 
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        setshowAlert(false)
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


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/PayLevels`, "PayLevels", ongetsuccess, onGetError)
    const {  } = useGet(`${process.env.REACT_APP_ADMIN_URL}/PayLevels/GetPayFrequencies`, "PayFrequencies", ongetpaylevelssuccess)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/PayLevels`, "PayLevels", onsuccess, onError)
    const {mutate: deleteMutate,} = useDelete(`${process.env.REACT_APP_ADMIN_URL}/PayLevels/${selected?.id}`,"PayLevels", onDeleteSuccess, onDeletError)
    const {mutate: updateMutate,} = usePut(`${process.env.REACT_APP_ADMIN_URL}/PayLevels/${selected?.id}`,"PayLevels", onUpdateSuccess, onUpdateError)
  
    
    const handleDelete = () => {
        deleteMutate(selected.id)
       
    }

    const handleEdit = (row) => {
        console.log(row)
        setSelected(row)
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            if(fieldName == 'maximumAmount' || fieldName == 'minimumAmount'){
                formik.setFieldValue(fieldName, Number(commaRemover(row[fieldName])));
            }
            else if(fieldName == 'frequency'){
                formik.setFieldValue(fieldName, row[fieldName]?.id);
            }
            else{
                formik.setFieldValue(fieldName, row[fieldName]);
            }
            
        });
        setShowEditModal(true)
        tog_backdrop();
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
        maximumAmount: Yup.string().required('Maximum amount is required'),
        minimumAmount: Yup.string().required('Minimum amount is required'),
    });

    const initialValues = {
        name: '', minimumAmount: '', maximumAmount: '', frequency: '', comment:''
    };


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
           
            let payload = {
                "name": values.name,
                "code": values.code,
                "comment": values.comment,
                
                "maximumAmount": values.maximumAmount,
                "minimumAmount": values.minimumAmount,
                
                "frequency": {
                    "id": parseInt(values.frequency)
                },
                status : status == true ? 'Active' : 'Inactive'
            }
           // console.log(payload)
            if(showEditModal){
                updateMutate(payload)
            }else{
                mutate(payload)
            }
          

        },
    });


    const resetForm = () => {
        formik.setFieldValue('name', '')
        formik.setFieldValue('minimumAmount', 0)
        formik.setFieldValue('maximumAmount', 0)
        formik.setFieldValue('frequency', '')
        formik.setFieldValue('comment', '')
    }

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Pay Grade Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Pay Grade";

    const [disabled, setDisabled] = useState(true)

    if(isListLoading){
        return <LoadingSpinner/>
    }


    return (
        <>
          {showLoading ? <LoadingSpinner/>: null}

            <div className="page-content">
                <div className="container-fluid">
                <Breadcrumbs title="Administration" breadcrumbItem="Pay Grade" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={payGrades}
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
                {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Pay Grade</h5>
                    ) : (<h5 className="modal-title" id="staticBackdropLabel">Edit Pay Grade</h5>)}

                    <div>
                        <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            onClick={() => {
                                setmodal_backdrop(false);
                                resetForm()
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
                                            value={formik.values.name}/>
                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                </div>
                            </div>

                            <div className="col">
                                <div>
                                    <label className="form-label"> Code  <i
                                        className="text-danger">*</i></label>
                                    <input type="text" name="code" id="code" placeholder="Enter code" className="form-control-sm form-control" autoComplete="off"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.code}/> 
                                        {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <div className={`mb-3 ${formik.touched.minimumAmount && formik.errors.minimumAmount ? 'has-error' : ''}`}>
                                    <label className="form-label">Minimum Amount <i
                                        className="text-danger">*</i></label>
                                    <CurrencyInput name="minimumAmount" className={`form-control form-control-sm text-r`} 
                                    placeholder="0.00" defaultValue={formik.values.minimumAmount} decimalsLimit={2}
                                     onValueChange={formik.handleChange} onChange={formik.handleChange}/>
                                    {formik.touched.minimumAmount && formik.errors.minimumAmount && <div className="text-danger">{formik.errors.minimumAmount}</div>}
                                </div>
                            </div>

                            <div className="col">
                                <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                    <label className="form-label">Maximum Amount <i
                                        className="text-danger">*</i></label>
                                    <CurrencyInput name="maximumAmount" className={`form-control form-control-sm text-r`} 
                                    placeholder="0.00" defaultValue={formik.values.maximumAmount} decimalsLimit={2}
                                     onValueChange={formik.handleChange} onChange={formik.handleChange}/>

                                    {formik.touched.maximumAmount && formik.errors.maximumAmount && <div className="text-danger">{formik.errors.maximumAmount}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            
                           

                            <div className="col-6">
                                <div>
                                    <label className="form-label"> Frequency  <i
                                        className="text-danger">*</i></label>
                                    <select id="frequency" name="frequency"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.frequency}
                                        className="form-select fonm-select-sm">
                                        <option>Select Frequency</option>
                                        {payLevelFrequencies.map((item) => {
                                            return <option key={item.id} value={item.id}>{item.name}</option>
                                        })}
                                    </select>
                                        {formik.touched.frequency && formik.errors.frequency && <div className="text-danger">{formik.errors.frequency}</div>}
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
                        <div className="row">
                            <div className="col">
                                <div>
                                    <label className="form-label">Comment <i
                                        className="text-danger">*</i> </label>
                                    <textarea type="text" className="form-control-sm form-control" id="comment"
                                        autoComplete="off" placeholder="Enter comments here"
                                        onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.comment}></textarea>
                                            {formik.touched.comment && formik.errors.comment && <div className="text-danger">{formik.errors.comment}</div>}
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
                        {!showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2" onClick={() =>  console.log(formFields)}></i>Save</button>}
                        {showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>} </div>
                </form>

            </Modal>
            <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />


           
        </div>
        </>
      



    );
}
PayGrade.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default PayGrade;