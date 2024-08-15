// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
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
import SweetAlert from "components/CustomBizERP/SweetAlert";


function Banks() {

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

            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Country',
                accessor: 'country.name',
            },

            {
                Header: 'SWIFT',
                accessor: 'swiftCode',
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
            },


            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-sm btn-light me-2"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        {/* <span onClick={() => addBranch(originalRow)} title="Add Branch" className="btn btn-light me-2"><i className="fas fa-building" style={{color:'green'}}></i></span> */}
                        <span onClick={() => { setSelected(originalRow), setshowAlert(true) }}  className="btn btn-sm btn-light "><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>

                    </div>
                ),
                id: 'action',
                width: '10'

            }
        ],
        []
    );





    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [Banks, setBanks] = useState([])
    const [selected, setSelected] = useState(null)
    const [showAlert, setshowAlert] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [countries, setCountries] = useState([])
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [branches, setBranches] = useState([])



    const onsuccess = (data) => {
        //showToast("success", "Successfully saved")
        refetch()
    }

    const ongetsuccess = (data) => {
        setBanks(data)
    }

    const countryongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id, id: item.id, name: item.name, regions: item.regions }
        })
        setCountries(mappedData)
    }

    const onError = (error) => {
        showToast("error", "Could not save bank")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        //console.log(error)
        //showToast("error", "Could not get list of banks")
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


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Banks/GetAllBanks`, "Banks", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Banks/CreateBank`, "Banks", onsuccess, onError)
    const { mutate: deleteMutate, } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Banks/DeleteBank/${selected?.id}`, "Banks", onDeleteSuccess, onDeletError)
    const { mutate: updateMutate, } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Banks/UpdateBankById/${selected?.id}`, "Banks", onUpdateSuccess, onUpdateError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Countries`, "Countries", countryongetsuccess)


    const [regions, setRegions] = useState({label:'', value: ''})
    const [regionsOptions, setRegionsOptions] = useState([])


    useEffect(() => {
        let x  = countries.find((ct) => ct.id == selectedCountry?.value)
        //console.log('country changed', selectedCountry, countriesList)
        let mappedRegions = x?.regions?.map((region) => {
            return {
                id: region.id,
                value: region.id,
                label: region.name
            }
        })
        setRegionsOptions(mappedRegions)
           
        
    }, [selectedCountry])

    const handleDelete = (row) => {

        deleteMutate(row.id)
        setshowAlert(false)

    }

    const axios = useCustomAxios()
    const handleEdit = (row) => {
        console.log(row)
        setSelected(row)
        axios.get(`${process.env.REACT_APP_ADMIN_URL}/Banks/GetBankById/${row?.id}`)
        .then((res) => {
            //console.log(res.data.payload, "RESPONSE")
            let data = res.data.payload
            setShowEditModal(true)
            tog_backdrop()
            let editStatus = data.status == 'Inactive' ? false : true
            setStatus(editStatus)

            
            //formik.initialValues["key"] 
            formik.setFieldValue("name", data?.name)
            formik.setFieldValue("swiftCode", data?.swiftCode)
            formik.setFieldValue("id" , data?.taxType?.id)
          

            let editSelectedCountry = {id: data.country?.id, label: data.country?.name}
            setSelectedCountry(editSelectedCountry)

            setBranches([{ id: Math.ceil(Math.random() * 1000000), name: "", swiftCode: "", status: true},...data?.bankBranches])
           
        })
        .finally(() => {
            setShowLoading(false)
           
        })
    }

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        swiftCode: Yup.string().required('SWIFT code is required'),
        //countryId: Yup.number().required('Country is required')
    });

    const initialValues = {
        name: '', swiftCode: '', id: Math.ceil(Math.random() * 1000000)
    };

    const handleAddBranch = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000), name: "", swiftCode: "", status: true}
        setBranches([...branches, newOBJ]);
    }

    const removeFields = (item) => {
        let data = branches.filter((x) => x.id != item.id)
        setBranches(data);
    };

    const handleSaveBranches = () => {
        if(branches.length > 1){
            let branchesPayload = branches.map((values) => {
                return {
                    ...values,
                     bankId: selected?.id
            }})
                
            console.log(branchesPayload, "Branches to save")
        }
    }


    const handleFormChange = (e, index) => {
        let data = [...branches];
        //let formattedValue = Number(e.target.value).toFixed(2)
        data[index][e.target.name] = e.target.value;
        data[index]['status'] = e.target.checked;
        setBranches(data);
       
    };


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            //console.log(values)
            let payload = {
                swiftCode : values.swiftCode,
                name: values.name,
                status: status == true ? 'Active' : 'Inactive',
                "country": {
                  "id": selectedCountry?.value || 0,
                },
                "region": {
                  "id": regions?.value || 0
                },
                "bankBranches": [
                //   {
                //     "id": 0,
                //     "swiftCode": "string",
                //     "status": "string",
                //     "name": "string"
                //   }
                ]
              }
            if (showEditModal) {             
                updateMutate({ ...values, status: status == true ? 'Active' : 'Inactive' })            
            } else {
                //console.log("Add Mode:", {...values, status:status == true ? 'Active' : 'Inactive'})
                mutate(payload)

            }

            resetForm()
            setSelectedCountry(null)
        },
    });


    const resetForm = () => {
        formik.setFieldValue('name', '')
        formik.setFieldValue('swiftCode', '')
        formik.setFieldValue('id', '')
        setSelectedCountry(null)
    }

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Banks";

    if (isListLoading) {
        return <LoadingSpinner />
    }


    return (
        <>
            {showLoading ? <LoadingSpinner /> : null}

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Banks" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={Banks}
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
                    size="lg"
                >
                    <div className="modal-header">

                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Bank</h5>) :
                            (<h5 className="modal-title" id="staticBackdropLabel"> Edit Bank</h5>)}


                        <div>
                            <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                            <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                                onClick={() => {
                                    setmodal_backdrop(false);
                                    resetForm()
                                    setShowEditModal(false)
                                }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                        </div>


                    </div>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-body">

                            <div className="row">

                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                                        <label className="form-label">Name <i
                                            className="text-danger">*</i></label>
                                        <input type="text" className="form-control-sm form-control"
                                            autoComplete="off" placeholder="Enter Bank name"
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>


                                <div className="col">
                                    <div>
                                        <label className="form-label"> SWIFT  <i
                                            className="text-danger">*</i></label>
                                        <input type="text" name="swiftCode" id="swiftCode" placeholder="Enter SWIFT code" className="form-control-sm form-control" autoComplete="off"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.swiftCode} />
                                        {formik.touched.swiftCode && formik.errors.swiftCode && <div className="text-danger">{formik.errors.swiftCode}</div>}
                                    </div>
                                </div>


                            </div>
                            <div className="row mb-3">

                                <div className="col">
                                    <div>
                                        <label className="form-label"> Country  <i
                                            className="text-danger">*</i></label>
                                        <Select
                                            onChange={(e) => setSelectedCountry(e)}
                                            name="countryId"
                                            options={countries}
                                            value={selectedCountry}
                                            className="select2-selection row1"/>
                                       
                                        {selectedCountry == null ? (<div className="text-danger">{formik.errors.countryId}</div>) : null}
                                    </div>
                                </div>

                                <div className="col">
                                    
                                    <label className="form-label">Region</label>
                                    <Select
                                        name="territoryId"
                                        onChange={(e) => setRegions(e)}
                                        options={regionsOptions}
                                        value={regions}
                                        className="select2-selection row1" />
                                </div>

                                
                            </div>
                           

                            <div className="row mb-3">
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

                            {showEditModal && ( <div className="row mb-2" style={{display:'flex', flexDirection:'row-reverse', justifyContent:'space-between'}}>
                           
                                <button type="button" style={{width:120}} className="btn btn-default btn-sm me-2"><i className="fas fa-building me-2"></i>{branches?.length}  {branches.length > 1 ? 'branches' : 'branch'}</button>
                                {branches.length > 0 && <button type="button" style={{width:150}} onClick={handleSaveBranches} className="btn btn-success btn-sm me-2"><i className="fas fa-save me-2"></i>Save Branches</button>}
                            </div>)}

                            
                           {showEditModal &&  (<div className="row mb-3" style={{maxHeight:300, overflow:'auto'}}>
                          
                                <Table className="table-sm">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Swift Code</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branches.map((formRow, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td ><input type="text" className="form-control form-control-sm" autoComplete="off" name="name" value={formRow.name} onChange={(e) => handleFormChange(e, index)} /></td>
                                                    <td ><input type="text" className="form-control form-control-sm" autoComplete="off" name="swiftCode" value={formRow.swiftCode} onChange={(e) => handleFormChange(e, index)} /></td>
                                                    <td >
                                                        <div className="form-check form-switch form-switch-md mb-3">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="customSwitchsizemd"
                                                                onChange={(e) => {
                                                                    handleFormChange(e, index)
                                                                }}
                                                                defaultChecked={formRow.status}
                                                                name="status"
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor="customSwitchsizemd"
                                                            >
                                                                {formRow.status  ? 'Active' : 'Inactive'}
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td style={{ width: '7%',textAlign:'right' }}>
                                                        <span  type="button" className="text-primary" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}} title="Add Contact" onClick={handleAddBranch}>
                                                                <i className="far  fas fa-plus" />
                                                        </span>
                                                        <span type="button"className="text-danger" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}} title="Click to Remove" onClick={() => removeFields(formRow)}>
                                                                <i className="far  fas fa-trash" />
                                                        </span>
                                                    </td>
                                                    
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </div>)}


                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                setShowEditModal(false)
                                resetForm()
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
Banks.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Banks;