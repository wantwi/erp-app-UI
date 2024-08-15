// src/components/filter.
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, Row, Col, Form, InputGroup } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { usePut } from "hook/usePut";
import { useDelete } from "hook/useDelete";
import Select from "react-select";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import useCustomAxios from "hook/useCustomAxios";
import CurrencyInput from "react-currency-input-field";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from "react-icons/fa";


function Items() {

    const TypeTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 0 ? <span key={idx}>Stock</span> :
                    value === 1 ? <span key={idx}>Sales</span> : <span key={idx}>Purchase</span>

                }
            </>
        );
    };

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
                Header: 'Group',
                accessor: 'grouping.name'
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: ({ cell: { value } }) => <TypeTemplate value={value} />
            },
            // {
            //     Header: 'Date Created',
            //     accessor: 'dateCreated'
            // },
            // {
            //     Header: 'Status',
            //     accessor: 'status',
            //     Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            // },
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
    const [activeTab, setActiveTab] = useState('Stock')
    const [status, setStatus] = useState(true)
    const [disabled, setDisabled] = useState(true)

    const [selectedOptions, setSelectedOptions] = useState([]);

    const flatpickrRef = useRef(null);
    const flatpickrRef2 = useRef(null);

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    const openFlatpickr2 = () => {
        flatpickrRef2?.current?.flatpickr.open();
    };


    const options = [{
        "id": 1,
        "value": "1",
        "label": "Stock"
    }, {
        "id": 2,
        "value": "2",
        "label": "Sales"
    }, {
        "id": 3,
        "value": "3",
        "label": "Purchase"
    }]

    function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
        if (value && value.some((o) => o.value === "0")) {
            return `${placeholderButtonLabel}: All`;
        } else {
            return `${placeholderButtonLabel}: ${value.length} selected`;
        }
    }

    function onChange(value, event) {
        if (event.action === "select-option" && event.option.value === "0") {
            this.setState(this.options);
        } else if (
            event.action === "deselect-option" &&
            event.option.value === "0"
        ) {
            this.setState([]);
        } else if (event.action === "deselect-option") {
            this.setState(value.filter((o) => o.value !== "0"));
        } else if (value.length === this.options.length - 1) {
            this.setState(this.options);
        } else {
            this.setState(value);
        }
    }



    const ongetsuccess = (data) => {
        let mappedData = data.filter((item) => item.status != 2)
        setItemsList(mappedData)

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

    const assetclassongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.code} - ${item.name}`, value: item.id, code: item.code }
        })
        setassetClassOptions(mappedData)
    }

    const onUnitsGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item?.id, code: item.code, name:'unitOfMeasure' }
        })
        setunitsOfMeasureDropDown(mappedData)
    }

    // const employeesongetsuccess = (data) => {
    //     let mappedData = data.map((item) => {
    //         return { label: `${item.firstName} ${item.lastName}`, value: item.id }
    //     })
    //     setEmployeeOptions(mappedData)
    // }


    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    // const [modal_backdrop, setmodal_backdrop] = useState(false);
    const [formData, setFormData] = useState({ assetClass: '', capitalizationDate: '', isAsset: false, depreciationStartDate: '', costCenter: '' })
    const [itemsList, setItemsList] = useState([])
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showLoading, setShowLoading] = useState(false)
    const [selectedGrouping, setSelectedGrouping] = useState(0)
    const [accountsOptions, setAccountsOptions] = useState([])
    const [accountTypesOptions, setAccountTypesOptions] = useState([])
    const [formRows, setFormRows] = useState([]);
    const [showAlert, setshowAlert] = useState(false)
    const [assetClassOptions, setassetClassOptions] = useState([])
    const [employeeOptions, setEmployeeOptions] = useState([])
    const [assetClass, setAssetClass] = useState(null)
    const [employee, setEmployee] = useState(null)
    const [unitsOfMeasureDropDown, setunitsOfMeasureDropDown] = useState([])
    const [defaultUnitOfMeasure, setDefaultUnitOfMeasure] = useState({label:'Select', value:0})


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Items`, "Items", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Items`, "Items", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Items/${selected?.id}`, "Items", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Items/${selected?.id}`, "Items", onUpdateSuccess, onUpdateError)
    const { data: groups } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Groups/ItemGroup`, "ItemsGroups",)
    const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/item`, "AccountTypes", onAccountTypesGetSuccess)
    const { data: accounts } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllAccounts`, "accounts", onAccountsGetSuccess)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AssetClass/GetAll`, "AssetClass", assetclassongetsuccess)
    // const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Employees`, "Employees", employeesongetsuccess,)
    const { data: costCenters } = useGet(`${process.env.REACT_APP_ADMIN_URL}/CostCenter/GetAllCostCenters`, "cost-center")
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure/GetAll`, "UnitsOfMeasure", onUnitsGetSuccess)

    const handleDelete = (row) => {
        deleteMutate(row.id)
        setshowAlert(false)
    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {
        // console.log(row)
        // setSelected(row)
        // let statusBool = row.status == 0 ? false : true
        // setStatus(statusBool)
        // //formik.initialValues["key"] 
        // formik.resetForm()
        // Object.keys(row).forEach(fieldName => {
        //     formik.setFieldValue(fieldName, row[fieldName]);
        // });
        // setmodal_backdrop(false);
        // formik.resetForm();

        setShowEditModal(true)
        setSelected(row)
        formik.resetForm()

        axios.get(`${process.env.REACT_APP_ADMIN_URL}/Items/${row?.id}`)
            .then((res) => {
                console.log(res.data.payload, "RESPONSE")
                let data = res.data.payload

                setmodal_backdrop(false);
                let statusBool = row.status == 0 ? false : true
                setStatus(statusBool)

                Object.keys(row).forEach(fieldName => {
                    formik.setFieldValue(fieldName, row[fieldName]);
                });
                //formik.initialValues["key"] 
                formik.initialValues["code"] = data?.code
                formik.initialValues["name"] = data?.name
                setSelectedOptions(data.type)
                formik.initialValues["id"] = data?.id


                //let editSelectedGrouping = {id: data.grouping?.id, label: data.grouping?.name}
                setSelectedGrouping(data.grouping?.id)

            })
            .finally(() => {
                setShowLoading(false)
            })
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

    const handleAccountFormChange = (e, index) => {

        //console.log(e, index)
        let newObj = { id: Math.ceil(Math.random() * 1000000), accountType: accountTypesOptions[index],  account: e }
        let data = [...formRows, newObj];
        console.log(data)
     
        setFormRows(data)
    };


    const validationSchema = Yup.object().shape({
        //code: Yup.string().required('Code is required'),
        name: Yup.string().required('Name is required'),
        //type: Yup.array().required('Item type is required')
    });

    const initialValues = {
        "code": "",
        "name": "",
        "grouping": {
            "id": 0
        },
        "status": 0,
        "type": [],
        costCenter: 0
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            let temp = []
            selectedOptions.forEach((item) => temp.push(item.value))
            let payload = {
                ...values,
                //assetClass: assetClass.value, 
                isAsset: formData.isAsset,
                grouping: { id: selectedGrouping },
                type: temp,
                status: status == true ? '1' : 0,
                assetClass: {
                    id: assetClass.value
                },
                capitalisationDate: formData.capitalizationDate || "",
                depreciationStartDate: formData.depreciationStartDate || "",
                costCenter: {
                    id: values.costCenter
                },
                defaultUnitOfMeasure: {
                    id: defaultUnitOfMeasure?.value
                },
                itemAccountings: formRows.map((item) => {
                    return {
                        accountType: {
                            id: item?.accountType?.value
                          },
                          account: {
                            id: item?.account?.value
                        },
                        item: {
                            id: item.id || 0
                        }
                    }
                }),
            }

            //console.log(payload)

            if (showEditModal) {

                updateMutate(payload)
            } else {
                mutate(payload)
            }


        },
    });

    const resetForm = () => {
        formik.setFieldValue('code', '')
        formik.setFieldValue('name', '')
        setSelectedOptions([])
        setSelectedGrouping(0)
    }

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Item Successfully Created", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])

    if (isListLoading) {
        return <LoadingSpinner />
    }



    //meta title
    document.title = "Biz-360 ERP | Items";


    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Master Data" breadcrumbItem="Items" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={itemsList}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                            className="table-sm"
                        />
                    </CardBody>

                </Card>

            </div>



            {/*Add Item Modal */}
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
                    {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Items</h5>) :
                        (<h5 className="modal-title" id="staticBackdropLabel"> Edit Items</h5>)}


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

                        <div className="row mb-2">
                            <div className="col">
                                <div className="mb-3">
                                    <label className="form-label">Code <i
                                        className="text-danger">*</i></label>
                                    <InputGroup>
                                        <div className="input-group-text " style={{ cursor: 'pointer', height: 27 }} onClick={() => setDisabled(!disabled)}> {disabled ? 'Custom' : 'Generate'}</div>
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
                                    <input type="text" className="form-control-sm form-control" name="name"
                                        autoComplete="off" placeholder="Enter name" onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.name} />
                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row mb-2">

                            <div className="col">
                                <div className="mb-3">
                                    <label className="form-label">Type <i
                                        className="text-danger">*</i></label>
                                    <ReactMultiSelectCheckboxes

                                        options={[{ label: "All", value: "0" }, ...options]}
                                        placeholderButtonLabel="Select Type"
                                        getDropdownButtonLabel={getDropdownButtonLabel}
                                        value={selectedOptions}
                                        onChange={onChange}
                                        setState={setSelectedOptions}

                                    />
                                    {/* <select className="form-select form-select-sm" name="type" 
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.type} multiple>
                                        <option value={-1}>Select Type</option>
                                        <option value={0}>Stock</option>
                                        <option value={1}>Sales</option>
                                        <option value={2}>Purchase</option>
                                    </select> */}
                                    {formik.touched.type && formik.errors.type && <div className="text-danger">{formik.errors.type}</div>}
                                </div>
                            </div>

                            <div className="col">
                                <div className="mb-3">
                                    <label className="form-label">Group </label>
                                    <select className="form-select form-select-sm"

                                        onChange={(e) => setSelectedGrouping(e.target.value)}
                                        value={selectedGrouping}>
                                        <option>Select Group</option>
                                        {groups?.filter((item) => item.status != 0).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}

                                    </select>
                                </div>
                            </div>

                        </div>

                        <div className="row mb-2">

                            {/* <div className="col" hidden>
                                <div className="mb-3">
                                    <label className="form-label">Asset Class</label>
                                    <Select
                                        onChange={(e) => setAssetClass(e)}
                                        name="assetClass"
                                        options={assetClassOptions}
                                        value={assetClass}
                                        className="select2-selection row1" />
                                </div>
                            </div> */}

                            <div className="col" hidden>
                                <div className="mb-3">
                                    <label className="form-label">Cost Center </label>
                                    <select className="form-select form-select-sm"
                                        name="costCenter"
                                        onChange={(e) => setSelectedGrouping(e.target.value)}
                                        value={formik.values.costCenter}>
                                        <option>Select Cost Center</option>
                                        {costCenters?.filter((item) => item.status != 0).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}

                                    </select>
                                </div>
                            </div>

                        </div>



                        <div className="row mb-2">

                            <div className="col-3">
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



                            <div className="col-3">
                                <div className="mb-3">
                                    <label className="form-label">&nbsp;</label>
                                    <div className="input-group input-group-sm">
                                        Is an Asset? &nbsp; &nbsp;<input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={formData.isAsset}
                                            value={formData.isAsset}
                                            onClick={(e) => {
                                                setFormData({ ...formData, isAsset: !formData.isAsset })
                                                formData.isAsset == false ? setActiveTab('Assets') : setActiveTab('Stock')

                                            }}
                                        />
                                        <label style={{ marginLeft: 10 }}>{formData.isAsset ? 'Yes' : 'No'}</label> <label>{formData.isAsset}</label>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Tabbed Pane */}
                        <div className="row">
                            <div className="col">
                                <ul className="nav nav-tabs mb-3">
                                    {formData.isAsset && <li className="nav-item" onClick={() => setActiveTab('Assets')}>
                                        <a className={activeTab == 'Assets' ? `nav-link active` : `nav-link`} href="#"> <i className="bx bx-building" /> Assets</a>
                                    </li>}
                                   

                                    <li className="nav-item" onClick={() => setActiveTab('Accounting')}>
                                        <a className={activeTab == 'Accounting' ? `nav-link active` : `nav-link`} href="#"> <i className="mdi mdi-typewriter" /> Accounting</a>
                                    </li>

                                    <li className="nav-item" onClick={() => setActiveTab('Stock')}>
                                        <a className={activeTab == 'Stock' ? `nav-link active` : `nav-link`} href="#"> <i className="bx bx-box" /> Stock</a>
                                    </li>
                                </ul>
                                <div className="tab-content tab-scroll" id="myTabContent">
                                    {activeTab == 'Assets' && formData.isAsset && (
                                        <div className="tab-pane fade show active " id="assets-tab-pane" role="tabpanel" aria-labelledby="Stock-tab" tabIndex="0">
                                            {/* Tab 1 */}
                                            <div className="row mb-3">
                                                <div className="col">
                                                    <div className="mb-3">
                                                        <label className="form-label">Asset Class <i
                                                            className="text-danger">*</i></label>
                                                        <Select
                                                            onChange={(e) => setAssetClass(e)}
                                                            //onChange={(e) => setFormData((e) => ({ ...formData, assetClass: e }))}
                                                            name="assetClass"
                                                            options={assetClassOptions}
                                                            value={assetClass}
                                                            className="select2-selection row1" />
                                                        {/* <input type="text" className="form-control-sm form-control" name="name"
                                                            autoComplete="off"
                                                            onChange={(e) => setFormData((e) => ({ ...formData, assetClass: e.target.value }))}
                                                            value={formData.assetClass} /> */}
                                                        {/* {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>} */}
                                                    </div>
                                                </div>

                                                <div className="col">
                                                    <div className="mb-3">
                                                        <label className="form-label">Capitalization Date <i
                                                            className="text-danger">*</i></label>
                                                         <InputGroup>
                                                            <Flatpickr
                                                                value={formData.capitalizationDate}
                                                                onChange={(e) => setFormData({ ...formData, capitalizationDate: e[0].toISOString() })}
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
                                                        {/* <input type="date" className="form-control-sm form-control" name="name"
                                                            autoComplete="off"
                                                            onChange={(e) => setFormData({ ...formData, capitalizationDate: e.target.value })}
                                                            value={formData.capitalizationDate} /> */}
                                                        {/* {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>} */}
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="row mb-3">
                                                <div className="col">
                                                    <div className="mb-3">
                                                        <label className="form-label">Depreciation Start Date <i
                                                            className="text-danger">*</i></label>
                                                            <InputGroup>
                                                            <Flatpickr
                                                                value={formData.depreciationStartDate}
                                                                onChange={(e) => setFormData({ ...formData, depreciationStartDate: e[0].toISOString() })}
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
                                                        {/* <input type="date" className="form-control-sm form-control" name="name"
                                                            autoComplete="off" onChange={(e) => setFormData({ ...formData, depreciationStartDate: e.target.value })}
                                                            value={formData.depreciationStartDate} /> */}
                                                        {/* {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>} */}
                                                    </div>
                                                </div>

                                                <div className="col">
                                                    <div className="mb-3">
                                                        <label className="form-label">Cost Center</label>
                                                        <select className="form-select form-select-sm"
                                                            name="costCenter"
                                                            onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                                                            value={formData.costCenter}>
                                                            <option>Select Cost Center</option>
                                                            {costCenters?.filter((item) => item.status != 0).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}

                                                        </select>
                                                        {/* <input type="text" className="form-control-sm form-control" name="name"
                                                            autoComplete="off" onChange={(e) => setFormData((e) => ({ ...formData, costCenter: e.target.value }))}
                                                            value={formData.costCenter} /> */}
                                                        {/* {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>} */}
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Default Unit of Measure </label>
                                                        <Select
                                                            onChange={(e) => setDefaultUnitOfMeasure(e)}
                                                            name="unitOfMeasure"
                                                            options={unitsOfMeasureDropDown}
                                                            value={defaultUnitOfMeasure}
                                                            className="select2-selection row1" />
                                                  
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    )}
                                    {activeTab == 'Stock' && (
                                        <div className="tab-pane fade show active " id="Stock-tab-pane" role="tabpanel" aria-labelledby="Stock-tab" tabIndex="0">
                                            {/* Tab 1 */}
                                            <div className="row mb-3">
                                                <Table className="table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Warehouse name</th>
                                                            <th>Instock Qty</th>
                                                            <th>Ordered Qty</th>
                                                            <th>Committed Qty</th>
                                                            <th>Available to Promise</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    </tbody>
                                                </Table>
                                            </div>


                                        </div>)
                                    }
                                    {activeTab == 'Accounting' &&
                                        (<div className="tab-pane fade show active" id="financial-tab-pane" role="tabpanel"
                                            aria-labelledby="Accounting-tab" tabIndex="0">
                                            <Form className="repeater" encType="multipart/form-data">
                                                <div>

                                                    <Table className="table mb-2">

                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th style={{ width: '45%' }}>Account Type</th>
                                                                <th style={{ width: '53%' }}>Account Code & Name</th>
                                                                {/* <th></th> */}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {/* {(formRows || []).map((formRow, key) => ( */}
                                                            {(accountTypesOptions || []).map((formRow, key) => (
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
                                               
                                            </Form>
                                        </div>
                                        )}
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
                        {!showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>}
                        {showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>}
                    </div>
                </form>
            </Modal>



            <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />


        </div>



    );
}
Items.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Items;