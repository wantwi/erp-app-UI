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
    quantity: Yup.number(),

    status: Yup.string(),
    baseUnitOfMeasure: Yup.object().shape({
        id: Yup.string()
    })
});



const initialValues = {
    id: 0,
    code: '',
    name: '',
    quantity: "",
    status: "Inactive",
    baseUnitOfMeasure: { id: 0 },

};





function PageForm({ baseData, rowInfo, setShowLoading, modal_backdrop, setmodal_backdrop, setMinimized }) {
    const [selectedMulti, setselectedMulti] = useState(null);
    const [selectedGroup, setselectedGroup] = useState(null);

    const onsuccess = (data) => {
        // setmodal_backdrop(false)
        //   console.log({onsuccess:data});
    }

    const onError = (error) => {
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }
    const onPutError = (error) => {

        console.log({ onPutError: error });
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure`, "units-measure", onsuccess, onError)
    const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure/${rowInfo?.id}`, "units-measure", onsuccess, onPutError)

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {

            rowInfo?.id ? putMutate(values) :
                mutate(values)
        },
    });

    useEffect(() => {
        `  `
        formik.resetForm()
        setselectedGroup(null)

        return () => {

        }
    }, [])


    useEffect(() => {

        formik.setFieldValue('status', "Inactive");
        setselectedGroup(null)
        console.log({ rowInfo });
        if (rowInfo?.id) {
            console.log({ rowInfo });
            formik.setFieldValue('id', rowInfo?.id || 0);
            formik.setFieldValue('code', rowInfo?.code || '');
            formik.setFieldValue('name', rowInfo?.name || '');
            formik.setFieldValue('quantity', rowInfo?.quantity || 0);
            formik.setFieldValue('baseUnitOfMeasure.id', rowInfo?.baseUnitOfMeasure?.id || 0);
            formik.setFieldValue('status', rowInfo?.status);
            rowInfo?.baseUnitOfMeasure !== null ? setselectedGroup({ label: rowInfo?.baseUnitOfMeasure?.name, value: rowInfo?.baseUnitOfMeasure?.id }) : setselectedGroup(null)
        }

        return () => {
            formik.resetForm()
        }
    }, [rowInfo])

    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Unit of Measure Created Successfully", "Notice")
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
            showToast("success", "Unit of Measure Updated Successfully", "Notice")
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

    const handleSelectGroup = (selectedGroup) => {
        setselectedGroup(selectedGroup)

        // console.log({selectedGroupVal:selectedGroup?.value, selectedGroup});
        formik.setFieldValue('baseUnitOfMeasure.id', selectedGroup?.value)

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
                <h5 className="modal-title" id="staticBackdropLabel">{rowInfo?.id ? `Edit ${rowInfo?.name}` : 'Add Unit of Measure'}</h5>

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
                                    placeholder="Enter name"
                                />
                                {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col col-md-8 col-sm-12">
                            <div className={`mb-3`}>
                                <label className="form-label">Base Unit<i className="text-danger"></i></label>
                                <Select
                                    value={selectedGroup}
                                    onChange={(value) => {
                                        handleSelectGroup(value)
                                    }}
                                    options={baseData.map(x => ({ label: x?.name, value: x?.id }))}
                                    className="select2-selection"
                                />


                            </div>
                        </div>
                        <div className="col col-md-4">
                            <div className={` ${formik.touched.region && formik.errors.region ? 'has-error' : ''}`}>
                                <label className="form-label">Quantity <i className="text-danger"></i></label>
                                <input
                                    type="number"
                                    name="quantity"
                                    className={`form-control form-control-sm ${formik.touched.quantity && formik.errors.quantity ? 'is-invalid' : ''}`}
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.quantity}
                                    autoComplete="off"
                                    placeholder="quantity"
                                    step={1}
                                    min={1}
                                />
                                {formik.touched.quantity && formik.errors.quantity && <div className="text-danger">{formik.errors.quantity}</div>}
                            </div>

                        </div>
                        <div className="col-4">
                            <div className="mb-3" style={{ marginTop: -20 }}>
                                <label className="form-label">&nbsp;</label>
                                <div className="input-group input-group-sm">
                                    Status &nbsp; &nbsp;
                                    <div className="form-check form-switch">
                                        <input className="form-check-input switch-status" defaultChecked={rowInfo.status === "Active" ? true : false} onChange={handleStatusChange} type="checkbox" id="chkStatus" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='row'>


                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => {
                        setmodal_backdrop(false);
                    }}>Close</button>
                    <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i>
                        {rowInfo?.id ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>

            {/*  */}

        </Modal>
    )
}

export default PageForm