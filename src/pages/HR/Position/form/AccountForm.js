import React, { useState } from 'react'
import Select from "react-select";
import { Modal, Col } from 'reactstrap';
import './reactSelect.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePost } from 'hook/usePost';
import { useEffect } from 'react';
import { showToast } from 'helpers/utility';
import { useGet } from 'hook/useGet';
import { usePut } from 'hook/usePut';
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import { useRef } from 'react';
import LoadingSpinner from 'components/CustomBizERP/LoadingSpinner';
import { useGetById } from 'hook/useGetById';



const validationSchema = Yup.object().shape({
  // code: Yup.string().required('Code is required'),
  name: Yup.string().required('Name is required'),
  parentPositionId: Yup.number(),
  comments: Yup.string(),
  status: Yup.string(),
  isManager: Yup.string(),
  payGradeId: Yup.number(),
  vacant: Yup.string(),
  effectiveDate:Yup.string(),
  endDate:Yup.string(),
  fte: Yup.number(),//.required('Type is required'),
  massPosition: Yup.string()//.required('Curreny is required')
  // currencies: Yup.array()
  //   .min(1, 'At least one currency must be selected')
  //   .required('At least one currency must be selected'),
});


const initialValues = {
  // code: '',
  name: '',
  comments: "",
  parentPositionId: 0,
  status: 'Active',
  payGradeId: 0,
  isManager: "No",
  massPosition: 'No',
  fte: 0,
  vacant: "Yes",
  effectiveDate:"",
  endDate:""
};





