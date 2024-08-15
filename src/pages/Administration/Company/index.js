// src/components/filter.
import React, { useContext, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Col, Modal, Nav, NavItem, NavLink, Row, Card, CardBody, TabContent, TabPane, Table } from 'reactstrap';
import classnames from "classnames";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ImageUploader from 'react-image-upload'
import 'react-image-upload/dist/index.css'

import { useGet } from 'hook/useGet';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
// import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import CompanyForm from "./form/CompanyForm";
import UsersTable from "./form/UsersTable";
import LOGO from "../../../assets/images/companies/img-4.png"
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGetStatic } from "hook/useGetStatic";
import { usePut } from "hook/usePut";
import useAuth from "hook/useAuth";
import axios from 'axios'

const validationSchema = Yup.object().shape({
    // code: Yup.string().required('Code is required'),
    name: Yup.string().required('Name is required'),
    registrationDate: Yup.string().required('Registration Data is required'),
    taxIDNumber: Yup.string().required('TIN is required'),
    logo: Yup.string(),
    streetAddress: Yup.string().required('Street address is required'),
    postAddress: Yup.string().required('Postal address is required'),
    city: Yup.string().required('City is required'),
    phone: Yup.string().required('Phone number is required'),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    website: Yup.string().url('Invalid URL'),
    logoAttachment: Yup.string(),
    companyFinancials: Yup.object().shape({
        homeCurrencyId: Yup.string(), //.required('Home Currency is required'),
        reportingCurrencyId: Yup.string()//.required('Reporting Currency is required'),
        // otherCurrency: Yup.string()
    })
});




