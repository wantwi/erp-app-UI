import React from 'react'
import { useState } from 'react';

import { Col, Modal, Nav, NavItem, NavLink, Row, TabContent,Form, TabPane, Table } from 'reactstrap';
import classnames from "classnames";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import UsersTable from './UsersTable';
import EntryTable from '../EntryTable/EntryTable';
import {useForm, useFieldArray} from "react-hook-form"

const defaultvalue ={account:"", credit:"", debit:"",commnet:""}

const validationSchema = Yup.object().shape({
    transDate: Yup.string().required('Transaction Date is required'),
    account: Yup.string().required('Account is required'),
    rate: Yup.number().integer(),
    debit_LC: Yup.number().when('currencyType', {
        is: 0,
        then: Yup.number().required('Debit LC is required when currencyType is LC'),
    }),
    debit_FC: Yup.number().when('currencyType', {
        is: 1,
        then: Yup.number().required('Debit FC is required when currencyType is FC'),
    }),
    credit_LC: Yup.number(),
    credit_FC: Yup.number(),
    comments: Yup.string(),
    currencyType: Yup.number().required('Currency Type is required'),
});


const initialValues = {
    transDate: '',
    rate: 1,
    currencyType: 0,
    debit_LC:0,
    debit_FC:0,
    credit_LC:0,
    credit_FC:0,
    comments:"",
    account:""
  
};


