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
  transactionDate: '',
  transactionNumber: '',
  assestId:0,
  assetValueDate:"",
  assetCapitalizationDate:"",
  quantity: 0
};


function FormComponet({employees, unitTypes,setShowLoading, modal_backdrop, setmodal_backdrop, setMinimized, userInfo, setuserInfo }) {
  const [selectedMulti, setselectedMulti] = useState(null);
  const [selectedGroup, setselectedGroup] = useState(null);

  const validationSchema = Yup.object().shape({
    transactionDate: Yup.string(),
    transactionNumber: Yup.string(),
    assestId: Yup.number(),
    assetValueDate: Yup.string(),//.required('Code is required'),
    assetCapitalizationDate: Yup.string(),//.required('Name is required'),
   
    quantity: Yup.number()
  });



const onsuccess = (data)=>{
  // setmodal_backdrop(false)
  //   console.log({onsuccess:data});
}

const onError = (error)=>{
  setShowLoading(false)
  showToast("error", error?.code, "Notice")
 
}
const onPutError = (error) =>{

  console.log({onPutError: error});
  showToast("error", error?.code, "Notice")

  
  setShowLoading(false)

  

}
 const {mutate, isSuccess, isLoading} = usePost(`${process.env.REACT_APP_ADMIN_URL}/OrganisationalUnits`,"org-units",onsuccess, onError)
 const {mutate:putMutate, isSuccess:isPutSuccess, isLoading:isPutLoading} = usePut(`${process.env.REACT_APP_ADMIN_URL}/OrganisationalUnits/${userInfo?.id}`,"org-units",onsuccess, onPutError)

 console.log({onsuccess:isSuccess});

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: (values,{resetForm}) => {

     
      // mutate({...values, numberOfEmployees:+values?.numberOfEmployees})

      // console.log({values});

      // return
   
      userInfo?.id ? putMutate({...values,type:{id:values.type?.id, name:unitTypes.find(x => x?.id === values.type?.id)?.name} , manager:null, numberOfEmployees:+values?.numberOfEmployees}) :
      mutate({...values,manager:{id: "00000000-0000-0000-0000-000000000000"}, numberOfEmployees:+values?.numberOfEmployees})
     
    },
  });

 useEffect(() => {
   if(isSuccess){
    setmodal_backdrop(false)
    showToast("success", "Unit Created Successfully", "Notice")
    formik.resetForm()
    setShowLoading(false)
   }
   if(isLoading){
    setShowLoading(isLoading)
   }
 
   return () => {
     
   }
 }, [isSuccess, isLoading])

 useEffect(() => {
  if(isPutSuccess){
   setmodal_backdrop(false)
   showToast("success", "Unit Updated Successfully", "Notice")
   formik.resetForm()
   setShowLoading(false)
   setuserInfo({})
  }
  if(isPutLoading){
   setShowLoading(isPutLoading)
  }



 

  return () => {
    
  }
}, [isPutSuccess, isPutLoading])
 

 useEffect(() => {
  formik.resetForm()
  if(userInfo?.id){

    console.log({userInfo});

    formik.setFieldValue('transactionDate', userInfo?.transactionDate ||'');
    formik.setFieldValue('transactionNumber', userInfo?.transactionNumber ||'');
    formik.setFieldValue('assetCapitalizationDate', userInfo?.assetCapitalizationDate ||'');
    formik.setFieldValue('assetValueDate',  userInfo?.assetValueDate);
    formik.setFieldValue('quantity',  userInfo?.quantity);
  }
 
   return () => {
   
   }
 }, [userInfo])

 const handleSelectGroup = (selectedGroup) => {
  setselectedGroup(selectedGroup)
  formik.setFieldValue('assestId', selectedGroup?.value || "00000000-0000-0000-0000-000000000000")
 
}



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
        {userInfo?.id ? `Edit ${userInfo?.name}`: 'Add  Capitalisation'}
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
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.transactionDate && formik.errors.transactionDate ? 'has-error' : ''}`}>
                <label className="form-label">Transaction Date <i className="text-danger"></i></label>
                <input
                  type="date"
                  name="transactionDate"
                  className={`form-control form-control-sm ${formik.touched.transactionDate && formik.errors.transactionDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.transactionDate}
                  autoComplete="off"
                  placeholder="Enter .transactionDate"
                />
                {formik.touched.transactionDate && formik.errors.transactionDate && <div className="text-danger">{formik.errors.transactionDate}</div>}
              </div>
            </div>
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.transactionNumber && formik.errorstouched.transactionNumber ? 'has-error' : ''}`}>
                <label className="form-label">Transaction Number <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="name"
                  className={`form-control form-control-sm ${formik.touched.transactionNumber && formik.errorstouched.transactionNumber ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.transactionNumber}
                  autoComplete="off"
                  placeholder="Enter unit name"
                />
                {formik.touched.transactionNumber && formik.errorstouched.transactionNumber && <div className="text-danger">{formik.errorstouched.transactionNumber}</div>}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.assetCapitalizationDate && formik.errors.assetCapitalizationDate ? 'has-error' : ''}`}>
                <label className="form-label">Asset Capitalisation Date <i className="text-danger"></i></label>
                <input
                  type="date"
                  name="transactionDate"
                  className={`form-control form-control-sm ${formik.touched.assetCapitalizationDate && formik.errors.assetCapitalizationDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.assetCapitalizationDate}
                  autoComplete="off"
                  placeholder="Enter assetCapitalizationDate"
                />
                {formik.touched.assetCapitalizationDate && formik.errors.assetCapitalizationDate && <div className="text-danger">{formik.errors.assetCapitalizationDate}</div>}
              </div>
            </div>
            <div className="col col-md-6">
              <div className={`mb-3 ${formik.touched.assetValueDate && formik.errorstouched.assetValueDate ? 'has-error' : ''}`}>
                <label className="form-label">Asset Value Date <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="name"
                  className={`form-control form-control-sm ${formik.touched.assetValueDate && formik.errorstouched.assetValueDate ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.assetValueDate}
                  autoComplete="off"
                  placeholder="Enter unit name"
                />
                {formik.touched.assetValueDate && formik.errorstouched.assetValueDate && <div className="text-danger">{formik.errorstouched.assetValueDate}</div>}
              </div>
            </div>
          </div>
          <div className="row row1">
          <div className="col col-md-9">
              <div className={`mb-3 ${formik.touched.assestId && formik.errors.assestId ? 'has-error' : ''}`}>
                <label className="form-label">Asset <i className="text-danger"></i></label>
                <Select
                  value={selectedGroup}
                  onChange={(value) => {
                    handleSelectGroup(value)
                  }}
                  options={employees.map(x => ({ label: x?.name, value: x?.id }))}
                  className="select2-selection"
                />
              
                {formik.touched.assestId && formik.errors.assestId && <div className="text-danger">{formik.errors.assestId}</div>}
              </div>
            </div>
            <div className="col col-md-3">
              <div className={`mb-3 ${formik.touched.quantity && formik.errorstouched.quantity ? 'has-error' : ''}`}>
                <label className="form-label">Quantity <i className="text-danger">*</i></label>
                <input
                  type="number"
                  name="name"
                  className={`form-control form-control-sm ${formik.touched.quantity && formik.errorstouched.quantity ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.quantity}
                  autoComplete="off"
                  placeholder="0"
                />
                {formik.touched.quantity && formik.errorstouched.quantity && <div className="text-danger">{formik.errorstouched.quantity}</div>}
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
          <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i> {userInfo?.id ? 'Update': 'Save' } </button>
        </div>
      </form>



    </Modal>
    </>
    
  )
}

export default FormComponet