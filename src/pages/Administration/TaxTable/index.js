// src/components/filter.
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, InputGroup, } from "reactstrap";
import { commaRemover, convertDateUSA, moneyInTxt, showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useGet } from "hook/useGet";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import Select from "react-select";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import useCustomAxios from "hook/useCustomAxios";
import CurrencyInput from "react-currency-input-field";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from "react-icons/fa";


function TaxTable() {

    const StatusTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 1 || value == 'Active' ?
                    <span key={idx} className="badge rounded-pill bg-success">Active</span> :
                    value == 'Inactive' ? (<span className="badge rounded-pill bg-danger">Inactive</span>) :
                        <span className="badge rounded-pill bg-danger">Disabled</span>
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
                Header: 'Percentage/Amount',
                accessor: 'percentOrAmountTypeValue',
                Cell: ({ cell: { value } }) =>  <span>{moneyInTxt(value.toFixed(2))}</span> 
            },
            {
                Header: 'Type',
                accessor: 'taxType.name',
            },

            {
                Header: 'Base Effective Date',
                accessor: 'effectiveDate',
            },
            {
                Header: 'GL Account',
                accessor: 'glAccount.name',
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
    const [taxTables, setTaxTables] = useState([])
    const [showAlert, setshowAlert] = useState(false)
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [glAccountsOptions, setGLAccounts] = useState([])
    const [selectedGLaccount, setSelectedGLaccount] = useState(null)
    const [selectedTaxType, setSelectedTaxType] = useState(null)
    const [taxBands, setTaxBands] = useState([{ id: Math.ceil(Math.random() * 1000000), minimumAmount: "", maximumAmount: "", taxBandTypeId: "", taxBandValue: '' }])
    const [levies, setLevies] = useState([{ id: Math.ceil(Math.random() * 1000000), levyName: "",  levyTypeId: "", levyValue: '' }])
    const [deletedTaxBands, setDeletedTaxBands] = useState([])
    const [activeTab, setActiveTab] = useState('Tax Bands')
    const [taxBandTypesOptions, setTaxBandTypesOptions] = useState([])
    const [taxTypesOptions, setTaxTypesOptions] = useState([])
    const [amountObj, setAmountObj] = useState(null)
    const flatpickrRef = useRef(null);

    const [effectiveDate, setEffectiveDate] = useState(null)

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };



    const onsuccess = (data) => {
        refetch()
        //showToast("success", "Successfully saved")
    }

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return {
                ...item,
                effectiveDate: convertDateUSA(item?.effectiveDate)
            }
        })
        setTaxTables(mappedData)
    }

    const onError = (error) => {
        showToast("error", "Could not save tax table")
        setShowLoading(false)
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
        refetch()
    }

    const glaccountsongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id, }
        })
        setGLAccounts(mappedData)
    }

    const onTaxBandTypesGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setTaxBandTypesOptions(mappedData)
    }

    const onTaxTypesGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setTaxTypesOptions(mappedData)
    }


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/TaxTable/GetAll`, "TaxTable", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/TaxTable`, "TaxTable", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/TaxTable/DeleteAsync/${selected?.id}`, "TaxTable", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/TaxTable?id=${selected?.id}`, "TaxTable", onUpdateSuccess, onUpdateError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetActualAccounts`, "GL Accounts", glaccountsongetsuccess,)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AppCodes?type=TaxBandType`, "TaxBandTypes", onTaxBandTypesGetSuccess)
    const { isLoading: isTaxTypesLoading } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AppCodes?type=TaxType`, "TaxType", onTaxTypesGetSuccess)

    const handleDelete = (row) => {

        deleteMutate(row.id)
        setshowAlert(false)

    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {

        setShowLoading(true)
        setSelected(row)

        axios.get(`${process.env.REACT_APP_ADMIN_URL}/TaxTable/${row?.id}`)
        .then((res) => {
            console.log(res.data.payload, "RESPONSE")
            let data = res.data.payload
            setShowEditModal(true)
            tog_backdrop()
            let editStatus = data.status == 'Inactive' ? false : true
            setStatus(editStatus)

            
            //formik.initialValues["key"] 
            formik.setFieldValue("name", data?.name)
            //formik.initialValues["effectiveDate"] = new Date(data?.effectiveDate).toISOString().substring(0,10)
            setEffectiveDate(new Date(data?.effectiveDate).toISOString().substring(0,10))
            formik.setFieldValue("taxTypeId", data?.taxType?.id)
            formik.setFieldValue("glAccountId", data?.glAccountId?.id)
            formik.setFieldValue("percentOrAmountTypeValue", data?.percentOrAmountTypeValue)
            formik.setFieldValue("percentOrAmountTypeId", data?.percentOrAmountType?.id)
            
            // formik.setValues(initialValues)
        
            
            let editGlAccount = {id: data.glAccount?.id, label: data.glAccount?.name}
            setSelectedGLaccount(editGlAccount)
    
            let editTaxType  = {id: data.taxType?.id, label: data.taxType?.name}
            setSelectedTaxType(editTaxType)

            // let mappedTaxBands = data.taxBands.map((item) => {
            //     return {
            //         ...item,

            //     }
            // })

            let newOBJ = { id: Math.ceil(Math.random() * 1000000), minimumAmount: "", maximumAmount: "", taxBandTypeId: "", taxBandValue: '' }
            let newOBJ2 = { id: Math.ceil(Math.random() * 1000000), levyName: "",  levyTypeId: "", levyValue: '' }
           
            if(data?.taxBands.length < 1){
                setTaxBands([...data?.taxBands, newOBJ]);
                setLevies([...data?.taxBands, newOBJ2]);
            }
            else{
                setTaxBands([...data?.taxBands])
                setLevies([...data?.taxBands]);
            }
           
          
           
        })
        .finally(() => {
            setShowLoading(false)
           
        })
      
    }


    //taxBands
    const addBands = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), minimumAmount: "", maximumAmount: "", taxBandTypeId: "", taxBandValue: '' }
        setTaxBands([...taxBands, newOBJ]);
    };


      //levies
      const addLevies = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), levyName: "",  levyTypeId: "", levyValue: '' }
        setLevies([...levies, newOBJ]);
        console.log(levies)
    };

    const handleFormChange = (e, index) => {
        let data = [...taxBands];
        //let formattedValue = Number(e.target.value).toFixed(2)
        data[index][e.target.name] = e.target.value;
        setTaxBands(data);
    };

    const handleLevyFormChange = (e, index) => {
        let data = [...levies];
        //let formattedValue = Number(e.target.value).toFixed(2)
        data[index][e.target.name] = e.target.value;
        setLevies(data);
    };

    const handleBlur = (e, index) => {
        let data = [...taxBands];
        data[index][e.target.name] = Number(data[index][e.target.name]).toFixed(2)
        setTaxBands(data)
    }

    const handleSelectChange = (e, index) => {
        let data = [...taxBands];

        data[index]['label'] = e.label
        data[index]['value'] = e.value
        data[index]['taxBandTypeId'] = e.value;
        setTaxBands(data);
    };

    const handleLevySelectChange = (e, index) => {
        let data = [...levies];

        data[index]['label'] = e.label
        data[index]['value'] = e.value
        data[index]['levyTypeId'] = e.value;
        setLevies(data);
    };

    const removeFields = (item) => {
        if(taxBands.length == 1){
            showToast('warning', 'You must have at least one tax band')
        }
        else{
            let data = taxBands.filter((x) => x.id != item.id)
            // console.log(data)
            setTaxBands(data);
        }
        
    };

    const removeLevyFields = (item) => {
        if(levies.length == 1){
            showToast('warning', 'You must have at least one tax band')
        }
        else{
            let data = levies.filter((x) => x.id != item.id)
            // console.log(data)
            setLevies(data);
        }
        
    };

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
    });

    const initialValues = {
        name: "",
        status: "", 
        // effectiveDate: "",
        taxTypeId: "",
        percentOrAmountTypeId: 0,
        percentOrAmountTypeValue: 0,
        glAccountId: 0,
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            //console.log(values, 'V')
            // Handle form submission logic here
            let tax_bands = []
            if(taxBands.length > 0 && taxBands[0].minimumAmount != ''){
                tax_bands = taxBands.map((item) => {
                    return {
                        "taxBandTypeId": item.taxBandTypeId,
                        "id": item.id,
                        "minimumAmount": item.minimumAmount,
                        "maximumAmount": item.maximumAmount,
                        "taxBandValue": item.taxBandValue,
                        "name":"",
                        "accountId":0
                        
                    }
                })
            }
            else if(levies.length > 0 && levies[0].levyValue != ''){
                tax_bands = levies.map((item) => {
                    return {
                        "id": item.id,
                        "minimumAmount": 0,
                        "maximumAmount": 0,
                        "taxBandTypeId": item?.levyTypeId,
                        "taxBandValue": item?.levyValue,
                        "name":"",
                        "accountId":0
                    }
                })
            }
  
            let payload = {
                ...values,
                effectiveDate: effectiveDate,
                taxTypeId: formik.values.taxTypeId || selectedTaxType.value,
                glAccountId:  selectedGLaccount.value || 0, //formik.values.glAccountId,
                status: status == true ? 'Active' : 'Inactive',
                taxBands: tax_bands,
                deletedTaxBandsIds: deletedTaxBands
            }

            console.log(payload)
            if (showEditModal) {
                //delete payload.taxBands
                updateMutate(payload)
                resetForm()
            }
            else{
                mutate(payload)
            }
           
            setSelectedGLaccount(null)
            setSelectedTaxType(null)
          
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


    useEffect(() => {
        if(selectedTaxType?.label == "Value Added Tax (VAT)"){
            setActiveTab('Levies')
        }
        else if(selectedTaxType?.label == "Personal Income Tax (PIT)"){
            setActiveTab('Tax Bands')
        }
    }, [selectedTaxType])

    const resetForm = () => {
        //formik.setValues(initialValues)
        setEffectiveDate('')
        setTaxBands([{ id: Math.ceil(Math.random() * 1000000), minimumAmount: "", maximumAmount: "", taxBandTypeId: "", taxBandValue: '' }])
    }

    //meta title
    document.title = "Biz-360 ERP | Tax Table";


    if (isListLoading) {
        return <LoadingSpinner />
    }


    return (
        <>
            {showLoading ? <LoadingSpinner /> : null}

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Tax Setup/Table" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={taxTables}
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
                       
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel"> Add Tax Setup</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel"> Edit Tax Setup</h5>)}

                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    setShowEditModal(false)
                                    resetForm()
                                    setSelectedGLaccount(null)
                                    setSelectedTaxType(null)
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


                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.taxTypeId && formik.errors.taxTypeId ? 'has-error' : ''}`}>
                                        <label className="form-label">Tax Type <i
                                            className="text-danger">*</i></label> 
                                       <Select
                                            name="taxTypeId"
                                            onChange={(e) => {setSelectedTaxType(e)}}
                                            options={taxTypesOptions}
                                            value={selectedTaxType}
                                            className="select2-selection row1" />
                                            {(selectedTaxType == null || selectedTaxType == '') && <div className="text-danger">{formik.errors.taxTypeId}</div>}
                                     
                                    </div>
                                </div>


                            </div>

                            <div className="row">
                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.base && formik.errors.base ? 'has-error' : ''}`}>
                                        <label className="form-label">Effective Date </label>
                                        <InputGroup>
                                                    <Flatpickr
                                                        value={effectiveDate}
                                                        onChange={(e) => setEffectiveDate(e[0].toISOString())}
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
                                        {/* <input type="date" className="form-control-sm form-control" name="effectiveDate"
                                            autoComplete="off"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.effectiveDate} /> */}
                                        {/* {formik.touched.effectiveDate && formik.errors.effectiveDate && <div className="text-danger">{formik.errors.effectiveDate}</div>} */}
                                    </div>
                                </div>

                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.glAccountId && formik.errors.glAccountId ? 'has-error' : ''}`}>
                                        <label className="form-label">G/L Account </label>
                                        <Select
                                            name="glAccountId"
                                            onChange={(e) => setSelectedGLaccount(e)}
                                            options={glAccountsOptions}
                                            value={selectedGLaccount}
                                            className="select2-selection row1" />
                                        {/* <select
                                            name="glAccountId"
                                            className="form-select form-select-sm"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.glAccountId}
                                            >
                                            <option>Select G/L account</option>
                                            {glAccountsOptions.map((item) => {
                                                return <option key={item.id} value={item.value}>{item.label}</option>
                                            })}
                                        </select> */}
                                        {formik.touched.glAccountId && formik.errors.glAccountId && <div className="text-danger">{formik.errors.glAccountId}</div>}
                                    </div>
                                </div>


                            </div>

                           {selectedTaxType?.label == "Value Added Tax (VAT)" || selectedTaxType?.label == "Withholding Tax (WHT)" ? (<div className="row mb-3">
                                <div className="col-6">
                                     <label className="form-label"> Tax Band Type {formik.touched.type}</label>
                                     <select className="form-select-sm form-select" name="percentOrAmountTypeId"
                                            autoComplete="off"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.percentOrAmountTypeId}>
                                                <option>Select Tax Band Type</option>
                                                {taxBandTypesOptions.map((item) => {
                                                    return <option key={item.value} value={item.value}>{item.label}</option>
                                                })}

                                     </select>
                                        {formik.touched.percentOrAmountTypeId && formik.errors.percentOrAmountTypeId && <div className="text-danger">{formik.errors.percentOrAmountTypeId}</div>}
                                </div>
                                <div className="col-6">
                                     <label className="form-label">Value </label>
                                     <CurrencyInput  className={`form-control form-control-sm text-r`} 
                                     placeholder="0.00" 
                                     name="percentOrAmountTypeValue" 
                                     defaultValue={formik.values.percentOrAmountTypeValue} 
                                     //onValueChange={formik.handleChange} 
                                     onValueChange={(value, name) => formik.setFieldValue(name, value)} 
                                   
                                    />
                                     {formik.touched.percentOrAmountTypeValue && formik.errors.percentOrAmountTypeValue && <div className="text-danger">{formik.errors.percentOrAmountTypeValue}</div>}
                                </div>
                            </div>) : null }



                            <div className="row">

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
                                       {selectedTaxType?.label == "Personal Income Tax (PIT)" ? (<li className="nav-item" onClick={() => setActiveTab('Tax Bands')}>
                                            <a className={activeTab == 'Tax Bands' ? `nav-link active` : `nav-link`} href="#">Tax Bands</a>
                                        </li>): null}
                                        {selectedTaxType?.label == "Value Added Tax (VAT)" ? (<li className="nav-item" onClick={() => setActiveTab('Levies')}>
                                            <a className={activeTab == 'Levies' ? `nav-link active` : `nav-link`} href="#">Levies</a>
                                        </li>) : null}
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {activeTab == 'Tax Bands' && selectedTaxType?.label == "Personal Income Tax (PIT)"  ? (
                                            <div className="tab-pane fade show active " role="tabpanel" aria-labelledby="taxBands-tab" tabIndex="0">
                                                {/* Tab 1 */}

                                                {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addBands}><i className="mdi mdi-plus me-1" /> Add Tax Band</button>
                                                </div> */}
                                                <table className="table table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Minimum Amount</th>
                                                            <th>Maximum Amount</th>
                                                            <th>Type</th>
                                                            <th>Value</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {taxBands.map((formRow, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td style={{width:'22%'}}><input type="number" className="form-control form-control-sm" autoComplete="off" name="minimumAmount" value={formRow.minimumAmount} onChange={(e) => handleFormChange(e, index)} onBlur={(e) => handleBlur(e,index)}/></td>
                                                                    <td style={{width:'22%'}}><input type="number" className="form-control form-control-sm" autoComplete="off" name="maximumAmount" value={formRow.maximumAmount} onChange={(e) => handleFormChange(e, index)} onBlur={(e) => handleBlur(e,index)}/></td>
                                                                    <td style={{width:'25%'}}>
                                                                        <Select
                                                                            onChange={(e) => handleSelectChange(e, index)}
                                                                            name="taxBandTypeId"
                                                                            options={taxBandTypesOptions}
                                                                            value={formRow}
                                                                            className="select2-selection row1" />
                                                                    </td>
                                                                    <td style={{width:'22%'}}><input type="number" className="form-control form-control-sm" autoComplete="off" name="taxBandValue" value={formRow.taxBandValue} onChange={(e) => handleFormChange(e, index)} onBlur={(e) => handleBlur(e,index)}/></td>
                                                                    <td style={{width:'8%', textAlign:'right'}}>
                                                                                <span title="Click to Add"  type="button" className="text-primary" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}}  onClick={addBands}><i className="fa fa-plus"></i></span>        
                                                                                <span  title="Click to Remove" onClick={() => removeFields(formRow)}><i className="far  fas fa-trash-alt me-2" style={{ width: 10, marginLeft: 0, color:'red' }} /></span>
                                                                    </td>
                                                                  
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>

                                            </div>) : 
                                        activeTab == 'Levies' && selectedTaxType?.label == "Value Added Tax (VAT)" ? (
                                                <div className="tab-pane fade show active " role="tabpanel" aria-labelledby="taxBands-tab" tabIndex="0">
                                                    {/* Tab 1 */}
    
                                                    {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                        <button type="button" className="btn btn-sm btn-primary" onClick={addLevies}><i className="mdi mdi-plus me-1" /> Add Levy</button>
                                                    </div> */}
                                                    <table className="table table-sm mb-0">
                                                        <thead>
                                                            <tr>
                                                                
                                                                <th>Name</th>
                                                                <th>Type</th>
                                                                <th>Value</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {levies.map((formRow, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                       
                                                                        <td style={{width:'25%'}}><input type="text" className="form-control form-control-sm" autoComplete="off" name="levyName" value={formRow.levyName} onChange={(e) => handleLevyFormChange(e, index)} /></td>
                                                                        <td style={{width:'25%'}}>
                                                                            <Select
                                                                                onChange={(e) => handleLevySelectChange(e, index)}
                                                                                name="levyTypeId"
                                                                                options={taxBandTypesOptions}
                                                                                value={formRow}
                                                                                className="select2-selection row1" />
                                                                        </td>
                                                                        <td style={{width:'20%'}}>
                                                                            <CurrencyInput  className={`form-control form-control-sm text-r`} placeholder="0.00" name="levyValue" defaultValue={formRow.levyValue} decimalsLimit={2} onValueChange={(value, name) => setAmountObj(name, value)} onChange={(e) => handleLevyFormChange(e, index)}/>
                                                                            {/* <input type="number" className="form-control form-control-sm" autoComplete="off" name="levyValue" value={formRow.levyValue} onChange={(e) => handleLevyFormChange(e, index)} /> */}
                                                                        </td>
                                                                        <td style={{width:'5%', textAlign:'right'}}>
                                                                                <span title="Click to Add"  type="button" className="text-primary" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}} onClick={addLevies}><i className="fa fa-plus"></i></span>        
                                                                                <span  title="Click to Remove" onClick={() => removeLevyFields(formRow)}><i className="far  fas fa-trash-alt me-2" style={{ width: 10, marginLeft: 0, color:'red' }} /></span>
                                                                        </td>
                                                                       
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
    
                                                </div>):null
                                                
                                        }
                                    </div>
                                </div>
                            </div>


                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                resetForm()
                                setShowEditModal(false)
                                setSelectedGLaccount(null)
                                setSelectedTaxType(null)
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
TaxTable.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default TaxTable;