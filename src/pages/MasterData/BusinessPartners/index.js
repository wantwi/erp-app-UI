// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, Form, InputGroup } from "reactstrap";
import { convertDateUSA, moneyInTxt, showToast } from "helpers/utility";

import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { usePost } from "hook/usePost";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import Select from "react-select";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import useCustomAxios from "hook/useCustomAxios";
import CurrencyInput from "react-currency-input-field";


function BusinessPartners() {

    const StatusTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 1 || value == 'Active' ?
                    <span key={idx} className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

                }
            </>
        );
    };

    const TypeTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 0  ? <span key={idx}>Customer</span> :
                 value === 1  ? <span key={idx}>Vendor</span> : <span key={idx}>Lead</span>

                }
            </>
        );
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Code',
                accessor: 'code'
            },
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Type',
                accessor: 'partnerType',
                Cell: ({ cell: { value } }) => <TypeTemplate value={value} />
            },
            {
                Header: 'Currency',
                accessor: 'preferredCurrencies',
               // Cell: ({ cell: { value } }) => <TypeTemplate value={value} />
            },
            {
                Header: 'Group',
                accessor: 'grouping.name',
            },
            {
                Header: 'Balance',
                accessor: 'balance',
                Cell: ({ cell: { value } }) => {return <span>{moneyInTxt(value)}</span>}
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
    const [activeTab, setActiveTab] = useState('Financial')
    const [formFields, setFormFields] = useState([
        { id: Math.ceil(Math.random() * 1000000), firstName: "", lastName: "", email: "", phoneNumber: "", position: '', defaultContact: "" }
    ]);
    const [accountsOptions, setAccountsOptions] = useState([])
    const [accountTypesOptions, setAccountTypesOptions] = useState([])
    const [formRows, setFormRows] = useState([]);

    const [showAlert, setshowAlert] = useState(false)
    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)

    const [businessPartners, setBusinessPartners] = useState([])
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [currencies, setCurrencies] = useState([])
    const [paymentTerms, setPaymentTerms] = useState([])
    const [disabled, setDisabled] = useState(true)
    const [territoriesOptions, setTerritoriesOptions] = useState([])
    const [countryOptions, setCountryOptions] = useState([])
    const [territory, setTerritory] = useState({label:'', value: 0})
    const [country, setCountry] = useState({label:'', value: ''})
    const [businessGroupOptions, setbusinessGroupOptions] = useState([])
    const [businessGroupOptionsCopy, setbusinessGroupOptionsCopy] = useState([])
    const [grouping, setGroouping] = useState(null)
    const [partnerType, setPartnerType] = useState('')
    const [regions, setRegions] = useState({label:'', value: ''})
    const [regionsOptions, setRegionsOptions] = useState([])
    const [countriesList, setCountriesList] = useState([])

    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const ongetsuccess = (data) => {
         let mappedData = data.map((item) => {
            return {
                ...item,
                preferredCurrencies: item.preferredCurrencies != null ? item?.preferredCurrencies.map((item) => item.name).join(',') : []
            }
         })
         setBusinessPartners(mappedData)
    }



    const onGetCurrenciesSuccess = (data) => {
        setCurrencies(data)
    }

    const onError = (error) => {
        showToast("error", "Could not save Business Partner")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        console.log(error)
        showToast("error", "Could not get Business Partners")
        setShowLoading(false)
        setBusinessPartners([])
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

    const onTerritoriesGet = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setTerritoriesOptions(mappedData)
    }

    const onCountriesGet = (data) => {
        setCountriesList(data)
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setCountryOptions(mappedData)
    }

    const onBusinessGroupGet = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id, bpType: item.bpType }
        })
        setbusinessGroupOptions(mappedData)
        setbusinessGroupOptionsCopy(mappedData)
    }

    const onGetPaymentTermsSuccess = (data) => {
        setPaymentTerms(data)
    }




    const { isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners?PartnerType=${partnerType}`, "BusinessPartners", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners`, "BusinessPartners", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners/${selected?.id}`, "BusinessPartners", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners/${selected?.id}`, "BusinessPartners", onUpdateSuccess, onUpdateError)

    const { data, isLoading: isCurrencyLoading } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, "currencies", onGetCurrenciesSuccess)
    const { data: accounts } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllControlAccountsOnly?accountType=all`, "accounts", onAccountsGetSuccess)
    const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/businessPartner`, "AccountTypes", onAccountTypesGetSuccess)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Territories`, "Territories", onTerritoriesGet)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Countries`, "Countries", onCountriesGet)
    const { isLoading: isGroupsLoading} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Groups/BusinessGroup`, "BusinessGroup", onBusinessGroupGet)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/PaymentTerms`, "Payment Terms", onGetPaymentTermsSuccess)

    const handleChangePartnerType = (e) => {
        setPartnerType(e.target.value)
    }

    useEffect(() => {
        refetch()
    }, [partnerType])

    const axios = useCustomAxios()
   

    useEffect(() => {
        let selectedCountry  = countriesList.find((ct) => ct.id == country.value)
        //console.log('country changed', selectedCountry, countriesList)
        let mappedRegions = selectedCountry?.regions?.map((region) => {
            return {
                id: region.id,
                value: region.id,
                label: region.name
            }
        })
        setRegionsOptions(mappedRegions)
           
        
    }, [country])


    const handleDelete = (row) => {

        deleteMutate(row.id)
        setshowAlert(false)

    }

    const handleEdit = (row) => {
        console.log(row)
        setSelected(row)
        let editStatus = row.status == 0 ? false : true
        setStatus(editStatus)
        
        let contactRow =  { id: Math.ceil(Math.random() * 1000000), firstName: "", lastName: "", email: "", phoneNumber: "", position: '', defaultContact: "" }
        setFormFields([...row?.contactPerson, contactRow])
        //formik.initialValues["key"] 
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
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
        partnerType: Yup.string().required('Partner type is required'),
    });

    const [status, setStatus] = useState(true)
    const [selectedCurrency, setselectedCurrency] = useState(0)
    const [selectedPaymentTerm, setselectedPaymentTerm] = useState(0)

    const initialValues = {
        code: "",
        name: "",
        email: "",
        phoneNumber: "",
        physicalAddress: "",
        postalAddress: "",
        controlAccount: 0,
        creditLimit: 0,
        paymentTermId: 0,
        balance: 0,
        partnerType: 0,
        status: status == true ? '1' : '0',
       
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here


            if(formFields[0].firstName == ''){
                showToast('warning', 'Please make sure at least one contact has been added to the list')
            }

            else{
                let payload = {
                    ...values,
                    status: status == true ? '1' : '0',
                    territoryId: territory.value,
                    country: {
                        "id": country.value || 0
                    },
                    region: {
                        "id": regions.value || 0
                    },
                    preferredCurrency: {
                        "currencyId": selectedCurrency
                    },
                    grouping: {
                        "id": grouping.value
                    },
                    contactPerson: formFields,
                    businessPartnerAccountings: formRows.map((item) => {
                        return {
                            accountType: {
                                id: item?.accountType?.value
                              },
                              account: {
                                id: item?.account?.value
                            },
                        }
                    }),
                   
                }
                if (showEditModal) {
    
                    delete payload.preferredCurrency
                    updateMutate(payload)
                } else {
                    mutate(payload)
                    //console.log(formFields)
                    console.log("Add Mode:", payload)
                }
            }

            


        },
    });


    useEffect(() => {
        
        if(formik.values.partnerType == 0){
            let filtered = businessGroupOptionsCopy.filter((item) => item.bpType.toLowerCase() == 'customer')
            setbusinessGroupOptions(filtered)
        }
        else if(formik.values.partnerType == 1){
            let filtered = businessGroupOptionsCopy.filter((item) => item.bpType.toLowerCase() == 'vendor')
            setbusinessGroupOptions(filtered)
        }
        else if(formik.values.partnerType == 2){
            let filtered = businessGroupOptionsCopy.filter((item) => item.bpType.toLowerCase() == 'lead')
            setbusinessGroupOptions(filtered)
        }
        else{
            setbusinessGroupOptions(businessGroupOptions)
        }
       
    }, [formik.values.partnerType])

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Business Partner Successfully Created", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])

    const addFields = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), firstName: "", lastName: "", email: "", phoneNumber: "", position: '', defaultContact: "" }
        setFormFields([...formFields, newOBJ]);
    };

    const removeFields = (item) => {
        if(formFields.length == 1){
            showToast('warning', 'You must have at least one contact on the list')
        }
        else{
            let data = formFields.filter((x) => x.id != item.id)
            console.log(data)
            //let data = [...formFields];
            // data.splice(index, 1);
            setFormFields(data);
        }
        
    };

    const handleFormChange = (e, index) => {
        let data = [...formFields];
        if(e.target.name == 'defaultContact'){

            //map all default values to no, and then change one to yes
            data = data.map((item) => {
                return {
                    ...item, 
                    defaultContact: 'no'
                }
            })
           
            data[index]['defaultContact'] = e.target.checked == true ? 'yes' : 'no';
        }
        else{
            data[index][e.target.name] = e.target.value;
        }
        

        setFormFields((prev) => data);
    };

    const handleAccountFormChange = (e, index) => {

        //console.log(e, index)
        let newObj = { id: Math.ceil(Math.random() * 1000000), accountType: accountTypesOptions[index],  account: e }
        let data = [...formRows, newObj];
        console.log(data)
     
        setFormRows(data)
    };


 


    if (isListLoading || showLoading) {
        return <LoadingSpinner />
    }
    //meta title
    document.title = "Biz-360 ERP | Business Partners";


    return (
        <>

            {showLoading ? <LoadingSpinner /> : null}
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Master Data" breadcrumbItem="Business Partners" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={businessPartners}
                                isGlobalFilter={true}
                                isAddOptions={true}
                                customPageSize={10}
                                setmodal_backdrop={setmodal_backdrop}
                                setShowEditModal={setShowEditModal}
                                handleChangePartnerType={handleChangePartnerType}
                                className="table-sm"
                            />
                        </CardBody>

                    </Card>

                </div>



                {/*Add Modal */}
                <Modal
                    isOpen={modal_backdrop}
                    toggle={() => {
                        tog_backdrop();
                    }}
                    backdrop={'static'}
                    id="staticBackdrop"
                    size={activeTab == "Contact Persons" ? 'xl' : 'xl'}
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Business Partner</h5>) : (<h5 className="modal-title" id="staticBackdropLabel">Edit Business Partner</h5>)}

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

                            <div className="row mb-3">
                                <div className="col">
                                  
                                        <label className="form-label">Code <i
                                            className="text-danger">*</i></label>
                                        <InputGroup>
                                            <div className="input-group-text " style={{ cursor: 'pointer', height:27 }} onClick={() => setDisabled(!disabled)}> {disabled ? 'Custom' : 'Generate'}</div>
                                            <input type="text" className="form-control form-control-sm" name="code" placeholder="Enter code" disabled={disabled}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.code} />
                                        </InputGroup>
                                </div>

                                <div className="col">
                                    <div className={` ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                        <label className="form-label">Name <i
                                            className="text-danger">*</i></label>
                                        <input type="text" className="form-control-sm form-control" autoComplete="off" placeholder="Enter Business Partner Name"
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>

                                <div className="col">
                                  
                                        <label className="form-label">Email </label>
                                        <input type="text" className="form-control-sm form-control" name="email"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.email}
                                            autoComplete="off" placeholder="someemail@email.com" />
                                   
                                </div>

                                <div className="col">
                                  
                                        <label className="form-label">Phone Number </label>
                                        <input type="text" className="form-control-sm form-control" name="phoneNumber"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.phoneNumber}
                                            autoComplete="off" placeholder="xxx-xxxx-xxx" />
                                   
                                </div>

                            </div>

                            <div className="row mb-3">

                                <div className="col">
                                   
                                        <label className="form-label">Address </label>
                                        <input type="text" className="form-control-sm form-control" name="postalAddress"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.postalAddress}
                                            autoComplete="off" placeholder="Enter Address" />
                                  
                                </div>

                                <div className="col">
                                    
                                        <label className="form-label">Territory</label>
                                        <Select
                                            name="territoryId"
                                            onChange={(e) => setTerritory(e)}
                                            options={territoriesOptions}
                                            value={territory}
                                            className="select2-selection row1" />
                                      
                                    
                                </div>

                                <div className="col">
                                    
                                    <label className="form-label">Country</label>
                                    <Select
                                        name="territoryId"
                                        onChange={(e) => setCountry(e)}
                                        options={countryOptions}
                                        value={country}
                                        className="select2-selection row1" />
                                </div>

                                <div className="col">
                                    
                                    <label className="form-label">Region</label>
                                    <Select
                                        name="territoryId"
                                        onChange={(e) => setRegions(e)}
                                        options={regionsOptions}
                                        value={regions}
                                        className="select2-selection row1" />
                                </div>

                            </div>


                            <div className="row mb-3">

                                <div className="col-3">
                                   
                                   <label className="form-label">Type <i
                                       className="text-danger">*</i></label>
                                   <select className="form-select-sm form-select" name="partnerType"
                                       onBlur={formik.handleBlur}
                                       onChange={formik.handleChange}
                                       value={formik.values.partnerType}>
                                       <option value={''}>Select Type</option>
                                       <option value={0}>Customer</option>
                                       <option value={1}>Vendor</option>
                                       <option value={2}>Lead</option>
                                   </select>
                                   {formik.touched.partnerType && formik.errors.partnerType && <div className="text-danger">{formik.errors.partnerType}</div>}

                                </div>

                                <div className="col-3">
                                    
                                    <label className="form-label">Grouping <i
                                        className="text-danger">*</i></label>
                                    <Select
                                        onChange={(e) => {setGroouping(e)}}
                                        name="grouping"
                                        options={businessGroupOptions}
                                        className="select2-selection row1" />

                                    {(grouping?.value == '' || grouping == null) ? <div className="text-danger">Group is required</div> : null}
                            </div>

                        </div>


                            <div className="row mb-0">

                                <div className="col-4">
                                   
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





                            {/* Tabbed Pane */}
                            <div className="row">
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('Financial')}>
                                            <a className={activeTab == 'Financial' ? `nav-link active` : `nav-link`} href="#">Financial</a>
                                        </li>
                                      
                                        <li className="nav-item" onClick={() => setActiveTab('Accounting')}>
                                            <a className={activeTab == 'Accounting' ? `nav-link active` : `nav-link`} href="#">Accounting</a>
                                        </li>
                                        <li className="nav-item" onClick={() => setActiveTab('Contact Persons')}>
                                            <a className={activeTab == 'Contact Persons' ? `nav-link active` : `nav-link`} href="#">Contact Persons</a>
                                        </li>
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {
                                            activeTab == 'Financial' && (<>
                                                <div className="row mb-3">
                                                    <div className="col">
                                                       
                                                            <label className="form-label">Control Account </label>
                                                            <select className="form-select form-select-sm" name="controlAccount" onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.controlAccount}>
                                                                <option>Select account</option>
                                                                {accounts?.map((account) =>
                                                                    (<option key={account.id} value={account.id}>{account.code}-{account.name}</option>))
                                                                }
                                                            </select>

                                                       
                                                    </div>
                                                    <div className="col">
                                                       
                                                            <label className="form-label">Credit Limit </label>
                                                            <CurrencyInput
                                                                id="creditLimit"
                                                                name="creditLimit"
                                                                className={`form-control form-control-sm text-r`}
                                                                placeholder="0.00"
                                                                defaultValue={formik.values.creditLimit}
                                                                decimalsLimit={2}
                                                                onBlur={formik.handleBlur}
                                                                onValueChange={(value, name) => formik.setFieldValue(name, value)}
                                                                />
                                                            {/* <input type="text" className="form-control-sm form-control" name="creditLimit"
                                                                //onBlur={formik.handleBlur}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.creditLimit}
                                                                onBlur={(e) => {
                                                                    console.log('Values', e.target.value)
                                                                    const x = e.target.value;
                                                                    formik.setFieldValue("creditLimit", Number(x).toFixed(2));
                                                                }}
                                                                autoComplete="off" placeholder="Credit Limit" /> */}
                                                        
                                                    </div>

                                                    <div className="col">
                                                       
                                                            <label className="form-label">Payment Terms </label>
                                                            <select className="form-select-sm form-select" name="paymentTermId"
                                                                onBlur={formik.handleBlur}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.paymentTermId}>
                                                                <option>Select Payment Term</option>
                                                                {paymentTerms?.map((item, idx) => {
                                                                    return (<option key={idx} value={item.id}>{item.name}</option>)
                                                                })}
                                                            </select>
                                                            {/* <input type="text" className="form-control form-control" name="paymentTermId"
                                                                onBlur={formik.handleBlur}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.paymentTermId}
                                                                autoComplete="off" placeholder="Payment Terms" /> */}
                                                        
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-4">
                                                       
                                                            <label className="form-label">Balance </label>
                                                            <CurrencyInput
                                                                id="balance"
                                                                name="balance"
                                                                className={`form-control form-control-sm text-r`}
                                                                placeholder="0.00"
                                                                defaultValue={formik.values.balance}
                                                                decimalsLimit={2}
                                                                onBlur={formik.handleBlur}
                                                                onValueChange={(value, name) => formik.setFieldValue(name, value)}
                                                                />
                                                            {/* <input type="text" className="form-control-sm form-control" name="balance"
                                                                onBlur={formik.handleBlur}
                                                                onChange={formik.handleChange}
                                                                value={formik.values.balance}
                                                                autoComplete="off" placeholder="Balance" /> */}
                                                       
                                                    </div>

                                                    <div className="col-4">
                                                      
                                                            <label className="form-label">Currencies  <i className="text-danger">*</i></label>
                                                            <select className="form-select-sm form-select" name="currencyId"

                                                                onChange={(e) => setselectedCurrency(e.target.value)}
                                                                value={selectedCurrency}>
                                                                <option>Select Currency</option>
                                                                <option value={0}>All</option>
                                                                {currencies?.map((item, idx) => {
                                                                    return (<option key={idx} value={item.id}>{item.code}</option>)
                                                                })}
                                                            </select>
                                                        
                                                    </div>
                                                </div>
                                            </>
                                            )
                                        }
                                        {activeTab == 'Contact Persons' && (
                                            <div className="tab-pane fade show active " id="general-tab-pane" role="tabpanel" aria-labelledby="general-tab" tabIndex="0">
                                                {/* Tab 1 */}

                                                {/* <div style={{ textAlign: 'right', marginBottom:5 }} >
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addFields}><i className="mdi mdi-plus me-1" /> Add Contact Person</button>
                                                </div> */}

                                                            <Table className="table-sm mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>First Name</th>
                                                                    <th>Last Name</th>
                                                                    <th>Email</th>
                                                                    <th>Phone</th>
                                                                    <th>Position</th>
                                                                    <th>Default Contact</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>

                                                                {formFields.map((form, index) => {
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{index+1}</td>
                                                                            <td style={{width:'20%'}}><input type="text" className="form-control form-control-sm" autoComplete="off" name="firstName" value={form.firstName} onChange={(e) => handleFormChange(e, index)} /></td>
                                                                            <td style={{width:'15%'}}><input type="text" className="form-control form-control-sm" autoComplete="off" name="lastName" value={form.lastName} onChange={(e) => handleFormChange(e, index)} /></td>
                                                                            <td style={{width:'15%'}}><input type="text" className="form-control form-control-sm" autoComplete="off" name="email" value={form.email} onChange={(e) => handleFormChange(e, index)} /></td>
                                                                            <td style={{width:'15%'}}><input type="text" className="form-control form-control-sm" autoComplete="off" name="phoneNumber" value={form.phoneNumber} onChange={(e) => handleFormChange(e, index)} /></td>
                                                                            <td style={{width:'15%'}}><input type="text" className="form-control form-control-sm" autoComplete="off" name="position" value={form.position} onChange={(e) => handleFormChange(e, index)} /></td>
                                                                            <td style={{width:'10%', textAlign:'center'}}><input style={{marginTop:10}} type="radio" className="form-radio " name="defaultContact" value={form.defaultContact} onChange={(e) => handleFormChange(e, index)} /></td>
                                                                            <td style={{width:'5%', textAlign:'right'}}>
                                                                                <span title="Click to Add"  type="button" className="text-primary" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}} onClick={addFields}><i className="fa fa-plus"></i></span>        
                                                                                <span  title="Click to Remove"><i className="far  fas fa-trash-alt me-2" style={{ width: 10, marginLeft: 0, color:'red' }} onClick={() => removeFields(form)}/></span>
                                                                            </td>
                                                                        </tr>
                                                                       
                                                                    );
                                                                })}
                                                            </tbody>
                                                            </Table>

                                            </div>)
                                        }
                                        {activeTab == 'Accounting' &&
                                            (<div className="tab-pane fade show active" id="financial-tab-pane" role="tabpanel"
                                                aria-labelledby="financial-tab" tabIndex="0">
                                                <Form className="repeater" encType="multipart/form-data">
                                                    <div>

                                                        <Table className="table mb-2">

                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th style={{ width: '43%' }}>Account Type</th>
                                                                    <th style={{ width: '55%' }}>Account Code & Name</th>
                                                                    {/* <th></th> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {/* {(formRows || []).map((formRow, key) => ( */}
                                                                {(accountTypesOptions || [])?.map((formRow, key) => (
                                                                    <tr key={key}>
                                                                    <td>{key + 1}</td>
                                                                    <td >
                                                                        <Select
                                                                            //onChange={(e) => handleFormChange(e, key)}
                                                                            name="accountType"
                                                                            options={accountTypesOptions}
                                                                            value={formRow}
                                                                            isReadonly
                                                                            className="select2-selection row1" />

                                                                    </td>

                                                                    <td>
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
                                            </div>)
                                        }
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                formik.resetForm();
                            }}>Close</button>
                            {!showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2" onClick={() =>  console.log(formFields)}></i>Save</button>}
                            {showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>}
                        </div>
                    </form>
                </Modal>
                <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />


            </div>
        </>




    );
}
BusinessPartners.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BusinessPartners;