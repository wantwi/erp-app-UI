// src/components/filter.
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, InputGroup, Modal, Table, } from "reactstrap";
import { calculateDays, commaRemover, convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { useFormik } from "formik";
import * as Yup from 'yup';
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { usePost } from "hook/usePost";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import ImageUploader from 'react-image-upload'
import LOGO from "../../../assets/images/companies/img-4.png"
import CurrencyInput from "react-currency-input-field";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from "react-icons/fa";

function Employees() {

    const StatusTemplate = ({ value, idx }) => {
        return (
            <>
                {value === 1 || value == 'Active' ?
                    <span key={idx} className="badge rounded-pill bg-success">Active</span> :
                    value == 'Retired' ? (<span className="badge rounded-pill bg-warning">Retired</span>) :
                        <span className="badge rounded-pill bg-danger">Terminated</span>
                }
            </>
        );
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Code',
                accessor: 'code',
            },
            {
                Header: 'Image',
                accessor: 'image',
            },
            {
                Header: 'First Name',
                accessor: 'firstName',
            },
            {
                Header: 'Other Names',
                accessor: 'otherNames'
            },
            {
                Header: 'Last Name',
                accessor: 'lastName'
            },
            {
                Header: 'Date of Birth',
                accessor: 'dateOfBirth',
            },
            {
                Header: 'Employment Status',
                accessor: 'employmentStatus',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => { setshowAlert(true), setSelected(originalRow) }} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',
                width: '10'

            }

        ],
        []
    );

    const handleDelete = (row) => {
        deleteMutate(row.id)
        setshowAlert(false)
    }

    const handleEdit = (row) => {
        let mappedRow = {
            ...row,
            hiredDate: new Date(row.hiredDate).toISOString().substring(0, 10),
            dateOfBirth: new Date(row.dateOfBirth).toISOString().substring(0, 10),
        }
        setSelected(mappedRow)

        //formik.initialValues["key"] 
        formik.resetForm()
        Object.keys(mappedRow).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
        });

        setShowEditModal(true)
        tog_backdrop();
    }


    //compensation
    const addCompensation = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), effectiveDate: "", amount: "", overtime: "", changeReasons: "" }
        setcompensationsList([...compensationsList, newOBJ]);
        console.log(compensationsList, "CL")
    };

    const handleCompensationFormChange = (e, index) => {
        let data = [...compensationsList];
        if (e.target.name == 'amount') {
            data[index][e.target.name] = amountObj?.value
        }
        data[index][e.target.name] = e.target.value;
        setcompensationsList(data);
    };

    const handleBlur = (e, index) => {
        let data = [...compensationsList];
        data[index][e.target.name] = Number(data[index][e.target.name]).toFixed(2)
        setcompensationsList(data)
    }


    //qualifications
    const addQualifications = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), institution: "", qualificationStartDate: "", qualificationEndDate: "", institution: "" }
        setqualificationsList([...qualificationsList, newOBJ]);
    };

    const handleQualificationFormChange = (e, index) => {
        let data = [...qualificationsList];
        data[index][e.target.name] = e.target.value;
        setqualificationsList((prev) => data);
    };

    const addPositions = () => {
        let newOBJ = { positionId: Math.ceil(Math.random() * 1000000), position: '', timeInPosition: "", startDate: "", description: "" }
        setpositionsList([...positionsList, newOBJ]);
    };

    const handlePositionFormChange = (e, index) => {
        let data = [...positionsList];
        data[index][e.target.name] = e.target.value;
        if (e.target.name == 'startDate') {
            let days = (calculateDays(new Date().toISOString(), new Date(e.target.value)) + ' days')
            data[index]['timeInPosition'] = days
        }
        setpositionsList(data);
    };


    const addContacts = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), fullName: "", relationship: "", nextOfKin: "", phone: "" }
        setContactsList([...contactsList, newOBJ]);
    };

    const handleContactsFormChange = (e, index) => {
        let data = [...contactsList];
        if (e.target.name == 'defaultContact') {

            //map all default values to no, and then change one to yes
            data = data.map((item) => {
                return {
                    ...item,
                    defaultContact: 'No'
                }
            })

            data[index]['defaultContact'] = e.target.checked == true ? 'Yes' : 'No';
        }
        else {
            data[index][e.target.name] = e.target.value;
        }
        setContactsList(data);
    };


    const addAttachmentt = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), file: '', fileName: '' }
        setAttachments([...attachments, newOBJ]);
    };

    const handleAttachmentFormChange = (e, index) => {
        let data = [...attachments];
        data[index][e.target.name] = e.target.value;
        setAttachments((prev) => data);
    };

    const removeFields = (item) => {
        console.log(item)
        if (item.hasOwnProperty('fullName')) {
            if (contactsList.length == 1) {
                showToast('warning', 'You must add at least one contact')
            }
            else {
                let data = contactsList.filter((x) => x.id != item.id)
                setContactsList(data);
            }

        }
        if (item.hasOwnProperty('position')) {
            if (positionsList.length == 1) {
                showToast('warning', 'You must add at least one position')
            }
            else {
                let data = positionsList.filter((x) => x.positionId != item.positionId)
                setpositionsList(data);
            }

        }
        if (item.hasOwnProperty('institution')) {
            if (qualificationsList.length == 1) {
                showToast('warning', 'You must add at least one institution')
            }
            else {
                let data = qualificationsList.filter((x) => x.id != item.id)
                setqualificationsList(data);
            }

        }
        if (item.hasOwnProperty('effectiveDate')) {
            if (compensationsList.length == 1) {
                showToast('warning', 'You must add at least one compensation record')
            }
            else {
                let data = compensationsList.filter((x) => x.id != item.id)
                setcompensationsList(data);
            }

        }
        if (item.hasOwnProperty('file')) {
            if (attachments.length == 1) {
                showToast('warning', 'You must add at least one attachement record')
            }
            else {
                let data = attachments.filter((x) => x.id != item.id)
                setAttachments(data);
            }

        }

    };


    const getImageFileObject = (imageFile) => {
        console.log({ imageFile })
        var file = imageFile.file
        var reader = new FileReader();
        reader.onloadend = function () {
            console.log('RESULT', reader.result)
            formik.setFieldValue('imageBase64', JSON.stringify(reader.result))
        }
        reader.readAsDataURL(file);
    }
    const runAfterImageDelete = (file) => {

        console.log({ file })
        formik.setFieldValue('imageBase64', "")
    }


    const ongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return {
                ...item,
                dateOfBirth: convertDateUSA(item?.dateOfBirth)
            }
        })
        setEmployeesList(mappedData)

    }

    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")


        //create compensation if data exists
        if (compensationsList.length > 0) {
            let payload = compensationsList.map((item) => {
                return {
                    ...item,
                    amount: commaRemover(item.amount),
                    employee: {
                        id: data.payload.id
                    }
                }
            })
            mutateCompensation(payload)
        }

        //create qualifications if data exists
        if (qualificationsList.length > 0) {
            let payload = qualificationsList.map((item) => {
                return {
                    ...item,
                    employee: {
                        id: data.payload.id
                    }
                }
            })
            mutateQualifications(payload)
        }


        //create positions if data exists
        if (positionsList.length > 0) {
            let payload = positionsList.map((item) => {
                return {
                    ...item,
                    employeeId: data.payload.id
                }
            })
            mutatePositions(payload)
        }


        //create contactsList if data exists
        if (contactsList.length > 0) {
            let payload = contactsList.map((item) => {
                return {
                    ...item,
                    employeeId: data.payload.id
                }
            })
            mutateContacts(payload)
        }

        setcompensationsList([])
        setContactsList([])
        setpositionsList([])
        setqualificationsList([])
        refetch()

    }

    const onError = (error) => {
        showToast("error", "Could not save Item")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        console.log(error)
        showToast("error", "Could not get Items LIst")
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
        tog_backdrop()
        refetch()
    }

    const PreviewImage = () => {
        return (
            <div>
                <img width={200} height={200} src={LOGO} />
            </div>
        )
    }

    const [activeTab, setActiveTab] = useState('Compensation')
    const [employeesList, setEmployeesList] = useState([])
    const [showAlert, setshowAlert] = useState(false)
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [disabled, setDisabled] = useState(true)

    const [showLoading, setShowLoading] = useState(false)
    const [status, setStatus] = useState(true)
    const [contactsList, setContactsList] = useState([{ id: Math.ceil(Math.random() * 1000000), fullName: "", relationship: "", nextOfKin: "", phone: "", defaultContact: "" }])
    const [compensationsList, setcompensationsList] = useState([{ id: Math.ceil(Math.random() * 1000000), effectiveDate: "", amount: "", overtime: "", changeReasons: "" }])
    const [positionsList, setpositionsList] = useState([{ positionId: Math.ceil(Math.random() * 1000000), position: '', timeInPosition: "", startDate: "", description: "" }])
    const [qualificationsList, setqualificationsList] = useState([{ id: Math.ceil(Math.random() * 1000000), institution: "", qualificationStartDate: "", qualificationEndDate: "", institution: "" }])
    const [attachments, setAttachments] = useState([{ id: Math.ceil(Math.random() * 1000000), fileName: '', file: '' }])

    const { isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Employees`, "Employees", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Employees`, "Employees", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Employees/${selected?.id}`, "Employees", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Employees/${selected?.id}`, "Employees", onUpdateSuccess, onUpdateError)
    const { mutate: mutateCompensation, } = usePost(`${process.env.REACT_APP_ADMIN_URL}/EmployeeCompensations`)
    const { mutate: mutatePositions, } = usePost(`${process.env.REACT_APP_ADMIN_URL}/EmployeePositions`)
    const { mutate: mutateQualifications, } = usePost(`${process.env.REACT_APP_ADMIN_URL}/EmployeeQualifications`)
    const { mutate: mutateContacts, } = usePost(`${process.env.REACT_APP_ADMIN_URL}/EmployeeContacts`)
    const { data: organisationalUnits } = useGet(`${process.env.REACT_APP_ADMIN_URL}/OrganisationalUnits`, "OrganisationalUnits")
    const [amountObj, setAmountObj] = useState(null)
    const flatpickrRef = useRef(null);

    const [dob, setDOB] = useState(null)

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    const validationSchema = Yup.object().shape({
          firstName: Yup.string().required('First Name is required'),
          lastName: Yup.string().required('Last Name is required'),
    });

    const initialValues = {
        "firstName": "",
        "otherNames": "",
        "lastName": "",
        //"dateOfBirth": "",
        "gender": "",
        "residentialAddress": "",
        "postalAddress": "",
        "socialSecurityNumber": "",
        "taxInformationNumber": "",
        "hiredDate": "",
        "isAUser": true,
        "employmentStatus": "",
        "imageBase64": null,


        //qualifications
        "qualification": "string",
        "qualificationDescription": "string",
        "linkToCertification": "string",
        "qualificationDate": "2023-09-25T22:23:30.082Z",
        "institution": "2023-09-25T22:23:30.082Z",

        //positions
        "positionId": 0,
        "employeeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "timeInPosition": "string",
        "startDate": "2023-09-25T22:24:03.064Z",

        //contact
        "contactType": "string",
        "fullName": "string",
        "relationship": "string"
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here

            let payload = {
                ...values,
                dateOfBirth: dob
                // status: status == true ? '1' : '0',

            }

            console.log(payload)

            if (showEditModal) {

                updateMutate(payload)
            } else {
                mutate(payload)

            }

        },
    });

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)


    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();

    }

    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Employee Successfully Added", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])

    if (isListLoading) {
        return <LoadingSpinner />
    }


    //meta title
    document.title = "Biz-360 ERP | Employees";


    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Master Data" breadcrumbItem="Employees" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={employeesList}
                                isGlobalFilter={true}
                                isAddOptions={true}
                                customPageSize={10}
                                setmodal_backdrop={setmodal_backdrop}
                                className="table-sm"
                            />
                        </CardBody>

                    </Card>

                </div>



                {/* Modal */}
                <Modal
                    isOpen={modal_backdrop}
                    toggle={() => {
                        tog_backdrop();
                    }}
                    backdrop={'static'}
                    id="staticBackdrop"
                    size="xl"
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel"> <i className="fa fa-user me-2" />Add Employee</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel"> <i className="fa fa-user me-2" />Edit Employee</h5>)}


                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    setShowEditModal(false)
                                    formik.resetForm()
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body">

                            <div className="row">

                                <div className="col-3">
                                    <div className="col">
                                        <div className="mb-3">
                                            <label className="form-label">Image </label>
                                            <ImageUploader

                                                onFileAdded={(img) => getImageFileObject(img)}
                                                onFileRemoved={(img) => runAfterImageDelete(img)}
                                                style={{ height: 300, width: 250, marginTop: 10 }}

                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-9">
                                    <div className="row mb-3">
                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Code <i
                                                    className="text-danger">*</i></label>
                                                <InputGroup>
                                                    <div className="input-group-text " style={{ cursor: 'pointer', height: 27 }} onClick={() => setDisabled(!disabled)} title="Toggle between auto generation of code or custom input"> {disabled ? 'Custom' : "Generate"} </div>
                                                    <input type="text" className="form-control-sm form-control" name="code" placeholder="Enter code" disabled={disabled}
                                                        onBlur={formik.handleBlur}
                                                        onChange={formik.handleChange}
                                                        value={formik.values.code} />
                                                </InputGroup>
                                                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">First Name <i
                                                    className="text-danger">*</i></label>
                                                <input type="text" className="form-control-sm form-control" name="firstName" onChange={formik.handleChange}
                                                    value={formik.values.firstName}
                                                    autoComplete="off" placeholder="Enter first name" />
                                                {formik.touched.firstName && formik.errors.firstName && <div className="text-danger">{formik.errors.firstName}</div>}
                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Other Names </label>
                                                <input type="text" className="form-control-sm form-control" name="otherNames" onChange={formik.handleChange}
                                                    value={formik.values.otherNames}
                                                    autoComplete="off" placeholder="Enter other names" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Last Name <i
                                                    className="text-danger">*</i></label>
                                                <input type="text" className="form-control-sm form-control" name="lastName" onChange={formik.handleChange}
                                                    value={formik.values.lastName}
                                                    autoComplete="off" placeholder="Enter last name" />
                                                {formik.touched.lastName && formik.errors.lastName && <div className="text-danger">{formik.errors.lastName}</div>}
                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">DOB <i
                                                    className="text-danger">*</i></label>
                                                <InputGroup>
                                                    <Flatpickr
                                                        value={dob}
                                                        // value={formik.values.dateOfBirth}
                                                        // name="dateOfBirth" onChange={formik.handleChange}
                                                        //onChange={() => console.log(flatpickrRef.current.flatpickr.selectedDates)}
                                                        onChange={(e) => setDOB(e[0].toISOString())}
                                                        className="form-control form-control-sm"
                                                        placeholder="dd M, yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d M, Y",
                                                            dateFormat: "Y-m-d"
                                                        }}
                                                        ref={flatpickrRef} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text" onClick={openFlatpickr}>
                                                            <FaCalendar />
                                                        </span>
                                                    </div>
                                                </InputGroup>
                                                {dob == null ? <div className="text-danger">{'DOB is required'}</div> : null}


                                                {/* <input type="date" className="form-control-sm form-control" name="dateOfBirth" onChange={formik.handleChange}
                                                    value={formik.values.dateOfBirth}
                                                    autoComplete="off" /> */}
                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Emploment Status </label>
                                                <select className="form-select form-select-sm" name="employmentStatus" onChange={formik.handleChange}
                                                    value={formik.values.employmentStatus} >
                                                    <option>Select Status</option>
                                                    <option>Active</option>
                                                    <option>Retired</option>
                                                    <option>Terminated</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Attachments <i
                                                    className="text-danger">*</i></label>
                                                <input type="file" className="form-control-sm form-control" />
                                            </div>
                                        </div> */}
                                    </div>

                                    <div className="row mb-3">




                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Organizational Unit </label>
                                                <select className="form-select form-select-sm">
                                                    <option>Select Unit</option>
                                                    {[] || organisationalUnits.map((item) =>
                                                        <option key={item.id} value={item.id}>{item.name}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className="mb-3">
                                                <label className="form-label">Tax Information Number(TIN) <i
                                                    className="text-danger">*</i></label>
                                                <input type="text" className="form-control-sm form-control" name="taxInformationNumber" onChange={formik.handleChange}
                                                    value={formik.values.taxInformationNumber}
                                                    autoComplete="off" />
                                            </div>
                                        </div>


                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Is a User? </label>
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
                                                        {status ? 'Yes' : 'No'}
                                                    </label>
                                                </div>

                                            </div>
                                        </div>


                                    </div>


                                </div>
                            </div>




                            {/* Tabbed Pane */}
                            <div className="row">
                                <div className="col">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item" onClick={() => setActiveTab('Compensation')}>
                                            <a className={activeTab == 'Compensation' ? `nav-link active` : `nav-link`} href="#">Compensation</a>
                                        </li>

                                        <li className="nav-item" onClick={() => setActiveTab('Qualifications')}>
                                            <a className={activeTab == 'Qualifications' ? `nav-link active` : `nav-link`} href="#">Qualifications</a>
                                        </li>

                                        <li className="nav-item" onClick={() => setActiveTab('Positions')}>
                                            <a className={activeTab == 'Positions' ? `nav-link active` : `nav-link`} href="#">Positions</a>
                                        </li>
                                        <li className="nav-item" onClick={() => setActiveTab('Emergency Contacts')}>
                                            <a className={activeTab == 'Emergency Contacts' ? `nav-link active` : `nav-link`} href="#">Emergency contacts</a>
                                        </li>
                                        <li className="nav-item" onClick={() => setActiveTab('Attachments')}>
                                            <a className={activeTab == 'Attachments' ? `nav-link active` : `nav-link`} href="#">Attachments</a>
                                        </li>
                                    </ul>
                                    <div className="tab-content tab-scroll" id="myTabContent">
                                        {activeTab == 'Compensation' ? (
                                            <div className="tab-pane fade show active " role="tabpanel" aria-labelledby="Compensation-tab" tabIndex="0">
                                                {/* Tab 1 */}

                                                {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addCompensation}><i className="mdi mdi-plus me-1" /> Add Compensation</button>
                                                </div> */}
                                                <Table className="table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Effective Date</th>
                                                            <th>Amount</th>
                                                            <th>Overtime</th>
                                                            <th>Change Reason</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {compensationsList.map((form, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td><input type="date" className="form-control-sm form-control" autoComplete="off" name="effectiveDate" value={form.effectiveDate} onChange={(e) => handleCompensationFormChange(e, index)} /></td>
                                                                    <td>
                                                                        <CurrencyInput name="amount" className={`form-control form-control-sm text-r`} placeholder="0.00" defaultValue={form.amount} decimalsLimit={2} onValueChange={(value, name) => setAmountObj(name, value)} onChange={(e) => handleCompensationFormChange(e, index)} />
                                                                    </td>
                                                                    <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="overtime" value={form.overtime} onChange={(e) => handleCompensationFormChange(e, index)} /></td>
                                                                    <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="changeReasons" value={form.changeReasons} onChange={(e) => handleCompensationFormChange(e, index)} /></td>
                                                                    <td style={{ width: '7%', textAlign: 'right' }}>
                                                                        <span type="button" className="text-primary" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Add Contact" onClick={addCompensation}>
                                                                            <i className="far  fas fa-plus" />
                                                                        </span>
                                                                        <span type="button" className="text-danger" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                            <i className="far  fas fa-trash" />
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </Table>

                                            </div>) :
                                            activeTab == 'Qualifications' ? (
                                                <div className="tab-pane fade show active " role="tabpanel" id="Qualifications-tab-pane" aria-labelledby="Qualifications-tab-pane" tabIndex="1">
                                                    {/* Tab 2 */}

                                                    {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                        <button type="button" className="btn btn-sm btn-primary" onClick={addQualifications}><i className="mdi mdi-plus me-1" /> Add Qualifications</button>
                                                    </div> */}
                                                    <Table className="table-sm mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Institution</th>
                                                                <th>Award/Cert</th>
                                                                <th>Start Date</th>
                                                                <th>End Date</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {qualificationsList.map((form, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="institution" value={form.institution} onChange={(e) => handleQualificationFormChange(e, index)} /></td>
                                                                        <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="qualification" value={form.qualification} onChange={(e) => handleQualificationFormChange(e, index)} /></td>
                                                                        <td><input type="date" className="form-control-sm form-control" autoComplete="off" name="qualificationStartDate" value={form.qualificationStartDate} onChange={(e) => handleQualificationFormChange(e, index)} /></td>
                                                                        <td><input type="date" className="form-control-sm form-control" autoComplete="off" name="qualificationEndDate" value={form.qualificationEndDate} onChange={(e) => handleQualificationFormChange(e, index)} /></td>

                                                                        <td style={{ width: '7%', textAlign: 'right' }}>
                                                                            <span type="button" className="text-primary" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Add Qualification" onClick={addQualifications}>
                                                                                <i className="far  fas fa-plus" />
                                                                            </span>
                                                                            <span type="button" className="text-danger" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                                <i className="far  fas fa-trash" />
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </Table>
                                                </div>) :
                                                activeTab == 'Positions' ? (
                                                    <div className="tab-pane fade show active" id="positions-tab-pane" role="tabpanel" aria-labelledby="positions-tab-pane" tabIndex="2">

                                                        {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                            <button type="button" className="btn btn-sm btn-primary" onClick={addPositions}><i className="mdi mdi-plus me-1" /> Add Position</button>
                                                        </div> */}
                                                        <Table className="table-sm mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th>Position</th>
                                                                    <th>Start Date</th>
                                                                    <th>Time In Position</th>
                                                                    <th>Description</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {positionsList.map((form, index) => {
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="position" value={form.position} onChange={(e) => handlePositionFormChange(e, index)} /></td>
                                                                            <td><input type="date" className="form-control-sm form-control" autoComplete="off" name="startDate" value={form.startDate} onChange={(e) => handlePositionFormChange(e, index)} /></td>
                                                                            <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="timeInPosition" value={form.timeInPosition} onChange={(e) => handlePositionFormChange(e, index)} /></td>
                                                                            <td><input type="text" className="form-control-sm form-control" autoComplete="off" name="description" value={form.description} onChange={(e) => handlePositionFormChange(e, index)} /></td>
                                                                            <td style={{ width: '7%', textAlign: 'right' }}>
                                                                                <span type="button" className="text-primary" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Add Position" onClick={addPositions}>
                                                                                    <i className="far  fas fa-plus" />
                                                                                </span>
                                                                                <span type="button" className="text-danger" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                                    <i className="far  fas fa-trash" />
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </Table>



                                                    </div>) :
                                                    activeTab == 'Emergency Contacts' ?
                                                        (
                                                            <div className="tab-pane fade show active " id="contacts-tab-pane" role="tabpanel" aria-labelledby="contacts-tab-pane" tabIndex="3">
                                                                {/* Tab 1 */}

                                                                {/* <div style={{ textAlign: 'right' }} className="mb-2">
                                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addContacts}><i className="mdi mdi-plus me-1" /> Add Contact Person</button>
                                                                </div> */}

                                                                <Table className="table-sm mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Name</th>
                                                                            <th>Relationship</th>
                                                                            <th>Phone</th>
                                                                            <th>Email</th>
                                                                            <th>Address</th>
                                                                            <th>Next of Kin</th>
                                                                            <th>Default</th>
                                                                            <th></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>

                                                                        {contactsList?.map((form, index) => {
                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td style={{ width: '15%' }}><input type="text" className="form-control-sm form-control" autoComplete="off" name="fullName" value={form.fullName} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '15%' }}><input type="text" className="form-control-sm form-control" autoComplete="off" name="relationship" value={form.relationship} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '15%' }}><input type="text" className="form-control-sm form-control" autoComplete="off" name="phone" value={form.phone} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '15%' }}><input type="text" className="form-control-sm form-control" autoComplete="off" name="email" value={form.email} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '15%' }}><input type="text" className="form-control-sm form-control" autoComplete="off" name="address" value={form.address} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '15%' }}><input type="text" className="form-control-sm form-control" autoComplete="off" name="nextOfKin" value={form.nextOfKin} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '3%', textAlign: 'center' }}><input style={{ marginTop: 10 }} type="radio" className="form-radio " name="defaultContact" value={form.defaultContact} onChange={(e) => handleContactsFormChange(e, index)} /></td>
                                                                                    <td style={{ width: '7%', textAlign: 'right' }}>
                                                                                        <span type="button" className="text-primary" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Add Contact" onClick={addContacts}>
                                                                                            <i className="far  fas fa-plus" />
                                                                                        </span><span type="button" className="text-danger" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                                            <i className="far  fas fa-trash" />
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>

                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </Table>


                                                            </div>) : (
                                                            <Table className="table-sm mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>FileName</th>
                                                                        <th></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>

                                                                    {attachments?.map((form, index) => {
                                                                        return (
                                                                            <tr key={index}>
                                                                                <td style={{ width: '17%' }}><input type="file" className="form-control-sm form-control" name="attachment" value={form.file} onChange={(e) => handleAttachmentFormChange(e, index)} /></td>
                                                                                <td style={{ width: '7%', textAlign: 'right' }}>
                                                                                    <span type="button" className="text-primary" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Add Contact" onClick={addAttachmentt}>
                                                                                        <i className="far  fas fa-plus" />
                                                                                    </span>
                                                                                    <span type="button" className="text-danger" style={{ marginTop: 10, marginRight: 10, cursor: "pointer", fontSize: 12 }} title="Click to Remove" onClick={() => removeFields(form)}>
                                                                                        <i className="far  fas fa-trash" />
                                                                                    </span>
                                                                                </td>
                                                                            </tr>

                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </Table>

                                                        )
                                        }
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                            }}>Close</button>
                            {!showEditModal ? (<button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>) :
                                (<button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>)}
                        </div>
                    </form>

                </Modal>
                <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />


            </div>
        </>




    );
}
Employees.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Employees;