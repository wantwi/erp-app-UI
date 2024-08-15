import React from 'react'
import { useState } from 'react';

import { Col, Modal, Nav, NavItem, NavLink, Row, TabContent, TabPane, Table } from 'reactstrap';
import classnames from "classnames";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UsersTable from './UsersTable';
import { useGet } from 'hook/useGet';

const validationSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    name: Yup.string().required('Name is required'),

        registeration: Yup.string().required('Registration Data is required'),
        TIN: Yup.string().required('TIN is required'),
        logo: Yup.string(),
        streetAddress: Yup.string().required('Street address is required'),
        postalAddress: Yup.string().required('Postal address is required'),
        city: Yup.string().required('City is required'),
        phone: Yup.string().required('Phone number is required'),
        email: Yup.string().required('Email is required').email('Invalid email address'),
        website: Yup.string().url('Invalid URL'),
      

    financial: Yup.object().shape({
        homeCurrency: Yup.string().required('Home Currency is required'),
        reportingCurrency: Yup.string().required('Reporting Currency is required'),
        otherCurrency: Yup.string()
    })
});

const initialValues = {
    code: '',
    name: '',
     registeration: "", TIN: "", logo: "", streetAddress: "", postalAddress: "", city: "", phone: "", email: "", website: "",
    financial: { homeCurrency: "", reportingCurrency: "", otherCurrency: "" }
};


