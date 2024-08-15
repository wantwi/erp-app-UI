// src/components/filter.
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, Row, Col, Form } from "reactstrap";
import { usePost } from "hook/usePost";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { containsObject, showToast } from "helpers/utility";
import Select from "react-select";
import './index.css'
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { usePut } from "hook/usePut";
import { useDelete } from "hook/useDelete";
import { convertDateUSA } from "helpers/utility";
import useCustomAxios from "hook/useCustomAxios";




const StatusTemplate = ({ value, idx }) => {
    return (
        <>
            {value === 1 || value == 'Active' ?
                <span key={idx} className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

            }
        </>
    );
};



const RecurringStatusTemplate = ({ value, idx }) => {
    return (
        <>
            {value === 1 || value == 'Yes' ?
                <span key={idx} className="badge rounded-pill bg-success">Yes</span> : <span className="badge rounded-pill bg-danger">No</span>

            }
        </>
    );
};
function ItemGroups() {
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Description',
                accessor: 'description'
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },
            {
                Header: 'Item Count',
                accessor: 'recordCount'
            },
            {
                Header: 'Counting Cycle Type',
                accessor: 'countCycleType'
            },
            {
                Header: 'Counting Cycle Value',
                accessor: 'countCycleValue'
            },
            {
                Header: 'Next Counting Date',
                accessor: 'nextCountingDate'
            },
            // {
            //     Header: 'Count Cycle Start',
            //     accessor: 'startDate'
            // },
            // {
            //     Header: 'Count Cycle End',
            //     accessor: 'endDate'
            // },
            {
                Header: 'Recurring Status',
                accessor: 'groupCountCycle.recurring',
                Cell: ({ cell: { value } }) => <RecurringStatusTemplate value={value} />
            },
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div style={{ width: 90, textAlign: 'right' }}>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => handleDelete(originalRow)} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',


            }
        ],
        []
    );


    const onsuccess = (data) => {
        refetch()
        //showToast("success", "Successfully saved")
    }

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return {
                ...item,
                startDate: convertDateUSA(item.groupCountCycle?.startDate),
                endDate: convertDateUSA(item.groupCountCycle?.endDate),
                countCycleType: item.groupCountCycle?.countCycle == 0 ? 'Months' : item.groupCountCycle?.countCycle == 1 ? 'Weeks' : 'Days',
                countCycleValue: item.groupCountCycle?.countCycleValue,
                recurring: item.groupCountCycle?.recurring == 0 ? 'Yes' : 'No',
            }
        })
        setItemGroupsList(mappedData)
    }

    const onGetError = (error) => {
        //showToast("error", "Could not get list")
        setItemGroupsList([])
    }

    const onError = (error) => {
        showToast("error", "Could not save")
        //setShowLoading(false)
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

    const onAccountsGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.code} - ${item.name}`, value: item.id, code: item.code, name:item.name }
        })
        setAccountsOptions(mappedData)
    }

    const onAccountTypesGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setAccountTypesOptions(mappedData)
    }

    const [activeTab, setActiveTab] = useState('General')
    const [status, setStatus] = useState(true)
    const [accountsOptions, setAccountsOptions] = useState([])
    const [accountTypesOptions, setAccountTypesOptions] = useState([])
    const [formRows, setFormRows] = useState([]);

    const INIT = { countCycle: 0, groupCountCycle: {}, countCycleValue: '', recurring: 0, startDate: '', endDate: '' }
    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [formData, setFormData] = useState({ countCycle: 0, valuationMehod:'', groupCountCycle: {}, countCycleValue: '', recurring: true, startDate: '', endDate: '' })
    const [itemGroupsList, setItemGroupsList] = useState([])
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [hasCountCycle, sethasCountCycle] = useState(false)

    const { isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Groups/ItemGroup`, "ItemsGroups", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Groups/item`, "ItemsGroups", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Groups/${selected?.id}`, "ItemsGroups", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Groups/${selected?.id}`, "ItemsGroups", onUpdateSuccess, onUpdateError)
    const { data: accountTypes } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/item`, "AccountTypes", onAccountTypesGetSuccess)
    const { data: accounts } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllAccounts`, "accounts", onAccountsGetSuccess)
    const { data: appCodesValuationMethods } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AppCodes?type=ValuationMethod`, "appCodesValuationMethods")

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
    });

    const initialValues = {

        name: "",
        description: "",
        status: "Active",
        count:0

    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here

            let payload = {
                name: values.name,
                description: values.description,
                status: status == true ? '1' : '0',
                groupAccountings: formRows.map((item) => {
                    return {
                        accountType: {
                            id: item?.accountType?.value
                          },
                          account: {
                            id: item?.account?.value
                        }
                    }
                }),
                groupCountCycle: {
                    countCycle: formData.countCycle || 0,
                    countCycleValue: formData.countCycleValue || 0,
                    recurring: formData.recurring == true ? 1 : 0,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                },
                valutionMethod: {
                    id: formData.valuationMehod || 0
                }
            }
            console.log({ payload})


            if (showEditModal) {
                //console.log(payload)


                let updatedPayload = {

                    "name": payload.name,
                    "groupType": 0, //0 for item group and 1 for business group
                    "description": payload.description,
                    "status": payload.status,
                    // "groupCountCycle": {
                    //   "countCycle": 0,
                    //   "countCycleValue": payload.countCycleValue,
                    //   "recurring": payload.groupCountCycle.recurring == 'Yes' ? 0 : 1,
                    //   "startDate": "2023-09-01T18:06:06.383Z",
                    //   "endDate": "2023-09-01T18:06:06.383Z"
                    // }

                }
                //console.log(updatedPayload)
                updateMutate(updatedPayload)
            } else {
                mutate(payload)
            }

        },
    });


    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Item Group Successfully Created", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])


    const handleDelete = (row) => {
        setSelected(row)
        deleteMutate(row.id)
        // console.log(row)
    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {
        console.log(row)
        setSelected(row)
        // setFormData(row)
        let editStatus = row.status == 0 ? false : true
        setStatus(editStatus)

        let recurring = row.recurring == 'No'? false : true
        setFormData({...formData, recurring: recurring})

        let hasCountCycle = row.groupCountCycle != null ? true : false
        sethasCountCycle(hasCountCycle)

        console.log(row.groupCountCycle)
        setFormData({...formData, 
            countCycle: row?.groupCountCycle?.countCycle,
            countCycleValue: row?.groupCountCycle?.countCycleValue,
            startDate: row?.groupCountCycle?.startDate.substring(0,10),
            endDate: row?.groupCountCycle?.endDate.substring(0,10)})


        // axios.get(`${process.env.REACT_APP_ADMIN_URL}/Groups/Item/${row?.id}`)
        // .then((res) => {
        //     console.log(res.data.payload)
        //     let data = res.data.payload
        //     setShowEditModal(true)
        //     tog_backdrop()
           
        // })
        // .finally(() => {
        //     setShowLoading(false)
           
        // })
        //formik.initialValues["key"] 
       // formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
        });
        setShowEditModal(true)
        tog_backdrop()
    }

   


    const handleAccountTypeFormChange = (e, index) => {
       
    };

    const handleAccountFormChange = (e, index) => {

        //console.log(e, index)
        let newObj = { id: Math.ceil(Math.random() * 1000000), accountType: accountTypesOptions[index],  account: e }
        let data = [...formRows, newObj];
        //console.log(data)
     
        setFormRows(data)
    };

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }


    //meta title
    document.title = "Biz-360 ERP | Item Groups";



    if (isListLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Item Groups" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={itemGroupsList}
                                isGlobalFilter={true}
                                isAddOptions={true}
                                customPageSize={10}
                                setmodal_backdrop={setmodal_backdrop}
                                handleDelete={handleDelete}
                                className={'table-sm '}
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
                    size={activeTab == "Accounting" ? 'lg' : 'md'}
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Item Group</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel">Edit Item Group</h5>)}
                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    formik.resetForm()
                                    setFormData(INIT)
                                    setShowEditModal(false)
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body" id="modal-body">

                            <div className="row">
                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Name <i
                                            className="text-danger">*</i></label>
                                        <input type="text" className="form-control-sm form-control" id="name" placeholder="Enter Name" onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>


                               {showEditModal ?  (<div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Item Count </label>
                                        <input disabled type="number" className="form-control-sm form-control" id="count"  onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.count} />
                                        {formik.touched.count && formik.errors.count && <div className="text-danger">{formik.errors.count}</div>}
                                    </div>
                                </div>) :  null}
                            </div>

                            <div className="row mb-2">
                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label"> Description</label>
                                        <textarea id="description" placeholder="Enter description" className="form-control-sm form-control" autoComplete="off"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.description}>
                                        </textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-2">
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


                            {/* Tabbed Pane */}
                            <div className="row">
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('General')}>
                                            <a className={activeTab == 'General' ? `nav-link active` : `nav-link`} href="#">< i className="bx bx-info-circle" /> General</a>
                                        </li>

                                        <li className="nav-item" onClick={() => setActiveTab('Accounting')}>
                                            <a className={activeTab == 'Accounting' ? `nav-link active` : `nav-link`} href="#">< i className="mdi mdi-typewriter" /> Accounting</a>
                                        </li>
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {activeTab == 'General' ? (
                                            <div className="tab-pane fade show active " id="general-tab-pane" role="tabpanel" aria-labelledby="general-tab" tabIndex="0">
                                                {/* Tab 1 */}


                                                <div className="row mb-2">
                                                    <div className="mb-2">
                                                            <label className="form-label"> Has Counting Cycle?</label>
                                                            <div className="form-check form-switch form-switch-md mb-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id="customSwitchsizemd"
                                                                    onChange={(e) => sethasCountCycle(!hasCountCycle)}
                                                                    defaultChecked={hasCountCycle}
                                                                />
                                                                <label
                                                                    className="form-check-label"
                                                                    htmlFor="customSwitchsizemd"
                                                                >
                                                                    {hasCountCycle ? 'Yes' : 'No'}
                                                                </label>
                                                            </div>
                                                    </div>
                                                </div>
                                                {hasCountCycle ? 
                                                (<><div className="row mb-2">
                                                    <div className="col">
                                                        <div className="mb-2">
                                                            <label className="form-label"> Counting Cycle</label>
                                                            <select className="form-select form-select-sm" value={formData.countCycle} onChange={(e) => setFormData({ ...formData, countCycle: e.target.value })}>
                                                                <option>Select Cycle</option>
                                                                <option value={0}>Months</option>
                                                                <option value={1}>Weeks</option>
                                                                <option value={2}>Days</option>
                                                            </select>

                                                        </div>
                                                    </div>

                                                    <div className="col">
                                                        <div className="mb-2">
                                                            <label className="form-label"> Value</label>
                                                            <input type="text"  className="form-control form-control-sm" placeholder="Enter value" autoComplete="off" value={formData?.countCycleValue} onChange={(e) => setFormData({ ...formData, countCycleValue: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-2">
                                                    <div className="col">
                                                        <div className="mb-2">
                                                            <label className="form-label"> Start Date</label>
                                                            <input type="date" className="form-control form-control-sm" autoComplete="off" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />

                                                        </div>
                                                    </div>

                                                    <div className="col">
                                                        <div className="mb-2">
                                                            <label className="form-label"> End Date</label>
                                                            <input type="date" className="form-control form-control-sm" autoComplete="off" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-2">

                                                    <div className="col-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Recurring Status </label>
                                                            <div className="form-check form-switch form-switch-md mb-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id="customSwitchsizemd"
                                                                    onChange={(e) => setFormData({...formData, recurring: !formData.recurring})}
                                                                    defaultChecked={formData.recurring}
                                                                />
                                                                <label
                                                                    className="form-check-label"
                                                                    htmlFor="customSwitchsizemd"
                                                                >
                                                                    {formData.recurring ? 'Yes' : 'No'}
                                                                </label>
                                                            </div>

                                                        </div>
                                                    </div>

                                                   
                                                </div> </>) : null}

                                                <div className="row mb-2">
                                                    <div className="col">
                                                            <label className="form-label"> Valuation Method</label>
                                                            <select className="form-select form-select-sm" value={formData.valuationMehod} onChange={(e) => setFormData({ ...formData, valuationMehod: e.target.value })}>
                                                                <option>Select Method</option>
                                                                {appCodesValuationMethods?.map((item) => <option key={item.id}  value={item.id}>{item.name}</option>)} 
                                                            </select>

                                                       
                                                    </div>
                                                </div>

                                            </div>) :
                                            (<div className="tab-pane fade show active" id="financial-tab-pane" role="tabpanel"
                                                aria-labelledby="financial-tab" tabIndex="0">

                                                <Form className="repeater" encType="multipart/form-data">
                                                    <div>

                                                        <Table className="table-sm mb-2">

                                                            <thead>
                                                                <tr>
                                                                    {/* <th>#</th> */}
                                                                    <th style={{ width: '40%' }}>Account Type</th>
                                                                    <th style={{ width: '50%' }}>Account Code & Name</th>
                                                                    {/* <th></th> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {/* {(formRows || []).map((formRow, key) => ( */}
                                                                {(accountTypesOptions || []).map((formRow, key) => (
                                                                    <tr key={key}>
                                                                        {/* <td>{key + 1}</td> */}
                                                                        <td >
                                                                            {/* <label htmlFor="name">Account Type</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleAccountTypeFormChange(e, key)}
                                                                                name="accountType"
                                                                                options={accountTypesOptions}
                                                                                value={formRow}
                                                                                isReadonly={true}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                        <td>
                                                                            {/* <label htmlFor="name">Account Name</label> */}
                                                                            <Select
                                                                                onChange={(e) => handleAccountFormChange(e, key)}
                                                                                name="accountName"
                                                                                options={accountsOptions}
                                                                                className="select2-selection row1" />

                                                                        </td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>



                                                    </div>
                                                    {/* <input
                                                        type="button"
                                                        className="btn btn-success mt-3 mt-lg-0"
                                                        value="Add"
                                                        onClick={() => onAddFormRow()}
                                                    /> */}
                                                </Form>
                                                {/* <div className="table-responsive">
                                                <Table className="table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Account Type</th>
                                                            <th>Account Code & Name</th>
                                                          
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    {accountTypes?.map((item, idx) => {
                                                        return (<tr key={idx}>
                                                            <th scope="row">{idx+1}</th>
                                                            <td>{item.name}</td>
                                                            <td key={idx}> 
                                                                <Select
                                                                        onChange={() => {
                                        
                                                                        }}
                                                                        options={accountsOptions}
                                                                        className="select2-selection"

                                                                    />
                                                            </td>
                                                           

                                                        </tr>)}
                                                    )}
                                                       
                                                    </tbody>
                                                </Table>
                                            </div> */}
                                            </div>)}
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                setShowEditModal(false)
                            }}>Close</button>
                           {!showEditModal ? (<button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>) :
                                (<button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>)}
                        </div>
                    </form>

                </Modal>


            </div>
        </>




    );
}
ItemGroups.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default ItemGroups;