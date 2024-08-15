// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes, { object } from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";

import { AppContext } from "App";
import AccountTable from "./AccountTable/AccountTable";
import { useGet } from "hook/useGet";
import { useGetById } from "hook/useGetById";
import { useGetByIds } from "hook/useGetByIds";

function groupByParentAccountAndMonth1(data) {
    const groupedByParentAccount = {};

    // Group data by parent account
    data.forEach(account => {
        const parentAccount = account.parentAccount;

        if (!groupedByParentAccount[parentAccount]) {
            groupedByParentAccount[parentAccount] = [];
        }

        groupedByParentAccount[parentAccount].push(account);
    });

    // Create an array of objects with parentAccount, accountName, and months
    const resultArray = Object.entries(groupedByParentAccount).map(([parentAccount, accounts]) => {
        const monthsArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = accounts.find(account => account.subPeriodId === (index + 1));
            return monthData
                ? {
                    accountName: monthData.accountName,
                    subPeriodName: monthData.subPeriodName,
                    planAmount: monthData.planAmount,
                    budgetAmount: monthData.budgetAmount,
                }
                : {
                    subPeriodName: "", // Or you can set it to the default value for subPeriodName
                    planAmount: 0.00,
                    budgetAmount: 0.00,
                };
        });

        return {
            parentAccount: parentAccount,
            months: monthsArray,
        };
    });

    return resultArray;
}

function groupByParentAccountAndSubAccounts(data) {
    const groupedByParentAccount = {};

    // Group data by parent account
    data.forEach(account => {
        const parentAccount = account.parentAccount;

        if (!groupedByParentAccount[parentAccount]) {
            groupedByParentAccount[parentAccount] = [];
        }

        groupedByParentAccount[parentAccount].push(account);
    });

    // Create an array of objects with parentAccount and subAccounts
    const resultArray = Object.entries(groupedByParentAccount).map(([parentAccount, subAccounts]) => {
        const subAccountsArray = subAccounts.map(subAccount => {
            const accountObject = {
                accountName: subAccount.accountName,
            };

            // Add months to the subAccount object
            Array.from({ length: 12 }, (_, index) => {
                const subPeriodName = getMonthName(index + 1); // Function to get month name based on index
                const monthData = subAccounts.find(acc => acc.subPeriodId === (index + 1));

                accountObject[subPeriodName] = {
                    planAmount: monthData ? monthData.planAmount : 0.00,
                    budgetAmount: monthData ? monthData.budgetAmount : 0.00,
                };
            });

            return accountObject;
        });

        return {
            parentAccount: parentAccount,
            subAccounts: subAccountsArray,
        };
    });

    return resultArray;
}

// Helper function to get month name
function getMonthName(monthIndex) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return months[monthIndex - 1];
}


function ChartOfAccount() {

    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)

    const [filter, setFilter] = useState({ currency: "", year: `${new Date().getFullYear()}`, viewType: "income_statement" })
    const [chartAccount, setChartAccount] = useState([])
    const [canSearch, setCanSearch] = useState(false)
    const [loading, setLoading] = useState(false)

    const onsuccess = (data) => {

        setLoading(false)
        const result = groupByParentAccountAndSubAccounts(data);

        setChartAccount(result)

    }
    //ChartOfAccount/GetSimpleChartOfAccountByCurrency/1/Year/1?accountType=dsd
    const { refetch, isLoading, isSuccess } = useGetByIds(`${process.env.REACT_APP_ADMIN_URL}/ChartOfAccount/GetSimpleChartOfAccountByCurrency/${filter?.currency}/Year/${filter?.year}?accountType=${filter?.viewType}`, ['chart-account'], [filter?.currency, filter?.year, filter?.viewType], onsuccess)

    const { data: currenciesList = [], isLoading: currenciesLoading } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies', (data) => { setFilter(prev => ({ ...prev, currency: data[0]?.id })) })
    const { data: period = [], isLoading: periodsLoading } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Period`, 'period', (data) => { setFilter(prev => ({ ...prev, year: `${new Date().getFullYear()}` })) })

    //meta title
    document.title = "Biz-360 ERP | Chart of Accounts";

    const handleChangeEvent = (event) => {
        setFilter(prev => ({ ...prev, [event.target.name]: event.target.value }))
    }

    const handleSearchEvent = () => {
        setLoading(true)
        refetch()
    }

    useEffect(() => {
        setCanSearch(Object.values(filter).every(x => x.length > 0))

        return () => {
            setCanSearch(false)
        }
    }, [filter])
    useEffect(() => {

        refetch()

        return () => {

        }
    }, [filter])


    return (
        <>
            {
                loading ?
                    <div id="preloader">
                        <div id="status">
                            <div className="spinner-chase">
                                <div className="chase-dot" />
                                <div className="chase-dot" />
                                <div className="chase-dot" />
                                <div className="chase-dot" />
                                <div className="chase-dot" />
                                <div className="chase-dot" />
                            </div>
                        </div>
                    </div> : null
            }
            <div className="page-content">
                {/* <div className="container-fluid"> */}
                <Breadcrumbs title="Financials" breadcrumbItem="Chart of Accounts" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>

                    <CardBody >
                        <CardTitle>
                            <Row>
                                <Col md={2}>
                                    <label>Year</label>
                                    <select className="form-select form-select-sm" value={filter?.year} name="year" onChange={handleChangeEvent}>

                                        {
                                            period?.map(x => <option key={x?.year} value={x?.year}>{x?.year}</option>)
                                        }


                                    </select>
                                </Col>
                                <Col md={2} sm={12}>
                                    <label>View Types</label>
                                    <select className="form-select form-select-sm " value={filter?.viewType} name="viewType" onChange={handleChangeEvent}>
                                        <option value={'income_statement'}>Income Statement</option>
                                        <option value={'balance_sheet'}>Balance Sheet</option>

                                    </select>
                                </Col>
                                <Col md={2} sm={12}>
                                    <label>Currency</label>
                                    <select className="form-select form-select-sm" value={filter?.currency} name="currency" onChange={handleChangeEvent}>

                                        {
                                            currenciesList?.filter(x => x?.isHome === 'Yes' || x?.isReporting === 'Yes')
                                                .map(x => <option key={x?.id} value={x?.id}>{x?.code}</option>)
                                        }
                                        {/* <option>Local</option>
                                    <option>Reporting</option> */}
                                    </select>
                                </Col>
                                <Col className="align-self-end">
                                    <button className="btn btn-primary btn-sm" onClick={handleSearchEvent}><i className="fa fa-search"></i>{' '} Search</button>
                                </Col>
                                <Col md={4}></Col>
                                <Col className="align-self-end">
                                    <button className="btn btn-primary btn-sm"><i className="fa fa-file-excel"></i>{' '} Excel Export</button>
                                </Col>
                            </Row>
                        </CardTitle>

                        <AccountTable chartAccount={chartAccount} />
                    </CardBody>

                </Card>

                {/* </div> */}


            </div>
        </>




    );
}
ChartOfAccount.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default ChartOfAccount;

