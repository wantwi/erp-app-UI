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
import DatepickerFormControl from 'components/datepickerComponent/DatepickerFormControl';

// const validationSchema = Yup.object().shape({
//     transDate: Yup.string().required('Transaction Date is required'),
//     account: Yup.string().required('Account is required'),
//     rate: Yup.number().integer(),
//     debit_LC: Yup.number().when('currencyType', {
//         is: 0,
//         then: Yup.number().required('Debit LC is required when currencyType is LC'),
//     }),
//     debit_FC: Yup.number().when('currencyType', {
//         is: 1,
//         then: Yup.number().required('Debit FC is required when currencyType is FC'),
//     }),
//     credit_LC: Yup.number(),
//     credit_FC: Yup.number(),
//     comments: Yup.string(),
//     currencyType: Yup.number().required('Currency Type is required'),
// });


const validationSchema = Yup.object().shape({
    journalDate: Yup.date().required('Journal Date is required'),
    rate: Yup.number(),
    currencyId: Yup.number().required('Currency Type is required'),
    status: Yup.string(),
    reference1: Yup.string(),
    reference2: Yup.string(),
    // transactionNumber: Yup.string(),
    comment: Yup.string(),
    entries: Yup.array().of(
        Yup.object().shape({
            accountId: Yup.object().shape({ value: Yup.number(), label: Yup.string() }),
            //.required('Account is required'),
            debitLC: Yup.number(),
            creditLC: Yup.number(),
            creditFC: Yup.number(),
            debitFC: Yup.number(),
            reference1: Yup.string(),
            reference2: Yup.string(),
            lineComment: Yup.string()
        })
    ),
    // recurringOptions: Yup.object()
    // .shape({
    //     name: Yup.string(),
    //     frequency: Yup.string(),
    //     frequencyValue: Yup.number(),
    //     onDay: Yup.number(),
    //     firstExecutionDate: Yup.string(),
    //     expiryDate: Yup.string(),
    // })
});

// "recurringOptions": {
//     "frequency": "string",
//     "frequencyValue": 0,
//     "onDay": 0,
//     "firstExecutionDate": "2023-10-02T16:39:53.559Z",
//     "expiryDate": "2023-10-02T16:39:53.559Z"
//   }







const item = { accountId: null, creditLC: 0, debitLC: 0, creditFC: 0, debitFC: 0, reference1: "", reference2: "", lineComment: "" }

const defaultvalue = {
    journalDate: "",
    rate: 1,
    currencyId: 0,
    status: "New",
    reference1: "",
    reference2: "",
    comment: "",
    entries: [item],
    recurringOptions: {
        name: "",
        frequency: "",
        frequencyValue: 0,
        onDay: 0,
        firstExecutionDate: "",
        expiryDate: ""
    }
};

console.log({ defaultvalue });



// const defaultvalue = {
//     rate: 1,
//     transData: '',
//     currencyType: 0,
//     entries: [{ account: "", credit: "", debit: "", commnet: "" }]
// }

