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
            {value === 1 || value == 'Active' || value == 'Opened' ?
                <span key={idx} className="badge rounded-pill bg-success">{value}</span> : <span className="badge rounded-pill bg-danger">{value}</span>

            }
        </>
    );
};

function Bid() {
    const columns = useMemo(
        () => [
            {
                Header: 'Quotation Date',
                accessor: 'quotationDate',
            },
            {
                Header: 'Vendor',
                accessor: 'vendor',
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
                quotationDate: convertDateUSA(item?.transactionDate),
                vendor: item?.businessPartner?.name,
            }
        })
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
            return { label: `${item.name}`, value: item?.id, code: item.code, name: 'unitOfMeasure' }
        })
        setunitsOfMeasureDropDown(mappedData)
    }

    const oncurrenciesgetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.code} - ${item.name}`, value: item.id, isHome: item.isHome }
        })
        setCurrencyOptions(mappedData)
    }

    const onitemsgetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item?.id, name: 'item' }
        })
        setItemsOptions(mappedData)
    }

    const onBusinessPartnersGet = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setbpDropdown(mappedData)

    }

    const onTaxTablesGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id, taxType: item.taxType?.id }
        })
        let vat = mappedData.filter((value) => value.taxType == 12).map((value) => {
            return {
                ...value,
                name: 'VAT'
            }
        })
        let wht = mappedData.filter((value) => value.taxType == 11).map((value) => {
            return {
                ...value,
                name: 'WHT'
            }
        })
        setTaxTablesOptionsVAT(vat)
        setTaxTablesOptionsWHT(wht)
    }


    const onUserRequestGet = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.requestNumber}`, value: item.id }
        })
        setUserRequests(mappedData)

    }

    

    const [bpDropdown, setbpDropdown] = useState([])
    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [currencyOptions, setCurrencyOptions] = useState([])
    const [selectedCurrency, setSelectedCurrency] = useState(null)
    const [itemsDropDown, setItemsOptions] = useState([])
    const [unitsOfMeasureDropDown, setunitsOfMeasureDropDown] = useState([])
    const [selectedVendor, setselectedVendor] = useState(null)
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [itemsList, setItemsList] = useState([{ id: Math.ceil(Math.random() * 1000000), item: { label: 'Select', value: 0 }, quantity: "", quotedQuantity:'', price:'', description: "", unitOfMeasure: { label: 'Select', value: 0 }, WHT: { label: 'Select', value: 0 }, VAT: { label: 'Select', value: 0 } }])
    const flatpickrRef = useRef(null);
    const flatpickrRef2 = useRef(null);
    const [quotationDate, setQuotationDate] = useState(null)
    const [proposedDeliveryDate, setProposedDeliveryDate] = useState(null)
    const [taxTablesVAT, setTaxTablesOptionsVAT] = useState([])
    const [taxTablesWHT, setTaxTablesOptionsWHT] = useState([])
    const [userRequests, setUserRequests] = useState([])
    const [selectedUserRequest, setSelectedUserRequest] = useState(null)

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    const openFlatpickr2 = () => {
        flatpickrRef2?.current?.flatpickr.open();
    };


    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners?PartnerType=1`, "BusinessPartners", onBusinessPartnersGet)
    const { isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/PurchaseQuotationBids`, "Purchase Bid", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/PurchaseQuotationBids`, "PurchaseQuotationBids", onsuccess, onError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, "Currencies", oncurrenciesgetsuccess)
    const {} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Items`, "Items", onitemsgetsuccess)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure/GetAll`, "UnitsOfMeasure", onUnitsGetSuccess)
    const { isLoading: isTaxTypesLoading } = useGet(`${process.env.REACT_APP_ADMIN_URL}/TaxTable/GetAll`, "TaxTables", onTaxTablesGetSuccess)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UserRequests/GetAll`, "Purchase Requests", onUserRequestGet)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/PurchaseQuotationBids/${selected?.id}`, "PurchaseQuotationBids", onUpdateSuccess, onUpdateError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/PurchaseQuotationBids/${selected?.id}`, "PurchaseQuotationBids", onDeleteSuccess, onDeletError)

    const validationSchema = Yup.object().shape({
        // quotationDate: Yup.string().required('Quotation Date is required'),
        // proposedDeliveryDate: Yup.string().required('Proposed Delivery Date is required'),
    });

    const initialValues = {
        comments: "",
        exchangeRate: "",
        status:'Opened'
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here

            let payload = {
                "number": "",
                "totalQuantity": itemsList.reduce((total, value) => total + value.quantity, 0),
                "businessPartner": {
                    "id": selectedVendor?.value
                },
                "status": values.status,
                "basedOn": selectedUserRequest.value,
                "remarks": values.comments,
                "transactionDate": quotationDate,
                "proposedDeliveryDate": proposedDeliveryDate,
                "currency": {
                    "id": selectedCurrency?.value
                },
                "exchangeRateValue": values.exchangeRate || 0,
                purchaseQuotationBidItems: itemsList.map((value) => {
                    return {
                        "id": value.id,
                        "item": {
                            "id": value.item?.value
                        },
                        "unitOfMeasureId": value?.unitOfMeasure?.value,
                        "quotedQuantity": value?.quotedQuantity,
                        "quantity": value?.quantity,
                        "quotedPrice": value?.price
                    }
                })
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
        setSelected(row)
        axios.get(`${process.env.REACT_APP_ADMIN_URL}/PurchaseQuotationBids/${row?.id}`)
            .then((res) => {
                console.log(res.data.payload)
                let data = res.data.payload
                setShowEditModal(true)
                tog_backdrop()
               

                setSelectedUserRequest({id: data?.basedOn})
                setselectedVendor({id: data.businessPartner?.id, value: data.businessPartner?.id, label: `${data.businessPartner?.name}`})
                setQuotationDate(data?.transactionDate?.substring(0, 10))
                setProposedDeliveryDate(data?.proposedDeliveryDate?.substring(0, 10))
                setSelectedCurrency({id: data?.currency?.id, id: data?.currency?.id,label: data?.currency?.name})
                formik.setFieldValue("comments", data?.comments)
                formik.setFieldValue("status", data?.status)
                
                let list = data?.purchaseQuotationBidItems?.map((values) => {
                    return {
                        id: values?.id,
                        item: { label: values?.item?.name, value: values?.item?.id },
                        quantity: "",
                        quotedQuantity:'', 
                        price:'', 
                        description: "", 
                        unitOfMeasure: { label: 'Select', value: 0 }, 
                        WHT: { label: 'Select', value: 0 }, 
                        VAT: { label: 'Select', value: 0 } 
                    }
                })
                console.log(list)
                let newObj = { id: Math.ceil(Math.random() * 1000000), item: { label: 'Select', value: 0 }, quantity: "", quotedQuantity:'', price:'', description: "", unitOfMeasure: { label: 'Select', value: 0 }, WHT: { label: 'Select', value: 0 }, VAT: { label: 'Select', value: 0 } }
                setItemsList([...list, newObj])
            })
            .finally(() => {
                setShowLoading(false)

            })
    }


    const resetForm = () => {
        formik.setFieldValue('comments', '')
        formik.setFieldValue('exchangeRate', '')
        setSelectedCurrency(null)
        setProposedDeliveryDate(null)
        setQuotationDate(null)
        setSelectedUserRequest(null)
        setselectedVendor(null)
        setItemsList([{ id: Math.ceil(Math.random() * 1000000), item: { label: 'Select', value: 0 }, quantity: "", quotedQuantity:'', price:'', description: "", unitOfMeasure: { label: 'Select', value: 0 }, WHT: { label: 'Select', value: 0 }, VAT: { label: 'Select', value: 0 } }])
       

        console.log('resetting form')
    }
    
    const addItem = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), item: { label: 'Select', value: 0 }, quantity: "", description: "", unitOfMeasure: { label: 'Select', value: 0 },  VAT: { label: 'Select', value: 0 },  WHT: { label: 'Select', value: 0 },   }
        setItemsList((prev) => [...prev, newOBJ]);
    };

    const handleFormChange = (e, index) => {
        console.log(e)
        let data = [...itemsList];
        if (e.target == undefined) {
            data[index][e.name].value = e.value;
            data[index][e.name].label = e.label;
            if (e.name == 'item') {
                console.log(data)
                data[index]['quantity'] = 1
            }
        }
        else {
            data[index][e.target.name] = e.target.value;

        }

        console.log(data)
        setItemsList(data)

    };


    const removeFields = (item) => {
        if(itemsList.length == 1){
            showToast('warning', 'You must have at least one item on the list')
        }
        else{
            let data = itemsList.filter((x) => x.id != item.id)
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
            showToast("success", "Bid Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Bid";

    if (isListLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Master Data" breadcrumbItem="Bid" />
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
                    size={'xl'}

                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Bid</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel">Edit Bid</h5>)}

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
                        <div className="modal-body" >

                            <div className="row mb-3">


                                <div className="col">
                                    <div className="mb-0">
                                        <label className="form-label">Quotation Date <i
                                            className="text-danger">*</i></label>
                                        <InputGroup>
                                            <Flatpickr
                                                value={quotationDate}
                                                name="quotationDate"
                                                onChange={(e) => setQuotationDate(e[0].toISOString())}
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
                                        {quotationDate == null ? <div className="text-danger">{'Quotation Date is required'}</div> : null}
                                    </div>
                                </div>


                                <div className="col">
                                    <div className="mb-0">
                                        <label className="form-label">Vendor </label>
                                        <Select
                                            onChange={(e) => setselectedVendor(e)}
                                            name="assetClass"
                                            options={bpDropdown}
                                            value={selectedVendor}
                                            className="select2-selection row1" />
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="mb-0">
                                        <label className="form-label">Currency </label>
                                        <Select
                                            onChange={(e) => setSelectedCurrency(e)}
                                            name="assetClass"
                                            options={currencyOptions}
                                            value={selectedCurrency}
                                            className="select2-selection row1" />
                                    </div>
                                </div>

                                {selectedCurrency?.isHome == 'No' && <div className="col" >
                                    <div className="mb-0">
                                        <label className="form-label">Exchange Rate </label>
                                        <input type="text" className="form-control-sm form-control" name="exchangeRate" onChange={formik.handleChange}
                                            value={formik.values.exchangeRate}
                                            autoComplete="off" />
                                        {/* {formik.touched.requestDate && formik.errors.requestDate && <div className="text-danger">{formik.errors.requestDate}</div>} */}
                                    </div>
                                </div>}
                            </div>


                            <div className="row mb-3">
                                <div className="col">
                                    <div className="mb-0">
                                        <label className="form-label">Based On </label>
                                        {/* <input type="text" className="form-control-sm form-control" placeholder="Insert Base Document Number" name="basedOn" onChange={formik.handleChange}
                                            value={formik.values.basedOn}
                                            autoComplete="off" /> */}
                                        <Select
                                            onChange={(e) => setSelectedUserRequest(e)}
                                            name="assetClass"
                                            options={userRequests}
                                            value={selectedUserRequest}
                                            className="select2-selection row1" />
                                        {formik.touched.basedOn && formik.errors.basedOn && <div className="text-danger">{formik.errors.basedOn}</div>}
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="mb-0">
                                        <label className="form-label">Proposed Delivery Date <i
                                            className="text-danger">*</i></label>
                                        <InputGroup>
                                            <Flatpickr
                                                value={proposedDeliveryDate}
                                                name="proposedDeliveryDate"
                                                onChange={(e) => setProposedDeliveryDate(e[0].toISOString())}
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
                                        {proposedDeliveryDate == null ? <div className="text-danger">{'Proposed Delivery Date is required'}</div> : null}
                                    </div>
                                </div>

                                <div className="col-3">
                                    <div className="mb-0">
                                        <label className="form-label">Status </label>
                                        <select className="form-select form-select-sm" name="status"  value={formik.values.status} onChange={formik.handleChange}>
                                            <option value={'Opened'}>Opened</option>
                                            <option value={'Closed'}>Closed</option>
                                            <option value={'Canceled'}>Cancelled</option>
                                            <option value={'Draft'}>Draft</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col">

                                    <div className="mb-0">
                                        <label className="form-label">Comments</label>
                                        <textarea className="form-control-sm form-control" name="comments" onChange={formik.handleChange}
                                            value={formik.values.comments}
                                            autoComplete="off" />
                                    </div>
                                </div>


                            </div>



                            <div className="row mb-3">



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
                                                            <th style={{ width: '15%' }}>Item/Service</th>
                                                            <th style={{ width: '11%' }}>Unit of Measure</th>
                                                            <th style={{ width: '15%' }}>Description</th>
                                                            <th style={{ width: '8%' }}>Quantity</th>
                                                            <th style={{ width: '8%' }}>Quoted Quantity</th>
                                                            <th style={{ width: '8%' }}>Quoted Price</th>
                                                            <th style={{ width: '15%' }}>VAT Type</th>
                                                            <th style={{ width: '15%' }}>WH Type</th>
                                                            <th style={{ width: '5%' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {itemsList?.map((form, key) => {
                                                            return (
                                                                <tr key={key}>
                                                                    <td>{key + 1}</td>
                                                                    <td>

                                                                        <Select
                                                                            onChange={(e) => handleFormChange(e, key)}
                                                                            name="item"
                                                                            options={itemsDropDown}
                                                                            value={form.item}
                                                                            className="select2-selection row1" />
                                                                    </td>
                                                                    <td>
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
                                                                    <td>
                                                                        <input type="number" className="form-control-sm form-control" autoComplete="off" name="quantity" value={form.quantity} onChange={(e) => handleFormChange(e, key)} />
                                                                    </td>
 
                                                                    <td>
                                                                        <input type="number" className="form-control-sm form-control" autoComplete="off" name="quotedQuantity" value={form.quotedQuantity} onChange={(e) => handleFormChange(e, key)} />

                                                                    </td>
                                                                    <td>
                                                                        <input type="number" className="form-control-sm form-control" autoComplete="off" name="price" value={form.price} onChange={(e) => handleFormChange(e, key)} />
                                                                    </td>
                                                                    <td>
                                                                        <Select
                                                                            onChange={(e) => handleFormChange(e, key)}
                                                                            name="VAT"
                                                                            options={taxTablesVAT}
                                                                            value={form.VAT}
                                                                            className="select2-selection row1" />
                                                                    </td>
                                                                    <td>
                                                                        <Select
                                                                            onChange={(e) => handleFormChange(e, key)}
                                                                            name="WHT"
                                                                            options={taxTablesWHT}
                                                                            value={form.WHT}
                                                                            className="select2-selection row1" />
                                                                    </td>

                                                                    <td style={{ width: '7%', textAlign: 'right' }}>
                                                                        <span type="button" className="text-primary" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Add Contact" onClick={addItem}>
                                                                            <i className="far  fas fa-plus" />
                                                                        </span>
                                                                        <span type="button" className="text-danger" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                            <i className="far  fas fa-trash" />
                                                                        </span>
                                                                    </td>

                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </Table>
                                            </div>

                                        ) : null}
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
Bid.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Bid;