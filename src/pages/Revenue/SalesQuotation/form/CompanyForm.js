import React, { useEffect, useRef } from 'react'
import { useState } from 'react';

import { Col, Modal, Nav, CardText, NavItem, NavLink, Row, TabContent, Form, TabPane, Table, Alert, DropdownItem, DropdownToggle, UncontrolledDropdown, DropdownMenu } from 'reactstrap';

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
import { FaCalendar, FaInfoCircle } from "react-icons/fa"
import useCustomAxios from 'hook/useCustomAxios';


function getFormattedDate(strDate) {
    const inputDate = new Date(strDate)
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(inputDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

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




const item = { item: null, vat: null, vatValue: '', warehouse: null, withholdingTax: null, withholdingTaxValue: '', uom: null, quantity: 1, price: "", lineRemarks: "" }

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

    // businessPartner: null,
    // currency: null,
    // transactionDate: "",
    // exchangeRateValue: 1,
    // dueDate: "",
    // remarks: "",
    // entries: [item],
    // documentNumber: "",
    // status: ""

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

const convertDate = (date) => {
    const strDate = new Date(date)
    const year = strDate.getFullYear()
    const month = strDate.getMonth() + 1
    const day = strDate.getDate()

    return `${year}-${month}-${day}`
}


const CompanyForm = ({ refetch,
    UoM,
    TaxTable,
    Warehouse,
    BusinessPartners,
    items,
    rowInfo,
    setRowInfo,
    setShowLoading,
    currenciesList,
    modal_backdrop,
    setmodal_backdrop,
    setMinimized }) => {
    const axios = useCustomAxios()
    const [isRecurring, setIsrecurring] = useState(false)
    const flatpickrRef = useRef(null);
    const flatpickrRef2 = useRef(null);
    const [isFC, setIsFC] = useState(false)
    const [totalUnitPrice, setTotalUnitPrice] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalTax, setTotalTax] = useState(0)
    const [totalWHT, setTotalWHT] = useState(0)
    const [action, setAction] = useState(1)


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

    const exRateSuccess = (data) => {

        console.log({ exRateSuccess: data })
        setValue("exchangeRateValue", data[0]?.rate || 1)

    }

    const transDate = watch("transactionDate")
    const currencyId = watch("currency")

    const { refetch: getBusinessPartner, data, isLoading: isBPLoading } = useGetById(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners/${businessPartner?.value || rowInfo?.businessPartner?.id}`, 'business-partners', businessPartner?.value, onSuccess)
    const { refetch: getExchangeRate } = useGetById(`${process.env.REACT_APP_ADMIN_URL}/ExchangeRate/GetDaysExchangeRateOfCurrency/${convertDate(transDate)}?currencyId=${getValues("currency")}`, 'exchange-rate', getValues("currency"), exRateSuccess)
    // const { isLoading, isSuccess, mutate: PostDetails } = usePost(`${process.env.REACT_APP_ADMIN_URL}/CapitalisationDetails`, 'capitalisations')
    // const { isLoading: isPutLoading, isSuccess: isPutSuccess, mutate: putDetailsMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/CapitalisationDetails/UpdateDetailsByCapitalisationId/${rowInfo?.id}`, 'capitalisations')
    console.log({ businessPartner, data });
    const onPostSuccess = (data) => {

        console.log({ data })
    }

    const onPutSuccess = (data) => {
    }

    const onMutateError = () => {
        setShowLoading(false)
    }


    const { isLoading, isSuccess, mutate } = usePost(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations`, "sales-quotations", onPostSuccess, onMutateError)
    const { isLoading: isDraftLoading, isSuccess: isDraftSuccess, mutate: draftMutate } = usePost(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations/Draft`, "sales-quotations", onPostSuccess, onMutateError)

    const { isLoading: isPutLoading, isSuccess: isPutSuccess, mutate: putMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations/${rowInfo?.id}`, 'sales-quotations', onPutSuccess, onMutateError)

    function onSubmit(data) {

        const postData = {
            businessPartner: {
                id: data?.businessPartner?.value
            },
            remarks: data?.remarks,
            transactionDate: convertDate(data?.transactionDate),
            dueDate: convertDate(data?.dueDate),
            currency: {
                id: Number(data?.currency)
            },
            exchangeRateValue: Number(data?.exchangeRateValue),
            salesQuotationItems: data?.entries.map(x => ({
                id: 0,
                item: { id: x?.item?.value },
                quantity: Number(x?.quantity),
                price: Number(x?.price),
                unitOfMeasure: {
                    id: x?.uom?.value
                },
                warehouse: {
                    id: x?.warehouse?.value,
                    name: x?.warehouse?.label,
                },
                vat: {
                    id: x?.vat?.value,
                    name: x?.vat?.label,
                },
                vatValue: Number(x?.vatValue.replace(/,/g, '')) || 0,
                withholdingTax: {
                    id: x?.withholdingTax?.value,
                    name: x?.withholdingTax?.label,
                },
                withholdingTaxValue: Number(x?.withholdingTaxValue?.replace(/,/g, '')) || 0,
                lineRemarks: ""

            }))

        }

        // console.log({ postData })

        // return

        if (action === 1) {
            rowInfo?.id ? putMutate(postData) : mutate(postData)
        } else if (action === 2) {
            draftMutate(postData)
        } else if (action === 3) {
            alert("Prepare for delivery")
        }
    }

    const onError = (errors) => {
        console.log({ onError: errors })

    }



    useEffect(() => {
        if (isSuccess) {
            refetch()
            setmodal_backdrop(false)
            showToast("success", "Sales Quotations Created Successfully", "Notice")
            reset()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }
        if (isPutSuccess) {
            // setmodal_backdrop(false)
            showToast("success", "Sales Quotations Updated Successfully", "Notice")
            // reset()
            setShowLoading(false)
        }
        if (isPutLoading) {
            setShowLoading(isLoading)
        }

        if (isPutLoading || isLoading) {
            setShowLoading(true)
        }
        if (isDraftSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Sales Order  Saved as Draft", "Notice")
            // reset()
            setShowLoading(false)
        }
        if (isDraftLoading) {
            setShowLoading(isLoading)
        }

        return () => {

        }
    }, [isSuccess, isLoading, isPutLoading, isPutSuccess, isDraftLoading, isDraftSuccess])
    //account: 0, credit: 0, debit: 0, commnet: "" 

    useEffect(() => {
        setValue("transactionDate", new Date().toISOString().slice(0, 10))
        setValue("exchangeRateValue", 1)
        setValue("entries", [item, item])
        setValue("status", "")
        setValue("documentNumber", "")
        setValue("businessPartner", null)
        setValue("remarks", "")

        if (rowInfo?.id) {

            console.log({ rowInfo });


            const details = rowInfo?.salesQuotationItems.map(x => ({
                item: { value: x?.item?.id, label: x?.item?.name },
                quantity: x?.quantity,
                price: x?.price,
                uom: { value: x?.unitOfMeasure?.id, label: x?.unitOfMeasure?.name },
                warehouse: { value: x?.warehouse?.id, label: x?.warehouse?.name },
                vat: { value: x?.vat?.id, label: x?.vat?.name },
                vatValue: moneyInTxt(x?.vatValue, "en", 2),
                withholdingTax: { value: x?.withholdingTax?.id, label: x?.withholdingTax?.name },
                withholdingTaxValue: moneyInTxt(x?.withholdingTaxValue, "en", 2)

            }))



            setValue("transactionDate", rowInfo?.transactionDate.split("T")[0])
            setValue("dueDate", rowInfo?.dueDate.split("T")[0])
            setValue('status', rowInfo?.status)
            setValue('documentNumber', rowInfo?.number)
            setValue('exchangeRateValue', rowInfo?.exchangeRateValue)
            setValue('currency', rowInfo?.currency?.id)
            setValue('businessPartner', { value: rowInfo?.businessPartner?.id, label: rowInfo?.businessPartner?.name })
            setValue("remarks", rowInfo?.remarks)
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

    useEffect(() => {

        if (getValues('currency') && getValues("transactionDate")) {
            getExchangeRate()

        }


        return () => {

        }
    }, [watch(['currency', 'transactionDate'])])



    const getPriceValue = async (itemdId, customerId, quantity, unitOfMeasureId, index) => {
        if (!customerId) {
            showToast("warning", 'Please select customer', "Notice")
            setValue(`entries[${index}].item`, null)
            return
        }
        console.log({ itemdId, customerId, quantity, unitOfMeasureId });
        if (itemdId?.value && customerId?.value && unitOfMeasureId?.value && quantity) {
            const req = await axios.get(`${process.env.REACT_APP_ADMIN_URL}/Pricing/GetBestPricingForItemAndQuantity?itemdId=${itemdId?.value}&customerId=${customerId?.value}&quantity=${quantity}&unitOfMeasureId=${unitOfMeasureId?.value}`)
            setValue(`entries[${index}].price`, req.data.payload)
        }
    }

    const getTaxValue = (value, index) => {

        if (value) {
            setValue(`entries[${index}].vatValue`, moneyInTxt(TaxTable.find(x => x?.id === value)?.percentOrAmountTypeValue || 0, "en", 2))
        } else {
            setValue(`entries[${index}].vatValue`, '')
        }

    }

    const getWHTValue = (value, index) => {
        if (value) {
            setValue(`entries[${index}].withholdingTaxValue`, moneyInTxt(TaxTable.find(x => x?.id === value)?.percentOrAmountTypeValue || 0, "en", 2))
        } else {
            setValue(`entries[${index}].withholdingTaxValue`, '')
        }


    }

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            setTotalUnitPrice(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.price), 0))
            setTotalPrice(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.quantity) * Number(currentValue.price), 0))
            setTotalTax(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.vatValue), 0))
            setTotalWHT(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.withholdingTaxValue), 0))
        }, { entries: true }) // Subscribe to changes in the 'entries' field only


        return () => subscription.unsubscribe()

    }, [watch(["entries"])])



    return (
        <div className='order-modal'>
            <Modal
                isOpen={modal_backdrop}
                toggle={() => {
                    tog_backdrop();
                }}
                backdrop={'static'}
                id="staticBackdrop"
                size='xl'
                className="custom-modal"

            >
                <div className="modal-header">
                    <h5 className="modal-title" id="staticBackdropLabel">
                        {rowInfo?.id ? `Edit Transaction No. - ${rowInfo?.number}` : "Add Sales Quotation"}
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
                <form onSubmit={handleSubmit(onSubmit, onError)}>
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
                                            {/* <option value={0}>Select currency</option> */}
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


                                {/* {
                                isFC ? <> */}
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
                                            disabled={!isFC}

                                        />
                                    )}

                                />

                                {/* </> : null
                            } */}


                            </div>
                            <div className="col col-md-2" hidden>
                                <label className="form-label">Tax Table <i className="text-danger"></i></label>
                                <Controller
                                    name={`tax`}
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            name="tax"
                                            className={`form-select form-select-sm ${errors.currency ? 'is-invalid' : ''}`}
                                            {...field}

                                        >
                                            <option value={0}>Select Tax</option>
                                            {TaxTable?.map((x) => (
                                                <option key={x?.id} value={x?.id}>
                                                    {x?.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                <div className="invalid-feedback">{errors.currency?.message}</div>


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
                            <div className="table-wrapper sticktable" style={{ minHeight: "40vh", maxHeight: "60vh" }}>
                                <Table className="table table-hover table-bordered table-sm " style={{ fontSize: '0.9em !important' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: 20 }} className='sticky-columns'>#</th>
                                            <th className='sticky-columns'>Item</th>
                                            <th className='sticky-columns'>Warehouse</th>
                                            <th className='sticky-columns'>UoM</th>
                                            <th style={{ width: 90 }} >Qty</th>
                                            <th style={{ width: 95 }} className='text-r' >Price</th>
                                            <th>Tax</th>
                                            <th style={{ width: 90 }}>Value</th>
                                            <th>WHT</th>
                                            <th style={{ width: 90 }}>Value</th>
                                            <th style={{ width: 120 }} className='text-r'>Total</th>
                                            <th style={{ width: 50 }}></th>
                                        </tr>
                                    </thead>

                                    <tbody className='tbody' id="cost_area_TableBody">
                                        {
                                            fields.map((field, index) => (

                                                <tr key={field?.id}>
                                                    <td className='sticky-columns'>{index + 1}</td>

                                                    <td className='sticky-columns' style={{ minWidth: 200 }}>
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

                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption)
                                                                        getPriceValue(
                                                                            selectedOption,
                                                                            getValues("businessPartner"),
                                                                            getValues(`entries[${index}]quantity`),
                                                                            getValues(`entries[${index}].uom`), index)

                                                                    }}



                                                                    className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed
                                                                />


                                                            )}
                                                        />

                                                    </td>
                                                    <td className='sticky-columns' style={{ minWidth: 200, display: 'flex', justifyContent: "space-between" }}>
                                                        <Controller
                                                            name={`entries[${index}].warehouse`}
                                                            control={control}
                                                            rules={{ required: true }}
                                                            render={({ field, fieldState }) => (
                                                                <Select
                                                                    name={field.name}
                                                                    value={field.value}
                                                                    options={Warehouse.map((x) => ({ value: x?.id, label: `${x?.name}` }))}
                                                                    placeholder="Select warehouse"


                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption)
                                                                        // getPriceValue(
                                                                        //     selectedOption,
                                                                        //     getValues("businessPartner"),
                                                                        //     getValues(`entries[${index}]quantity`),
                                                                        //     getValues(`entries[${index}].uom`), index)

                                                                    }}



                                                                    className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed
                                                                />


                                                            )}
                                                        />
                                                        <UncontrolledDropdown>
                                                            <DropdownToggle
                                                                href="#"
                                                                className="card-drop"
                                                                tag="a"
                                                            >
                                                                <FaInfoCircle />
                                                            </DropdownToggle>
                                                            <DropdownMenu className="dropdown-menu-end">
                                                                <DropdownItem
                                                                    href="#"
                                                                    onClick={() => { }}
                                                                >
                                                                    {/* <i className="mdi mdi-pencil font-size-16 text-success me-1" />{" "} */}
                                                                    Expected Quantity
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    href="#"
                                                                    onClick={() => { }}
                                                                >

                                                                    Maximum Quantity
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    href="#"
                                                                    onClick={() => { }}
                                                                >

                                                                    Minimum Quantity
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    href="#"
                                                                    onClick={() => { }}
                                                                >

                                                                    Price List
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </UncontrolledDropdown>

                                                    </td>
                                                    <td className='sticky-columns' style={{ minWidth: 150 }}>
                                                        <Controller
                                                            name={`entries[${index}].uom`}
                                                            control={control}
                                                            rules={{ required: true }} // Add your validation rules here
                                                            render={({ field, fieldState }) => (
                                                                <Select
                                                                    name={field.name}
                                                                    value={field.value}
                                                                    options={UoM.map((x) => ({ value: x?.id, label: x?.name }))}
                                                                    placeholder="Select UoM"

                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption)
                                                                        getPriceValue(
                                                                            getValues(`entries[${index}].item`),
                                                                            getValues("businessPartner"),
                                                                            getValues(`entries[${index}]quantity`),
                                                                            selectedOption, index)

                                                                    }}


                                                                    className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed

                                                                    styles={{ background: "red" }}
                                                                />


                                                            )}
                                                        />

                                                    </td>

                                                    <td className='text-r'>
                                                        <Controller
                                                            name={`entries[${index}].quantity`}
                                                            control={control}
                                                            rules={{ required: true }} // Add your validation rules here
                                                            render={({ field, fieldState }) => (
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    name={field.name}
                                                                    value={field.value}
                                                                    className={`form-control form-control-sm`}
                                                                    placeholder="0.00"
                                                                    onChange={(e) => {
                                                                        getPriceValue(
                                                                            getValues(`entries[${index}].item`),
                                                                            getValues("businessPartner"),
                                                                            e.target.value,
                                                                            getValues(`entries[${index}].uom`), index)

                                                                        field.onChange(e.target.value)

                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        {/* <input
                                                            type="number"
                                                            name={`entries[${index}]quantity`}
                                                            className={`form-control form-control-sm  text-r ${errors.entries?.[index]?.quantity ? 'is-invalid' : ''}`}
                                                            placeholder="0"
                                                            {...register(`entries.${index}.quantity`)}
                                                            onChange={() => {

                                                                getPriceValue(
                                                                    getValues(`entries[${index}].price`),
                                                                    getValues("businessPartner"),
                                                                    getValues(`entries[${index}].quantity`),
                                                                    getValues(`entries[${index}].uom`), index)

                                                            }}
                                                        /> */}

                                                    </td>
                                                    <td className='text-r'>
                                                        <Controller
                                                            name={`entries[${index}].price`}
                                                            control={control}
                                                            rules={{ required: true, }} // Add your validation rules here
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

                                                    <td style={{ minWidth: 150 }}>
                                                        <Controller
                                                            name={`entries[${index}].vat`}
                                                            control={control}
                                                            // rules={{ required: true }} // Add your validation rules here
                                                            render={({ field, fieldState }) => (
                                                                <Select
                                                                    name={field.name}
                                                                    value={field.value}
                                                                    options={TaxTable.filter(x => x?.taxType?.name === 'Value Added Tax (VAT)').map((x) => ({ value: x?.id, label: x?.name }))}
                                                                    placeholder="Select Tax"

                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption)
                                                                        getTaxValue(selectedOption?.value, index)
                                                                    }}

                                                                // className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed
                                                                />
                                                            )}
                                                        />

                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            name={`entries[${index}]vatValue`}
                                                            className={`form-control form-control-sm  text-r`}
                                                            placeholder="0"
                                                            {...register(`entries.${index}.vatValue`)}
                                                            disabled
                                                        />
                                                    </td>
                                                    <td style={{ minWidth: 150 }}>
                                                        <Controller
                                                            name={`entries[${index}].withholdingTax`}
                                                            control={control}
                                                            // rules={{ required: true }} // Add your validation rules here
                                                            render={({ field, fieldState }) => (
                                                                <Select
                                                                    name={field.name}
                                                                    value={field.value}
                                                                    options={TaxTable.filter(x => x?.taxType?.name === 'Withholding Tax (WHT)').map((x) => ({ value: x?.id, label: x?.name }))}
                                                                    placeholder="Select WHT"

                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption)
                                                                        getWHTValue(selectedOption?.value, index)
                                                                    }}

                                                                // className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed
                                                                />


                                                            )}
                                                        />

                                                    </td>


                                                    <td>
                                                        <input
                                                            type="text"
                                                            name={`entries[${index}]withholdingTaxValue`}
                                                            className={`form-control form-control-sm  text-r`}
                                                            placeholder="0"
                                                            {...register(`entries.${index}.withholdingTaxValue`)}
                                                            disabled
                                                        />
                                                    </td>


                                                    <td>
                                                        <input
                                                            type="text"
                                                            className={`form-control form-control-sm  text-r`}
                                                            value={getValues(`entries[${index}]quantity`) * getValues(`entries[${index}]price`) || 0}
                                                            disabled
                                                        />
                                                    </td>


                                                    <td style={{ minWidth: 50 }}>
                                                        <>
                                                            <span disabled={rowInfo?.id} type='button' style={{ marginRight: 5, cursor: "pointer", fontSize: 12 }} className='text-primary' onClick={handleAppendRow}><i className='fa fa-plus'></i></span>
                                                            <span disabled={rowInfo?.id} style={{ marginRight: 5, cursor: "pointer", fontSize: 12 }} className='text-danger' onClick={() => remove(index)}><i className='fa fa-trash-alt'></i></span>
                                                        </>


                                                    </td>

                                                </tr>

                                            ))
                                        }
                                        <tr>

                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td className='text-r'>{moneyInTxt(totalUnitPrice, "en", 2)}</td>
                                            {/* <td></td> */}
                                            <td></td>
                                            <td className='text-r'>{moneyInTxt(totalTax, "en", 2)}</td>
                                            <td></td>
                                            <td className='text-r'>{moneyInTxt(totalWHT, "en", 2)}</td>
                                            <td className='text-r'>{moneyInTxt(totalPrice, "en", 2)}</td>
                                            <td></td>
                                        </tr>
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
                        {/* <button type="submit" onClick={() => setAction(3)} className="btn btn-sm  btn-info"><i className="fas fa-bus me-2"></i>Prepare Delivery</button> */}
                        {/* <button type="submit" onClick={() => setAction(2)} className="btn btn-sm  btn-primary"><i className="fas fa-save me-2"></i>Save as Draft</button> */}
                        <button type="submit" onClick={() => setAction(1)} className="btn btn-sm  btn-success"><i className="fas fa-save me-2"></i>{rowInfo?.id ? "Update" : "Save"}</button>
                    </div>
                </form>
            </Modal>
        </div>


    )
}

export default CompanyForm