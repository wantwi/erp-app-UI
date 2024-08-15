import React, { useEffect } from 'react'
import { useState } from 'react';

import { Col, Modal, Nav, CardText, NavItem, NavLink, Row, TabContent, Form, TabPane, Table, Alert } from 'reactstrap';
// Card,
// CardBody,
// CardText,
// CardTitle,
// Col,
// Collapse,
// Container,
// Nav,
// NavItem,
// NavLink,
// Row,
// TabContent,
// TabPane,
// UncontrolledCollapse

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
import DatepickerFormControl from 'components/datepickerComponent/DatepickerFormControl';



const validationSchema = Yup.object().shape({
    transactionDate: Yup.date().required('Transaction Date is required'),
    depreciationStartDate: Yup.date().required('Asset Capitalisation Date is required'),
    status: Yup.string(),
    entries: Yup.array().of(
        Yup.object().shape({
            itemId: Yup.object().shape({ value: Yup.number(), label: Yup.string() }).required(),
            quantity: Yup.number(),
            unitPrice: Yup.number(),
            totalAmount: Yup.string(),
            remarks: Yup.string()
        })
    )

});







const item = { itemId: null, quantity: 1, unitPrice: "", totalAmount: 0, remarks: "", id: 0 }

const defaultvalue = {
    transactionDate: "",
    depreciationStartDate: "",
    status: "Closed",
    entries: [item],

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


const CompanyForm = ({ refetch, accounts, rowInfo, setRowInfo, setShowLoading, currenciesList, modal_backdrop, setmodal_backdrop, setMinimized }) => {
    // const [activeTab, setActiveTab] = useState('General')
    const [activeTab, setactiveTab] = useState("1");
    const [isHomeCurrency, setIsHomeCurrency] = useState(true)
    const [formRows, setFormRows] = useState([{ id: 1 }]);
    const [totalCredit, setTotalCredit] = useState(0)
    const [totalDebit, setTotalDebit] = useState(0)
    const [totalCreditFC, setTotalCreditFC] = useState(0)
    const [totalDebitFC, setTotalDebitFC] = useState(0)
    // const [status, setStatus] = useState("Closed")
    const [isRecurring, setIsrecurring] = useState(false)
    const [totalError, setTotalError] = useState(false)
    const [customActiveTab, setcustomActiveTab] = useState("1");

    //console.log({accounts});

    const toggleCustom = tab => {
        if (customActiveTab !== tab) {
            setcustomActiveTab(tab);
        }
    };

    const { control, register, handleSubmit, watch, reset, formState: { errors }, getValues, setValue, setError, clearErrors } = useForm({
        defaultValues: defaultvalue,
        resolver: yupResolver(validationSchema)
    })

    const { fields, append, remove } = useFieldArray({
        name: "entries",
        control,
        rules: {
            required: "Please provide at least one GL entry"
        }
    })

    const handleIssetIsrecurringEvent = (event) => {

        setIsrecurring(!isRecurring)

    }

    const { isLoading, isSuccess, mutate: PostDetails } = usePost(`${process.env.REACT_APP_ADMIN_URL}/CapitalisationDetails`, 'capitalisations')
    const { isLoading: isPutLoading, isSuccess: isPutSuccess, mutate: putDetailsMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/CapitalisationDetails/UpdateDetailsByCapitalisationId/${rowInfo?.id}`, 'capitalisations')

    const onPostSuccess = (data) => {
        const entries = getValues("entries").map(x => ({
            id: 0,
            capitalisation: { id: data?.payload?.id },
            itemId: x?.itemId?.value,
            quantity: x?.quantity,
            unitPrice: x?.unitPrice,
            totalAmount: (x?.unitPrice * x?.quantity)
        }))

        PostDetails(entries)
    }

    const onPutSuccess = (data) => {
        const entries = getValues("entries").map(x => ({
            id: x?.id,
            capitalisation: { id: rowInfo?.id },
            itemId: x?.itemId?.value,
            quantity: x?.quantity,
            unitPrice: x?.unitPrice,
            totalAmount: (x?.unitPrice * x?.quantity),
            remarks: x?.remarks
        }))

        // console.log({entries: getValues("entries")});


        putDetailsMutate(entries)

    }



    const { isLoading: initLoading, mutate } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Capitalisations`, "capitalisations", onPostSuccess)

    const { isLoading: isPutIntLoading, mutate: putMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Capitalisations/${rowInfo?.id}`, 'capitalisations', onPutSuccess)

    function onSubmit(data) {
        const { transactionDate, depreciationStartDate, status } = data
        let postData = {
            transactionDate, depreciationStartDate, status
        }


        console.log({ postData: data });

        // return
        // mutate(postData)

        rowInfo?.id ? putMutate(postData) : mutate(postData)
    }

    const getNextTransDate = () => {

        if (getValues("recurringOptions.frequency").length > 0 && getValues("recurringOptions.frequencyValue") != 0) {

            const nextDate = getNextTransactionDate(
                getValues("recurringOptions.frequency"),
                Number(getValues("recurringOptions.frequencyValue")),
                Number(getValues("recurringOptions.onDay"))
            )

            const expireDate = getExpirationDate(
                getValues("recurringOptions.frequency"),
                Number(getValues("recurringOptions.frequencyValue")),
                Number(getValues("recurringOptions.onDay"))
            )

            setValue("recurringOptions.firstExecutionDate", nextDate.split("T")[0])
            setValue("recurringOptions.expiryDate", expireDate.split("T")[0])
        }


    }

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            // setTotalCredit(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.creditLC), 0))
            // setTotalDebit(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.debitLC), 0))

            // setTotalCreditFC(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.creditFC), 0))
            // setTotalDebitFC(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.debitFC), 0))
        }, { entries: true }) // Subscribe to changes in the 'entries' field only


        return () => subscription.unsubscribe()

    }, [watch(["entries"])])



    // const hasExpireAndNextDate = watch("recurringOptions.frequency") === '' || watch("recurringOptions.frequency") === 'day' || watch("recurringOptions.frequency") === 'week' ? false : true
    //  watch("recurringOptions.frequency") === '' || watch("recurringOptions.frequency") === 'day' || watch("recurringOptions.frequency") === 'week'  ?? setValue("recurringOptions.onDay", 0)

    // console.log({ hasExpireAndNextDate });

    useEffect(() => {
        if (isSuccess) {
            refetch()
            setmodal_backdrop(false)
            showToast("success", "Capitalisation Created Successfully", "Notice")
            reset()
            setShowLoading(false)
        }
        if (isLoading || initLoading) {
            setShowLoading(isLoading || initLoading)
        }
        if (isPutSuccess) {
            // setmodal_backdrop(false)
            showToast("success", "Capitalisation Updated Successfully", "Notice")
            // reset()
            setShowLoading(false)
        }
        if (isPutLoading) {
            setShowLoading(isLoading)
        }

        if (isPutLoading || isLoading || initLoading) {
            setShowLoading(true)
        }

        return () => {

        }
    }, [isSuccess, isLoading, isPutLoading, isPutSuccess])
    //account: 0, credit: 0, debit: 0, commnet: "" 
    const getAccount = (id) => {
        const findAccount = accounts.find(x => x?.id === id)

        return {
            value: id,
            label: findAccount?.name
        }

    }
    useEffect(() => {
        setValue("depreciationStartDate", new Date().toISOString().slice(0, 10))

        setValue("transactionDate", new Date().toISOString().slice(0, 10))

        setValue("entries", [item, item])

        setValue("status", "Closed")

        if (rowInfo?.id) {


            const details = rowInfo?.details.map(x => ({
                itemId: { value: x?.id, label: accounts.find(a => a?.id === x?.itemId)?.name },
                quantity: x?.quantity,
                unitPrice: moneyInTxt(x?.unitPrice, "en", 2),
                remarks: x?.remarks || "",
                totalAmount: moneyInTxt(x?.totalAmount, "en", 2),
                id: x?.id
            }))


            setValue("depreciationStartDate", rowInfo?.depreciationStartDate.split("T")[0])
            setValue("transactionDate", rowInfo?.transactionDate.split("T")[0])
            setValue('status', rowInfo?.status)
            setValue("entries", details)
            setmodal_backdrop(true)

        }



        return () => {

        }
    }, [rowInfo])



    const handleAppendRow = () => {

        append({ ...item })
    }


    const handleFoucus = (value) => {
        if (Number(value) === 0) return ""

        return Number(value)
    }


    return (
        <Modal
            isOpen={modal_backdrop}
            toggle={() => {
                tog_backdrop();

            }}
            backdrop={'static'}
            id="staticBackdrop"
            size='xl'
        // style={{ maxWidth: "max-content" }}
        >
            <div className="modal-header">
                <h5 className="modal-title" id="staticBackdropLabel">
                    {rowInfo?.id ? `Edit Transaction No. - ${rowInfo?.transactionNumber}` : "Add Capitalisation"}

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
                                <label className="form-label">Transaction Date <i className="text-danger">*</i></label>
                                <DatepickerFormControl Controller={Controller} control={control} name="transactionDate" />
                                {/* <input
                                    type="date"
                                    name="transactionDate"
                                    {...register('transactionDate')} className={`form-control form-control-sm ${errors.transactionDate ? 'is-invalid' : ''}`}
                                    placeholder="Enter"
                                    onChange={(e) => setValue("depreciationStartDate", e.target.value)}
                                /> */}
                                <div className="invalid-feedback">{errors.transactionDate?.message}</div>
                            </div>
                        </div>

                        <div className="col col-md-3">
                            {/* <div className={`mb-3 ${formik.touched.currencyType && formik.errors.currencyType ? 'has-error' : ''}`}> */}
                            <label className="form-label">Asset Capitalisation Date <i className="text-danger">*</i></label>
                            <DatepickerFormControl Controller={Controller} control={control} name="depreciationStartDate" />
                            {/* <input
                                type="date"
                                name="depreciationStartDate"
                                {...register('depreciationStartDate')} className={`form-control form-control-sm ${errors.depreciationStartDate ? 'is-invalid' : ''}`}
                                placeholder="Enter"

                            // disabled={rowInfo?.id}
                            /> */}
                            <div className="invalid-feedback">{errors.depreciationStartDate?.message}</div>
                            {/* <select
                                        name="currencyId"
                                        {...register('currencyId')} onChange={checkCurrency} className={`form-select form-control-sm ${errors.currencyId ? 'is-invalid' : ''}`}
                                        disabled={rowInfo?.id}
                                    >
                                        <option value={0}>Select currency</option>
                                        {
                                            currenciesList?.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                                        }



                                    </select> */}
                            {/* <div className="invalid-feedback">{errors.currencyId?.message}</div> */}
                            {/* </div> */}
                        </div>

                        <div className="col col-md-3 offset-md-1">
                            {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                            <label className="form-label">Transaction No.<i className="text-danger"></i></label>
                            <input
                                type="text"
                                step="any"
                                name="rate"
                                value={rowInfo?.transactionNumber || ""}
                                className={`form-control form-control-sm `}
                                disabled={true}

                            />
                            {/* <div className="invalid-feedback">{errors.rate?.message}</div> */}
                            {/* </div> */}
                        </div>
                        {/* <div className="col col-md-5" hidden></div> */}
                        <div className="col col-md-2">
                            <label className="form-label">Status <i className="text-danger"></i></label>
                            <select
                                name="status"
                                className={`form-select form-select-sm  ${errors.status ? 'is-invalid' : ''}`}
                                {...register('status')}

                            >
                                {/* <option value={""} disabled selected>Select Status</option> */}
                                {
                                    ["Closed", "Cancelled"]?.map(x => <option key={x} value={x}>{x}</option>)
                                }

                            </select>
                            <div className="invalid-feedback">{errors.status}</div>

                        </div>

                    </div>


                    <div className="wrapper row1">
                        <div className="table-wrapper" style={{ minHeight: "40vh", maxHeight: "60vh" }}>
                            <Table className="table table-hover table-bordered table-sm" style={{ fontSize: '0.9em !important' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Item</th>
                                        <th style={{ width: 100 }} >Quantity</th>
                                        <th className='text-r' >Unit Price</th>
                                        <th className='text-r' >Amount</th>

                                        {/* <th>Transaction #</th> */}
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
                                                        name={`entries[${index}].itemId`}
                                                        control={control}
                                                        rules={{ required: true }} // Add your validation rules here
                                                        render={({ field, fieldState }) => (
                                                            <Select
                                                                name={field.name}
                                                                value={field.value}
                                                                options={accounts.map((x) => ({ value: x?.id, label: x?.name }))}
                                                                placeholder="Select Item"
                                                                isClearable
                                                                onChange={(selectedOption) => field.onChange(selectedOption)}
                                                                // Add any other props you need
                                                                className={`form-control-sm ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed
                                                                // isDisabled={rowInfo?.id}
                                                                styles={{ background: "red" }}
                                                            />


                                                        )}
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
                                                    <input
                                                        hidden
                                                        type="number"
                                                        name={`entries[${index}]unitPrice`}
                                                        className={`form-control form-control-sm text-r ${errors.entries?.[index]?.unitPrice ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        {...register(`entries.${index}.unitPrice`)}


                                                    />

                                                    <CurrencyInput
                                                        id="input-example"
                                                        name="input-name"
                                                        className={`form-control form-control-sm text-r ${errors.entries?.[index]?.unitPrice ? 'is-invalid' : ''}`}
                                                        placeholder="0.00"
                                                        defaultValue={getValues(`entries.${index}.unitPrice`)}
                                                        decimalsLimit={2}
                                                        onValueChange={(value, name) => setValue(`entries.${index}.unitPrice`, value)}
                                                    />

                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name={`entries[${index}]totalAmount`}
                                                        className={`form-control form-control-sm text-r ${errors.entries?.[index]?.totalAmount ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        value={moneyInTxt(Number(getValues(`entries.${index}.unitPrice`)) * Number(getValues(`entries.${index}.quantity`)), "en", 2)}
                                                        {...register(`entries.${index}.totalAmount`)}
                                                        disabled={true}

                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type='text'
                                                        className="form-control form-control-sm"
                                                        placeholder="Remark"
                                                        name={`entries[${index}]remarks`}
                                                        {...register(`entries.${index}.remarks`)}
                                                        style={{ width: "100%" }}
                                                        disabled={rowInfo?.id}
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
                        {/* <div>
                            {
                                totalError ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Alert color="danger" role="alert">
                                        Total debits must equal to total credits. Kindly check and alter your values
                                    </Alert>

                                </div> : null
                            }
                        </div> */}

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