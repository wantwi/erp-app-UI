import React, { useState } from 'react'
import Select from "react-select";
import { Modal, Col } from 'reactstrap';
import './reactSelect.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePost } from 'hook/usePost';
import { useEffect } from 'react';
import { showToast } from 'helpers/utility';



const validationSchema = Yup.object().shape({
  code: Yup.string().required('Code is required'),
  name: Yup.string().required('Name is required'),
  parent: Yup.string(),
  description: Yup.string(),
  status: Yup.boolean(),
  accountType: Yup.string().required('Type is required')
});



const initialValues = {
  code: '',
  name: '',
  description: "",
  parent: '',
  status: true,
  accountType: ""
};



function AccountForm({ modal_backdrop, setmodal_backdrop, setMinimized }) {
  const onsuccess = (data) => {
    setmodal_backdrop(false)
    console.log({ onsuccess: data });
  }

  const onError = (error) => {

  }
  const { mutate, isSuccess } = usePost("/api/User", "user", onsuccess, onError)

  console.log({ onsuccess: isSuccess });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      // Handle form submission logic here
      // console.log({values});

      return
      mutate(values)

    },
  });
  useEffect(() => {
    if (isSuccess) {
      setmodal_backdrop(false)
      showToast("success", "User Created Successfully", "Notice")
      formik.resetForm()
    }

    return () => {

    }
  }, [isSuccess])



  return (
    <Modal
      isOpen={modal_backdrop}
      toggle={() => {
        tog_backdrop();
      }}
      backdrop={'static'}
      id="staticBackdrop"
      size='md'
    >
      <div className="modal-header">
        <h5 className="modal-title" id="staticBackdropLabel">Add Account</h5>

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
                  placeholder="Code"
                />
                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
              </div>
            </div>
            <div className="col col-md-9">
              <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                <label className="form-label">Name <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  autoComplete="off"
                  placeholder="Enter account name"
                />
                {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className={`mb-3`}>
                <label className="form-label">Description<i className="text-danger"></i></label>
                <textarea
                  name="description"
                  className={`form-control`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.description}
                  autoComplete="off"
                  placeholder="Enter description"
                  rows={3}
                ></textarea>

              </div>
            </div>

          </div>
          <div className="row">

            <div className="col col-md-6">
              <div className={`mb-3`}>
                <label className="form-label">Parent Account <i className="text-danger">*</i></label>
                <select
                  name="parent"
                  className={`form-control`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.parent}
                >
                  <option value="parent">Parent</option>
                  <option value="NO">No Parent</option>

                </select>

              </div>
            </div>
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.accountType && formik.errors.accountType ? 'has-error' : ''}`}>
                <label className="form-label">Type <i className="text-danger">*</i></label>
                <select
                  name="accountType"
                  className={`form-control ${formik.touched.accountType && formik.errors.accountType ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.accountType}
                >
                  <option value="">Select type</option>
                  <option value="Asset">Asset</option>
                  <option value="Capital">Capital</option>
                  <option value="Liability">Liability</option>
                  <option value="Cost of Sales">Cost of Sales</option>
                  <option value="Operating Costs">Operating Costs</option>
                </select>
                {formik.touched.accountType && formik.errors.accountType && <div className="text-danger">{formik.errors.accountType}</div>}
              </div>
            </div>

          </div>
          <div className='row mb-3'>
          <div className="col col-md-6">
            <div className="form-check form-check-end">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck2"
              />
              <label
                className="form-check-label"
                htmlFor="defaultCheck2"
              >
                Cash Account
              </label>
            </div>

          </div>
          </div>
          <div className='row'>
          <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.status && formik.errors.status ? 'has-error' : ''}`}>
                <label className="form-label">Currency <i className="text-danger">*</i></label>
                <select
                  name="status"
                  className={`form-control ${formik.touched.status && formik.errors.status ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.status}
                >

                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && <div className="text-danger">{formik.errors.status}</div>}
              </div>
            </div>
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.status && formik.errors.status ? 'has-error' : ''}`}>
                <label className="form-label">Status <i className="text-danger">*</i></label>
                <select
                  name="status"
                  className={`form-control ${formik.touched.status && formik.errors.status ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.status}
                >

                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && <div className="text-danger">{formik.errors.status}</div>}
              </div>
            </div>

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

export default AccountForm