const initialValues = {

    name: '',
    registrationDate: "",
    taxIDNumber: "",
    logo: "",
    streetAddress: "",
    postAddress: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    logoAttachment: "",
    companyFinancials: { homeCurrencyId: "", reportingCurrencyId: "" }
};
function BusinessPartnerGroups() {
   
   const {auth}= useAuth()
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
                accessor: 'status'
            },
            {
                Header: 'BP Count',
                accessor: 'dateCreated'
            },
        ],
        []
    );

    const [activeTab, setactiveTab] = useState("1");

    const PreviewImage = () => {
        return (
            <div>
                <img width={200} height={200} src={LOGO} />
            </div>
        )
    }

    const toggleTab = tab => {
        if (activeTab !== tab) {
            setactiveTab(tab);
        }
    };

   

    const onsuccess = (data) => {
        console.log({ onsuccess: data, });
        const valx = data.companyFinancialDetails?.reportingCurrency?.id
        formik.setFieldValue('city', data?.city)
        formik.setFieldValue('email', data?.email)
        formik.setFieldValue('name', data?.name)
        formik.setFieldValue('phone', data?.phone)
        formik.setFieldValue('postAddress', data?.postAddress)
        formik.setFieldValue('streetAddress', data?.streetAddress)
        formik.setFieldValue('taxIDNumber', data?.taxIDNumber)
        formik.setFieldValue('registrationDate', data?.registrationDate.split('T')[0])
        formik.setFieldValue('website', data?.website)
        formik.setFieldValue('companyFinancials.homeCurrencyId', data?.companyFinancialDetails?.homeCurrency?.id || "")
        formik.setFieldValue('companyFinancials.reportingCurrencyId', data?.companyFinancialDetails?.reportingCurrency.id || valx)

    }

    const { data, isLoading } = useGetStatic(`${process.env.REACT_APP_ADMIN_URL}/Company`, 'company-info', onsuccess)

    const onPutsuccess = () => {
        showToast("success", "Company Info Uodated.", "Notice")
    }

    const onPutError =()=>{

    }

    const { mutate, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Company/${data?.id}`, 'company-info', onPutsuccess,onPutError)

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            // Handle form submission logic here
            console.log({ values });

            // const fd = new FormData()
            const postData = {
                ...values,
                companyFinancials: {
                    homeCurrencyId: +values.companyFinancials.homeCurrencyId,
                    reportingCurrencyId: +values.companyFinancials.reportingCurrencyId
                },
            }
            mutate(postData)
            // fd.append('city', postData.city)
            // fd.append('email', postData.email)
            // fd.append('name', postData.name)
            // fd.append('phone', postData.phone)
            // fd.append('postAddress', postData.postAddress)
            // fd.append('streetAddress', postData.streetAddress)
            // fd.append('taxIDNumber', postData.taxIDNumber)
            // fd.append('registrationDate', postData.registrationDate)
            // fd.append('website', postData.website)
            // fd.append('companyFinancials', JSON.stringify(postData.companyFinancials))
            // fd.append('logoAttachment', postData.logoAttachment)

            // axios.put(`${process.env.REACT_APP_ADMIN_URL}/Company/${data?.id}`, fd, {
            //     headers: {
            //         'Content-Type': 'application/json' // Set the correct content type
            //     }
            // })
            // .then(response => {
            //     console.log('Response:', response.data);
            // })
            // .catch(error => {
            //     console.error('Error:', error);
            // });

            
            // axios(,fd, {
            //     headers: {'Content-Type': 'multipart/form-data','Authorization' : `Bearer ${auth?.access_token}`}
            // }).then(result=>{
            //     console.log({result});
            // })
            //mutate(fd)
        },
    });

    const getImageFileObject = (imageFile) => {
        console.log({ imageFile })

        formik.setFieldValue('logoAttachment', JSON.stringify(imageFile))

    }
    const runAfterImageDelete = (file) => {

        console.log({ file })
        formik.setFieldValue('logoAttachment', "")
    }

    const { data: currenciesList = [] } = useGetStatic(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies')

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    // const [modal_backdrop, setmodal_backdrop] = useState(false);
    const [formData, setFormData] = useState({ name: '', symbol: '', short_name: '' })

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    //meta title
    document.title = "Biz-360 ERP | Company";



    console.log({ Company: data });

    if (isLoading || isPutLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Administration" breadcrumbItem="Company" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <Row>
                            <Col md={2} sm={12}></Col>
                            <Col md={6} sm={12} style={{ border: '1px solid #eeeeee' }}>


                                <form onSubmit={formik.handleSubmit} className="p-2">
                                    <div className="modal-body" style={{ minHeight: '55vh' }}>

                                        <div className="row">
                                            <div className="col col-md-3" hidden>
                                                <div className={`mb-1 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                                                    <label className="form-label m-0">Code <i className="text-danger">*</i></label>
                                                    <input
                                                        type="text"
                                                        name="code"
                                                        className={`form-control form-control-sm ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''}`}
                                                        onBlur={formik.handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.code}
                                                        autoComplete="off"
                                                        placeholder="Enter code"
                                                    />
                                                    {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className={`mb-1 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                                    <label className="form-label m-0">Name<i className="text-danger">*</i></label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className={`form-control form-control-sm ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                                                        onBlur={formik.handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.name}
                                                        autoComplete="off"
                                                        placeholder="Enter company name"
                                                    />
                                                    {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                                </div>
                                            </div>
                                        </div>


                                        {/* Tabbed Pane */}
                                        <div className="row">
                                            <Nav tabs style={{ marginLeft: 9 }}>
                                                <NavItem>
                                                    <NavLink
                                                        style={{ cursor: "pointer", }}
                                                        className={classnames({
                                                            active: activeTab === "1",
                                                        })}
                                                        onClick={() => {
                                                            toggleTab("1");
                                                        }}
                                                    >
                                                        General
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        style={{ cursor: "pointer" }}
                                                        className={classnames({
                                                            active: activeTab === "2",
                                                        })}
                                                        onClick={() => {
                                                            toggleTab("2");
                                                        }}
                                                    >
                                                        Financials
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        style={{ cursor: "pointer" }}
                                                        className={classnames({
                                                            active: activeTab === "3",
                                                        })}
                                                        onClick={() => {
                                                            toggleTab("3");
                                                        }}
                                                    >
                                                        Settings
                                                    </NavLink>
                                                </NavItem>
                                                {/* <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({
                                        active: activeTab === "3",
                                    })}
                                    onClick={() => {
                                        toggleTab("3");
                                    }}
                                >
                                    User
                                </NavLink>
                            </NavItem> */}


                                            </Nav>
                                            <TabContent activeTab={activeTab} className="p-3 text-muted">
                                                
                                                <TabPane tabId="1">
                                                    <div className="row">
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.registrationDate && formik.errors.registrationDate ? 'has-error' : ''}`}>
                                                                <label htmlFor="registrationDate" className="form-label m-0">Registration Date <i className="text-danger">*</i></label>
                                                                <input
                                                                    type="date"
                                                                    id="registrationDate"
                                                                    name="registrationDate"
                                                                    className={`form-control form-control-sm ${formik.touched.registrationDate && formik.errors.registrationDate ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.registrationDate}
                                                                    autoComplete="off"
                                                                    placeholder=""
                                                                />
                                                                {formik.touched.registrationDate && formik.errors.registrationDate && <div className="text-danger">{formik.errors.registrationDate}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.taxIDNumber && formik.errors.taxIDNumber ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">TIN #<i className="text-danger">*</i></label>
                                                                <input
                                                                    type="text"
                                                                    name="taxIDNumber"
                                                                    className={`form-control form-control-sm ${formik.touched.taxIDNumber && formik.errors.taxIDNumber ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.taxIDNumber}
                                                                    autoComplete="off"
                                                                    placeholder="Enter TIN"
                                                                />
                                                                {formik.touched.taxIDNumber && formik.errors.taxIDNumber && <div className="text-danger">{formik.errors.taxIDNumber}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.email && formik.errors.email ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Email<i className="text-danger">*</i></label>
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    className={`form-control form-control-sm ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.email}
                                                                    autoComplete="off"
                                                                    placeholder="Enter email"
                                                                />
                                                                {formik.touched.email && formik.errors.email && <div className="text-danger">{formik.errors.email}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.phone && formik.errors.phone ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Phone <i className="text-danger">*</i></label>
                                                                <input
                                                                    type="text"
                                                                    name="phone"
                                                                    className={`form-control form-control-sm ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.phone}
                                                                    autoComplete="off"
                                                                    placeholder="Enter phone number"
                                                                />
                                                                {formik.touched.phone && formik.errors.phone && <div className="text-danger">{formik.errors.phone}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.streetAddress && formik.errors.streetAddress ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Street Address<i className="text-danger">*</i></label>
                                                                <textarea

                                                                    name="streetAddress"
                                                                    className={`form-control form-control-sm ${formik.touched.streetAddress && formik.errors.streetAddress ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.streetAddress}
                                                                    autoComplete="off"
                                                                    placeholder="Enter street address"
                                                                    rows={3}

                                                                ></textarea>
                                                                {formik.touched.streetAddress && formik.errors.streetAddress && <div className="text-danger">{formik.errors.streetAddress}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.postAddress && formik.errors.postAddress ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Post Address <i className="text-danger">*</i></label>
                                                                <textarea
                                                                    type="text"
                                                                    name="postAddress"
                                                                    className={`form-control form-control-sm ${formik.touched.postAddress && formik.errors.postAddress ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.postAddress}
                                                                    autoComplete="off"
                                                                    placeholder="Enter postal address"
                                                                    rows={3}
                                                                ></textarea>
                                                                {formik.touched.postAddress && formik.errors.postAddress && <div className="text-danger">{formik.errors.postAddress}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.city && formik.errors.city ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">City<i className="text-danger">*</i></label>
                                                                <input
                                                                    type="text"
                                                                    name="city"
                                                                    className={`form-control form-control-sm ${formik.touched.city && formik.errors.city ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.city}
                                                                    autoComplete="off"
                                                                    placeholder="Enter city"
                                                                />
                                                                {formik.touched.city && formik.errors.city && <div className="text-danger">{formik.errors.city}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.website && formik.errors.website ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Website <i className="text-danger"></i></label>
                                                                <input
                                                                    type="text"
                                                                    name="website"
                                                                    className={`form-control form-control-sm ${formik.touched.website && formik.errors.website ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.website}
                                                                    autoComplete="off"
                                                                    placeholder="Enter website"
                                                                />
                                                                {/* {formik.touched.website && formik.errors.website && <div className="text-danger">{formik.errors.website}</div>} */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        {/* <div className="col col-md-6">
                                        <div className={`mb-1 ${formik.touched.type && formik.errorstouched.type ? 'has-error' : ''}`}>
                                            <label className="form-label m-0">Role <i className="text-danger">*</i></label>
                                            <select
                                                name="type"
                                                className={`form-control form-control-sm ${formik.touched.type && formik.errorstouched.type ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.valuestouched.type}
                                            >
                                                <option value="">Select Role</option>
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                            {formik.touched.type && formik.errorstouched.type && <div className="text-danger">{formik.errorstouched.type}</div>}
                                        </div>
                                    </div> */}
                                                        {/* <div className="col col-md-6">
                                                    <h3>LOGO</h3>
                                                </div> */}
                                                    </div>
                                                </TabPane>
                                                <TabPane tabId="2">
                                                    <div className="row">
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.companyFinancials?.homeCurrencyId && formik.errors.companyFinancials?.homeCurrencyId ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Home Currency <i className="text-danger">*</i></label>
                                                                <select
                                                                    name="companyFinancials.homeCurrencyId"
                                                                    className={`form-control form-control-sm ${formik.touched.companyFinancials?.homeCurrencyId && formik.errors.companyFinancials?.homeCurrencyId ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.companyFinancials.homeCurrencyId}
                                                                >
                                                                    <option value="">Select Home Currency</option>
                                                                    {
                                                                        currenciesList.map((x, i) => <option key={`${x?.code}_${i}h`} value={x?.id}>{x?.name}</option>)
                                                                    }


                                                                </select>
                                                                {formik.touched.companyFinancials?.homeCurrencyId && formik.errors.companyFinancials?.homeCurrencyId && <div className="text-danger">{formik.errors.companyFinancials?.homeCurrencyId}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col col-md-6">
                                                            <div className={`mb-1 ${formik.touched.companyFinancials?.reportingCurrencyId && formik.errors.companyFinancials?.reportingCurrencyId ? 'has-error' : ''}`}>
                                                                <label className="form-label m-0">Reporting  Currency <i className="text-danger">*</i></label>
                                                                <select
                                                                    name="companyFinancials.reportingCurrencyId"
                                                                    className={`form-select form-select-sm ${formik.touched.companyFinancials?.reportingCurrencyId && formik.errors.companyFinancials?.reportingCurrencyId ? 'is-invalid' : ''}`}
                                                                    onBlur={formik.handleBlur}
                                                                    onChange={formik.handleChange}
                                                                    value={formik.values.companyFinancials.reportingCurrencyId}
                                                                >
                                                                    <option value="">Select Reporting Currency</option>
                                                                    {
                                                                        currenciesList.map((x, i) => <option key={`${x?.code}_${i}r`} value={x?.id}>{x?.name}</option>)
                                                                    }
                                                                </select>
                                                                {formik.touched.companyFinancials?.reportingCurrencyId && formik.errors.companyFinancials?.reportingCurrencyId && <div className="text-danger">{formik.errors.companyFinancials?.reportingCurrencyId}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* <div className="row" >
                                    <div className="col">
                                        <div className={`mb-1 ${formik.touched.role && formik.errors.role ? 'has-error' : ''}`}>
                                            <label className="form-label m-0">Other Currencies <i className="text-danger"></i></label>
                                            <select
                                                name="role"
                                                className={`form-control form-control-sm ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.role}
                                            >
                                                <option value="">Select other Currency</option>
                                                <option value="">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                            {formik.touched.role && formik.errors.role && <div className="text-danger">{formik.errors.role}</div>}
                                        </div>
                                    </div>
                                   
                                </div> */}
                                                </TabPane>
                                                <TabPane tabId="3">
                                                    <div className="row ">
                                                        <div className="col">
                                                            <div className="row">
                                                               
                                                                <ul style={{marginLeft:20}}>
                                                                    <li>
                                                                        <div style={{display:"flex", gap:5}}>
                                                                        <label className="mt-2"> Lock screen in</label> <input style={{width:100, height:25, marginTop:5}} value={15} step={"none"} type="number" className="form-control form-control-sm" />
                                                                    <span className="mt-2">Minutes</span>
                                                                            
                                                                        </div>
                                                                  
                                                                    </li>
                                                                </ul>
                                                                
                                                            </div>
                                                            
                                                        </div>
                                                    </div>
                                                </TabPane>


                                            </TabContent>
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-light d-none" onClick={() => {
                                            setmodal_backdrop(false);
                                        }}>Close</button>
                                        <button type="submit" className="btn btn-sm btn-info"><i className="fas fa-edit me-2"></i>Update</button>
                                    </div>
                                </form>

                            </Col>
                            <Col md={4} sm={12} style={{ justifyContent: 'center', placeContent: "center" }}>
                                <label>LOGO</label>
                                {data?.logoAttachment ? <PreviewImage /> : <ImageUploader
                                    onFileAdded={(img) => getImageFileObject(img)}
                                    onFileRemoved={(img) => runAfterImageDelete(img)}
                                    style={{ height: 220, width: 220, marginTop: 10 }}

                                />}
                                {/* <div style={{ height: 170, width: 170, border: '1px solid #eeeeee', borderRadius: 10, display: "grid", placeContent: "center" }}>
                                    <img src={LOGO} alt="LOGO" style={{ objectFit: 'contain', width: 150 }} />


                                </div> */}
                                <button style={{ width: 220 }} className="btn btn-sm btn-primary mt-3">Change</button>
                            </Col>
                        </Row>
                        {/* <TableContainer
                            columns={columns}
                            data={data}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                         className="table-sm"
                        /> */}
                    </CardBody>

                </Card>

            </div>



            {/* Modal */}
            <CompanyForm modal_backdrop={modal_backdrop} setmodal_backdrop={setmodal_backdrop} setMinimized={setMinimized} />

        </div>



    );
}
BusinessPartnerGroups.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BusinessPartnerGroups;