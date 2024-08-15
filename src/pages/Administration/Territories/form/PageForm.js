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



const validationSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    address: Yup.string(),//.required('Address is required'),
    country: Yup.string(),//.required('Country is required'),
    region: Yup.string(),//.required('Region is required'),
    status: Yup.boolean(),
    manager: Yup.object().shape({
        id: Yup.string()
    }),
    postalAddress: Yup.string(),

});



const initialValues = {
    id: 0,
    code: '',
    name: '',
    description: "",
    address: '',
    country: '',
    region: '',
    status: 0,
    postalAddress: "",
    manager: { id: "00000000-0000-0000-0000-000000000000" },

};





function PageForm({ rowInfo, setShowLoading, modal_backdrop, setmodal_backdrop, setMinimized }) {
    const [selectedMulti, setselectedMulti] = useState(null);
    const [selectedGroup, setselectedGroup] = useState(null);

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
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Territories`, "territories", onsuccess, onError)
    const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Territories/${rowInfo?.id}`, "territories", onsuccess, onPutError)

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {

            rowInfo?.id ? (delete values.manager, putMutate({...values, status:Number(values?.status)})) :
            mutate(values)
        },
    });

    useEffect(() => {
        formik.resetForm()
        setselectedGroup(null)
    
      return () => {
        
      }
    }, [])
    

    useEffect(() => {
        formik.resetForm()
        console.log({rowInfo});
        if (rowInfo?.id) {
            console.log({ rowInfo });
            formik.setFieldValue('id', rowInfo?.id || 0);
            formik.setFieldValue('code', rowInfo?.code || '');
            formik.setFieldValue('name', rowInfo?.name || '');
            formik.setFieldValue('description', rowInfo?.description || '');
            formik.setFieldValue('postalAddress', rowInfo?.postalAddress || '');
            formik.setFieldValue('region', rowInfo?.region || '');
            formik.setFieldValue('country', rowInfo?.country || '');
            formik.setFieldValue('manager.id', rowInfo?.manager?.id || "00000000-0000-0000-0000-000000000000");
            formik.setFieldValue('status', rowInfo?.status);
            formik.setFieldValue('address', rowInfo?.address ||'');
        }

        return () => {

        }
    }, [rowInfo])

    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Territory Created Successfully", "Notice")
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
        if(isPutSuccess){
         //setmodal_backdrop(false)
         showToast("success", "Territory Updated Successfully", "Notice")
         //formik.resetForm()
         setShowLoading(false)
         //setuserInfo({})
        }
        if(isPutLoading){
         setShowLoading(isPutLoading)
        }
        return () => {
          
        }
      }, [isPutSuccess, isPutLoading])

    const handleStatusChange = (evnt) => {
        if (evnt.target.checked) {
            formik.setFieldValue('status', 1)
        } else {
            formik.setFieldValue('status', 0)
        }
    }

    const handleSelectGroup = (selectedGroup) => {
        setselectedGroup(selectedGroup)

        // console.log({selectedGroupVal:selectedGroup?.value, selectedGroup});
        // formik.setFieldValue('parentId', selectedGroup?.value)

    }



    return (
        <Modal
            isOpen={modal_backdrop}
            toggle={() => {
                tog_backdrop();
            }}
            backdrop={'static'}
            id="staticBackdrop"
        >
            <div className="modal-header">
                {/* <h5 className="modal-title" id="staticBackdropLabel">Add Territory</h5> */}
                <h5 className="modal-title" id="staticBackdropLabel">{rowInfo?.id ? `Edit ${rowInfo?.name}`: 'Add Territory'}</h5>

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
                                    placeholder="Enter cost center name"
                                />
                                {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col">
                            <div className={`mb-3 ${formik.touched.description && formik.errors.description ? 'has-error' : ''}`}>
                                <label className="form-label">Description <i className="text-danger"></i></label>
                                <textarea
                                    rows={3}
                                    name="description"
                                    className={`form-control form-control-sm ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.description}
                                    autoComplete="off"
                                    placeholder="Enter description"
                                ></textarea>
                                {formik.touched.description && formik.errors.description && <div className="text-danger">{formik.errors.description}</div>}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col-md-6">
                            <div className={`mb-3 ${formik.touched.address && formik.errors.address ? 'has-error' : ''}`}>
                                <label className="form-label">Address <i className="text-danger"></i></label>
                                <textarea
                                    rows={3}
                                    name="address"
                                    className={`form-control form-control-sm ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.address}
                                    autoComplete="off"
                                    placeholder="Enter address"
                                ></textarea>
                                {formik.touched.address && formik.errors.address && <div className="text-danger">{formik.errors.address}</div>}
                            </div>
                        </div>
                        <div className="col col-md-6">
                            <div className={`mb-3 ${formik.touched.postalAddress && formik.errors.postalAddress ? 'has-error' : ''}`}>
                                <label className="form-label">Postal Address <i className="text-danger"></i></label>
                                <textarea
                                    rows={3}
                                    name="postalAddress"
                                    className={`form-control form-control-sm ${formik.touched.postalAddress && formik.errors.postalAddress ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.postalAddress}
                                    autoComplete="off"
                                    placeholder="Enter Postal Address"
                                ></textarea>
                                {formik.touched.postalAddress && formik.errors.postalAddress && <div className="text-danger">{formik.errors.postalAddress}</div>}
                            </div>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col col-md-6">
                            <div className={`mb-3 ${formik.touched.country && formik.errors.country ? 'has-error' : ''}`}>
                                <label className="form-label">Country <i className="text-danger"></i></label>
                                <select
                                    name="country"
                                    className={`form-select form-select-sm ${formik.touched.country && formik.errors.country ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.country}
                                >
                                    <option value="">Country</option>
                                    <option >Ghana</option>
                                    <option >Canada</option>
                                </select>
                                {formik.touched.country && formik.errors.country && <div className="text-danger">{formik.errors.country}</div>}
                            </div>
                        </div>
                        <div className="col col-md-6">
                            <div className={`mb-3 ${formik.touched.region && formik.errors.region ? 'has-error' : ''}`}>
                                <label className="form-label">Region <i className="text-danger"></i></label>
                                <select name="region"
                                    value={formik.values.region}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    className={`form-select form-select-sm ${formik.touched.region && formik.errors.region ? 'is-invalid' : ''}`}>
                                    <option value={""}>Select Region</option>
                                    <option>GR</option>
                                </select>
                                {/* <input
                                    type="text"
                                    name="region"
                                    className={`form-control form-control-sm ${formik.touched.region && formik.errors.region ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.region}
                                    autoComplete="off"
                                    placeholder="Enter Region"
                                /> */}
                                {formik.touched.region && formik.errors.region && <div className="text-danger">{formik.errors.region}</div>}
                            </div>
                        </div>

                    </div>
                    <div className='row row1'>
                        <div className="col col-md-8 col-sm-12">
                            <div className={`mb-3`}>
                                <label className="form-label">Manager <i className="text-danger"></i></label>
                                <Select
                                    value={selectedGroup}
                                    onChange={(value) => {
                                        handleSelectGroup(value)
                                    }}
                                    options={[].map(x => ({ label: x?.name, value: x?.id }))}
                                    className="select2-selection"
                                />


                            </div>
                        </div>
                        <div className="col-4">
                            <div className="mb-3">
                                <label className="form-label">&nbsp;</label>
                                <div className="input-group input-group-sm">
                                    Status &nbsp; &nbsp;
                                    <div className="form-check form-switch">
                                        <input className="form-check-input switch-status" defaultChecked={rowInfo.status === 1 ? true : false} onChange={handleStatusChange} type="checkbox" id="chkStatus" value="0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => {
                        setmodal_backdrop(false);
                    }}>Close</button>
                    <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i>
                    {rowInfo?.id ? 'Update': 'Save' }
                    </button>
                </div>
            </form>

            {/*  */}

        </Modal>
    )
}

export default PageForm