const CompanyForm = ({ modal_backdrop, setmodal_backdrop, setMinimized }) => {
    // const [activeTab, setActiveTab] = useState('General')
    const [activeTab, setactiveTab] = useState("1");

    const toggleTab = tab => {
        if (activeTab !== tab) {
            setactiveTab(tab);
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            // Handle form submission logic here
            console.log(values);
        },
    });

    const { data: currenciesList = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies')


    return (
        <Modal
            isOpen={modal_backdrop}
            toggle={() => {
                tog_backdrop();
            }}
            backdrop={'static'}
            id="staticBackdrop"
           size='lg'
        >
            <div className="modal-header">
                <h5 className="modal-title" id="staticBackdropLabel">Add Company</h5>

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
                        <div className="col col-md-3">
                            <div className={`mb-3 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                                <label className="form-label">Code <i className="text-danger">*</i></label>
                                <input
                                    type="text"
                                    name="code"
                                    className={`form-control ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.code}
                                    autoComplete="off"
                                    placeholder="Enter code"
                                />
                                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                            </div>
                        </div>
                        <div className="col col-md-9">
                            <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                <label className="form-label">Name<i className="text-danger">*</i></label>
                                <input
                                    type="text"
                                    name="name"
                                    className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
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
                        <Nav tabs>
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
                                    Financial
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
                                    User
                                </NavLink>
                            </NavItem>


                        </Nav>
                        <TabContent activeTab={activeTab} className="p-3 text-muted">
                            <TabPane tabId="1">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <div className={`mb-3 ${formik.touched.registeration && formik.errors.registeration ? 'has-error' : ''}`}>
                                            <label htmlFor="registeration" className="form-label">Registration Date <i className="text-danger">*</i></label>
                                            <input
                                                type="date"
                                                id="registeration"
                                                name="registeration"
                                                className={`form-control ${formik.touched.registeration && formik.errors.registeration ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.registeration}
                                                autoComplete="off"
                                                placeholder=""
                                            />
                                            {formik.touched.registeration && formik.errors.registeration && <div className="text-danger">{formik.errors.registeration}</div>}
                                        </div>
                                    </div>
                                    <div className="col col-md-6">
                                        <div className={`mb-3 ${formik.touched.TIN && formik.errors.TIN ? 'has-error' : ''}`}>
                                            <label className="form-label">TIN #<i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="TIN"
                                                className={`form-control ${formik.touched.TIN && formik.errors.TIN ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.TIN}
                                                autoComplete="off"
                                                placeholder="Enter TIN"
                                            />
                                            {formik.touched.TIN && formik.errors.TIN && <div className="text-danger">{formik.errors.TIN}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col col-md-6">
                                        <div className={`mb-3 ${formik.touched.email && formik.errors.email ? 'has-error' : ''}`}>
                                            <label className="form-label">Email<i className="text-danger">*</i></label>
                                            <input
                                                type="email"
                                                name="email"
                                                className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
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
                                        <div className={`mb-3 ${formik.touched.phone && formik.errors.phone ? 'has-error' : ''}`}>
                                            <label className="form-label">Phone <i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="phone"
                                                className={`form-control ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
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
                                        <div className={`mb-3 ${formik.touched.streetAddress && formik.errors.streetAddress ? 'has-error' : ''}`}>
                                            <label className="form-label">Street Address<i className="text-danger">*</i></label>
                                            <textarea
                                               
                                                name="streetAddress"
                                                className={`form-control ${formik.touched.streetAddress && formik.errors.streetAddress ? 'is-invalid' : ''}`}
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
                                        <div className={`mb-3 ${formik.touched.postalAddress && formik.errors.postalAddress ? 'has-error' : ''}`}>
                                            <label className="form-label">Post Address <i className="text-danger">*</i></label>
                                            <textarea
                                                type="text"
                                                name="postalAddress"
                                                className={`form-control ${formik.touched.postalAddress && formik.errors.postalAddress ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.postalAddress}
                                                autoComplete="off"
                                                placeholder="Enter postal address"
                                                rows={3}
                                            ></textarea>
                                            {formik.touched.postalAddress && formik.errors.postalAddress && <div className="text-danger">{formik.errors.postalAddress}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col col-md-6">
                                        <div className={`mb-3 ${formik.touched.city && formik.errors.city ? 'has-error' : ''}`}>
                                            <label className="form-label">City<i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="city"
                                                className={`form-control ${formik.touched.city && formik.errors.city ? 'is-invalid' : ''}`}
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
                                        <div className={`mb-3 ${formik.touched.website && formik.errors.website ? 'has-error' : ''}`}>
                                            <label className="form-label">Website <i className="text-danger"></i></label>
                                            <input
                                                type="text"
                                                name="website"
                                                className={`form-control ${formik.touched.website && formik.errors.website ? 'is-invalid' : ''}`}
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
                                        <div className={`mb-3 ${formik.touched.type && formik.errorstouched.type ? 'has-error' : ''}`}>
                                            <label className="form-label">Role <i className="text-danger">*</i></label>
                                            <select
                                                name="type"
                                                className={`form-control ${formik.touched.type && formik.errorstouched.type ? 'is-invalid' : ''}`}
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
                                    <div className="col col-md-6">
                                        <h3>LOGO</h3>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tabId="2">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <div className={`mb-3 ${formik.touched.role && formik.errors.role ? 'has-error' : ''}`}>
                                            <label className="form-label">Home Currency <i className="text-danger">*</i></label>
                                            <select
                                                name="role"
                                                className={`form-control ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.role}
                                            >
                                                <option value="">Select Home Currency</option>
                                                {
                                                    currenciesList.map((x,i) =>  <option key={`${x?.code}_${i}`} value={x?.code}>{x?.name}</option>)
                                                }
                                               
                                             
                                            </select>
                                            {formik.touched.role && formik.errors.role && <div className="text-danger">{formik.errors.role}</div>}
                                        </div>
                                    </div>
                                    <div className="col col-md-6">
                                        <div className={`mb-3 ${formik.touched.role && formik.errors.role ? 'has-error' : ''}`}>
                                            <label className="form-label">Reporting  Currency <i className="text-danger">*</i></label>
                                            <select
                                                name="role"
                                                className={`form-control ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.role}
                                            >
                                                <option value="">Select Reporting Currency</option>
                                                <option value="">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                            {formik.touched.role && formik.errors.role && <div className="text-danger">{formik.errors.role}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <div className={`mb-3 ${formik.touched.role && formik.errors.role ? 'has-error' : ''}`}>
                                            <label className="form-label">Other Currencies <i className="text-danger"></i></label>
                                            <select
                                                name="role"
                                                className={`form-control ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
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
                                   
                                </div>
                            </TabPane>
                            <TabPane tabId="3">
                                <UsersTable/>
                            </TabPane>


                        </TabContent>
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

    )
}

export default CompanyForm