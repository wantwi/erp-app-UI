// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, InputGroup, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import Select from "react-select";
import useCustomAxios from "hook/useCustomAxios";


function AssetClass() {
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
                Header: 'Depreciation Type',
                accessor: 'depreciationType.name'
            },
            {
                Header: 'Rate',
                accessor: 'rate',
            },
            {
                Header: 'Date Created',
                accessor: 'dateCreated',
                Cell: ({ cell: { value } }) => <>{convertDateUSA(value)}</>
            },
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div style={{ width: 90, textAlign: 'right' }}>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => {setSelected(originalRow), setshowAlert(true)}} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',


            }
        ],
        []
    );



    const [activeTab, setActiveTab] = useState('Account Determination')
    const [assetClassList, setAssetClassList] = useState([])
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [showAlert, setshowAlert] = useState(false)
    const [accountTypesOptions, setAccountTypesOptions] = useState([])
    const [accountsOptions, setAccountsOptions] = useState([])
    const [formRows, setFormRows] = useState([]);

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)




    const ongetsuccess = (data) => {
        setAssetClassList(data)
    }

    const onGetError = (error) => {
        showToast("error", "Could not get list of records")
        setShowLoading(false)
    }

    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const onError = (error) => {
        showToast("error", "Could not save Asset Class")
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

    const onAccountTypesGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setAccountTypesOptions(mappedData)
    }

    const onAccountsGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.code} - ${item.name}`, value: item.id, code: item.code }
        })
        setAccountsOptions(mappedData)
    }

    


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AssetClass/GetAll`, "AssetClass", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/AssetClass`, "AssetClass", onsuccess, onError)
    const {mutate: deleteMutate,} = useDelete(`${process.env.REACT_APP_ADMIN_URL}/AssetClass/DeleteAsync/${selected?.id}`,"AssetClass", onDeleteSuccess, onDeletError)
    const {mutate: updateMutate,} = usePut(`${process.env.REACT_APP_ADMIN_URL}/AssetClass?id=${selected?.id}`,"AssetClass", onUpdateSuccess, onUpdateError)

    const { data: depreciationTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AppCodes?type=depreciationType`, "Depreciation Types")
    const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/AccountDetermination`, "AccountDetermination", onAccountTypesGetSuccess)
    const { data: accounts } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetActualAccounts`, "accounts", onAccountsGetSuccess)

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }


    const handleDelete = (row) => {
    
        deleteMutate(row.id)
        setshowAlert(false)
       
    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {
        setShowLoading(true)
        console.log(row)
        setSelected(row)
        formik.resetForm()
        axios.get(`${process.env.REACT_APP_ADMIN_URL}/AssetClass/${row?.id}`)
        .then((res) => {
            console.log(res.data.payload)
            let data = res.data.payload
            setShowEditModal(true)
            tog_backdrop()
            let editStatus = data.status == 'Inactive' ? false : true
            setStatus(editStatus)
            //formik.resetForm()
            // Object.keys(row).forEach(fieldName => {
            //     formik.setFieldValue(fieldName, data[fieldName]);
            // });
            formik.setFieldValue("depreciationTypeId", data.depreciationType?.id)
            formik.setFieldValue("yearOfAcquisitionId", data.yearOfAcquisition?.id)
            formik.setFieldValue("subsequentAcquisitionId", data.subsequentAcquisition?.id)
            formik.setFieldValue("name", data.name)
            formik.setFieldValue("month", data.month)
            formik.setFieldValue("rate", data.rate)
            formik.setFieldValue("writeOffLimitAmount", data.writeOffLimitAmount)
            formik.setFieldValue("code", data.code)
            formik.setFieldValue("minimumDepreciationValue", data.minimumDepreciationValue)
            formik.setFieldValue("accumulatedDepreciationPostingMethod", data.accumulatedDepreciationPostingMethod)
            
            //formik.initialValues["key"] 
            // let newObj = { id: Math.ceil(Math.random() * 1000000), assetClassId: 0, accountId: 0, accountDeterminationTypeId:0  }
            // let data = [...formRows, newObj];

            let mappedAccountDetermination = data?.assetClassAccounting.map((value) => {
                return {
                    id: value?.id,
                    assetClassId: value?.assetClassId,
                    accountDeterminationTypeId: value?.accountDeterminationTypeId
                }
            })
            // data[index]['accountId'] = e.value;
            // data[index]['accountDeterminationTypeId'] = e.value;
           
            setFormRows(mappedAccountDetermination);
            
           
        })
        .finally(() => {
            setShowLoading(false)
           
        })
       
    }


    const handleFormChange = (e, index) => {

        let newObj = { id: Math.ceil(Math.random() * 1000000), assetClassId: 0, accountId: 0, accountDeterminationTypeId:0  }
        let data = [...formRows, newObj];

    
            data[index]['accountId'] = e.value;
            data[index]['accountDeterminationTypeId'] = e.value;
           
            setFormRows((prev) => data);
      
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        //noOfDays: Yup.string().required('No of days is required'),
    });

    const initialValues = {
        name: '', rate:0, month:0, writeOffLimitAmount:0,
        depreciationTypeId: 0,
        depreciationOptionId: 0,
        depreciationOptionValue: 0,
        subsequentAcquisitionId: 0,
        yearOfAcquisitionId: 0,
        minimumDepreciationValue: 0,
        code: '',
        pauseDepreciation: '',
        accumulatedDepreciationPostingMethod: '',
    };


    const resetForm = () => {
        formik.setFieldValue('name', '')
        formik.setFieldValue('code', '')
        formik.setFieldValue('rate', 0)
        formik.setFieldValue('month', '')
        formik.setFieldValue('writeOffLimitAmount', 0)
        formik.setFieldValue('depreciationTypeId', 0)
        formik.setFieldValue('subsequentAcquisitionId', 0)
        formik.setFieldValue('yearOfAcquisitionId', 0)
        formik.setFieldValue('minimumDepreciationValue', 0)
        formik.setFieldValue("accumulatedDepreciationPostingMethod", 0)
        // setSelectedOptions([])
        // setSelectedGrouping(0)

    }


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            //console.log(values)
            if (showEditModal) {
                updateMutate({ 
                    ...values, 
                    status: status == true ? 'Active' : 'Inactive',
                    assetClassAccountings: formRows
                 })
            } else {
                //console.log("Add Mode:", {...values, status:status == true ? 'Active' : 'Inactive'})
                mutate({
                    ...values,
                    status: status == true ? 'Active' : 'Inactive',
                    assetClassAccountings: formRows
                    // assetClassAccountings: [
                    //     {
                    //         "id": 0,
                    //         "assetClassId": 0,
                    //         "accountId": 23,
                    //         "accountDeterminationTypeId": 20
                    //     }
                    // ]
                })

            }


        },
    });

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
    document.title = "Biz-360 ERP | Asset Class";

    const [disabled, setDisabled] = useState(true)

    if (isListLoading) {
        return <LoadingSpinner />
    }
    
    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Asset Class" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={assetClassList}
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
                    size="lg"
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Asset Class</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel"> Edit Asset Class</h5>)}

                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    resetForm();
                                    setShowEditModal(false)
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body">

                            <div className="row mb-2">
                                <div className="col">
                                    <div className={` ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
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
                                    <div className={`mb-2 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
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


                            <div className="row mb-3">
                                <div className="col">
                                    <div >
                                        <label className="form-label">Depreciation Type <i
                                            className="text-danger">*</i></label>
                                        <select className="form-select-sm form-select" name="depreciationTypeId" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.depreciationTypeId} >
                                            <option value={0}>Select Type</option>
                                            {depreciationTypes?.map((item) => {
                                                return <option key={item.id} value={item.id}>{item.name}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>

                                          
                                {/* Reducing Balance = Rate, Write off Limit (amount) */}
                                 {(formik.values.depreciationTypeId == 2 || formik.values.depreciationTypeId == 3) && 
                                 <div className="col">
                                  
                                        <label className="form-label">Rate </label>
                                        <input type="text" className="form-control-sm form-control"
                                            autoComplete="off" placeholder="Enter rate"
                                            name="rate"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.rate} />

                                 
                                </div>}

                                {formik.values.depreciationTypeId == 2 && <div className="col">
                        
                                        <label className="form-label">Useful Life (Months)</label>
                                        <input type="text" className="form-control-sm form-control"
                                            autoComplete="off" placeholder="Enter month"
                                            name="month"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.month} />
                                       
                              
                                </div>}

                                {formik.values.depreciationTypeId == 3 && <div className="col">
                                   
                                        <label className="form-label">Write off Limit (Amount)</label>
                                        <input type="text" className="form-control-sm form-control"
                                            autoComplete="off" placeholder="Enter amount"
                                            name="writeOffLimitAmount"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.writeOffLimitAmount} />

                                    
                                </div>}

                            </div>

                            <div className="row mb-3" >
                                <div className="col">
                                    <label className="form-label">Year of Acquistion <i
                                        className="text-danger">*</i></label>
                                    <select className="form-select-sm form-select" name="yearOfAcquisitionId" onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.yearOfAcquisitionId} >
                                        <option value={0}>Select Acquistion Year</option>
                                        <option value={1}>Pro Rata</option>
                                        <option value={2}>Half Year</option>
                                        <option value={3}>Full Year</option>
                                    </select>
                                </div>

                                <div className="col">
                                    <label className="form-label">Subsequent Acquistion <i
                                        className="text-danger">*</i></label>
                                    <select className="form-select-sm form-select" name="subsequentAcquisitionId" onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.subsequentAcquisitionId} >
                                        <option value={0}>Select Subsequent Acquistion </option>
                                        <option value={1}>Pro Rata</option>
                                        <option value={2}>Half Year</option>
                                        <option value={3}>Full Year</option>
                                    </select>
                                </div>

                                <div className="col">
                                    <label className="form-label">Minimum Depreciation Value</label>
                                    <input type="text" className="form-control-sm form-control"
                                                autoComplete="off" placeholder="Enter name"
                                                name="minimumDepreciationValue"
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.minimumDepreciationValue} />
                                </div>
                            </div>

                            <div className="row mb-3" >
                                <div className="col-5">
                                    <label className="form-label">Accumulated Depreciation Posting Method <i
                                        className="text-danger">*</i></label>
                                    <select className="form-select-sm form-select" name="accumulatedDepreciationPostingMethod" onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.accumulatedDepreciationPostingMethod} >
                                        <option value={''}>Select Method</option>
                                        <option value={'Direct'}>Direct</option>
                                        <option value={'Indirect'}>Indirect</option>
                                    </select>
                                </div>
                            </div>


                            {/* Tabbed Pane */}
                            <div className="row">
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('Account Determination')}>
                                            <a className={activeTab == 'Account Determination' ? `nav-link active` : `nav-link`} href="javascript:void(0);">Account Determination</a>
                                        </li>

                                        {/* <li className="nav-item" onClick={() => setActiveTab('Accounting')}>
                                            <a className={activeTab == 'Accounting' ? `nav-link active` : `nav-link`} href="javascript:void(0);">Accounting</a>
                                        </li> */}
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent" >

                                        <div className="tab-pane fade show active" id="financial-tab-pane" role="tabpanel"
                                            aria-labelledby="Account-Determination-tab" tabIndex="0" >
                                            <div className="table-responsive" style={{height:250}}>
                                                <Table className="table-sm mb-0" >
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Description</th>
                                                            <th>Account</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                                {/* {(formRows || []).map((formRow, key) => ( */}
                                                                {(accountTypesOptions || []).map((formRow, key) => (
                                                                    <tr key={key}>
                                                                        <td>{key + 1}</td>
                                                                        <td >
                                                                            {/* <label htmlFor="name">Account Type</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleFormChange(e, key)}
                                                                                name="accountDeterminationType"
                                                                                options={accountTypesOptions}
                                                                                value={formRow}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                        <td>
                                                                            {/* <label htmlFor="name">Account Name</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleFormChange(e, key)}
                                                                                name="accountType"
                                                                                options={accountsOptions}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                resetForm();
                                setShowEditModal(false)
                            }}>Close</button>
                             {!showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>}
                             {showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>}
                        </div>
                    </form>

                </Modal>
                <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete}/>


            </div>
        </>




    );
}
AssetClass.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default AssetClass;