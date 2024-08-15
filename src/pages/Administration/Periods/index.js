// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, Table, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { useDelete } from "hook/useDelete";
import { usePut } from "hook/usePut";
import { usePost } from "hook/usePost";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import useCustomAxios from "hook/useCustomAxios";
import SweetAlert from "components/CustomBizERP/SweetAlert";


const StatusTemplate = ({ value, idx }) => {
    return (
      <div>
        {
         (value === 1 || value.includes('Open')) ?
         <span key={idx} className="badge rounded-pill bg-success">Open</span>: 
         (value == 'Closing') ?
         <span className="badge rounded-pill bg-warning">Closing</span> :
         (value == 'Closed') ?
         <span className="badge rounded-pill bg-danger">Closed</span>:
         <span className="badge rounded-pill bg-info">Mixed</span>
  
      }
      </div>
    );
};

function Periods() {
    const columns = useMemo(
        () => [
            {
                Header: 'Year',
                accessor: 'year',
            },
            {
                Header: 'Start Date',
                accessor: 'startDate',
                Cell: ({ cell: { value } }) => <div>{convertDateUSA(value)}</div>
            },
            {
                Header: 'End Date',
                accessor: 'endDate',
                Cell: ({ cell: { value } }) => <div>{convertDateUSA(value)}</div>
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) =><StatusTemplate value={value}/>
            },
            {
                Header: 'Date Created',
                accessor: 'dateCreated',
                Cell: ({ cell: { value } }) => <div>{convertDateUSA(value)}</div>
            },
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div style={{width:90, textAlign: 'right'}}>
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti"><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => {setshowAlert(true), setSelected(originalRow)}} className="btn btn-light button-akiti"><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action'

            }
        ],
        []
    );

    const onsuccess = (data) => {
        refetch()
        //showToast("success", "Successfully saved")
    }

    const ongetsuccess = (data) => {
        let mappedData = data.map(item => {
            return {
                ...item,
                startDate: item.subPeriods[0]?.startDate,
                endDate: item.subPeriods[item.subPeriods.length - 1]?.endDate
            }
        })
        setperiodsList(mappedData)
    }

    const onGetError = (error) => {
        showToast("error", "Could not get list")
        setperiodsList([])
    }

    const onError = (error) => {
        showToast("error", "Could not save")
        //setShowLoading(false)
    }

    const onDeletError = (error) =>{
        console.log(error)
        showToast("error", error?.code, "Notice") 
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        refetch()
    }

    const onUpdateError = (error) =>{
        console.log(error)
        showToast("error", error?.code, "Notice") 
        setShowLoading(false)
    }

    const onUpdateSuccess = () => {
        showToast("success", "Successfully Updated")
        setShowEditModal(false)
        refetch()
    }

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [showAlert, setshowAlert] = useState(false)
    const [isSubModalOpen, setIsSubModalOpen] = useState(false)

    const [periodsList, setperiodsList] = useState([])
    const [selected,setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [subPeriods, setSubPeriods] = useState([])

    const {  isLoading: isListLoading, isError, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Period`, "Periods", ongetsuccess, onGetError)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Period`, "Period", onsuccess, onError)
    const {mutate: deleteMutate,} = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Period/${selected?.year}`,"Period", onDeleteSuccess, onDeletError)
    const {mutate: updateMutate,} = usePut(`${process.env.REACT_APP_ADMIN_URL}/Period`,"Period", onUpdateSuccess, onUpdateError)
    const axios = useCustomAxios()

    const validationSchema = Yup.object().shape({
        year: Yup.string().required('Year is required'),
    });

    const initialValues = {

        year: "",
        description: "",
        status: "Open",
       

    };

  

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here

            let payload = {
                ...values
            }
            console.log({ payload })


            if(showEditModal){
                console.log(payload)
                updateMutate(payload)
            }else{
                mutate(payload)
            }

        },
    });

    const [showLoading, setShowLoading] = useState(false)
    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Period Successfully Created", "Notice")
            formik.resetForm()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading])

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    const handleDelete = (row) => {
        deleteMutate(row.id)
        setshowAlert(false)
    }

    const handleUpdateSubperiod = (subperiod) => {
        let payload ={
            "name": subperiod.name,
            "status": subperiod.status,
            "startDate": subperiod.startDate,
            "endDate": subperiod.endDate
          }

        console.log(payload)
        axios.put(`${process.env.REACT_APP_ADMIN_URL}/Period/UpdateSubPeriod/${subperiod?.id}`, payload)
        .then((res) => showToast('success', 'Updated Subperiod Successfully'))
        .catch((error) => {
            showToast('error', "Error updating subperiod")
            console.log(error)
        })
    }

    const handleEdit = (row) => {
        //console.log(row)
        setSelected(row)

        axios.get(`${process.env.REACT_APP_ADMIN_URL}/Period/GetSubPeriodsByYear/${row?.year}`)
        .then((res) => setSubPeriods(res.data.payload))
        .catch((error) => {
            showToast('error', "Error getting subperiods")
            console.log(error)
        })
        
        formik.resetForm()
        Object.keys(row).forEach(fieldName => {
            formik.setFieldValue(fieldName, row[fieldName]);
          });
        setShowEditModal(true)
    }

    //meta title
    document.title = "Biz-360 ERP | Periods";
    if(isListLoading){
        return <LoadingSpinner/>
    }

    return (
        <>
         {showLoading ? <LoadingSpinner message="Saving..."/>: null}
         <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Administration" breadcrumbItem="Periods" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={periodsList}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                            className="table-sm"
                           
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
                    <h5 className="modal-title" id="staticBackdropLabel">Add Period</h5>

                    <div>
                        <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            onClick={() => {
                                setmodal_backdrop(false);
                                formik.resetForm()
                            }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                    </div>


                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body">

                        <div className="row">
                            <div className="col">
                                <div className="mb-3">
                                    <label className="form-label">Year <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control form-control" id="year"  onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.year} />
                                    {formik.touched.year && formik.errors.year && <div className="text-danger">{formik.errors.year}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col">
                                <div>
                                    <label className="form-label">Description</label>
                                    <textarea type="text" className="form-control form-control"  id="description"  onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.description} />
                                </div>
                            </div>

                        </div>


                    </div>
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-outline-success" onClick={() => setIsSubModalOpen(true)}> <i className="bx bx-calendar" /> Sub Periods</button>
                        <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Save</button>
                    </div>
                </form>
            </Modal>


                {/* Edit  Modal */}
                <Modal
                isOpen={showEditModal}
                toggle={() => {
                    setShowEditModal(!showEditModal);
                }}
                backdrop={'static'}
                id="staticBackdrop"
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="staticBackdropLabel">Update Period ({selected?.year})</h5>

                    <div>
                        
                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            onClick={() => {
                                setShowEditModal(false);
                                formik.resetForm()
                            }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                    </div>


                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body">

                        <div className="row">
                            <div className="col">
                                <div className="mb-3">
                                    <label className="form-label">Year <i
                                        className="text-danger">*</i></label>
                                    <input type="text" className="form-control form-control" id="year"  onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.year} />
                                    {formik.touched.year && formik.errors.year && <div className="text-danger">{formik.errors.year}</div>}
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col">
                                <div>
                                    <label className="form-label">Description</label>
                                    <textarea type="text" className="form-control form-control"  id="description"  onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.description} />
                                </div>
                            </div>

                        </div>


                    </div>
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-outline-success" onClick={() => setIsSubModalOpen(true)}> <i className="bx bx-calendar" /> Sub Periods</button>
                        <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>
                    </div>
                </form>
            </Modal>


            {/* Sub Modal */}
            <Modal
                isOpen={isSubModalOpen}
                toggle={() => {
                    setIsSubModalOpen(!isSubModalOpen);
                }}
                backdrop={'static'}
                id="staticBackdrop"
                size="lg"
                style={{ marginTop: 100 }}
            >
                <div className="modal-header">
                    <h5 className="modal-title" id="supPeriod">Sub Periods for ({selected?.year})</h5>

                    <div>

                        <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                            aria-label="Close"><i className="mdi mdi-close" onClick={() => setIsSubModalOpen(false)}></i></button>
                    </div>


                </div>
                <div className="modal-body">
                    <Table className="table mb-0">
                        <thead>
                            <tr>
                               
                                <th>Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                        {(subPeriods || []).map((subperiod, key) => {
                            return <tr key={key}>
                                <td>{subperiod.name}</td>
                                <td>{convertDateUSA(subperiod.startDate)}</td>
                                <td>{convertDateUSA(subperiod.endDate)}</td>
                                <td>
                                    <select className="form-select form-select-sm" value={subperiod.status} onChange={(e) => {
                                       
                                        handleUpdateSubperiod({...subperiod, status: e.target.value})
                                    }}>
                                        <option value={'Open'}>Open</option>
                                        <option value={'Closed'}>Closed</option>                                     
                                        {/* <option value={'Mixed'}>Mixed</option> */}
                                        
                                    </select>
                                </td>
                            </tr>
                        }

                        )}

                        </tbody>
                    </Table>



                </div>

            </Modal>

            <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete}/>


        </div>
        </>
       



    );
}
Periods.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Periods;