const CompanyForm = ({ modal_backdrop, setmodal_backdrop, setMinimized }) => {
    // const [activeTab, setActiveTab] = useState('General')
    const [activeTab, setactiveTab] = useState("1");
    const [currencyType, setCurrencyType] = useState(0)
    const [formRows, setFormRows] = useState([{ id: 1 }]);

    const onAddFormRow = () => {
        const modifiedRows = [...formRows];
        modifiedRows.push({ id: modifiedRows.length + 1 });
        setFormRows(modifiedRows);
      };
    
      const onDeleteFormRow = id => {
        if (id !== 1) {
          var modifiedRows = [...formRows];
          modifiedRows = modifiedRows.filter(x => x["id"] !== id);
          setFormRows(modifiedRows);
        }
      };

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

    console.log({formik:formik.values});


    return (
        <Modal
            isOpen={modal_backdrop}
            toggle={() => {
                tog_backdrop();
            }}
            backdrop={'static'}
            id="staticBackdrop"
            size='xl'
        >
            <div className="modal-header">
                <h5 className="modal-title" id="staticBackdropLabel">Add Journal Entry</h5>

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
                        <div className="col col-md-4">
                            <div className={`mb-3 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                                <label className="form-label">Date <i className="text-danger">*</i></label>
                                <input
                                    type="date"
                                    name="transData"
                                    className={`form-control ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.code}
                                    autoComplete="off"
                                    placeholder="Enter"
                                />
                                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                            </div>
                        </div>

                        <div className="col col-md-4">
                            <div className={`mb-3 ${formik.touched.currencyType && formik.errors.currencyType ? 'has-error' : ''}`}>
                                <label className="form-label">Currency <i className="text-danger">*</i></label>
                                <select
                                    name="currencyType"
                                    className={`form-control ${formik.touched.currencyType && formik.errors.currencyType ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.currencyType}
                                >
                                    
                                    <option value={0}>LC</option>
                                    <option value={1}>FC</option>
                                </select>
                                {formik.touched.currencyType && formik.errors.currencyType && <div className="text-danger">{formik.errors.currencyType}</div>}
                            </div>
                        </div>
                       
                        <div className="col col-md-4">
                            <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}>
                                <label className="form-label">Rate<i className="text-danger">*</i></label>
                                <input
                                    type="text"
                                    name="rate"
                                    className={`form-control ${formik.touched.rate && formik.errors.rate ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.rate}
                                    autoComplete="off"
                                    disabled = {formik.values.currencyType === "1" ? false: true}
                                    placeholder="Enter rate"
                                />
                                {formik.touched.rate && formik.errors.rate && <div className="text-danger">{formik.errors.rate}</div>}
                            </div>
                        </div>
                    </div>
                    {/* <div  className="row"> */}
                    {/* <Form className="repeater" encType="multipart/form-data"> */}
                    <div>
                        
                    </div>

                    <div  style={{maxHeight:'43vh', overflowY:'scroll', background:'#eeeeee', padding:5, overflowX:'hidden'}} hidden>
                      {(formRows || []).map((formRow, key) => (
                        <div  className="row" key={key}>
                          <Col lg={4} className="mb-3">
                            {/* <label htmlFor="name">Account</label> */}
                            <input
                              type="text"
                              id="name"
                              name="untyped-input"
                              className="form-control"
                              placeholder="Account"
                            />
                          </Col>

                          <Col lg={2} className="mb-3">
                            {/* <label htmlFor="email">Credit</label> */}
                            <input
                              type="email"
                              id="email"
                              className="form-control"
                              placeholder="Credit"
                            />
                          </Col>

                          <Col lg={2} className="mb-3">
                            {/* <label htmlFor="subject">Debit</label> */}
                            <input
                              type="text"
                              id="subject"
                              className="form-control"
                              placeholder="Debit"
                            />
                          </Col>

                          {/* <Col lg={2} className="mb-3">
                            <label htmlFor="resume">Resume</label>
                            <input
                              type="file"
                              className="form-control"
                              id="resume"
                            />
                          </Col> */}

                          <Col lg={3} className="mb-3">
                            {/* <label htmlFor="message">Comment</label> */}
                            <textarea
                              id="message"
                              className="form-control"
                              placeholder="Comment"
                            ></textarea>
                          </Col>

                          <Col lg={1} className="align-self-center">
                            <div className="d-grid">
                                <button  className="btn btn-danger"  onClick={() => onDeleteFormRow(formRow.id)}>
                                    <i className='fa fa-trash'></i>
                                </button>
                              <input
                                type="button"
                                className="btn btn-primary"
                                value="Delete"
                                onClick={() => onDeleteFormRow(formRow.id)}
                                hidden
                              />
                            </div>
                          </Col>
                        </div>
                      ))}
                    </div>
                    
                  {/* </Form> */}
                  <div className='row mt-2' hidden>
                    <div className='col-10'></div>
                    <div className='col-md-2 ' style={{alignSelf:"end"}}>
                    <button  className="btn btn-primary mb-3 mt-lg-0" style={{float:"right"}}  onClick={() => onAddFormRow()}>
                          <i className='fa fa-plus'></i>{" "} Add
                  </button>
                    </div>
                 
                  </div>
                 
                  <input
                  hidden
                      type="button"
                      className="btn btn-primary mt-3 mt-lg-0"
                      value="Add"
                      onClick={() => onAddFormRow()}
                      style={{float:"right"}}
                    />
                    {/* </div> */}
                    <fieldset style={{background:"#f8f8fb", padding:3, border:'1px solid #ebebf4'}} hidden>
                        <strong className='mb-2'>Journal Items</strong>
                        <div className="row">
                        <div className="col col-md-4">
                            <div className={`mb-3 ${formik.touched.status && formik.errors.status ? 'has-error' : ''}`}>
                                <label className="form-label">Account <i className="text-danger">*</i></label>
                                <select
                                    name="status"
                                    className={`form-control ${formik.touched.status && formik.errors.status ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.status}
                                >
                                    <option>Select Account</option>
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                                {formik.touched.status && formik.errors.status && <div className="text-danger">{formik.errors.status}</div>}
                            </div>
                        </div>
                        {
                            formik.values.currencyType !== '1' ?
                            <>
                                    <div className="col col-md-2" hidden>
                                        <div className={`mb-3 ${formik.touched.debit_FC && formik.errors.debit_FC ? 'has-error' : ''}`}>
                                            <label className="form-label">Debit(FC)<i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="debit_FC"
                                                className={`form-control ${formik.touched.debit_FC && formik.errors.debit_FC ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.debit_FC}
                                                autoComplete="off"
                                                placeholder="Enter debit(FC)"
                                            />
                                            {formik.touched.debit_FC && formik.errors.debit_FC && <div className="text-danger">{formik.errors.debit_FC}</div>}
                                        </div>
                                    </div>
                                    <div className="col col-md-2" hidden>
                                        <div className={`mb-3 ${formik.touched.credit_FC && formik.errors.credit_FC ? 'has-error' : ''}`}>
                                            <label className="form-label">Credit(FC)<i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="credit_FC"
                                                className={`form-control ${formik.touched.credit_FC && formik.errors.credit_FC ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.credit_FC}
                                                autoComplete="off"
                                                placeholder="Enter credit(FC)"
                                            />
                                            {formik.touched.credit_FC && formik.errors.credit_FC && <div className="text-danger">{formik.errors.credit_FC}</div>}
                                        </div>
                                    </div>
                                </>:
                                <>
                                    <div className="col col-md-2">
                                        <div className={`mb-3 ${formik.touched.debit_LC && formik.errors.debit_LC ? 'has-error' : ''}`}>
                                            <label className="form-label">Debit(LC)<i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="name"
                                                className={`form-control ${formik.touched.debit_LC && formik.errors.debit_LC ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.debit_LC}
                                                autoComplete="off"
                                                placeholder="Enter first name"
                                            />
                                            {formik.touched.debit_LC && formik.errors.debit_LC && <div className="text-danger">{formik.errors.debit_LC}</div>}
                                        </div>
                                    </div>
                                    <div className="col col-md-2">
                                        <div className={`mb-3 ${formik.touched.credit_LC && formik.errors.credit_LC ? 'has-error' : ''}`}>
                                            <label className="form-label">Credit(LC)<i className="text-danger">*</i></label>
                                            <input
                                                type="text"
                                                name="name"
                                                className={`form-control ${formik.touched.credit_LC && formik.errors.credit_LC ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.credit_LC}
                                                autoComplete="off"
                                                placeholder="Enter first name"
                                            />
                                            {formik.touched.credit_LC && formik.errors.credit_LC && <div className="text-danger">{formik.errors.credit_LC}</div>}
                                        </div>
                                    </div>
                                </> 
                                
                        }
                        <div className="col col-md-4">
                            <div className={`mb-3`}>
                                <label className="form-label">Commnet <i className="text-danger">*</i></label>
                                <textarea className='form-control' rows={1}></textarea>
                            </div>
                            <button style={{float:'right'}} className='btn btn-sm btn-primary'><i className='fa fa-plus'></i> Add</button>
                        </div>

                    </div>
                    </fieldset>
                    <div className='row mt-4' hidden>
                    <UsersTable />

                    </div>
                   


                    {/* Tabbed Pane */}
                    {/* <div className="row" hidden>
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
                                                placeholder="Enter first name"
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
                                                placeholder="Enter email"
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
                                                placeholder="Enter phone number"
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
                                                placeholder="Enter email"
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
                                                placeholder="Enter phone number"
                                            />
                                           
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    
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
                                                <option value="">Admin</option>
                                                <option value="user">User</option>
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
                                            <label className="form-label">Other Currencies <i className="text-danger">*</i></label>
                                            <select
                                                name="role"
                                                className={`form-control ${formik.touched.role && formik.errors.role ? 'is-invalid' : ''}`}
                                                onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.role}
                                            >
                                                <option value="">Select Home Currency</option>
                                                <option value="">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                            {formik.touched.role && formik.errors.role && <div className="text-danger">{formik.errors.role}</div>}
                                        </div>
                                    </div>

                                </div>
                            </TabPane>
                            <TabPane tabId="3">
                                <UsersTable />
                            </TabPane>


                        </TabContent>
                    </div> */}

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