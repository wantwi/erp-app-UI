// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import Select from "react-select";
import useCustomAxios from "hook/useCustomAxios";


function BankAccounts() {

    const StatusTemplate = ({ value, idx }) => {
        return (
            <div style={{ width: 90 }}>
                {value === 1 || value == 'Active' ?
                    <span key={idx} className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

                }
            </div>
        );
    };

    const columns = useMemo(
        () => [
            // {
            //     Header: 'Bank Code',
            //     accessor: 'bank.swiftCode',
            // },
            {
                Header: 'Account',
                accessor: 'name',
            },
            {
                Header: 'Branch Name',
                accessor: 'bankBranch.name',
            },
            // {
            //     Header: 'Branch Code',
            //     accessor: 'branchCode',
            // },
            {
                Header: 'Account No.',
                accessor: 'number',
            },
            {
                Header: 'SWIFT Code',
                accessor: 'bank.swiftCode',
            },
            {
                Header: 'G/L Account',
                accessor: 'glAccount.name',
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },
            // {
            //     Header: 'Date Created',
            //     accessor: 'dateCreated'
            // },

            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-sm btn-light me-2"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => handleDelete(originalRow)} className="btn btn-sm btn-light "><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',
                width: '10'

            }
        ],
        []
    );





    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [BankAccountss, setBankAccountss] = useState([])
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [banks, setBanks] = useState([])
    const [branches, setBranches] = useState([])
    const [selectedBank, setSelectedBank] = useState(null)
    const [selectedBranch, setSelectedBranch] = useState(null)
    const [glAccountsOptions, setGLAccounts] = useState([])
    const [selectedGLaccount, setSelectedGLaccount] = useState(null)
    const [branchIsLoading, setBranchIsLoading]  = useState(false)




    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const ongetsuccess = (data) => {

        setBankAccountss(data)

    }

    const bankongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id, swiftCode: item.swiftCode }
        })
        setBanks(mappedData)
    }

    const onError = (error) => {
        showToast("error", "Could not save Account")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        setShowLoading(false)
    }

    const onDeletError = (error) => {
        console.log(error)
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        refetch()
    }

    const onUpdateError = (error) => {
        console.log(error)
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const onUpdateSuccess = () => {
        showToast("success", "Successfully Updated")
        setShowEditModal(false)
        refetch()
    }

    const glaccountsongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id,  }
        })
        setGLAccounts(mappedData)
    }

  

    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Banks/GetAllBankAccounts`, "BankAccounts", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Banks/CreateBankAccount`, "BankAccounts", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Banks/DeleteBankAccount/${selected?.id}`, "BankAccounts", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/BankAccounts/${selected?.id}`, "BankAccounts", onUpdateSuccess, onUpdateError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Banks/GetAllBanks`, "Banks", bankongetsuccess,)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetActualAccounts`, "GL Accounts", glaccountsongetsuccess,)



    const axios = useCustomAxios()
    useEffect(() => {
       setSelectedBranch(null)
        if(selectedBank){
            setBranchIsLoading(true)
            axios.get(`${process.env.REACT_APP_ADMIN_URL}/Banks/GetBankById/${selectedBank?.value}`)
            .then((res) => {
                //console.log(res.data)
                let mappedData = res.data.payload.bankBranches.map((item) => {
                    return { label: `${item.name}`, value: item.id, swiftCode: item.swiftCode }
                })
                setBranches(mappedData)
            })
            .finally(() => setBranchIsLoading(false))
        }
       
    }, [selectedBank])
    
    const handleDelete = (row) => {
        setSelected(row)
        deleteMutate(row.id)
        // console.log(row)
    }

    const handleEdit = (row) => {
        //console.log(row)
        setSelected(row)
        //formik.initialValues["key"] 
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
        });
        setShowEditModal(true)
    }

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const validationSchema = Yup.object().shape({
        bankId: Yup.string().required('Name is required'),
        // glAccountId: Yup.string().required('G/L Account is required'),
    });

    const initialValues = {
        id: 0, bankId: 0, bankBranchId: 0, glAccountId: 0, name: '', number: '', description: '', dateCreated: new Date().toISOString()
    };


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            let payload = {
                ...values,
                bankId: selectedBank.value,
                bankBranchId: selectedBranch.value,
                glAccountId: selectedGLaccount.value,
                status: status == true ? 'Active' : 'Inactive'
            }

            console.log(payload)
            if (showEditModal) {
                updateMutate({...values, status:status == true ? 'Active' : 'Inactive'})
            } else {
               mutate(payload)

            }


        },
    });

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Bank Account Successfully Created", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])

    //meta title
    document.title = "Biz-360 ERP | Bank Accounts";

    if (isListLoading) {
        return <LoadingSpinner />
    }

    // if (banks) {
    //     console.log(banks)
    // }


    return (
        <>
            {showLoading ? <LoadingSpinner /> : null}

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Bank Accounts" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={BankAccountss}
                                isGlobalFilter={true}
                                isAddOptions={true}
                                customPageSize={10}
                                setmodal_backdrop={setmodal_backdrop}
                                handleDelete={handleDelete}
                                className="table-sm "
                            />
                        </CardBody>

                    </Card>

                </div>


                {/* Add Modal */}
                <Modal
                    isOpen={modal_backdrop}
                    toggle={() => {
                        tog_backdrop();
                    }}
                    backdrop={'static'}
                    id="staticBackdrop"
                >
                    <div className="modal-header">
                        <h5 className="modal-title" id="staticBackdropLabel">Add Bank Account</h5>

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

                            <div className="row mb-2">
                                 <div className="col">
                                    <div>
                                        <label className="form-label"> Account Name  <i
                                            className="text-danger">*</i></label>
                                        <input type="text" name="name" id="name"  
                                                className="form-control-sm form-control" autoComplete="off"onBlur={formik.handleBlur}
                                                onChange={formik.handleChange}
                                                value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-2">

                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.bankId && formik.errors.bankId ? 'has-error' : ''}`}>
                                        <label className="form-label">Bank  <i
                                            className="text-danger">*</i></label>
                                        <Select
                                            onChange={(e) => setSelectedBank(e)}
                                            name="bankId"
                                            options={banks}
                                            value={selectedBank}
                                            isLoading={branchIsLoading}
                                            className="select2-selection row1" />
                                        {formik.touched.bankId && formik.errors.bankId && <div className="text-danger">{formik.errors.bankId}</div>}
                                    </div>
                                </div>

                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                        <label className="form-label">Branch <i
                                            className="text-danger">*</i></label>


                                        <Select
                                            onChange={(e) => setSelectedBranch(e)}
                                            name="bankBranchId"
                                            options={branches}
                                            value={selectedBranch}
                                            className="select2-selection row1" />
                                        {formik.touched.bankBranchId && formik.errors.bankBranchId && <div className="text-danger">{formik.errors.bankBranchId}</div>}

                                       </div>
                                </div>


                            </div>
                            <div className="row mb-3">

                                <div className="col">
                                    <div>
                                        <label className="form-label"> SWIFT/Branch Code  <i
                                            className="text-danger">*</i></label>
                                        <input type="text" name="bankBranchId" id="bankBranchId"  
                                                className="form-control-sm form-control" autoComplete="off" value={selectedBank?.swiftCode} />
                                        {/* {formik.touched.bankBranchId && formik.errors.bankBranchId && <div className="text-danger">{formik.errors.bankBranchId}</div>} */}
                                    </div>
                                </div>


                                <div className="col">
                                    <div>
                                        <label className="form-label"> Account Number  <i
                                            className="text-danger">*</i></label>
                                        <input type="text" name="number" id="number" placeholder="Enter Account Number" className="form-control-sm form-control" autoComplete="off"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.number} />
                                        {formik.touched.number && formik.errors.number && <div className="text-danger">{formik.errors.number}</div>}
                                    </div>
                                </div>

                            </div>


                            <div className="row mb-3">

                                <div className="col">
                                    <div>
                                        <label className="form-label">GL Account <i
                                            className="text-danger">*</i> </label>
                                        <Select
                                            name="glAccountId"
                                            onChange={(e) => setSelectedGLaccount(e)}
                                            options={glAccountsOptions}
                                            value={selectedGLaccount}
                                            className="select2-selection row1" />
                                        {formik.touched.glAccountId && formik.errors.glAccountId && <div className="text-danger">{formik.errors.glAccountId}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-6">
                                    <div className="mb-3">
                                        <label className="form-label">Status </label>
                                        <div className="form-check form-switch form-switch-md mb-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="customSwitchsizemd"
                                                onChange={(e) => setStatus(!status)}
                                                defaultChecked={status}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="customSwitchsizemd"
                                            >
                                                {status ? 'Active' : 'Inactive'}
                                            </label>
                                        </div>

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


            </div>
        </>




    );
}
BankAccounts.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BankAccounts;