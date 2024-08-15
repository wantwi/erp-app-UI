// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Button, Card, CardBody, Col, FormGroup, InputGroup, Label, Modal, ModalBody, ModalFooter, Row, Table, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
//import { data } from '../../../common/data/exchange-rates'
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import useCustomAxios from "hook/useCustomAxios";



function ExchangeRate() {
    const [tableData, setTableData] = useState([])
    const [selectedPeriod, setSelectedPeriod] = useState('')
    const [selectedPeriodId, setSelectedPeriodId] = useState(null)
    const [showLoading, setShowLoading] = useState(false)

    const [periodsList, setperiodsList] = useState([])
    const [subPeriods, setSubPeriods] = useState([])
    const [subPeriodId, setSubPeriodId] = useState(0)
    const [ratesList, setRatesList] = useState([])



    const ongetsuccess = (data) => {
        setperiodsList(data)
        const thisYear = new Date().getFullYear()
        setSelectedPeriod(thisYear)
    }

    const onGetError = (error) => {
        showToast("error", "Could not get list")
        setperiodsList([])
    }






    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    // const [modal_backdrop, setmodal_backdrop] = useState(false);
    const { isLoading: isListLoading, isError } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Period`, "Periods", ongetsuccess, onGetError)
    const axios = useCustomAxios()

    const handleSubPeriodSelect = (e) => {
        if (selectedPeriod == '') {
            showToast('warning', "Please Select Period", "Warning")
        }
        else {
            setSubPeriodId(e.target.value)
        }
    }

    const handleUpdateExchangeRate = (e) => {
      
            let newObject = {
                "foreignCurrencyId": e.target.id,
                "rate": (e.target.value),
                "rateDate": e.target.name
            }
            if(newObject.rate != ''){
                let updatedList = [...ratesList, newObject]
                setRatesList((prev) => updatedList)
            }
            
    }

    const handleFormChange = (e, rowIndex, index) => {
            let data = [...tableData];
            console.log(e.target.value);
            data[rowIndex].exchangeRates[index]['rate'] = e.target.value
           //console.log(data[rowIndex].exchangeRates[index], 'DATA')
            // data[rowIndex].exchangeRates[index]['rate'] = e.target.value;
            setTableData((prev) => data);
    }

    const handleSaveRates = () => {
        if(ratesList.length > 0){
            axios.post(`${process.env.REACT_APP_ADMIN_URL}/ExchangeRate`, ratesList)
            .then((res) => {
                showToast('success', "Exchange Rates successfully updated")
            })
            .catch((error) => {
                // showToast('error', "Error getting subperiods")
                // console.log(error)
            })
        }
    }

    useEffect(() => {
        if (selectedPeriod) {
            axios.get(`${process.env.REACT_APP_ADMIN_URL}/Period/GetSubPeriodsByYear/${selectedPeriod}`)
                .then((res) => setSubPeriods(res.data.payload))
                .catch((error) => {
                    // showToast('error', "Error getting subperiods")
                    // console.log(error)
                })
                .finally(() => {
                    console.log(subPeriods, 'SP')
                    //setSubPeriodId(19)
                })
        }

    }, [selectedPeriod])


    useEffect(() => {
        if(subPeriods){
            let period = convertDateUSA(new Date())
            console.log(period.substring(3,6))
            let selectedPeriodObj = subPeriods.find((item) => item.name.includes(period.substring(3,6)))
            console.log(selectedPeriodObj)
            setSubPeriodId(selectedPeriodObj?.id)
        }
        
    },[subPeriods])


    useEffect(() => {
        if (subPeriodId) {
            setTableData([])

            axios.get(`${process.env.REACT_APP_ADMIN_URL}/ExchangeRate/GetExchangeRatesBySubPeriod/${subPeriodId}`)
                .then((res) => {
                    // console.log(res.data.payload, 'EXRates')
                    setTableData(res.data.payload)
                })
                .catch((error) => {
                    // showToast('error', "Error getting subperiods")
                    // console.log(error)
                })
        }
    }, [subPeriodId])

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    //meta title
    document.title = "Biz-360 ERP | Exchange Rate";


    if (isListLoading) {
        return <LoadingSpinner />
    }


    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Administration" breadcrumbItem="Exchange Rate" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>

                    <CardBody >
                        <Row>

                            <Col md="2" sm={12}>
                                <FormGroup className="">
                                    <Label>Period</Label>
                                    <InputGroup>
                                        <select className="form-select form-select-sm" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                                            <option>Select period</option>
                                            {periodsList.map((item) =>
                                                <option key={item.id} value={item.year}>{item.year}</option>
                                            )}

                                        </select>
                                    </InputGroup></FormGroup>

                            </Col>
                            <Col md="3" sm={12}>
                                <FormGroup className="">
                                    <Label>Sub Period</Label>
                                    <InputGroup>
                                        <select className="form-select form-select-sm" value={subPeriodId} onChange={handleSubPeriodSelect}>
                                            <option>Select Sub period</option>
                                            {
                                                subPeriods.map(x => <option key={x.id} id={x.id} value={x.id}>{x.name} {x.periodYear}</option>)
                                            }

                                        </select>
                                    </InputGroup></FormGroup>

                            </Col>
                            <Col md="3" sm={12}>
                                <FormGroup className="">
                                    <Label>Home Currency</Label>
                                    <InputGroup>
                                    <input type="text" value={(tableData[0]?.['homeCurrency']?.name || '') + ' (' + (tableData[0]?.['homeCurrency']?.code || '') + ')'} className="form-control form-control-sm" readOnly/>
                                    </InputGroup></FormGroup>
                                
                            </Col>
                            <Col md="4" sm={12} >
                                <FormGroup className="row">
                                    <Label></Label>
                                    <InputGroup style={{display:'flex',flexDirection:'row-reverse', marginTop:30}}>
                                        <Button color="primary" className="btn-sm" onClick={handleSaveRates}><i className="far fa-save" ></i> Save Exchange Rates</Button>
                                    </InputGroup></FormGroup>
                                
                            </Col>
                        </Row>

                        {showLoading ? <LoadingSpinner /> :
                            <div className="wrapper">
                                <div className="table-wrapper">
                                    <Table className="table mb-0 table-sm">
                                        <thead className="table-light sticky-col first-w first-col">
                                            <tr>
                                                {tableData.length > 0 && <th>Date</th>}
                                                {tableData[0]?.exchangeRates?.map((item, idx) => (<th key={idx} id={item.currencyId}>{item?.currencyName}({item.currencyCode})</th>))}
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {tableData?.map((item, rowIndex) => {
                                                //console.log(item)
                                                return (
                                                    <tr key={rowIndex}>
                                                        <td>{convertDateUSA(item?.day).substring(0,6)}</td>
                                                        {item?.exchangeRates.map((row, i) => <td key={i}>
                                                            <input style={{ border: 'none' }} type="number" step={0.01} onChange={(e) => handleFormChange(e,rowIndex, i)}
                                                             onBlur={handleUpdateExchangeRate} id={row.currencyId} name={row.rateDate}
                                                            //   value={row.rate ? parseFloat(row?.rate).toFixed(2) : ''} className="form-control form-control-sm" />
                                                              value={row?.rate} className="form-control form-control-sm" />
                                                        </td>)}

                                                    </tr>
                                                )
                                            })}


                                        </tbody>
                                    </Table>
                                </div>
                            </div>}
                    </CardBody>

                </Card>

            </div>





        </div>



    );
}
ExchangeRate.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default ExchangeRate;