// return value.toLocaleString('en-US', {
//     style: 'currency',
//     currency: 'USD', // Use the appropriate currency code
// }).replace('$', 'USD');

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
    const [fcCode, setFcCode] = useState("")
    const [isRecurring, setIsrecurring] = useState(false)
    const [totalError, setTotalError] = useState(false)
    const [customActiveTab, setcustomActiveTab] = useState("1");
    const [isDraft, setIsDraft] = useState(false)
    const toggleCustom = tab => {
        if (customActiveTab !== tab) {
            setcustomActiveTab(tab);
        }
    };

    const { control, register, handleSubmit, watch, reset, formState: { errors }, getValues, setValue, setError, clearErrors } = useForm({
        defaultValues: defaultvalue,
        resolver: yupResolver(validationSchema)
    })

    console.log({ control: errors });

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

    const onPostError = (error) => {
        showToast("error", error?.message, "Notice")
        setShowLoading(false)
    }



    const { isLoading, isSuccess, mutate, isError } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Journals`, 'journals', () => { }, onPostError)
    const { isLoading: isDraftLoading, isSuccess: isDraftSuccess, mutate: isDraftMutate } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Journals/SaveAsDraft`)

    const { isLoading: isPutLoading, isSuccess: isPutSuccess, mutate: putMutate } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Journals/CancelJournal?Id=${rowInfo?.id}`, 'journals')

    function onSubmit(data) {

        let postData = {}

        if (isHomeCurrency) {
            const renderEntries = data.entries.slice().map(x => ({ ...x, accountId: x.accountId?.value }))
            postData = {
                ...data,
                entries: renderEntries
            }

        } else {
            const renderEntries = data.entries.slice().map(x => ({ ...x, accountId: x.accountId?.value, debitLC: (+x?.debitFC * +data?.rate), creditLC: (+x?.creditFC * +data?.rate) }))
            postData = {
                ...data,
                entries: renderEntries
            }
        }

        console.log({ onSubmit: postData });

        if (isHomeCurrency) {
            if (Number(totalDebit) !== Number(totalCredit)) {
                setTotalError(true)
                return

            } else {
                setTotalError(false)
            }

        } else {
            if (Number(totalCreditFC) !== Number(totalDebitFC)) {
                setTotalError(true)
                return
            } else {
                setTotalError(false)
            }


        }

        isDraft ? isDraftMutate(postData) : mutate(postData)

        // rowInfo?.id ? putMutate(formData) : mutate(postData)
    }


    const checkCurrency = (evnt) => {

        const ishome = currenciesList.find(x => x?.id === +evnt.target.value)



        if (ishome?.isHome === "Yes") {
            setIsHomeCurrency(true)
            setFcCode("")
        } else {
            setIsHomeCurrency(false)
            setFcCode(ishome?.code)
        }
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
            setTotalCredit(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.creditLC), 0))
            setTotalDebit(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.debitLC), 0))

            setTotalCreditFC(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.creditFC), 0))
            setTotalDebitFC(value.entries.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue.debitFC), 0))
        }, { entries: true }) // Subscribe to changes in the 'entries' field only


        return () => subscription.unsubscribe()

    }, [watch(["entries"])])



    const hasExpireAndNextDate = watch("recurringOptions.frequency") === '' || watch("recurringOptions.frequency") === 'day' || watch("recurringOptions.frequency") === 'week' ? false : true
    //  watch("recurringOptions.frequency") === '' || watch("recurringOptions.frequency") === 'day' || watch("recurringOptions.frequency") === 'week'  ?? setValue("recurringOptions.onDay", 0)

    console.log({ hasExpireAndNextDate });

    useEffect(() => {
        if (isSuccess) {
            refetch()
            setmodal_backdrop(false)
            showToast("success", "Journal Created Successfully", "Notice")
            reset()
            setShowLoading(false)
        }
        if (isLoading) {
            setShowLoading(isLoading)
        }
        if (isDraftSuccess) {
            setmodal_backdrop(false)
            showToast("success", "Journal  Saved as Draft", "Notice")
            // reset()
            setShowLoading(false)
        }
        if (isDraftLoading) {
            setShowLoading(isLoading)
        }
        if (isError) {
            setShowLoading(false)
        }

        return () => {

        }
    }, [isSuccess, isLoading, isDraftLoading, isDraftSuccess])
    //account: 0, credit: 0, debit: 0, commnet: "" 
    const getAccount = (id) => {
        const findAccount = accounts.find(x => x?.id === id)

        return {
            value: id,
            label: findAccount?.name
        }

    }
    useEffect(() => {
        setValue("currencyId", currenciesList.find(x => x?.isHome === "Yes")?.id)
        setIsHomeCurrency(true)
        setValue("journalDate", new Date().toISOString().slice(0, 10))
        setValue('comment', "")
        setValue("entries", [item, item])
        setValue("rate", 1)
        setValue('reference1', "")
        setValue('reference2', "")
        setValue("recurringOptions", defaultvalue.recurringOptions)
        setValue("status", "New")
        setIsrecurring(false)
        setTotalError(false)
        setcustomActiveTab("1");

        if (rowInfo?.id) {
            const result = rowInfo?.journalEntries.map(x => ({
                accountId: { value: x?.accountId, label: x?.account },
                debitLC: x?.debitLC,
                debitFC: x?.debitFC,
                creditLC: x?.creditLC,
                creditFC: x?.creditFC,
                lineComment: x?.lineComment,
                reference1: x?.reference1,
                reference2: x?.reference2
            }))
            console.log({ result });


            if (rowInfo?.homeCurrency !== "Yes") {
                setIsHomeCurrency(false)
            }



            setValue("entries", result)
            setValue("currencyId", rowInfo?.currencyId)
            setValue("journalDate", rowInfo?.journalDate.split("T")[0])
            setValue('status', rowInfo?.status)
            setValue('reference1', rowInfo?.reference1)
            setValue('reference2', rowInfo?.reference2)
            setValue('comment', rowInfo?.comment)
            setValue('rate', rowInfo?.rate)
            if (rowInfo?.recurringOptions?.id) {
                setIsrecurring(true)
                setValue('recurringOptions.name', rowInfo?.recurringOptions?.name)
                setValue('recurringOptions.expiryDate', rowInfo?.recurringOptions?.expiryDate.split("T")[0])
                setValue('recurringOptions.firstExecutionDate', rowInfo?.recurringOptions?.nextExecutionDate?.split("T")[0] || "")
                setValue('recurringOptions.frequency', rowInfo?.recurringOptions?.frequency)
                setValue('recurringOptions.frequencyValue', rowInfo?.recurringOptions?.frequencyValue)
                setValue('recurringOptions.onDay', rowInfo?.recurringOptions?.onDay)
            }


            setmodal_backdrop(true)

        }



        return () => {

        }
    }, [rowInfo])

    // useEffect(() => {

    //     console.log({commpany: currenciesList.find(x => x?.companyState === "Home")?.id});
    //     // setValue("currencyId",`${currenciesList.find(x => x?.companyState === "Home")?.id}`)
    //     setValue("currencyId","1")

    //   return () => {

    //   }
    // }, [])
    // const handleonInput = (indx) => {


    //     if (!isHomeCurrency) {
    //         const copyEntries = getValues("entries")
    //         const rowData = copyEntries[indx]
    //         let newRow = {
    //             ...rowData,
    //             creditLC: `${Number(rowData?.creditFC || 0) * Number(getValues("rate"))}`,
    //             debitLC: `${Number(rowData?.debitFC || 0) * Number(getValues("rate"))}`
    //         }
    //         copyEntries[indx] = newRow
    //         setValue("entries", [])
    //         setValue("entries", copyEntries)
    //     }



    // }

    const handleAppendRow = () => {

        const curr = getValues("currencyId")
        if (curr == 0) {

            //setError("journalDate", { type: "custom", message: "Please select Journal Date" })
            setError("currencyId", { type: "custom", message: "Please select currency" })
            return
        }
        else {
            clearErrors("currencyId")
        }
        append({ ...item, lineComment: getValues("comment") })
    }


    const handleFoucus = (value) => {
        if (Number(value) === 0) return ""

        return Number(value)

    }

    const cuurencyCode = getValues('currencyId')?.code
    console.log({ cuurencyCode });


    return (
        <Modal
            isOpen={modal_backdrop}
            toggle={() => {
                tog_backdrop();

            }}
            backdrop={'static'}
            id="staticBackdrop"
            style={{ minWidth: "80vw", maxWidth: "max-content" }}
        >
            <div className="modal-header">
                <h5 className="modal-title" id="staticBackdropLabel">Add Journal Entry</h5>

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


                    {/* <>
                        {
                            isRecurring ?
                                <>
                                    <br />
                                    <hr className='recurrTrans' />

                                   
                                </>
                                : null
                        }
                    </> */}

                    <Nav tabs className="nav-tabs-custom ">
                        <NavItem>
                            <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                    active: customActiveTab === "1",
                                })}
                                onClick={() => {
                                    toggleCustom("1");
                                }}
                            >
                                <span className="d-block d-sm-none">
                                    <i className="fas fa-home"></i>
                                </span>
                                <span className="d-none d-sm-block">General</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                    active: customActiveTab === "2",
                                })}
                                onClick={() => {
                                    toggleCustom("2");
                                }}
                            >
                                <span className="d-block d-sm-none">
                                    <i className="far fa-user"></i>
                                </span>
                                <span className="d-none d-sm-block">Recurring Details</span>
                            </NavLink>
                        </NavItem>

                    </Nav>

                    <TabContent
                        activeTab={customActiveTab}
                        className="p-3 text-muted"
                    >
                        <TabPane tabId="1">

                            <div className="row mb-2">
                                <div className="col col-md-2">
                                    <div >
                                        <label className="form-label">Date <i className="text-danger">*</i></label>
                                        <DatepickerFormControl Controller={Controller} control={control} name="journalDate" />
                                        {/* <input
                                            type="date"
                                            name="journalDate"
                                            {...register('journalDate')} className={`form-control sm-input ${errors.journalDate ? 'is-invalid' : ''}`}
                                            placeholder="Enter"

                                            disabled={rowInfo?.id}
                                        /> */}
                                        <div className="invalid-feedback">{errors.journalDate?.message}</div>
                                    </div>
                                </div>

                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.currencyType && formik.errors.currencyType ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Currency <i className="text-danger">*</i></label>
                                    <select
                                        name="currencyId"
                                        {...register('currencyId')} onChange={checkCurrency} className={`form-select sm-input ${errors.currencyId ? 'is-invalid' : ''}`}
                                        disabled={rowInfo?.id}
                                    >
                                        <option value={0}>Select currency</option>
                                        {
                                            currenciesList?.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                                        }



                                    </select>
                                    <div className="invalid-feedback">{errors.currencyId?.message}</div>
                                    {/* </div> */}
                                </div>

                                <div className="col col-md-1">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Rate<i className="text-danger">*</i></label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="rate"
                                        className={`form-control sm-input ${errors.rate ? 'is-invalid' : ''}`}
                                        {...register('rate')}
                                        autoComplete="off"
                                        placeholder="Enter rate"
                                        disabled={isHomeCurrency || rowInfo?.id}

                                    />
                                    <div className="invalid-feedback">{errors.rate?.message}</div>
                                    {/* </div> */}
                                </div>
                                <div className="col col-md-5"></div>
                                <div className="col col-md-2">
                                    <label className="form-label">Status <i className="text-danger"></i></label>
                                    <select
                                        name="status"
                                        className={`form-select sm-input  ${errors.status ? 'is-invalid' : ''}`}
                                        {...register('status')}

                                        disabled={rowInfo?.id}

                                    >
                                        <option value={" "} disabled>Select Status</option>
                                        {

                                            rowInfo?.id ? ["Closed", "Draft", "Cancelled"]?.map(x => <option key={x} value={x}>{x}</option>) : ["New"]?.map(x => <option key={x} value={x}>{x}</option>)
                                        }

                                    </select>
                                    <div className="invalid-feedback">{errors.status}</div>

                                </div>

                            </div>
                            <div className="row mb-1">
                                <div className="col col-md-3">
                                    <div >
                                        <label className="form-label">Reference 1 <i className="text-danger"></i></label>
                                        <input
                                            type="text"
                                            name="reference1"
                                            {...register('reference1')} className={`form-control sm-input ${errors.reference1 ? 'is-invalid' : ''}`}
                                            placeholder="Enter Reference 1"
                                            disabled={rowInfo?.id}
                                            size={"sm"}
                                        />
                                        <div className="invalid-feedback">{errors.reference1?.message}</div>
                                    </div>
                                </div>
                                <div className="col col-md-3">
                                    <div >
                                        <label className="form-label">Reference 2 <i className="text-danger"></i></label>
                                        <input
                                            type="text"
                                            name="reference2"
                                            {...register('reference2')} className={`form-control sm-input ${errors.reference2 ? 'is-invalid' : ''}`}
                                            placeholder="Enter Reference 2"
                                            disabled={rowInfo?.id}
                                        />
                                        <div className="invalid-feedback">{errors.reference2?.message}</div>
                                    </div>
                                </div>

                                <div className="col col-md-6">
                                    <div >
                                        <label className="form-label">Comment <i className="text-danger"></i></label>
                                        <input
                                            className="form-control sm-input"
                                            placeholder="Comment"
                                            name={`comment`}
                                            {...register(`comment`)}
                                            disabled={rowInfo?.id}
                                        />
                                    </div>
                                </div>
                                <div className="col col-md-3 mt-4" hidden>
                                    <div className="form-check form-check-end mt-2">

                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isCashAccount"
                                            name="isCashAccount"
                                            //   ref={isCashAccountRef}
                                            onChange={handleIssetIsrecurringEvent}
                                            defaultChecked={isRecurring}
                                            disabled={rowInfo?.id}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="reccurringTrans"
                                        >
                                            Create as Recurring Transaction
                                        </label>
                                    </div>

                                </div>

                            </div>

                        </TabPane>
                        <TabPane tabId="2">

                            <div className="row row1 mb-3">
                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Name<i className="text-danger"></i></label>
                                    <input
                                        type="text"
                                        name="recurringOptions.name"
                                        className={`form-control sm-input ${errors.rate ? 'is-invalid' : ''}`}
                                        {...register('recurringOptions.name')}
                                        autoComplete="off"
                                        placeholder="Enter value"
                                        disabled={rowInfo?.id}

                                    />
                                    <div className="invalid-feedback">{errors.recurringOptions?.name?.message}</div>
                                    {/* </div> */}
                                </div>

                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Frequency<i className="text-danger"></i></label>
                                    <select
                                        name="recurringOptions.frequency"
                                        className={`form-select sm-input ${errors.status ? 'is-invalid' : ''}`}
                                        {...register('recurringOptions.frequency')}
                                        disabled={rowInfo?.id}
                                        onBlur={getNextTransDate}
                                    >
                                        <option value={""} disabled>Select frequency</option>
                                        {
                                            ["day", "week", "month", "year"].map(x => <option key={x} value={x}>{x}</option>)
                                        }

                                    </select>
                                    {/* </div> */}
                                </div>
                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Frequency Value<i className="text-danger"></i></label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="recurringOptions.frequencyValue"
                                        className={`form-control sm-input ${errors.rate ? 'is-invalid' : ''}`}
                                        {...register('recurringOptions.frequencyValue')}
                                        autoComplete="off"
                                        placeholder="Enter value"
                                        disabled={rowInfo?.id}
                                        onBlur={getNextTransDate}

                                    />
                                    <div className="invalid-feedback">{errors.recurringOptions?.frequencyValue?.message}</div>
                                    {/* </div> */}
                                </div>
                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">On Day<i className="text-danger"></i></label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="recurringOptions.onDay"
                                        className={`form-control sm-input ${errors.rate ? 'is-invalid' : ''}`}
                                        {...register('recurringOptions.onDay')}
                                        autoComplete="off"
                                        placeholder="Enter value"
                                        disabled={rowInfo?.id}
                                        onBlur={getNextTransDate}

                                    />
                                    <div className="invalid-feedback">{errors.recurringOptions?.onDay?.message}</div>
                                    {/* </div> */}
                                </div>
                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Expiry Date<i className="text-danger"></i></label>
                                    <input
                                        type="date"
                                        name="recurringOptions.expiryDate"
                                        className={`form-control sm-input ${errors.rate ? 'is-invalid' : ''}`}
                                        {...register('recurringOptions.expiryDate')}
                                        autoComplete="off"
                                        placeholder="Enter date"
                                        disabled={rowInfo?.id}

                                    />
                                    <div className="invalid-feedback">{errors.recurringOptions?.expiryDate?.message}</div>
                                    {/* </div> */}
                                </div>
                                <div className="col col-md-2">
                                    {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                                    <label className="form-label">Next Execution Date<i className="text-danger"></i></label>
                                    <input
                                        type="date"
                                        name="recurringOptions.firstExecutionDate"
                                        className={`form-control sm-input ${errors.rate ? 'is-invalid' : ''}`}
                                        {...register('recurringOptions.firstExecutionDate')}
                                        autoComplete="off"
                                        placeholder="Enter date"
                                        disabled={rowInfo?.id}

                                    />
                                    <div className="invalid-feedback">{errors.recurringOptions?.firstExecutionDate?.message}</div>
                                    {/* </div> */}
                                </div>

                            </div>

                        </TabPane>

                    </TabContent>

                    <div style={{ margin: "0 17px" }} className="wrapper row1">
                        <div className="table-wrapper" style={{ minHeight: "40vh", maxHeight: "60vh" }}>
                            <Table className="table table-hover table-bordered table-sm" style={{ fontSize: '0.9em !important' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th></th>
                                        <th>Account</th>
                                        <th className='text-r'>Debit</th>
                                        <th className='text-r'>Credit</th>
                                        {!isHomeCurrency ? <th className='text-r'>Debit(FC)</th> : null}
                                        {!isHomeCurrency ? <th className='text-r'>Credit(FC)</th> : null}
                                        <th>Reference 1</th>
                                        <th>Reference 2</th>
                                        {/* <th>Transaction #</th> */}
                                        <th>Comment</th>
                                        {!rowInfo?.id ? <th></th> : null}
                                    </tr>
                                </thead>

                                <tbody id="cost_area_TableBody">
                                    {
                                        fields.map((field, index) => (

                                            <tr key={field?.id}>
                                                <td>{index + 1}</td>
                                                <td hidden={rowInfo?.id ? false : true}>
                                                    <Controller
                                                        name={`entries[${index}].accountId`}
                                                        control={control}
                                                        rules={{ required: true }} // Add your validation rules here
                                                        render={({ field, fieldState }) => (


                                                            <input disabled name={`entries[${index}].accountId`} value={field.value?.label} type='text' className='form-control form-control-sm' />



                                                        )}
                                                    />

                                                </td>
                                                <td style={{ minWidth: 200 }} hidden={rowInfo?.id ? true : false}>
                                                    <Controller
                                                        name={`entries[${index}].accountId`}
                                                        control={control}
                                                        rules={{ required: true }} // Add your validation rules here
                                                        render={({ field, fieldState }) => (
                                                            <Select
                                                                name={field.name}
                                                                value={field.value}
                                                                options={accounts.map((x) => ({ value: x?.id, label: x?.name }))}
                                                                placeholder="Select Account"
                                                                isClearable
                                                                onChange={(selectedOption) => field.onChange(selectedOption)}
                                                                // Add any other props you need
                                                                className={`sm-input ${fieldState.invalid ? 'is-invalid' : ''}`} // You can apply the className here if needed
                                                                // isDisabled={rowInfo?.id}
                                                                styles={{ background: "red" }}
                                                            />


                                                        )}
                                                    />

                                                </td>
                                                <td className='text-r'>
                                                    {isHomeCurrency ? <input
                                                        type="number"
                                                        name={`entries[${index}]debitLC`}
                                                        className={`form-control sm-input  text-r ${errors.entries?.[index]?.debitLC ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        {...register(`entries.${index}.debitLC`)}
                                                        disabled={Number(getValues(`entries.${index}.creditLC`)) > 0 || rowInfo?.id}
                                                        onFocus={() => setValue(`entries.${index}.debitLC`, handleFoucus(getValues(`entries.${index}.debitLC`)))}
                                                        onBlur={() => setValue(`entries.${index}.creditLC`, 0)}
                                                    // disabled={!isHomeCurrency}
                                                    /> : getValues(`entries.${index}.debitFC`) * Number(getValues("rate"))}
                                                </td>
                                                <td className='text-r'>
                                                    {isHomeCurrency ? <input
                                                        type="number"

                                                        name={`entries[${index}]creditLC`}
                                                        className={`form-control sm-input text-r ${errors.entries?.[index]?.creditLC ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        {...register(`entries.${index}.creditLC`)}
                                                        disabled={Number(getValues(`entries.${index}.debitLC`)) > 0 || rowInfo?.id}
                                                        onFocus={() => setValue(`entries.${index}.creditLC`, handleFoucus(getValues(`entries.${index}.creditLC`)))}
                                                        onBlur={() => setValue(`entries.${index}.debitLC`, 0)}
                                                    // disabled={!isHomeCurrency}

                                                    /> : getValues(`entries.${index}.creditFC`) * Number(getValues("rate"))}
                                                </td>
                                                {!isHomeCurrency ? <td className='text-r'>
                                                    {isHomeCurrency ? 0 : <input
                                                        type="number"
                                                        name={`entries[${index}]debitFC`}
                                                        className={`form-control sm-input text-r ${errors.entries?.[index]?.debitFC ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        {...register(`entries.${index}.debitFC`)}
                                                        disabled={Number(getValues(`entries.${index}.creditFC`)) > 0 || rowInfo?.id}
                                                        onFocus={() => setValue(`entries.${index}.debitFC`, handleFoucus(getValues(`entries.${index}.debitFC`)))}
                                                        onBlur={() => setValue(`entries.${index}.creditFC`, 0)}

                                                    />}
                                                </td> : null}
                                                {!isHomeCurrency ? <td className='text-r'>
                                                    {isHomeCurrency ? 0 : <input
                                                        type="number"

                                                        name={`entries[${index}]creditFC`}
                                                        className={`form-control sm-input text-r ${errors.entries?.[index]?.creditFC ? 'is-invalid' : ''}`}
                                                        placeholder="0"
                                                        {...register(`entries.${index}.creditFC`)}
                                                        disabled={Number(getValues(`entries.${index}.debitFC`)) > 0 || rowInfo?.id}
                                                        onFocus={() => setValue(`entries.${index}.creditFC`, handleFoucus(getValues(`entries.${index}.creditFC`)))}
                                                        onBlur={() => setValue(`entries.${index}.debitFC`, 0)}

                                                    />}
                                                </td> : null}

                                                <td>
                                                    <input
                                                        type="text"
                                                        name={`entries[${index}]reference1`}
                                                        className={`form-control sm-input ${errors.entries?.[index]?.reference1 ? 'is-invalid' : ''}`}
                                                        placeholder="Reference 1"
                                                        {...register(`entries.${index}.reference1`)}
                                                        disabled={rowInfo?.id}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name={`entries[${index}]reference2`}
                                                        className={`form-control sm-input ${errors.entries?.[index]?.reference2 ? 'is-invalid' : ''}`}
                                                        placeholder="Reference 2"
                                                        {...register(`entries.${index}.reference2`)}
                                                        disabled={rowInfo?.id}
                                                    />
                                                </td>
                                                {/* <td>
                                                    <input
                                                        type="text"
                                                        name={`entries[${index}]transactionNumber`}
                                                        className={`form-control sm-input ${errors.entries?.[index]?.transactionNumber ? 'is-invalid' : ''}`}
                                                        placeholder="Transaction #"
                                                        {...register(`entries.${index}.transactionNumber`)}
                                                    />
                                                </td> */}
                                                <td>
                                                    <input
                                                        type='text'
                                                        className="form-control sm-input"
                                                        placeholder="Comment"
                                                        name={`entries[${index}]lineComment`}
                                                        {...register(`entries.${index}.lineComment`)}
                                                        style={{ width: 200 }}
                                                        disabled={rowInfo?.id}
                                                    />
                                                </td>

                                                {!rowInfo?.id ? <td>
                                                    <>
                                                        <span disabled={rowInfo?.id} type='button' style={{ marginRight: 5, cursor: "pointer", fontSize: 12 }} className='text-primary' onClick={handleAppendRow}><i className='fa fa-plus'></i></span>
                                                        <span disabled={rowInfo?.id} style={{ marginRight: 5, cursor: "pointer", fontSize: 12 }} className='text-danger' onClick={() => remove(index)}><i className='fa fa-trash-alt'></i></span>
                                                    </>


                                                </td> : null}

                                            </tr>

                                        ))
                                    }


                                    {getValues("entries").length > 0 ? <tr>
                                        <td></td>
                                        <td></td>
                                        <td className='text-r'>{
                                            isHomeCurrency ? convertCurrency(+totalDebit, currenciesList?.find(x => x?.companyState === "Home")?.code)
                                                : convertCurrency((+totalDebitFC * +getValues("rate")), currenciesList?.find(x => x?.companyState === "Home")?.code)
                                        }</td>
                                        <td className='text-r'>{isHomeCurrency ?
                                            convertCurrency(+totalCredit, currenciesList?.find(x => x?.companyState === "Home")?.code) :
                                            convertCurrency((+totalCreditFC * +getValues("rate")), currenciesList?.find(x => x?.companyState === "Home")?.code)
                                        }</td>
                                        {!isHomeCurrency ? <td className='text-r'>{`${fcCode} ${convertCurrency(+totalDebitFC)}`}</td> : null}
                                        {!isHomeCurrency ? <td className='text-r'>{`${fcCode} ${moneyInTxt(+totalCreditFC, "en", 2)}`}</td> : null}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr> : null}
                                </tbody>
                            </Table>



                        </div>
                        <div>
                            {
                                totalError ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Alert color="danger" role="alert">
                                        Total debits must equal to total credits. Kindly check and alter your values
                                    </Alert>

                                </div> : null
                            }
                        </div>

                    </div>



                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => {
                        setmodal_backdrop(false);
                        setRowInfo({})
                    }}>Close</button>
                    {
                        rowInfo?.id ? null :
                            <>
                                <button type="submit" onClick={() => setIsDraft(true)} className="btn btn-sm  btn-primary"><i className="fas fa-save me-2"></i>Save as draft</button>
                                <button type="submit" onClick={() => setIsDraft(false)} className="btn btn-sm  btn-success"><i className="fas fa-save me-2"></i>Save</button>
                            </>

                    }

                </div>
            </form>
        </Modal>

    )
}

export default CompanyForm


