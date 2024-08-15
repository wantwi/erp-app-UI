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
import { useGet } from 'hook/useGet';





// "{
//   ""FirstName"":""david"",
// ""Email"":""evening@mail.com"",
//   ""name"":""tetteh"",

//  ""OtherNames"":"""",
//  ""createdBy"":"""",

//   ""Password"":""TomF0rd@123"",
// ""phoneNumber"":"""",
//  ""RoleId"":"""",
//  ""CustomerId"":""""
// }"

const initialValues = {
  code: '',
  name: '',
  manager: { id: "00000000-0000-0000-0000-000000000000" },
  type: { id: "00000000-0000-0000-0000-000000000000", name: "string" },
  organisationalUnitParentId: 0,
  numberOfEmployees: 0
};


function FormComponet({ employees, unitTypes, setShowLoading, modal_backdrop, setmodal_backdrop, setMinimized, userInfo, setuserInfo }) {
  const [selectedMulti, setselectedMulti] = useState(null);
  const [selectedGroup, setselectedGroup] = useState(null);
  const [selectedParent, setselectedParent] = useState(null);
  const validationSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    name: Yup.string().required('Name is required'),
    type: Yup.object().shape({
      id: Yup.string(),
      name: Yup.string(),

    }),

    manager: Yup.object().shape({
      id: Yup.string()
    }),
    organisationalUnitParentId: Yup.number(),
    numberOfEmployees: Yup.string()
  });



  const onsuccess = (data) => {
    // setmodal_backdrop(false)
    //   console.log({onsuccess:data});
  }

  const onError = (error) => {
    setShowLoading(false)
    showToast("error", error?.code, "Notice")

  }
  const onPutError = (error) => {

    console.log({ onPutError: error });
    showToast("error", error?.code, "Notice")


    setShowLoading(false)



  }
  const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/OrganisationalUnits`, "org-units", onsuccess, onError)
  const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/OrganisationalUnits/${userInfo?.id}`, "org-units", onsuccess, onPutError)

  console.log({ onsuccess: isSuccess });

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: (values, { resetForm }) => {


      // mutate({...values, numberOfEmployees:+values?.numberOfEmployees})

      console.log({ values });

      // return

      userInfo?.id ? putMutate({ ...values, type: { id: values.type?.id, name: unitTypes.find(x => x?.id === values.type?.id)?.name }, manager: null, numberOfEmployees: +values?.numberOfEmployees }) :
        mutate({ ...values, manager: { id: "00000000-0000-0000-0000-000000000000" }, numberOfEmployees: +values?.numberOfEmployees })

    },
  });

  useEffect(() => {
    if (isSuccess) {
      setmodal_backdrop(false)
      showToast("success", "Unit Created Successfully", "Notice")
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
      setmodal_backdrop(false)
      showToast("success", "Unit Updated Successfully", "Notice")
      // formik.resetForm()
      setShowLoading(false)
      // setuserInfo({})
    }
    if (isPutLoading) {
      setShowLoading(isPutLoading)
    }





    return () => {

    }
  }, [isPutSuccess, isPutLoading])


  useEffect(() => {
    formik.resetForm()
    setselectedParent(null)
    if (userInfo?.id) {

      console.log({ userInfo });
      userInfo?.organisationalUnitParent?.id ? setselectedParent({ label: userInfo?.organisationalUnitParent?.name, value: userInfo?.organisationalUnitParent?.id }) : setselectedParent(null)

      formik.setFieldValue('code', userInfo?.code || '');
      formik.setFieldValue('name', userInfo?.name || '');
      formik.setFieldValue('manager.id', userInfo?.manager || '');
      // formik.setFieldValue('company', "00000000-0000-0000-0000-000000000000");
      formik.setFieldValue('type.id', userInfo?.type?.id);
      formik.setFieldValue('type.name', userInfo?.type?.name);
      formik.setFieldValue('numberOfEmployees', userInfo?.numberOfEmployees || 0);
      formik.setFieldValue('organisationalUnitParentId', userInfo?.organisationalUnitParent?.id || 0);
      // formik.setFieldValue('phoneNumber', userInfo?.phoneNumber ||'');
      // formik.setFieldValue('status', userInfo?.status || 1);
      // formik.setFieldValue('password', userInfo?.password ||'');
      // formik.setFieldValue('customerId', userInfo?.customerId ||'');

      // Object.keys(userInfo).forEach(fieldName => {
      //   formik.setFieldValue(fieldName, userInfo[fieldName]);
      // });
    }

    return () => {

    }
  }, [userInfo])

  console.log({ selectedParent });

  const handleSelectGroup = (selectedGroup) => {
    setselectedGroup(selectedGroup)
    formik.setFieldValue('manager.id', selectedGroup?.value || "00000000-0000-0000-0000-000000000000")

  }
  const handleSelectParent = (value) => {
    formik.setFieldValue('organisationalUnitParentId', Number(value?.value) || 0)
    setselectedParent(value)


  }

  const { data = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/OrganisationalUnits`, "org-units")

  console.log({ data });


  //  if(isPutLoading || isLoading){
  //   return <LoadingSpinner />
  //  }

  return (
    <>
      {/* {
      isLoading || isPutLoading ? <LoadingSpinner /> : null
    } */}
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
            {userInfo?.id ? `Edit ${userInfo?.name}` : 'Add Unit'}
          </h5>


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
              <div className="col col-md-3">
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
                    placeholder="Enter code"
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
                    placeholder="Enter unit name"
                  />
                  {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                </div>
              </div>
            </div>
            <div className="row row1">
              <div className="col col-md-6">
                <div className={`mb-3 ${formik.touched.manager?.id && formik.errors.manager?.id ? 'has-error' : ''}`}>
                  <label className="form-label">Manager <i className="text-danger"></i></label>
                  <Select
                    value={selectedGroup}
                    onChange={(value) => {
                      handleSelectGroup(value)
                    }}
                    options={employees.map(x => ({ label: x?.name, value: x?.id }))}
                    className="select2-selection"
                  />

                  {formik.touched.manager?.id && formik.errors.manager?.id && <div className="text-danger">{formik.errors.manager?.id}</div>}
                </div>
              </div>
              <div className="col col-md-6">
                <div className={`mb-3 ${formik.touched.organisationalUnitParentId?.id && formik.errors.organisationalUnitParentId?.id ? 'has-error' : ''}`}>
                  <label className="form-label">Parent Unit <i className="text-danger"></i></label>
                  <Select
                    value={selectedParent}
                    onChange={(value) => {
                      handleSelectParent(value)
                    }}
                    options={data?.map(x => ({ label: x?.name, value: x?.id }))}
                    className="select2-selection"
                  />

                  {formik.touched.organisationalUnitParentId?.id && formik.errors.organisationalUnitParentId?.id && <div className="text-danger">{formik.errors.organisationalUnitParentId?.id}</div>}
                </div>
              </div>

              {/* <div className="col col-md-6" hidden>
              <div className={`mb-3 ${formik.touched.company && formik.errors.company ? 'has-error' : ''}`}>
                <label className="form-label">Company <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="company"
                  className={`form-control form-control-sm ${formik.touched.company && formik.errors.company ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.company}
                  autoComplete="off"
                  placeholder="Enter company"
                />
                {formik.touched.company && formik.errors.company && <div className="text-danger">{formik.errors.company}</div>}
              </div>
            </div> */}
            </div>
            <div className="row">

              <div className="col col-md-6">
                <div className={`mb-3 ${formik.touched.type?.id && formik.errors.type?.id ? 'has-error' : ''}`}>
                  <label className="form-label">Type <i className="text-danger">*</i></label>
                  <select
                    name="type.id"
                    className={`form-select form-select-sm ${formik.touched.type?.id && formik.errors.type?.id ? 'is-invalid' : ''}`}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.type?.id}
                  >
                    <option value="">Select Type</option>
                    {
                      unitTypes?.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                    }

                    {/* <option value="Division">Division</option>
                  <option value="Department">Department</option>
                  <option value="Other">Other</option> */}
                  </select>
                  {formik.touched.type?.id && formik.errors.type?.id && <div className="text-danger">{formik.errors.type?.id}</div>}
                </div>
              </div>
              <div className="col col-md-6">
                <div className={`mb-3 ${formik.touched.numberOfEmployees && formik.errors.numberOfEmployees ? 'has-error' : ''}`}>
                  <label className="form-label">Number of Employees <i className="text-danger"></i></label>
                  <input
                    type="numberOfEmployees"
                    name="numberOfEmployees"
                    className={`form-control form-control-sm ${formik.touched.numberOfEmployees && formik.errors.numberOfEmployees ? 'is-invalid' : ''}`}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.numberOfEmployees}
                    autoComplete="off"
                    placeholder="Enter numberOfEmployees"
                  />
                  {formik.touched.numberOfEmployees && formik.errors.numberOfEmployees && <div className="text-danger">{formik.errors.numberOfEmployees}</div>}
                </div>
              </div>


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
    </>

  )
}

export default FormComponet