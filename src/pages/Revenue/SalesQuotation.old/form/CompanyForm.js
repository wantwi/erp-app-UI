import React, { useEffect, useRef } from 'react'
import { useState } from 'react';

import { Col, Modal, Nav, CardText, NavItem, NavLink, Row, TabContent, Form, TabPane, Table, Alert } from 'reactstrap';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray, Controller } from "react-hook-form"
import "./stickyTable.css"
import { usePost } from 'hook/usePost';
import { moneyInTxt, showToast } from 'helpers/utility';
import { usePut } from 'hook/usePut';
import Select from 'react-select';
import { getExpirationDate, getNextTransactionDate } from 'helpers/helperfunction';
import classnames from "classnames";
import CurrencyInput from 'react-currency-input-field'
import { useGetById } from 'hook/useGetById';
//Import Flatepicker
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from "react-icons/fa"



// const validationSchema = Yup.object().shape({
//     transactionDate: Yup.string().required('Transaction Date is required'),
//     depreciationStartDate: Yup.string().required('Asset Capitalisation Date is required'),
//     status: Yup.string(),
//     businessPartner: Yup.string(),
//     entries: Yup.array().of(
//         Yup.object().shape({
//             itemId: Yup.object().shape({ value: Yup.number(), label: Yup.string() }).required(),
//             quantity: Yup.number(),
//             unitPrice: Yup.number(),
//             totalAmount: Yup.string(),
//             remarks: Yup.string()
//         })
//     )

// });


// {
//     "businessPartner": {
//       "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
//     },
//     "remarks": "string",
//     "transactionDate": "2023-11-28T21:01:32.405Z",
//     "currency": {
//       "id": 0
//     },
//     "exchangeRateValue": 0,
//     "dueDate": "2023-11-28T21:01:32.405Z",
//     "salesQuotationItems": [
//       {
//         "item": {
//           "id": 0
//         },
//         "quantity": 0,
//         "price": 0,
//         "lineRemarks": "string"
//       }
//     ]




const item = { item: null, quantity: 1, price: "", lineRemarks: "" }

const defaultvalue = {
    businessPartner: null,
    currency: null,
    transactionDate: "",
    exchangeRateValue: 1,
    dueDate: "",
    remarks: "",
    entries: [item],
    documentNumber: "",
    status: ""

};




const convertCurrency = (value, code = 'GHS') => {
    if (code === "USD") {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: code,


        }).replace('$', `USD `)
    }
    if (code === "EUR") {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: code,


        }).replace('€', `EUR `)
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
    }).format(value);
}


