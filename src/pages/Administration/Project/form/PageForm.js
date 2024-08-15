import React, { useRef, useState } from 'react'
import Select from "react-select";
import { Modal } from 'reactstrap';
import './reactSelect.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePost } from 'hook/usePost';
import { useEffect } from 'react';
import { showToast } from 'helpers/utility';
import { usePut } from 'hook/usePut';
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from 'react-icons/fa';



const validationSchema = Yup.object().shape({
  code: Yup.string().required('Code is required'),
  name: Yup.string().required('Name is required'),
  parentId: Yup.number(),//.required('Parent project is required'),
  startDate: Yup.string(),//.required('Start Date is required'),
  endDate: Yup.string(),//.required('Dnd Date is required'),
  status: Yup.string(),
  description: Yup.string()

});




const initialValues = {
  code: '',
  name: '',
  parentId: 0,
  startDate: '',
  endDate: '',
  description: "",
  status: "Inactive"

};



function PageForm({ rowInfo, data: parentCenters, setShowLoading, modal_backdrop, setmodal_backdrop, setMinimized }) {
  const [selectedGroup, setselectedGroup] = useState({ label: "", value: 0 });
  const flatpickrRef = useRef(null);
  const flatpickrRef2 = useRef(null);

  const openFlatpickr = () => {
    flatpickrRef?.current?.flatpickr.open();
  };
  const openFlatpickr2 = () => {
    flatpickrRef2?.current?.flatpickr.open();
  };
  const onsuccess = (data) => {

  }

  const onError = (error) => {
    console.log({ onPutError: error });
    showToast("error", error?.message, "Notice")

    setShowLoading(false)
  }
  const onPutsuccess = (data) => {
    showToast("success", "Project Updated Successfully", "Notice")

    setShowLoading(false)
  }

  const onPutError = (error) => {

    console.log({ onPutError: error });
    showToast("error", error?.message, "Notice")

    setShowLoading(false)
  }
  const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Project`, "projects", onsuccess, onError)

  const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Project/${rowInfo?.id}`, "projects", onPutsuccess, onPutError)


  console.log({ onsuccess: isSuccess });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {


      rowInfo?.id ? putMutate(values) :
        mutate(values)

    },
  });

  useEffect(() => {
    if (isSuccess) {
      setmodal_backdrop(false)
      showToast("success", "Project Created Successfully", "Notice")
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
    formik.resetForm()
    if (rowInfo?.id) {
      console.log({ rowInfo });
      formik.setFieldValue('code', rowInfo?.code || '');
      formik.setFieldValue('name', rowInfo?.name || '');
      formik.setFieldValue('startDate', rowInfo?.startDate ? rowInfo?.startDate.split("T")[0] : '');
      formik.setFieldValue('endDate', rowInfo?.endDate ? rowInfo?.endDate.split("T")[0] : '');
      formik.setFieldValue('description', rowInfo?.description || '');
      formik.setFieldValue('status', rowInfo?.status);
      formik.setFieldValue('parentId', rowInfo?.parentId);
    }

    return () => {

    }
  }, [rowInfo])

  const formReset = () => {
    formik.resetForm()
  }

  const handleStatusChange = (evnt) => {
    if (evnt.target.checked) {
      formik.setFieldValue('status', "Active")
    } else {
      formik.setFieldValue('status', "Inactive")
    }
  }

  const handleSelectGroup = (selectedGroup) => {
    setselectedGroup(selectedGroup)
    formik.setFieldValue('parentId', selectedGroup?.value || 0)
  }



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
        <h5 className="modal-title" id="staticBackdropLabel">{
          rowInfo?.id ? `Edit ${rowInfo?.name}` : "Add Project"
        }</h5>

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
                <label className="form-label">Code <i className="text-danger"></i></label>
                <input
                  type="text"
                  name="code"
                  className={`form-control form-control-sm ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.code}
                  autoComplete="off"
                  placeholder="Code"
                />
                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
              </div>
            </div>
            <div className="col col-md-8">
              <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                <label className="form-label">Name <i className="text-danger"></i></label>
                <input
                  type="text"
                  name="name"
                  className={`form-control form-control-sm ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  autoComplete="off"
                  placeholder="Enter project name"
                />
                {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-md-6">
              <div >
                <label className="form-label">Start Date <i className="text-danger">*</i></label>
                <div className="input-group">
                  <Flatpickr
                    className="form-control form-control-sm"
                    placeholder="dd M, yyyy"
                    name="startDate"
                    value={formik.values.startDate}
                    options={{
                      altInput: true,
                      altFormat: "d M, Y",
                      dateFormat: "Y-m-d"
                    }}
                    ref={flatpickrRef}
                    onChange={(selectedDates) => {
                      const selectedDate = selectedDates[0];

                      // Ensure a valid date is selected
                      if (selectedDate) {
                        // Convert the date to a string
                        const dateString = selectedDate.toISOString().split('T')[0];

                        // Create a synthetic event object to simulate the behavior of a real event
                        const event = {
                          target: {
                            name: "startDate",
                            value: dateString
                          }
                        };

                        // Call formik.handleChange with the synthetic event
                        formik.handleChange(event);
                      }
                    }}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text" onClick={openFlatpickr}>
                      <FaCalendar />
                    </span>
                  </div>
                </div>

                {formik.touched.startDate && formik.errors.startDate && <div className="text-danger">{formik.errors.startDate}</div>}
              </div>
            </div>
            <div className="col col-md-6">
              <div >
                <label className="form-label">End Date <i className="text-danger">*</i></label>
                <div className="input-group">
                  <Flatpickr
                    className="form-control form-control-sm"
                    placeholder="dd M, yyyy"
                    name="endDate"
                    value={formik.values.endDate}
                    options={{
                      altInput: true,
                      altFormat: "d M, Y",
                      dateFormat: "Y-m-d"
                    }}
                    ref={flatpickrRef2}
                    onChange={(selectedDates) => {
                      const selectedDate = selectedDates[0];

                      // Ensure a valid date is selected
                      if (selectedDate) {
                        // Convert the date to a string
                        const dateString = selectedDate.toISOString().split('T')[0];

                        // Create a synthetic event object to simulate the behavior of a real event
                        const event = {
                          target: {
                            name: "endDate",
                            value: dateString
                          }
                        };

                        // Call formik.handleChange with the synthetic event
                        formik.handleChange(event);
                      }
                    }}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text" onClick={openFlatpickr2}>
                      <FaCalendar />
                    </span>
                  </div>
                </div>

                {formik.touched.endDate && formik.errors.endDate && <div className="text-danger">{formik.errors.endDate}</div>}
              </div>
            </div>
            <div className="col col-md-6" hidden>
              <div className={`mb-3 ${formik.touched.startDate && formik.errors.startDate ? 'has-error' : ''}`}>
                <label className="form-label">Start Date <i className="text-danger"></i></label>
                <input
                  type="date"
                  name="startDate"
                  className={`form-control form-control-sm ${formik.touched.startDate && formik.errors.startDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.startDate}
                  autoComplete="off"
                  placeholder="Enter Start Date"
                />
                {formik.touched.startDate && formik.errors.startDate && <div className="text-danger">{formik.errors.startDate}</div>}
              </div>
            </div>
            <div className="col col-md-6" hidden>
              <div className={`mb-3 ${formik.touched.endDate && formik.errors.endDate ? 'has-error' : ''}`}>
                <label className="form-label">End Date <i className="text-danger"></i></label>
                <input
                  type="date"
                  name="endDate"
                  className={`form-control form-control-sm ${formik.touched.endDate && formik.errors.endDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.endDate}
                  autoComplete="off"
                  placeholder="Enter EndDate"
                />
                {formik.touched.endDate && formik.errors.endDate && <div className="text-danger">{formik.errors.endDate}</div>}
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col">
              <div className={`mb-3`}>
                <label className="form-label">Description<i className="text-danger"></i></label>
                <textarea
                  name="description"
                  className={`form-control form-control-sm`}
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
            <div className="col">
              <div className={`mb`}>
                <label className="form-label">Parent Project <i className="text-danger"></i></label>
                <Select
                  value={selectedGroup}
                  onChange={(value) => {
                    handleSelectGroup(value)
                  }}
                  // options={accounts.map(x => ({ label: x?.name, value: x?.id }))}
                  options={parentCenters.map(x => ({ value: x?.id, label: x?.name }))}
                  className="select2-selection"
                  placeholder="Select Parent Project"
                />
                {/* <select
                  name="parentId"
                  className={`form-select`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.parentId}
                >
                  <option value={0}>Select account</option>
                  {
                    accounts.map(x => <option key={x?.code} value={x?.id}>{x?.name}</option>)
                  }


                </select> */}

              </div>
            </div>
            {/* <div className="col col-md-4">
              <div className={`mb-3 ${formik.touched.status && formik.errors.status ? 'has-error' : ''}`}>
                <label className="form-label">Status <i className="text-danger"></i></label>
                <select
                  name="status"
                  className={`form-control form-control-sm ${formik.touched.status && formik.errors.status ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.status}
                >

                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && <div className="text-danger">{formik.errors.status}</div>}
              </div>
            </div> */}
          </div>
          <div className='row mt-3'>
            <div className="col-6">
              <div className="mb-3">
                <label className="form-label">Status </label>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="customSwitchsizemd"
                    onChange={handleStatusChange} defaultChecked={rowInfo.status === "Active" ? true : false}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="customSwitchsizemd"
                  >
                    {formik.values.status === "Active" ? "Active" : "Inactive"}
                  </label>
                </div>

              </div>
            </div>
            {/* <div className="col col-md-6">
              <div className="col-6">
                <div className="mb-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="input-group input-group-sm">
                    Status &nbsp; &nbsp;
                    <div className="form-check form-switch">
                      <input className="form-check-input switch-status" onChange={handleStatusChange} defaultChecked={rowInfo.status === 'Active' ? true : false} type="checkbox" id="chkStatus" value="0" />
                    </div>
                  </div>
                </div>
              </div>
              <div className={`mb-3 ${formik.touched.status && formik.errors.status ? 'has-error' : ''}`} hidden>
                <label className="form-label">Status <i className="text-danger">*</i></label>
                <select
                  name="status"
                  className={`form-select ${formik.touched.status && formik.errors.status ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.status}
                >

                  <option value='Active'>Active</option>
                  <option value='Inactive'>Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && <div className="text-danger">{formik.errors.status}</div>}
              </div>
            </div> */}
          </div>


        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-light" onClick={() => {
            setmodal_backdrop(false);
          }}>Close</button>
          <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>{rowInfo?.id ? "Update" : "Save"}</button>
        </div>
      </form>



    </Modal>
  )
}

export default PageForm