function AccountForm({ data:positions, accountTypes, accountInfo, setAccountInfo, modal_backdrop, setmodal_backdrop, setMinimized }) {
  const [selectedMulti, setselectedMulti] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showLoading, setShowLoading] = useState(false)
  const isCashAccountRef = useRef(null)
  const isCountrolAccountRef = useRef(null)
  const [selectedGroup, setselectedGroup] = useState(null);
  const [subAccount, setSubAccount] = useState([])
  function handleMulti(selectedMulti) {
    setselectedMulti(selectedMulti);
  }

  const onsuccess = (data) => {
    showToast("success", "Position Created Successfully", "Notice")
    setmodal_backdrop(false)
    console.log({ onsuccess: data });
    setShowLoading(false)
  }

  const onPutsuccess = (data) => {
    showToast("success", "Position Updated Successfully", "Notice")
    
    setShowLoading(false)
  }

  const onPutError = (error) => {

    console.log({ onPutError: error });
    showToast("error", error?.message, "Notice")

    setShowLoading(false)
  }

  const onError = (error) => {
    // console.log({ onError: error });
  }
  const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Position`, "positions", onsuccess, onError)
  const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Position/${accountInfo?.id}`, "positions", onPutsuccess, onPutError)

  const resetForm = () => {
    setmodal_backdrop(false);
    setAccountInfo({})
    // isCashAccountRef.current.checked = false
    isCountrolAccountRef.current.checked = false
    setSelectedOptions([])
  }


  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {

      setShowLoading(true)

      const postObj = {
        ...values,
        fte: Number(values.fte),
        code:"POC_" + values?.name
      }

      // console.log({postObj});

      // return

      accountInfo?.id ? putMutate(postObj) :
        mutate(postObj)

    },
  });

  const handleIsCashAccount = (evnt) => {
    if (evnt.target.checked) {
      formik.setFieldValue('isCashAccount', "Yes")
    } else {
      formik.setFieldValue('isCashAccount', "No")
    }
  }
  const handleisCountrolAccount = (evnt) => {
    if (evnt.target.checked) {
      formik.setFieldValue('isManager', "Yes")
    } else {
      formik.setFieldValue('isManager', "No")
    }

  }
  const handleStatusChange = (evnt) => {
    if (evnt.target.checked) {
      formik.setFieldValue('status', "Active")
    } else {
      formik.setFieldValue('status', "Inactive")
    }
  }
  useEffect(() => {
    if (isSuccess) {
      setmodal_backdrop(false)
      // showToast("success", "Account Created Successfully", "Notice")
      formik.resetForm()
    }
    if (isPutSuccess) {
      //setmodal_backdrop(false)
      // showToast("success", "Account Updateed Successfully", "Notice")
      //formik.resetForm()
      // setAccountInfo({})
      //resetForm()
    }

    return () => {

    }
  }, [isSuccess, isPutSuccess])

  const handleSelectGroup = (selectedGroup) => {
    setselectedGroup(selectedGroup)

    console.log({ selectedGroupVal: selectedGroup?.value, selectedGroup });
    formik.setFieldValue('parentPositionId', selectedGroup?.value)

  }



  // useEffect(() => {

  //   formik.setFieldValue('currencies', selectedOptions)

  //   return () => {

  //   }
  // }, [selectedOptions])


  useEffect(() => {
    formik.resetForm()
    setselectedGroup(null)
    setSubAccount([])
    if (accountInfo?.id) {
     
        formik.setFieldValue("name", accountInfo?.name);
        formik.setFieldValue("comments", accountInfo?.comments);
        formik.setFieldValue("status", accountInfo?.status);
        formik.setFieldValue("payGradeId", accountInfo?.payGradeId);
        formik.setFieldValue("massPosition", accountInfo?.massPosition);
        formik.setFieldValue("fte", accountInfo?.fte);
        formik.setFieldValue("vacant", accountInfo?.vacant);
        formik.setFieldValue("effectiveDate", accountInfo?.effectiveDate.split("T")[0]);
        formik.setFieldValue("endDate", accountInfo?.endDate.split("T")[0]);

        formik.setFieldValue("parentPositionId", accountInfo?.parentPosition?.parentPositionId)

    
      // const selectedParent = accounts.find(x => x?.id === +accountInfo?.parentId)
      setselectedGroup({ value: accountInfo?.parentPosition?.parentPositionId, label: accountInfo?.parentPosition?.name })
      // setSubAccount(accountInfo?.childrenAccounts)

      setmodal_backdrop(true)
    }

    return () => {

    }
  }, [accountInfo])

  console.log({ accountInfo });


  // if (isPutLoading || isLoading || showLoading) {
  //   return <LoadingSpinner />
  // }


  return (
    <>
    {
            isPutLoading ||isLoading ?
                <div id="preloader">
                    <div id="status">
                        <div className="spinner-chase">
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                        </div>
                    </div>
                </div> : null
        }

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
        <h5 className="modal-title" id="staticBackdropLabel">
          {accountInfo?.id ? `Edit ${accountInfo?.name}` : 'Add Position'}</h5>

        <div>
          <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
          <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
            onClick={resetForm} aria-label="Close"><i className="mdi mdi-close"></i></button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className='row1'>
        <div className="modal-body">
          <div className="row">
            {/* <div className="col col-md-4">
              <div className={`mb-3 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                <label className="form-label">Code <i className="text-danger">*</i></label>
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
            </div> */}
            <div className="col col-md-8">
              <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                <label className="form-label">Name <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="name"
                  className={`form-control form-control-sm ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  autoComplete="off"
                  placeholder="Enter position name"
                />
                {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
              </div>
            </div>
            <div className="col col-md-4">
              <div className={`mb-3 ${formik.touched.vacant && formik.errors.vacant ? 'has-error' : ''}`}>
                <label className="form-label">Vacant <i className="text-danger"></i></label>
                <select
                name='vacant'
                 className='form-select form-select-sm'
                 onBlur={formik.handleBlur}
                 onChange={formik.handleChange}
                 value={formik.values.vacant}
                 >
                  <option value={"Yes"}>Yes</option>
                  <option value={"No"}>No</option>
                </select>
                {/* <input
                  type="text"
                  name="code"
                  className={`form-control form-control-sm ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.code}
                  autoComplete="off"
                  placeholder="Code"
                />
                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>} */}
              </div>
            </div>
          </div>
          <div className="row">
          <div className="col col-md-8 col-sm-12">
              <div className={`mb-3`}>
                <label className="form-label">Parent Position <i className="text-danger"></i></label>
                <Select
                  value={selectedGroup}
                  onChange={(value) => {
                    handleSelectGroup(value)
                  }}
                  options={positions.map(x =>({value: x?.id, label: x?.name}))}
                  className="select2-selection"
                />


              </div>
            </div>
            <div className="col col-md-4">
              <div className={`mb-3 ${formik.touched.fte && formik.errors.fte ? 'has-error' : ''}`}>
                <label className="form-label">Full Time Equivalent <i className="text-danger"></i></label>
                <input
                  type="text"
                  name="fte"
                  className={`form-control form-control-sm ${formik.touched.fte && formik.errors.fte ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fte}
                  autoComplete="off"
                  placeholder="Enter FTE"
                />
                {formik.touched.fte && formik.errors.fte && <div className="text-danger">{formik.errors.fte}</div>}
              </div>
            </div>
           
          </div>
          <div className='row'>
            <div className="col col-md-8 col-sm-12">
              <div className={`mb-3 ${formik.touched.payGradeId && formik.errors.payGradeId ? 'has-error' : ''}`}>
                <label className="form-label">Pay Grade <i className="text-danger"></i></label>
                <select
                  name="payGradeId"
                  className={`form-select form-select-sm ${formik.touched.payGradeId && formik.errors.payGradeId ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.payGradeId}
                >
                  <option value="">Select Pay Grade</option>
                  {/* {
                    account.payGradeIds.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                  } */}


                </select>
                {formik.touched.payGradeId && formik.errors.payGradeId && <div className="text-danger">{formik.errors.payGradeId}</div>}
              </div>
            </div>
            <div className="col col-md-4 col-sm-12">
              <div className={`mb-3 ${formik.touched.massPosition && formik.errors.massPosition ? 'has-error' : ''}`}>
                <label className="form-label">Mass Position <i className="text-danger"> </i></label>
                <select
                  name="massPosition"
                  className={`form-select form-select-sm ${formik.touched.massPosition && formik.errors.massPosition ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.massPosition}
                >
               
                  <option value={"Yes"}>Yes</option>
                  <option value={"No"}>No</option>
                
                  {/* {
                    accountTypes.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                  } */}


                </select>
                {formik.touched.massPosition && formik.errors.massPosition && <div className="text-danger">{formik.errors.massPosition}</div>}
              </div>
            </div>
          </div>
          <div className='row'>

            <div className="col col-md-6 col-sm-12">
              <div className={`mb-3 ${formik.touched.effectiveDate && formik.errors.effectiveDate ? 'has-error' : ''}`}>
                <label className="form-label">Start Date<i className="text-danger"></i></label>
                <input
                  name="effectiveDate"
                  type='date'
                  className={`form-control form-control-sm ${formik.touched.effectiveDate && formik.errors.effectiveDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.effectiveDate}
                />



                {formik.touched.effectiveDate && formik.errors.effectiveDate && <div className="text-danger">{formik.errors.effectiveDate}</div>}
              </div>

            </div>
            <div className="col col-md-6 col-sm-12">
              <div className={`mb-3 ${formik.touched.endDate && formik.errors.endDate ? 'has-error' : ''}`}>
                <label className="form-label">End Date<i className="text-danger"></i></label>
                <input
                  name="endDate"
                  type='date'
                  className={`form-control form-control-sm ${formik.touched.endDate && formik.errors.endDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.endDate}
                />



                {formik.touched.endDate && formik.errors.endDate && <div className="text-danger">{formik.errors.endDate}</div>}
              </div>

            </div>
           
          </div>
          <div className="row">
          <div className="col">
              <div className={`mb-3`}>
                <label className="form-label">Commnet<i className="text-danger"></i></label>
                <textarea
                  name="comments"
                  className={`form-control form-control-sm`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.comments}
                  autoComplete="off"
                  placeholder="Enter commnet"
                  rows={2}
                ></textarea>

              </div>
            </div>

          </div>

          {/* <div className='row mb-3' hidden>
            <div className="col col-md-6">
              <div className="form-check form-check-end">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isCashAccount"
                  name="isCashAccount"
                  ref={isCashAccountRef}
                  onChange={handleIsCashAccount}
                  defaultChecked={accountInfo.isCashAccount === 'Yes' ? true : false}
                />
                <label
                  className="form-check-label"
                  htmlFor="defaultCheck2"
                >
                  Cash Account
                </label>
              </div>

            </div>
            <div className="col col-md-6">
              <div className="form-check form-check-end">

                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isCountrolAccount"
                  name="isCountrolAccount"
                  ref={isCountrolAccountRef}
                  onChange={handleisCountrolAccount}
                  defaultChecked={accountInfo.isCountrolAccount === 'Yes' ? true : false}
                />
                <label
                  className="form-check-label"
                  htmlFor="defaultCheck2"
                >
                  Control Account
                </label>
              </div>

            </div>
          </div> */}
          <div className='row'>
            <div className="col col-md-6">
              <div className="form-check form-check-end mt-3">

                <input
                  className="form-check-input form-check-input-sm "
                  type="checkbox"
                  id="isManager"
                  name="isManager"
                  ref={isCountrolAccountRef}
                  onChange={handleisCountrolAccount}
                  defaultChecked={accountInfo?.isManager === 'Yes' || accountInfo?.isManager === 'yes' ? true : false}
                />
                <label
                  className="form-check-label"
                  htmlFor="defaultCheck2"
                >
                  Is Manager
                </label>
              </div>

            </div>
            <div className="col col-md-6" style={{ marginTop: -20 }}>
              <div className="col-6">
                <div className="mb-0">
                  <label className="form-label">&nbsp;</label>
                  <div className="input-group input-group-sm">
                    Status &nbsp; &nbsp;
                    <div className="form-check form-switch ">
                      <input className="form-check-input form-check form-switch switch-status " onChange={handleStatusChange} defaultChecked={accountInfo.status === 'Active' ? true : false} type="checkbox" id="chkStatus" value="0" />
                      <label>
                      &nbsp;&nbsp;{formik.values.status === "Active" ? "Active":"Inactive"}
                      </label>
                    </div>
                      
                  </div>
                </div>
              </div>
              <div className={`mb-3 ${formik.touched.status && formik.errors.status ? 'has-error' : ''}`} hidden>
                <label className="form-label">Status <i className="text-danger">*</i></label>
                <select
                  name="status"
                  className={`form-select form-select-sm ${formik.touched.status && formik.errors.status ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.status}
                >

                  <option value='Active'>Active</option>
                  <option value='Inactive'>Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && <div className="text-danger">{formik.errors.status}</div>}
              </div>
            </div>



          </div>




        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-sm btn-light" onClick={resetForm}>Close</button>
          <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i>{
            accountInfo?.id ? 'Update' : 'Save'}</button>
        </div>
      </form>



    </Modal>
    </>
   
  )
}

export default AccountForm