const CompanyForm = ({ refetch, BusinessPartners, items, rowInfo, setRowInfo, setShowLoading, currenciesList, modal_backdrop, setmodal_backdrop, setMinimized }) => {
    // const [status, setStatus] = useState("Closed")
    const [isRecurring, setIsrecurring] = useState(false)
    const flatpickrRef = useRef(null);
    const flatpickrRef2 = useRef(null);
    const [isFC, setIsFC] = useState(false)

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };
    const openFlatpickr2 = () => {
        flatpickrRef2?.current?.flatpickr.open();
    };

    const { control, register, handleSubmit, watch, reset, formState: { errors }, getValues, setValue, setError, clearErrors } = useForm({
        defaultValues: defaultvalue,
        // resolver: yupResolver(validationSchema)
    })

    const { fields, append, remove } = useFieldArray({
        name: "entries",
        control,
        rules: {
            required: "Please provide at least one Item"
        }
    })

    const businessPartner = watch("businessPartner")

    const onSuccess = (data) => {

        console.log({ onSuccess: data });

        setValue('currency', data?.preferredCurrencies[0]?.id || 0)

        data?.preferredCurrencies[0]?.isHome === 'Yes' ? setIsFC(false) : setIsFC(true)

    }

    const { refetch: getBusinessPartner, data, isLoading: isBPLoading } = useGetById(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners/${businessPartner?.value || rowInfo?.businessPartner?.id}`, 'business-partners', businessPartner?.value, onSuccess)
    // const { isLoading, isSuccess, mutate: PostDetails } = usePost(`${process.env.REACT_APP_ADMIN_URL}/CapitalisationDetails`, 'capitalisations')
    // const { isLoading: isPutLoading, isSuccess: isPutSuccess, mutate: putDetailsMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/CapitalisationDetails/UpdateDetailsByCapitalisationId/${rowInfo?.id}`, 'capitalisations')
    console.log({ businessPartner, data });
    const onPostSuccess = (data) => {

        console.log({ data })
    }

    const onPutSuccess = (data) => {


    }

    const onError = () => {
        setShowLoading(false)
    }


    const { isLoading, isSuccess, mutate } = usePost(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations`, "sales-quotations", onPostSuccess, onError)

    const { isLoading: isPutLoading, isSuccess: isPutSuccess, mutate: putMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations/${rowInfo?.id}`, 'sales-quotations', onPutSuccess, onError)

    function onSubmit(data) {

        const postData = {
            businessPartner: {
                id: data?.businessPartner?.value
            },
            remarks: data?.remarks,
            transactionDate: data?.transactionDate,
            currency: {
                id: Number(data?.currency)
            },
            exchangeRateValue: Number(data?.exchangeRateValue),
            dueDate: data?.dueDate,
            salesQuotationItems: data?.entries.map(x => ({
                item: { id: x?.item?.value },
                quantity: Number(x?.quantity),
                price: Number(x?.price),
                lineRemarks: x?.lineRemarks

            }))

        }


        //mutate(postData)
        //return
        rowInfo?.id ? putMutate(postData) : mutate(postData)
    }


    useEffect(() => {
        if (isSuccess) {
            refetch()
            setmodal_backdrop(false)
            showToast("success", "Sales Quotation Created Successfully", "Notice")
            reset()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }
        if (isPutSuccess) {
            // setmodal_backdrop(false)
            showToast("success", "Sales Quotation Updated Successfully", "Notice")
            // reset()
            setShowLoading(false)
        }
        if (isPutLoading) {
            setShowLoading(isLoading)
        }

        if (isPutLoading || isLoading) {
            setShowLoading(true)
        }

        return () => {

        }
    }, [isSuccess, isLoading, isPutLoading, isPutSuccess])
    //account: 0, credit: 0, debit: 0, commnet: "" 

    useEffect(() => {
        setValue("transactionDate", new Date().toISOString().slice(0, 10))
        setValue("dueDate", "")
        setValue("entries", [item, item])
        setValue("status", "")
        setValue("documentNumber", "")
        setValue("remarks", "")

        if (rowInfo?.id) {


            const details = rowInfo?.salesQuotationItems.map(x => ({
                item: { value: x?.item?.id, label: x?.item?.name },
                quantity: x?.quantity,
                price: x?.price,
                lineRemarks: x?.lineRemarks
            }))
            setValue("dueDate", rowInfo?.dueDate.split("T")[0])
            setValue("transactionDate", rowInfo?.transactionDate.split("T")[0])
            setValue('status', rowInfo?.status)
            setValue('documentNumber', rowInfo?.number)
            setValue('exchangeRateValue', rowInfo?.exchangeRateValue)
            setValue('currency', rowInfo?.currency?.id)
            setValue('businessPartner', { value: rowInfo?.businessPartner?.id, label: rowInfo?.businessPartner?.name })
            setValue("entries", details)
            setTimeout(() => {
                getBusinessPartner()
                setmodal_backdrop(true)

            }, 300);




        }
        return () => {

        }
    }, [rowInfo])



    const handleAppendRow = () => {
        append({ ...item })
    }

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {

            if (name === 'businessPartner') {
                setTimeout(() => {
                    getBusinessPartner()
                }, 300);

            }

            if (name === 'currency') {
                const currency = currenciesList.find(x => +x?.id === +value.currency)

                console.log({ currency, value });

                currency?.isHome === "Yes" ? setIsFC(false) : setIsFC(true)
            }

        }, { businessPartner: true, currency: true })


        return () => subscription.unsubscribe()

    }, [watch(["businessPartner", "currency"])])





    return (
        <Modal
            isOpen={modal_backdrop}
            toggle={() => {
                tog_backdrop();
            }}
            backdrop={'static'}
            id="staticBackdrop"
            size='xl'
        >
            <div className="modal-header">
                <h5 className="modal-title" id="staticBackdropLabel">
                    {rowInfo?.id ? `Edit Transaction No. - ${rowInfo?.id}` : "Add Sale Quotation"}
                </h5>
                <div>
                    <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                    <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                        onClick={() => {
                            setmodal_backdrop(false);
                            setRowInfo({})
                        }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                </div>


            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                    <div className="row mb-3">
                        <div className="col col-md-3">
                            <div >
                                <label className="form-label">Document Date <i className="text-danger">*</i></label>
                                <div className="input-group">
                                    <Controller
                                        name="transactionDate"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <Flatpickr
                                                {...field}
                                                className="form-control form-control-sm"
                                                placeholder="dd M, yyyy"
                                                options={{
                                                    altInput: true,
                                                    altFormat: "d M, Y",
                                                    dateFormat: "Y-m-d"
                                                }}
                                                ref={flatpickrRef}
                                            />
                                        )}
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text" onClick={openFlatpickr}>
                                            <FaCalendar />
                                        </span>
                                    </div>
                                </div>

                                <div className="invalid-feedback">{errors.transactionDate?.message}</div>
                            </div>
                        </div>
                        <div className="col col-md-3">
                            <label className="form-label">Due Date <i className="text-danger">*</i></label>
                            <div className="input-group">
                                <Controller
                                    name="dueDate"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Flatpickr
                                            {...field}
                                            className="form-control form-control-sm"
                                            placeholder="dd M, yyyy"
                                            options={{
                                                altInput: true,
                                                altFormat: "d M, Y",
                                                dateFormat: "Y-m-d"
                                            }}
                                            ref={flatpickrRef2}
                                        />
                                    )}
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text" onClick={openFlatpickr2}>
                                        <FaCalendar />
                                    </span>
                                </div>
                            </div>
                            {/* <Controller
                                name={`dueDate`}
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="date"
                                        {...field} className={`form-control form-control-sm ${errors.dueDate ? 'is-invalid' : ''}`}
                                        placeholder="Enter"

                                    />
                                )}

                            /> */}
                            <div className="invalid-feedback">{errors.dueDate?.message}</div>

                        </div>
                        <div className="col col-md-3 offset-md-1">

                            <div >
                                <label className="form-label">Document Number <i className="text-danger"></i></label>
                                <Controller
                                    name={`documentNumber`}
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            {...field} className={`form-control form-control-sm`}
                                            placeholder="Document Number"
                                            disabled

                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="col col-md-2">
                            <div >
                                <label className="form-label">Status<i className="text-danger"></i></label>
                                <Controller
                                    name={`status`}
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            {...field} className={`form-control form-control-sm`}
                                            placeholder="Status"
                                            disabled

                                        />
                                    )}
                                />
                            </div>
                        </div>

                    </div>
                    <div className="row mb-3">


                        <div className="col col-md-6">
                            <label className="form-label">Customer <i className="text-danger"></i></label>
                            <Controller
                                name="businessPartner"
                                control={control}
                                rules={{ required: 'Please select a business partner' }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        options={BusinessPartners.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))}
                                        placeholder="Select Business Partner"
                                        isClearable
                                        onChange={(selectedOption) => field.onChange(selectedOption)}
                                    />
                                )}
                            />
                        </div>
                        <div className="col col-md-3 offset-md-1">
                            <label className="form-label">Currency <i className="text-danger"></i></label>
                            <Controller
                                name={`currency`}
                                control={control}
                                render={({ field }) => (
                                    <select
                                        name="currency"
                                        className={`form-select form-select-sm ${errors.currency ? 'is-invalid' : ''}`}
                                        {...field}

                                    >
                                        <option value={0}>Select currency</option>
                                        {currenciesList?.map((x) => (
                                            <option key={x?.id} value={x?.id}>
                                                {x?.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            <div className="invalid-feedback">{errors.currency?.message}</div>


                        </div>
                        <div className="col col-md-2">


                            {
                                isFC ? <>
                                    <label className="form-label">Exchange Rate<i className="text-danger"></i></label>
                                    <Controller
                                        name={`exchangeRateValue`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="number"
                                                {...field}
                                                placeholder="0"
                                                className='form-control form-control-sm'

                                            />
                                        )}

                                    />

                                </> : null
                            }


                        </div>

                    </div>

                    <div className="row mb-3">

                        <div className="col col-md-6">

                            <label className="form-label">Remarks<i className="text-danger"></i></label>
                            <Controller
                                name={`remarks`}
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        {...field}
                                        placeholder="Enter Remarks"
                                        className='form-control form-control-sm'

                                    />
                                )}

                            />
                        </div>


                    </div>
                    {/* Balance, Credit Limit, Last Invoice Date, Invoice Amount, Last Payment Date, Payment Amount */}


                    {/* <div hidden={isBPLoading} className='row m-1 my-2 p-1 pt-2' style={{ background: "#f8f8fb", borderRadius: 8 }}>
                        <div className='col-2 d-flex flex-column'>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p><p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>
                            <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p>

                        </div>

                    </div> */}
                    <div hidden={!data} className='row m-1 my-2 p-1 pt-2' style={{ background: "#f8f8fb", borderRadius: 8 }}>
                        <div className='col-2 d-flex flex-column'>
                            <h6>Balance</h6>
                            <p>{data?.balance}</p>
                            {/* <p className="placeholder-glow" >
                                <span className="placeholder col-12"></span>
                            </p> */}

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <h6>Credit Limit</h6>
                            <p>{data?.creditLimit}</p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <h6>Last Invoice Date</h6>
                            <p>{data?.bussinessPartnerLatestTransaction?.lastInvoiceDate || ""}</p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <h6>Invoice Amount</h6>
                            <p>{data?.bussinessPartnerLatestTransaction?.lastInvoiceDate || ""}</p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <h6>Last Payment Date</h6>
                            <p>{data?.bussinessPartnerLatestTransaction?.lastPaymentDate || ""}</p>

                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <h6>Payment Amount</h6>
                            <p>{data?.bussinessPartnerLatestTransaction?.lastPaymentAmount || ""}</p>

                        </div>

                    </div>

                    <div className="wrapper row1">
                        <div className="table-wrapper" style={{ minHeight: "40vh", maxHeight: "60vh" }}>
                            <Table className="table table-hover table-bordered table-sm" style={{ fontSize: '0.9em !important' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Item</th>
                                        <th style={{ width: 100 }} >Instock Qty.</th>
                                        <th style={{ width: 90 }} >Quantity</th>
                                        <th style={{ width: 120 }} className='text-r' >Price</th>
                                        <th>Remarks</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody id="cost_area_TableBody">
                                    {
                                        fields.map((field, index) => (

                                            <tr key={field?.id}>
                                                <td>{index + 1}</td>

                                                <td style={{ minWidth: 200 }}>
                                                    <Controller
                                                        name={`entries[${index}].item`}
                                                        control={control}
                                                        rules={{ required: true }} // Add your validation rules here
                                                        render={({ field, fieldState }) => (
                                                            <Select
                                                                name={field.name}
                                                                value={field.value}
                                                                options={items.map((x) => ({ value: x?.id, label: `${x?.code} - ${x?.name}` }))}
                                                                placeholder="Select Item"
                                                                isClearable
                                                                onChange={(selectedOption) => field.onChange(selectedOption)}

                                                                className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed

                                                                styles={{ background: "red" }}
                                                            />


                                                        )}
                                                    />

                                                </td>

                                                <td>
                                                    <input
                                                        type="number"
                                                        className={`form-control form-control-sm`}
                                                        placeholder="0"
                                                        disabled

                                                    />
                                                </td>
                                                <td className='text-r'>
                                                    <input
                                                        type="number"
                                                        name={`entries[${index}]quantity`}
                                                        className={`form-control form-control-sm  text-r ${errors.entries?.[index]?.quantity ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        {...register(`entries.${index}.quantity`)}
                                                    />

                                                </td>
                                                <td className='text-r'>
                                                    <Controller
                                                        name={`entries[${index}].price`}
                                                        control={control}
                                                        rules={{ required: true }} // Add your validation rules here
                                                        render={({ field, fieldState }) => (
                                                            <CurrencyInput
                                                                id="input-example"
                                                                name={field.name}
                                                                value={field.value}
                                                                className={`form-control form-control-sm text-r ${errors.entries?.[index]?.price ? 'is-invalid' : ''}`}
                                                                placeholder="0.00"
                                                                decimalsLimit={2}
                                                                onValueChange={(value, name) => field.onChange(value)}
                                                            />
                                                        )}
                                                    />
                                                </td>


                                                <td>
                                                    <input
                                                        type="text"
                                                        name={`entries[${index}]lineRemarks`}
                                                        className={`form-control form-control-sm`}
                                                        placeholder="Remarks"
                                                        {...register(`entries.${index}.lineRemarks`)}
                                                    />
                                                </td>

                                                <td>
                                                    <>
                                                        <span disabled={rowInfo?.id} type='button' style={{ marginRight: 5, cursor: "pointer", fontSize: 12 }} className='text-primary' onClick={handleAppendRow}><i className='fa fa-plus'></i></span>
                                                        <span disabled={rowInfo?.id} style={{ marginRight: 5, cursor: "pointer", fontSize: 12 }} className='text-danger' onClick={() => remove(index)}><i className='fa fa-trash-alt'></i></span>
                                                    </>


                                                </td>

                                            </tr>

                                        ))
                                    }

                                </tbody>
                            </Table>
                        </div>
                    </div>

                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => {
                        setmodal_backdrop(false);
                        setRowInfo({})
                    }}>Close</button>
                    <button type="submit" className="btn btn-sm  btn-success"><i className="fas fa-save me-2"></i>{rowInfo?.id ? "Update" : "Save"}</button>
                </div>
            </form>
        </Modal>

    )
}

export default CompanyForm