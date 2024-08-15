import React, { useEffect } from 'react'
import { useState } from 'react';

import { Col, Modal, Nav, NavItem, NavLink, Row, TabContent, Form, TabPane, Table } from 'reactstrap';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from "react-hook-form"
import "./stickyTable.css"
import { usePost } from 'hook/usePost';
import { showToast } from 'helpers/utility';



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
    journalDate: Yup.string().required('Journal Date is required'),
    rate: Yup.number().integer(),
    currencyId: Yup.number().required('Currency Type is required'),
    entries: Yup.array().of(
        Yup.object().shape({
            account: Yup.number()
                .required('Account is required'),
            credit: Yup.number().required('Credit is required'),
            debit: Yup.number().required('Credit is required'),
            comment: Yup.string()
        })
    )
});









const defaultvalue = {
    journalDate: '',
    rate: 1,
    currencyId: 0,
    comment: "string",
    entries: [{ account: 0, credit: 0, debit: 0, commnet: "" }]
};

// const defaultvalue = {
//     rate: 1,
//     transData: '',
//     currencyType: 0,
//     entries: [{ account: "", credit: "", debit: "", commnet: "" }]
// }

const convertCurrency = (value, code='GHS') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code, 
      }).format(value);
}


const CompanyForm = ({accounts, setShowLoading, currenciesList, modal_backdrop, setmodal_backdrop, setMinimized }) => {
    // const [activeTab, setActiveTab] = useState('General')
    const [activeTab, setactiveTab] = useState("1");
    const [isHomeCurrency, setIsHomeCurrency] = useState(true)
    const [formRows, setFormRows] = useState([{ id: 1 }]);
    const [totalCredit, setTotalCredit] = useState(0)
    const [totalDebit, setTotalDebit] = useState(0)

    // const onAddFormRow = () => {
    //     const modifiedRows = [...formRows];
    //     modifiedRows.push({ id: modifiedRows.length + 1 });
    //     setFormRows(modifiedRows);
    //   };

    //   const onDeleteFormRow = id => {
    //     if (id !== 1) {
    //       var modifiedRows = [...formRows];
    //       modifiedRows = modifiedRows.filter(x => x["id"] !== id);
    //       setFormRows(modifiedRows);
    //     }
    //   };

    // const toggleTab = tab => {
    //     if (activeTab !== tab) {
    //         setactiveTab(tab);
    //     }
    // };

    const { control, register, handleSubmit, watch,reset, formState: { errors }, getValues } = useForm({
        defaultValues: defaultvalue,
        resolver: yupResolver(validationSchema)
    })

    const { append, remove, fields } = useFieldArray({

        name: "entries",
        control,
        rules: {
            required: "Please provide at least one GL entry"
        }
    })

 
    const {isLoading, isSuccess, mutate} =usePost(`${process.env.REACT_APP_ADMIN_URL}/Journals`)

    function onSubmit(data) {

        let formData = {journalDate:data?.journalDate,
            currencyId:data?.currencyId,
            rate:data?.rate,
            comment:"",
            status:"Active",}
        if(isHomeCurrency){
            formData.entries = data.entries.map(x => ({accountId:x?.account,debitLC:x?.debit,creditLC:x?.credit, debitFC:0,creditFC:0, lineComment:x?.comment }))
            
        }else{
            formData.entries = data.entries.map(x => ({accountId:x?.account,debitLC:0,creditLC:0, debitFC:x?.debit,creditFC:x?.credit, lineComment:x?.comment }))
        }
        // console.log({ onSubmit: formData });
        mutate(formData)
    }
    const checkCurrency = (value)=>{
       
       const ishome = currenciesList.find(x => x?.id === +value?.currencyId)

       if(ishome?.companyState === "Home" || value?.currencyId === 0 ){
                setIsHomeCurrency(true)
       }else{
        setIsHomeCurrency(false)
       }
       

    }

    useEffect(() => {
        const subscription = watch((value, { name, type }) => checkCurrency(value))
        
            watch((value, { name, type }) =>
             {
                setTotalCredit(value.entries.reduce((accumulator, currentValue) => accumulator + currentValue.credit, 0))
                setTotalDebit(value.entries.reduce((accumulator, currentValue) => accumulator + currentValue.debit, 0))
                const ishome = currenciesList.find(x => x?.id === +value?.currencyId)

                if(ishome?.companyState === "Home" || +value?.currencyId === 0 ){
                         setIsHomeCurrency(true)
                }else{
                 setIsHomeCurrency(false)
                }
            })
            
        return () => subscription.unsubscribe()

    }, [watch])

    useEffect(() => {
        if(isSuccess){
         setmodal_backdrop(false)
         showToast("success", "Journal Created Successfully", "Notice")
         reset()
         setShowLoading(false)
        }
        if(isLoading){
         setShowLoading(isLoading)
        }
      
        return () => {
          
        }
      }, [isSuccess, isLoading])


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
                <h5 className="modal-title" id="staticBackdropLabel">Add Journal Entry</h5>

                <div>
                    <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
                    <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
                        onClick={() => {
                            setmodal_backdrop(false);
                        }} aria-label="Close"><i className="mdi mdi-close"></i></button>
                </div>


            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">

                    <div className="row mb-3">
                        <div className="col col-md-4">
                            <div >
                                <label className="form-label">Date <i className="text-danger">*</i></label>
                                <input
                                    type="date"
                                    name="journalDate"
                                    {...register('journalDate')} className={`form-control ${errors.journalDate ? 'is-invalid' : ''}`}
                                    placeholder="Enter"
                                />
                                <div className="invalid-feedback">{errors.journalDate?.message}</div>
                            </div>
                        </div>

                        <div className="col col-md-4">
                            {/* <div className={`mb-3 ${formik.touched.currencyType && formik.errors.currencyType ? 'has-error' : ''}`}> */}
                            <label className="form-label">Currency <i className="text-danger">*</i></label>
                            <select
                                name="currencyId"
                                {...register('currencyId')} className={`form-select ${errors.currencyId ? 'is-invalid' : ''}`}
                            >
                                <option value={0}>Select currency</option>
                                {
                                    currenciesList?.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                                }



                            </select>
                            <div className="invalid-feedback">{errors.currencyId?.message}</div>
                            {/* </div> */}
                        </div>

                        <div className="col col-md-4">
                            {/* <div className={`mb-3 ${formik.touched.rate && formik.errors.rate ? 'has-error' : ''}`}> */}
                            <label className="form-label">Rate<i className="text-danger">*</i></label>
                            <input
                                type="text"
                                name="rate"
                                className={`form-control ${errors.rate ? 'is-invalid' : ''}`}
                                {...register('rate')}
                                autoComplete="off"
                                placeholder="Enter rate"
                                disabled={isHomeCurrency}
                            />
                            <div className="invalid-feedback">{errors.rate?.message}</div>
                            {/* </div> */}
                        </div>
                    </div>

                    <div className="wrapper">
                        <div className="table-wrapper">
                            <Table className="table table-hover table-bordered" style={{ fontSize: '0.9em !important' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th></th>
                                        <th>Account</th>
                                        <th>Credit</th>
                                        <th>Debit</th>
                                        <th>Comment</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody id="cost_area_TableBody">
                                    {
                                        fields.map((field, index) => (

                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <select
                                                        className={`form-select ${errors.entries?.[index]?.account ? 'is-invalid' : ''}`}
                                                        // name='account'
                                                        name={`entries[${index}]account`}

                                                        {...register(`entries.${index}.account`, { required: true })}
                                                    >
                                                        <option value={0}>Select Account</option>
                                                        {
                                                            accounts.map(x =>  <option key={x?.id} value={x?.id}>{x?.name}</option>)
                                                        }
                                                       

                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"

                                                        name={`entries[${index}]credit`}
                                                        className={`form-control ${errors.entries?.[index]?.credit ? 'is-invalid' : ''}`}
                                                        placeholder="Credit"
                                                        {...register(`entries.${index}.credit`, { required: true })}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name={`entries[${index}]debit`}
                                                        className={`form-control ${errors.entries?.[index]?.debit ? 'is-invalid' : ''}`}
                                                        placeholder="debit"
                                                        {...register(`entries.${index}.debit`, { required: true })}
                                                    />
                                                </td>
                                                <td>
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Comment"
                                                        name={`entries[${index}]comment`}
                                                        {...register(`entries.${index}.comment`)}
                                                    ></textarea>
                                                </td>
                                                <td>
                                                    <button className='btn btn-danger btn-sm' onClick={() => remove(index - 1)}><i className='fa fa-trash'></i></button>{" "}

                                                </td>
                                            </tr>

                                        ))
                                    }

                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td>{convertCurrency(totalCredit,currenciesList?.find(x => x?.id ===  +getValues('currencyId'))?.code)}</td>
                                        <td>{convertCurrency(totalDebit,currenciesList?.find(x => x?.id ===  +getValues('currencyId'))?.code)}</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </Table>
                            <button type='button' style={{ float: "right" }} className='btn btn-primary btn-sm' onClick={() => append(defaultvalue)}><i className='fa fa-plus'></i> Add</button>
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

    )
}

export default CompanyForm