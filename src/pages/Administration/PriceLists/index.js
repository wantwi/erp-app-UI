// src/components/filter.
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, InputGroup, } from "reactstrap";
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
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import useCustomAxios from "hook/useCustomAxios";
import { FaCalendar } from "react-icons/fa";
import Flatpickr from "react-flatpickr";

function PriceLists() {
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
                Header: 'Price List Name',
                accessor: 'name',
            },
            {
                Header: 'Effective Date',
                accessor: 'effectiveDate',
                Cell: ({ cell: { value } }) => convertDateUSA(value)
            },
            {
                Header: 'Payment Term',
                accessor: 'paymentTerms',
            },
            {
                Header: 'Customer',
                accessor: 'businessPartner.name',
            },
            {
                Header: 'Territory',
                accessor: 'territory.name',
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
                        <span onClick={() => handleEdit(originalRow)} className="btn btn-light me-2 button-akiti" ><i className="far fa-eye" style={{ color: 'blue' }}></i></span>
                        <span onClick={() => { setSelected(originalRow), setshowAlert(true) }} className="btn btn-light button-akiti" ><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
                    </div>
                ),
                id: 'action',
                width: '10'

            }

        ],

    );


    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [priceList, setPriceList] = useState([])
    const [territoriesOptions, setTerritoriesOptions] = useState([])
    const [territory, setTerritory] = useState({ label: '', value: 0 })
    const [paymentTerms, setPaymentTerms] = useState([])
    const [selectedPaymentTerms, setSelectedPaymentTerms] = useState([])
    const [businessPartners, setBusinessPartners] = useState([])
    const [selectedBusinessPartner, setSelectedBusinessPartner] = useState({label: '', value: 0})
    const [selected, setSelected] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [status, setStatus] = useState(true)
    const [showAlert, setshowAlert] = useState(false)
    const [details, setDetails] = useState([{ id: Math.ceil(Math.random() * 1000000), item:{label:'Select', value:0}, minQuantity: "", maxQuantity: "", price: "", unitOfMeasure: {label:'Select', value:0} }])
    const [itemsDropDown, setItemsOptions] = useState([])
    const [unitsOfMeasureDropDown, setunitsOfMeasureDropDown] = useState([])
    const [effectiveDate, setEffectiveDate] = useState(null)

    const onsuccess = (data) => {
        if(details.length > 0 && details[0].price != ""){
            let payload = details.map((item) => {
                return {
                    "item": {
                      "id": item?.item?.value
                    },
                    "priceList": {
                      "id": data.payload.id
                    },
                    "minQuantity": item.minQuantity,
                    "maxQuantity": item.maxQuantity,
                    "price": item.price,
                    "unitOfMeasure": {
                      "id": item.unitOfMeasure.value
                    }
                  }
            })
            mutatePriceDetails(payload)

        }
        else{
            formik.setFieldValue('name', '')
            formik.setFieldValue('effectiveDate', '')
            setSelectedBusinessPartner({label: '', value: 0})
            setTerritory({label: '', value: 0})
            setSelectedPaymentTerms([])
            setDetails([{ id: Math.ceil(Math.random() * 1000000), item:{label:'Select', value:0}, minQuantity: "", maxQuantity: "", price: "", unitOfMeasure: {label:'Select', value:0} }])

        }
        refetch()
    }

    // const onPriceListDetailsSuccess = () => {
    //     showToast('success', 'Price List Details Successfully Saved')
    // }

    const ongetsuccess = (data) => {
        let mappedData = data.map((item) => {
            //console.log(item)
            return {
                ...item,
                paymentTerms: (item?.paymentTerms?.map((term) =>  term?.paymentTerm?.name)).join(', ')
            }
        })
        setPriceList(mappedData)
    }

    const onError = (error) => {
        showToast("error", "Could not save pricing")
        setShowLoading(false)
    }

    const onGetError = (error) => {
        console.log(error)
        showToast("error", "Could not price listing")
        setShowLoading(false)
    }

    const onDeletError = (error) => {
        console.log(error)
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const onDeleteSuccess = () => {
        showToast("success", "Successfully Deleted")
        setshowAlert(false)
        refetch()
    }

    const onUpdateError = (error) => {
        console.log(error)
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const onUpdateSuccess = () => {
        showToast("success", "Successfully Updated")
        resetForm()
        setShowEditModal(false)
        setmodal_backdrop(false);
        refetch()
    }


    const onTerritoriesGet = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id }
        })
        setTerritoriesOptions(mappedData)
    }


    const onGetPaymentTermsSuccess = (data) => {
        let mappedData = data.map((item) => {
            return {
                id: item.id,
                value: item.id,
                label: item.name
            }
        })
        setPaymentTerms(mappedData)
    }

    const onbpgetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item.id, bpType: item?.partnerType }
        })
        setBusinessPartners(mappedData)
    }

    const onitemsgetsuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item?.id, name:'item' }
        })
        setItemsOptions(mappedData)
    }

    const onUnitsGetSuccess = (data) => {
        let mappedData = data.map((item) => {
            return { label: `${item.name}`, value: item?.id, code: item.code, name:'unitOfMeasure' }
        })
        setunitsOfMeasureDropDown(mappedData)
    }

    function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
        if (value && value.some((o) => o.value === "0")) {
          return `${placeholderButtonLabel}: All`;
        } else {
          return `${placeholderButtonLabel}: ${value.length} selected`;
        }
      }
    
      function onChange(value, event) {
        if (event.action === "select-option" && event.option.value === "0") {
          this.setState(this.options);
        } else if (
          event.action === "deselect-option" &&
          event.option.value === "0"
        ) {
          this.setState([]);
        } else if (event.action === "deselect-option") {
          this.setState(value.filter((o) => o.value !== "0"));
        } else if (value.length === this.options.length - 1) {
          this.setState(this.options);
        } else {
          this.setState(value);
        }
      }


    const { data, isLoading: isListLoading, refetch } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Pricing`, "Pricing", ongetsuccess, onGetError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/PaymentTerms`, "fa-eyes", onGetPaymentTermsSuccess)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Territories`, "Territories", onTerritoriesGet)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners`, "BusinessPartners", onbpgetsuccess)
    const { mutate, isSuccess, isLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Pricing`, "Pricing", onsuccess, onError)
    const {mutate: deleteMutate,} = useDelete(`${process.env.REACT_APP_ADMIN_URL}/Pricing/${selected?.id}`,"Pricing", onDeleteSuccess, onDeletError)
    const {mutate: updateMutate,} = usePut(`${process.env.REACT_APP_ADMIN_URL}/Pricing/${selected?.id}`,"PayLevels", onUpdateSuccess, onUpdateError)
    const { } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure/GetAll`, "UnitsOfMeasure", onUnitsGetSuccess)
    const {} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Items`, "Items", onitemsgetsuccess)
    const { mutate: mutatePriceDetails } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Pricing/PriceListDetails`, "PriceListDetails")
    
    const flatpickrRef = useRef(null)
    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    const handleDelete = () => {
        deleteMutate(selected.id)
       
    }
    const axios = useCustomAxios()
    const handleEdit = (row) => {
        //console.log(row)
        setSelected(row)
        setShowLoading(true)
        formik.resetForm()

        axios.get(`${process.env.REACT_APP_ADMIN_URL}/Pricing/${row?.id}`)
        .then((res) => {
            //console.log(res.data.payload, "RESPONSE")
            let data = res.data.payload
            setShowEditModal(true)
            tog_backdrop()
            let editStatus = data.status == 'Inactive' ? false : true
            setStatus(editStatus)

            console.log(data.paymentTerms, 'PT')
            let paymentsTermIds = data?.paymentTerms.map((item) => item.paymentTerm.id)
            console.log(paymentsTermIds, 'PTIDS')
            setSelectedPaymentTerms(paymentsTermIds)
            
            Object.keys(data).forEach(fieldName => {
                if(fieldName == 'effectiveDate'){
                    formik.setFieldValue(fieldName, new Date(row[fieldName]).toISOString().substring(0,10));
                }
                // else if(fieldName == 'paymentTerms'){
                //     //console.log('paymentTerms', row[fieldName])
                //     let terms = (row[fieldName].split(', '))
                //     //console.log('terms', terms)
                //     let formated = terms.map((item) => parseInt(item))
                //     setSelectedPaymentTerms(formated)
                //     //console.log(formated, 'Payment Terms')
                //     //formik.setFieldValue(fieldName, row[fieldName]?.join(', '));
                // }
                else{
                    formik.setFieldValue(fieldName, row[fieldName]);
                }
                
            });
        
            
            let editTerritory = {id: data.territory?.id, value: data.territory?.id, label: data.territory?.name}
            setTerritory(editTerritory)
    
            let editCustomer  = {id: data.businessPartner?.id, value: data.businessPartner?.id, label: data.businessPartner?.name}
            setSelectedBusinessPartner(editCustomer)

            
           
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
        
    });

    const initialValues = {
        name: '', effectiveDate: ''
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            // Handle form submission logic here
            let payload = {
                "name": values.name,
                "status" : status == true ? 'Active' : 'Inactive',
                "businessPartner": {
                    "id": selectedBusinessPartner?.value
                },
                "territory": {
                    "id": territory?.value
                },
                "paymentTermIds": selectedPaymentTerms.map((item) => item.id || 0).filter((id) => id != 0) || [],
                "effectiveDate": effectiveDate
            }
            //mutate(values)
           
            //console.log(payload)
            if(showEditModal){
               updateMutate(payload)
            }else{
               mutate(payload)
            }

            resetForm()
           
           
        },
    });


    const resetForm = () => {
       formik.setFieldValue('name', '')
       setEffectiveDate(null)
       setSelectedBusinessPartner({label: '', value: 0})
       setTerritory({label: '', value: 0})
       setSelectedPaymentTerms([])
       setDetails([{ id: Math.ceil(Math.random() * 1000000), item:{label:'Select', value:0}, minQuantity: "", maxQuantity: "", price: "", unitOfMeasure: {label:'Select', value:0} }])
    }

     
    const addPriceDetails = () => {
        let newOBJ = { id: Math.ceil(Math.random() * 1000000),  item: {label:'Select', value:0}, minQuantity: "", maxQuantity: "", price: "", unitOfMeasure: {label:'Select', value:0} }
        setDetails([...details, newOBJ]);
        
    };
    const handleFormChange = (e, index) => {
        let data = [...details];

        if(e.target == undefined){  
            data[index][e.name].value = e.value;
            data[index][e.name].label = e.label;
            if(e.name == 'item'){
                console.log(data)
                data[index]['minQuantity'] = 1
            }
        }
        else{
            data[index][e.target.name] = e.target.value;

        }
            
        setDetails(data);
    };

    const removeFields = (item) => {
        if(details.length == 1){
            showToast('warning', 'You must have at least one tax band')
        }
        else{
            let data = details.filter((x) => x.id != item.id)
            // console.log(data)
            setDetails(data);
        }
        
    };

    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        if (isSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Price List Successfully Created", "Notice")
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
    document.title = "Biz-360 ERP | Price Lists";

    if(isListLoading || showLoading){
        return <LoadingSpinner />
    }

    return (
        <>
            {showLoading ? <LoadingSpinner message="Saving..." /> : null}

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Administration" breadcrumbItem="Price Lists" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>
                        <CardBody>
                            <TableContainer
                                columns={columns}
                                data={priceList}
                                isGlobalFilter={true}
                                isAddOptions={true}
                                customPageSize={10}
                                setmodal_backdrop={setmodal_backdrop}
                                className="table-sm table-hover"
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
                    size="lg"
                >
                    <div className="modal-header">
                        {!showEditModal ? (<h5 className="modal-title" id="staticBackdropLabel">Add Price Listing</h5>
                            ) : (<h5 className="modal-title" id="staticBackdropLabel">Edit Price Listing</h5>)}

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
                                            autoComplete="off" placeholder=""
                                            name="name"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.name} />
                                        {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
                                    </div>
                                </div>

                                <div className="col">
                                    <div className={`mb-3 ${formik.touched.effectiveDate && formik.errors.effectiveDate ? 'has-error' : ''}`}>
                                        <label className="form-label">Effective Date <i
                                            className="text-danger">*</i></label>
                                        {/* <input type="date" className="form-control-sm form-control"
                                            autoComplete="off"
                                            name="effectiveDate"
                                            onBlur={formik.handleBlur}
                                            onChange={formik.handleChange}
                                            value={formik.values.effectiveDate} /> */}
                                            <InputGroup>
                                            <Flatpickr
                                                value={effectiveDate}
                                                name="quotationDate"
                                                onChange={(e) => setEffectiveDate(e[0].toISOString())}
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
                                        {effectiveDate == null ? <div className="text-danger">{'Effective Date is required'}</div> : null}
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-2">
                                <div className="col">
                                    <div className="mb-3">
                                        <label className="form-label">Payment Terms </label>
                                            <ReactMultiSelectCheckboxes
                                            
                                                options={[{ id:0, label: "All", value: "0" }, ...paymentTerms]}
                                                placeholderButtonLabel="Select Payment Term"
                                                getDropdownButtonLabel={getDropdownButtonLabel}
                                                value={selectedPaymentTerms}
                                                onChange={onChange}
                                                setState={setSelectedPaymentTerms}
                                                
                                            />
                                    </div>
                                </div>
                               

                                <div className="col">

                                    <label className="form-label">Territory</label>
                                    <Select
                                        name="territoryId"
                                        onChange={(e) => setTerritory(e)}
                                        options={territoriesOptions}
                                        value={territory}
                                        className="select2-selection row1" />


                                </div>

                            </div>


                            <div className="row mb-3">


                                <div className="col">

                                    <label className="form-label">Customer</label>
                                    <Select
                                        name="businessPartner"
                                        onChange={(e) => setSelectedBusinessPartner(e)}
                                        options={businessPartners}
                                        value={selectedBusinessPartner}
                                        className="select2-selection row1" />


                                </div>

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

                            <div className="row mb-2 tab-pane">
                                <h5>Price List Details</h5>
                                <table className="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Item</th>
                                            <th>Minimum Quantity</th>
                                            <th>Maximum Quantity</th>
                                            <th>Price</th>
                                            <th>Unit Of Measure</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {details.map((formRow, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td style={{width:'20%'}}>
                                                        <Select
                                                            onChange={(e) => handleFormChange(e, index)}
                                                            name="item"
                                                            options={itemsDropDown}
                                                            value={formRow.item}
                                                            className="select2-selection row1" />
                                                    </td>
                                                    <td style={{width:'17%'}}>
                                                        <input type="number" className="form-control form-control-sm" autoComplete="off" name="minQuantity" value={formRow.minQuantity} onChange={(e) => handleFormChange(e, index)} />
                                                    </td>
                                                    <td style={{width:'17%'}}>
                                                        <input type="number" className="form-control form-control-sm" autoComplete="off" name="maxQuantity" value={formRow.maxQuantity} onChange={(e) => handleFormChange(e, index)} />
                                                    </td>
                                                    <td style={{width:'17%'}}>
                                                        <input type="number" className="form-control form-control-sm" autoComplete="off" name="price" value={formRow.price} onChange={(e) => handleFormChange(e, index)} />
                                                    </td>
                                                    <td style={{width:'20%'}}>
                                                        <Select
                                                            onChange={(e) => handleFormChange(e, index)}
                                                            name="unitOfMeasure"
                                                            options={unitsOfMeasureDropDown}
                                                            value={formRow.unitOfMeasure}
                                                            className="select2-selection row1" />
                                                    </td>
                                                   
                                                    <td style={{width:'8%', textAlign:'right'}}>
                                                                <span title="Click to Add"  type="button" className="text-primary" style={{marginTop: 10, marginRight:10, cursor: "pointer", fontSize: 12}}  onClick={addPriceDetails}><i className="fa fa-plus"></i></span>        
                                                                <span  title="Click to Remove" onClick={() => removeFields(formRow)}><i className="far  fas fa-trash-alt me-2" style={{ width: 10, marginLeft: 0, color:'red' }} /></span>
                                                    </td>
                                                    
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>



                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={() => {
                                setmodal_backdrop(false);
                                resetForm()
                                setShowEditModal(false)
                            }}>Close</button>
                            {!showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2" ></i>Save</button>}
                        {showEditModal && <button type="submit" className="btn btn-success"><i className="fas fa-save me-2"></i>Update</button>} </div>
                        
                    </form>

                </Modal>
                <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />


            </div>
        </>




    );
}
PriceLists.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default PriceLists;