import React, { useState } from 'react'
import Select from "react-select";
import { Modal } from 'reactstrap';
import './reactSelect.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePost } from 'hook/usePost';
import { useEffect } from 'react';
import { showToast } from 'helpers/utility';
import { usePut } from 'hook/usePut';
import LoadingSpinner from 'components/CustomBizERP/LoadingSpinner';
import { useGetStatic } from 'hook/useGetStatic';





// "{
//   ""FirstName"":""david"",
// ""Email"":""evening@mail.com"",
//   ""LastName"":""tetteh"",

//  ""OtherNames"":"""",
//  ""createdBy"":"""",

//   ""Password"":""TomF0rd@123"",
// ""phoneNumber"":"""",
//  ""RoleId"":"""",
//  ""CustomerId"":""""
// }"

const initialValues = {
  firstName: '',
  lastName: '',
  otherNames: "",
  userName: '',
  roleId: '',
  email: '',
  phoneNumber: '',
  status: "Inactive",
  password: "",
  CustomerId: "",
  userType:""
  //confirmPassword:""
};


function UserForm({ roles, setShowLoading, modal_backdrop, setmodal_backdrop, setMinimized, userInfo, setuserInfo }) {
  const [selectedMulti, setselectedMulti] = useState(null);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string(),//.required('First Name is required'),
    lastName: Yup.string(),//.required('Last Name is required'),
    userName: Yup.string().required('Username is required'),
    roleId: Yup.string(),
    userType: Yup.string(),
    email: Yup.string().email('Invalid email'),//.required('Email is required'),
    phoneNumber: Yup.string(),//.required('Phone number is required'),
    // partner: Yup.array().min(1, 'At least one partner is required'),    status: Yup.number(),
    password: Yup.string(),//.required('Password is required'),
    // confirmPassword: Yup.string()
    //   .oneOf([Yup.ref('password'), null], 'Passwords must match')
    //   .required('Confirm Password is required'),
    customerId: Yup.string(),
  });

  const onsuccess = (data) => {
    // setmodal_backdrop(false)
    //   console.log({onsuccess:data});
  }

  const onError = (error) => {

  }
  const onPutError = (error) => {

    console.log({ onPutError: error });
    showToast("error", error?.code, "Notice")


    setShowLoading(false)



  }
  const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Users`, "users", onsuccess, onError)
  const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Users/${userInfo?.id}`, "users", onsuccess, onPutError)

  console.log({ onsuccess: isSuccess });

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: (values, { resetForm }) => {

      // console.log({values});
      // return

      userInfo?.id ? putMutate({ ...values, status: values?.status}) :
        mutate(values)

    },
  });

  useEffect(() => {
    if (isSuccess) {
      setmodal_backdrop(false)
      showToast("success", "User Created Successfully", "Notice")
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
    if (isPutSuccess) {
      //setmodal_backdrop(false)
      showToast("success", "User Updated Successfully", "Notice")
      //formik.resetForm()
      setShowLoading(false)
      //setuserInfo({})
    }
    if (isPutLoading) {
      setShowLoading(isPutLoading)
    }



    return () => {

    }
  }, [isPutSuccess, isPutLoading])

  const handleStatusChange = (evnt) => {
    if (evnt.target.checked) {
      formik.setFieldValue('status', "Active")
    } else {
      formik.setFieldValue('status', "Inactive")
    }
  }




  useEffect(() => {
    formik.resetForm()
    console.log({userInfo});
    if (userInfo?.id) {
      console.log({ userInfo });
      formik.setFieldValue('firstName', userInfo?.firstName || '');
      formik.setFieldValue('lastName', userInfo?.lastName || '');
      formik.setFieldValue('otherNames', userInfo?.otherNames || '');
      formik.setFieldValue('userName', userInfo?.userName || '');
      formik.setFieldValue('roleId', userInfo?.userRole?.id || '');
      formik.setFieldValue('email', userInfo?.email || '');
      formik.setFieldValue('phoneNumber', userInfo?.phoneNumber || '');
      formik.setFieldValue('status', userInfo?.status);
      formik.setFieldValue('password', userInfo?.password || '');
      formik.setFieldValue('customerId', userInfo?.customerId || '');
      formik.setFieldValue('userType', userInfo?.userType || '');

      // Object.keys(userInfo).forEach(fieldName => { userType
      //   formik.setFieldValue(fieldName, userInfo[fieldName]);
      // });
    }

    return () => {

    }
  }, [userInfo])




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
          {userInfo?.id ? `Edit ${userInfo?.firstName} ${userInfo.lastName}` : 'Add User'}</h5>

        <div>
          <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
          <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
            onClick={() => {
              setmodal_backdrop(false);
              formik.resetForm()
              setuserInfo({})
            }} aria-label="Close"><i className="mdi mdi-close"></i></button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="modal-body">
          <div className="row">
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.firstName && formik.errors.firstName ? 'has-error' : ''}`}>
                <label className="form-label">First Name <i className="text-danger"></i></label>
                <input
                  type="text"
                  name="firstName"
                  className={`form-control form-control-sm ${formik.touched.firstName && formik.errors.firstName ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.firstName}
                  autoComplete="off"
                  placeholder="Enter first name"
                />
                {formik.touched.firstName && formik.errors.firstName && <div className="text-danger">{formik.errors.firstName}</div>}
              </div>
            </div>
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.lastName && formik.errors.lastName ? 'has-error' : ''}`}>
                <label className="form-label">Last Name <i className="text-danger"></i></label>
                <input
                  type="text"
                  name="lastName"
                  className={`form-control form-control-sm ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lastName}
                  autoComplete="off"
                  placeholder="Enter last name"
                />
                {formik.touched.lastName && formik.errors.lastName && <div className="text-danger">{formik.errors.lastName}</div>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-md-6">
              <div className={`mb-3`}>
                <label className="form-label">Other Name<i className="text-danger"></i></label>
                <input
                  type="text"
                  name="otherNames"
                  className={`form-control form-control-sm`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.otherNames}
                  autoComplete="off"
                  placeholder="Enter other name"
                />

              </div>
            </div>
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.userName && formik.errors.userName ? 'has-error' : ''}`}>
                <label className="form-label">Username <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="userName"
                  className={`form-control form-control-sm ${formik.touched.userName && formik.errors.userName ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.userName}
                  autoComplete="off"
                  placeholder="Enter username"
                />
                {formik.touched.userName && formik.errors.userName && <div className="text-danger">{formik.errors.userName}</div>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.email && formik.errors.email ? 'has-error' : ''}`}>
                <label className="form-label">Email <i className="text-danger"></i></label>
                <input
                  type="text"
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
              <div className={`mb-3 ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'has-error' : ''}`}>
                <label className="form-label">Phone Number <i className="text-danger"></i></label>
                <input
                  type="text"
                  name="phoneNumber"
                  className={`form-control form-control-sm ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.phoneNumber}
                  autoComplete="off"
                  placeholder="Enter phone number"
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && <div className="text-danger">{formik.errors.phoneNumber}</div>}
              </div>
            </div>
          </div>
          <div className="row">

            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.roleId && formik.errors.roleId ? 'has-error' : ''}`}>
                <label className="form-label">Role <i className="text-danger"></i></label>
                <select
                  name="roleId"
                  className={`form-select form-select-sm ${formik.touched.roleId && formik.errors.roleId ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.roleId}
                >
                  <option value="">Select Role</option>
                  {
                    roles.map(x => <option key={x?.code} value={x?.id}>{x?.name}</option>)
                  }

                </select>
                {formik.touched.roleId && formik.errors.roleId && <div className="text-danger">{formik.errors.roleId}</div>}
              </div>
            </div>
            {/* <div className="col-6">
              <div className="mb-3">
                <label className="form-label">&nbsp;</label>
                <div className="input-group input-group-sm">
                  Status &nbsp; &nbsp;
                  <div className="form-check form-switch">
                    <input className="form-check-input switch-status" onChange={handleStatusChange} defaultChecked={userInfo.status === 1 ? true : false} type="checkbox" id="chkStatus" value="0" />
                  </div>
                </div>
              </div>
            </div> */}

            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.userType && formik.errors.userType ? 'has-error' : ''}`}>
                <label className="form-label">User Type <i className="text-danger"></i></label>
                <select
                  name="userType"
                  className={`form-select form-select-sm ${formik.touched.userType && formik.errors.userType ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.userType}
                >
                  <option value="">Select User Type</option>
                  {
                    ["STANDARD","POS","SELF_SERVICE"].map(x => <option key={x} value={x}>{x}</option>)
                  }

                </select>
                {formik.touched.userType && formik.errors.userType && <div className="text-danger">{formik.errors.userType}</div>}
              </div>
            </div>


          </div>
          <div className="row">
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.password && formik.errors.password ? 'has-error' : ''}`}>
                <label className="form-label">Password <i className="text-danger"></i></label>
                <input
                  type="password"
                  name="password"
                  className={`form-control form-control-sm ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  autoComplete="off"
                  placeholder="Enter password"
                />
                {formik.touched.password && formik.errors.password && <div className="text-danger">{formik.errors.password}</div>}
              </div>
            </div>

            <div className="col-6">
              <div className="mb-3">
                <label className="form-label">Status </label>
                <div className="form-check form-switch form-switch-md mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="customSwitchsizemd"
                    onChange={handleStatusChange} defaultChecked={userInfo.status === "Active" ? true : false}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="customSwitchsizemd"
                  >
                    {formik.values.status}
                  </label>
                </div>

              </div>
            </div>

            {/* <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'has-error' : ''}`}>
                <label className="form-label">Confirm Password <i className="text-danger">*</i></label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-control form-control-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.confirmPassword}
                  autoComplete="off"
                  placeholder="Confirm password"
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="text-danger">{formik.errors.confirmPassword}</div>}
              </div>
            </div> */}


          </div>

        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-sm btn-light" onClick={() => {
            setmodal_backdrop(false);
            formik.resetForm()
            setuserInfo({})
          }}>Close</button>
          <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i> {userInfo?.id ? 'Update' : 'Save'} </button>
        </div>
      </form>



    </Modal>
  )
}

export default UserForm