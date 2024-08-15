import React from 'react'
import "./AccountTable.css"
import { Table } from 'reactstrap'

const AccountTable = ({ chartAccount }) => {
    return (
        <div className="view main-card-body">
            <div className="wrapper">
                <div className="table-wrapper">
                    <Table className="table table-hover table-bordered" style={{ fontSize: '0.9em !important', minHeight: 100, maxHeight: 600 }}>
                        <thead className="table-light">
                            <tr>
                                <th className="sticky-col first-w first-col"><div style={{ minWidth: "20vw" }}></div ></th>
                                <th colSpan="2" className="text-center">January</th>
                                <th colSpan="2" className="text-center">February</th>
                                <th colSpan="2" className="text-center">March</th>
                                <th colSpan="2" className="text-center">April</th>
                                <th colSpan="2" className="text-center">May</th>
                                <th colSpan="2" className="text-center">June</th>
                                <th colSpan="2" className="text-center">July</th>
                                <th colSpan="2" className="text-center">August</th>
                                <th colSpan="2" className="text-center">September</th>
                                <th colSpan="2" className="text-center">October</th>
                                <th colSpan="2" className="text-center">November</th>
                                <th colSpan="2" className="text-center">December</th>
                            </tr>
                            <tr>
                                <th className="sticky-col first-w first-col" style={{ zIndex: 2, fontWeight: 900 }}>Account</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                                <th>Planned</th>
                                <th>Actual</th>
                            </tr>

                        </thead>

                        <tbody id="cost_area_TableBody">

                            {
                                chartAccount.map((x) => {
                                    const uniqueSubAccounts = Array.from(new Set(x?.subAccounts?.map((y) => y.accountName)))
                                        .map((accountName) => x.subAccounts.find((y) => y.accountName === accountName));

                                    return (
                                        <React.Fragment key={x?.parentAccount}>
                                            <tr>
                                                <td className="sticky-col first-w first-col">
                                                    <b>{x?.parentAccount}</b>
                                                </td>
                                            </tr>
                                            {uniqueSubAccounts &&
                                                uniqueSubAccounts.map((y) => (
                                                    <tr key={y.accountName}>
                                                        <td
                                                            className="sticky-col first-w first-col"
                                                            style={{ paddingLeft: "1.7em !important" }}
                                                        >
                                                            {y.accountName}
                                                        </td>
                                                        <td>{y.January.planAmount}</td>
                                                        <td>{y.January.budgetAmount}</td>
                                                        <td>{y.February.planAmount}</td>
                                                        <td>{y.February.budgetAmount}</td>
                                                        <td>{y.March.planAmount}</td>
                                                        <td >{y.March.budgetAmount}</td>
                                                        <td>{y.April.planAmount}</td>
                                                        <td >{y.April.budgetAmount}</td>
                                                        <td>{y.May.planAmount}</td>
                                                        <td >{y.May.budgetAmount}</td>
                                                        <td>{y.June.planAmount}</td>
                                                        <td >{y.June.budgetAmount}</td>
                                                        <td>{y.July.planAmount}</td>
                                                        <td >{y.July.budgetAmount}</td>
                                                        <td>{y.August.planAmount}</td>
                                                        <td >{y.August.budgetAmount}</td>
                                                        <td>{y.September.planAmount}</td>
                                                        <td >{y.September.budgetAmount}</td>
                                                        <td>{y.October.planAmount}</td>
                                                        <td >{y.October.budgetAmount}</td>
                                                        <td>{y.November.planAmount}</td>
                                                        <td >{y.November.budgetAmount}</td>
                                                        <td>{y.December.planAmount}</td>
                                                        <td >{y.December.budgetAmount}</td>
                                                        {/* ... repeat for other months */}
                                                    </tr>
                                                ))}
                                        </React.Fragment>
                                    );
                                })
                            }


                            <tr hidden>
                                <td className="sticky-col first-w first-col" style={{ paddingLeft: "1.7em !important" }}>accountName</td>
                                <td></td>
                                <td style={{ color: "black" }}></td>
                                <td></td>
                                <td style={{ color: "black" }}></td><td></td>
                                <td style={{ color: "black" }}></td>
                                <td></td><td style={{ color: "black" }}></td>
                                <td></td>
                                <td style={{ color: "black" }}></td>
                                <td></td>
                                <td style={{ color: "black" }}></td>
                                <td></td>
                                <td style={{ color: "black" }}></td>
                                <td></td>
                                <td style={{ color: "black" }}></td>
                                <td></td><td style={{ color: "black" }}></td>
                                <td></td><td style={{ color: "black" }}></td>
                                <td></td><td style={{ color: "black" }}></td><td></td><td style={{ color: "black" }}></td></tr>







                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default AccountTable





