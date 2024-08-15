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
import DisplaySubAccount from '../componet/DisplaySubAccount';


const validationSchema = Yup.object().shape({
  code: Yup.string().required('Code is required'),
  name: Yup.string().required('Name is required'),
  parentId: Yup.number(),
  description: Yup.string(),
  status: Yup.string(),
  isCashAccount: Yup.string(),
  isCountrolAccount: Yup.string(),
  type: Yup.number().required('Type is required'),
  currencies: Yup.number().required('Curreny is required')
  // currencies: Yup.array()
  //   .min(1, 'At least one currency must be selected')
  //   .required('At least one currency must be selected'),
});


// {
//   "name": "string",
//   "description": "string",
//   "status": "string",
//   "parentId": 0,
//   "code": "string",
//   "isCashAccount": "string",
//   "customerId": "string",
//   "currencies": [
//     0
//   ]
// }


const initialValues = {
  code: '',
  name: '',
  description: "",
  parentId: 0,
  status: 'Active',
  type: "",
  isCashAccount: "No",
  isCountrolAccount: 'No',
  currencies: 0,
  isActualAccount: "Yes"
};



function AccountForm({ accounts, accountTypes, accountInfo, setAccountInfo, modal_backdrop, setmodal_backdrop, setMinimized }) {
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
    setmodal_backdrop(false)
    console.log({ onsuccess: data });
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
  const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Accounts`, "accounts", onsuccess, onError)
  const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Accounts/${accountInfo?.id}`, "accounts", () => { }, onPutError)

  const resetForm = () => {
    setmodal_backdrop(false);
    setAccountInfo({})
    isCashAccountRef.current.checked = false
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
        type: Number(values.type)
      }


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
      formik.setFieldValue('isCountrolAccount', "Yes")
    } else {
      formik.setFieldValue('isCountrolAccount', "No")
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
      showToast("success", "Account Created Successfully", "Notice")
      formik.resetForm()
    }
    if (isPutSuccess) {
      //setmodal_backdrop(false)
      showToast("success", "Account Updateed Successfully", "Notice")
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
    formik.setFieldValue('parentId', selectedGroup?.value)

  }


  const { data: currenciesList = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies')
  const onSucess = (data) => {
    setSubAccount(data?.childrenAccounts)

  }
  const { refetch, data: accoutDetails } = useGetById(`${process.env.REACT_APP_ADMIN_URL}/Accounts/${selectedGroup?.value}`, "accounts", selectedGroup?.value, onSucess)

  console.log({ accoutDetails });

  // useEffect(() => {
  //   // setSelectedOptions([{ label: "All", value: "0" }, ...currenciesList.map(x => ({ value: x?.id, label: x?.code }))])
  //   if(selectedGroup?.value){
  //     refetch()
  //   }

  // }, [selectedGroup]);


  function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
    if (value && value.some((o) => o.value === "0")) {
      return `All ${placeholderButtonLabel} selected`;
    } else {
      return value.length > 1 ? `${value.length} currencies selected` : `${value.length} currency selected`;
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

  useEffect(() => {

    formik.setFieldValue('currencies', selectedOptions)

    return () => {

    }
  }, [selectedOptions])


  useEffect(() => {
    formik.resetForm()
    setselectedGroup(null)
    setSubAccount([])
    if (accountInfo?.id) {

      console.log({ accountInfo });

      const renderaccountInfo = {
        ...accountInfo,
        currencies: accountInfo?.currencies?.id
      }

      // setSelectedOptions(accountInfo?.currencies.map(x => ({ value: x?.id, label: x?.code })))

      // accountInfo.isCashAccount === 'Yes' ? isCashAccountRef.current.checked = true : isCashAccountRef.current.checked=false

      Object.keys(renderaccountInfo).forEach(fieldName => {
        formik.setFieldValue(fieldName, renderaccountInfo[fieldName]);
      });
      const selectedParent = accounts.find(x => x?.id === +accountInfo?.parentId)
      setselectedGroup({ value: selectedParent?.id, label: selectedParent?.name })
      setSubAccount(accountInfo?.childrenAccounts)

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
          {accountInfo?.id ? `Edit ${accountInfo?.name}` : 'Add Account'}</h5>

        <div>
          <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
          <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
            onClick={resetForm} aria-label="Close"><i className="mdi mdi-close"></i></button>
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
            <div className="col col-md-9">
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
          <div className="row row1">

            <div className="col col-md-12 col-sm-12">
              <div className={`mb-3`}>
                <label className="form-label">Parent Account <i className="text-danger"></i></label>
                <Select
                  value={selectedGroup}
                  onChange={(value) => {
                    handleSelectGroup(value)
                  }}
                  options={accounts.map(x => ({ label: x?.name, value: x?.id }))}
                  className="select2-selection"
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


          </div>
          <div className='row mb-3'>
            <div className="col col-md-8 col-sm-12">
              <div className={`mb-3 ${formik.touched.type && formik.errors.type ? 'has-error' : ''}`}>
                <label className="form-label">Type <i className="text-danger">*</i></label>
                <select
                  name="type"
                  className={`form-select form-select-sm ${formik.touched.type && formik.errors.type ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.type}
                >
                  <option value="">Select type</option>
                  {
                    accountTypes.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                  }


                </select>
                {formik.touched.type && formik.errors.type && <div className="text-danger">{formik.errors.type}</div>}
              </div>
            </div>
            <div className="col col-md-4 col-sm-12">
              <div className={`mb-3 ${formik.touched.type && formik.errors.type ? 'has-error' : ''}`}>
                <label className="form-label">Actual Account<i className="text-danger"></i></label>
                <select
                  name="isActualAccount"
                  className={`form-select form-select-sm ${formik.touched.isActualAccount && formik.errors.isActualAccount ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.isActualAccount}
                >
                  <option value="">Select Actual Account</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {formik.touched.isActualAccount && formik.errors.isActualAccount && <div className="text-danger">{formik.errors.isActualAccount}</div>}
              </div>
            </div>
          </div>
          <div className='row mb-3'>
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
          </div>
          <div className='row'>
            <div className="col col-md-6">

              <label className="form-label">Currency <i className="text-danger">*</i></label>
              <select
                name="currencies"
                className={`form-select form-select-sm ${formik.touched.currencies && formik.errors.currencies ? 'is-invalid' : ''}`}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.currencies}
              >
                <option value="">Select Currency</option>
                <option value={0}>All Currencies</option>
                {
                  currenciesList.map(x => <option key={x?.id} value={+x?.id}>{x?.code}</option>)
                }


              </select>
              {/* <div className={`${formik.touched.currencies && formik.errors.currencies ? 'b-error' : ''}`}>
                <ReactMultiSelectCheckboxes
                  options={[{ label: "All", value: "0" }, ...currenciesList.map(x => ({ value: x?.id, label: x?.code }))]}
                  placeholderButtonLabel="currencies"
                  getDropdownButtonLabel={getDropdownButtonLabel}
                  value={selectedOptions}
                  onChange={onChange}
                  setState={setSelectedOptions}
                  onBlur={formik.handleBlur}
                  
                
                />
                </div> */}

              {formik.touched.currencies && formik.errors.currencies && <div className="text-danger">{formik.errors.currencies}</div>}

            </div>

            <div className="col col-md-6">
              <div className="col-6">
                <div className="mb-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="input-group input-group-sm">
                    Status &nbsp; &nbsp;
                    <div className="form-check form-switch">
                      <input className="form-check-input switch-status" onChange={handleStatusChange} defaultChecked={accountInfo.status === 'Active' ? true : false} type="checkbox" id="chkStatus" value="0" />
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
            </div>



          </div>
          <div className='row'>

            {
              subAccount.length > 0 ? <DisplaySubAccount data={subAccount} /> : null
            }

          </div>



        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-sm btn-light" onClick={resetForm}>Close</button>
          <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i>{
            accountInfo?.id ? 'Update' : 'Save'}</button>
        </div>
      </form>



    </Modal>
  )
}

export default AccountForm