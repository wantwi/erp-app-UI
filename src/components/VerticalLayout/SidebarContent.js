import React, { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";


// //Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import withRouter from "components/Common/withRouter";
import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";

const SidebarContent = props => {
  const ref = useRef();
  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const path = useLocation();
  const activeMenu = useCallback(() => {
    const pathName = path.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>

            {/*  Dashboard Menu*/}
            <li>
              <Link to="/dashboard" >
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Home")}</span>
              </Link>
            </li>
            <li>

              <Link to="/self-service" >
                <i className="bx bx-male"></i>
                <span>{props.t("Self Service")}</span>
              </Link>
            </li>



            {/* Administration Module */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="fa fas fa-cog"></i>
                <span>{props.t("Administration")}</span>
              </Link>
              <ul className="has-arrow ">
                <li>
                  <Link to="/admin/users">{props.t("Users")}</Link>
                </li>
                <li>
                  <Link to="/admin/user-roles">{props.t("User Roles")}</Link>
                </li>
                <li>
                  <Link to="/admin/company">{props.t("Company")}</Link>
                  {/* <Link to="#">{props.t("Company")}</Link> */}
                </li>
                {/* <li>
                  <Link to="/admin/accounts">{props.t("Accounts")}</Link>
                </li> */}
                <li>
                  <Link to="/admin/periods">{props.t("Periods")}</Link>
                </li>
                <li>
                  <Link to="/admin/calendar">{props.t("Calendar/Holidays")}</Link>
                </li>
                <li>
                  <Link to="/admin/currency">{props.t("Currency")}</Link>
                  {/* <Link to="#">{props.t("Currency")}</Link> */}
                </li>
                <li>
                  <Link to="/admin/exchange-rates">{props.t("Exchange Rates")}</Link>
                </li>
                <li>
                  <Link to="/admin/cost-centers">{props.t("Cost Centers")}</Link>
                </li>
                <li>
                  <Link to="/admin/territories">{props.t("Territories")}</Link>
                </li>
                <li>
                  <Link to="/admin/payment-terms">{props.t("Payment Terms")}</Link>
                </li>
                <li>
                  <Link to="/admin/asset-class">{props.t("Asset Class")}</Link>
                </li>
                <li>
                  <Link to="/admin/tax-table">{props.t("Tax Table")}</Link>
                </li>
                <li>
                  <Link to="/admin/price-list">{props.t("Price List")}</Link>
                </li>
                <li>
                  <Link to="/admin/unit-measure">{props.t("Unit of Measure")}</Link>
                </li>
                <li>
                  <Link to="/admin/item-groups">{props.t("Item Groups")}</Link>
                </li>
                <li>
                  <Link to="/admin/business-partner-groups">{props.t("Business Partner Groups")}</Link>
                  {/* <Link to="#">{props.t("Business Partner Groups")}</Link> */}
                </li>
                <li>
                  <Link to="/admin/pay-grade">{props.t("Pay Grades")}</Link>
                </li>
                <li>
                  <Link to="/admin/deductions">{props.t("Deductions")}</Link>
                </li>
                <li>
                  <Link to="/admin/benefits">{props.t("Benefits")}</Link>
                </li>
                <li>
                  <Link to="/admin/locations">{props.t("Locations")}</Link>
                </li>
                <li>
                  <Link to="/admin/organizational-unit">{props.t("Organizational Unit")}</Link>
                </li>
                <li>
                  <Link to="/admin/positions">{props.t("Positions")}</Link>
                </li>
                <li>
                  <Link to="/admin/loan-types">{props.t("Loan Types")}</Link>
                </li>
                <li>
                  <Link to="/admin/banks">{props.t("Banks")}</Link>
                </li>
                <li>
                  <Link to="/admin/bank-accounts">{props.t("Bank Accounts")}</Link>
                </li>
                <li>
                  <Link to="/admin/excel-import">{props.t("Excel Import")}</Link>
                </li>
                <li>
                  <Link to="/admin/project">{props.t("Projects")}</Link>
                </li>
              </ul>
            </li>


            {/* Approvals */}
            <li>
              <Link to="/calendar" className="has-arrow ">
                <i className="mdi mdi-thumb-up-outline"></i>
                <span>{props.t("Approval")}</span>
              </Link>
              <ul className="has-arrow ">
                <li>
                  <Link to="/approval/rules">{props.t("Approval Rules")}</Link>
                </li>
                <li>
                  <Link to="/approval/decisions">{props.t("Approval Decisions")}</Link>
                </li>
              </ul>
            </li>

            {/* Financials */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-money"></i>
                <span>{props.t("Financials")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/financials/chart-account">{props.t("Chart of Accounts")}</Link>
                </li>
                <li>
                  <Link to="/financials/general-ledger">{props.t("General Ledger")}</Link>
                </li>
                <li>
                  <Link to="/financials/journal-entry">{props.t("Journal Entry")}</Link>
                </li>
                <li>
                  <Link to="/financials/recurring-journals">{props.t("Recurring Journals")}</Link>
                </li>
                <li>
                  <Link to="/financials/post-recurring-journals">{props.t("Post Recurring Journals")}</Link>
                </li>
                <li>
                  <Link to="/financials/internal-reconciliation">{props.t("Internal Reconciliation")}</Link>
                </li>
                <li>
                  <Link to="/financials/expense-request">{props.t("Expense Request")}</Link>
                </li>
                <li>
                  <Link to="/financials/expense-report">{props.t("Expense Report")}</Link>
                </li>
                <li>
                  <Link to="/#" className="has-arrow">
                    {props.t("Fixed Assets")}
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/financials/fixed-asset/capitalisation">{props.t("Capitalisation")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/fixed-asset/capitalisation-credit-note">{props.t("Capitalisation Credit Note")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/fixed-asset/depreciation-run">{props.t("Depreciation Run")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/fixed-asset/revaluation">{props.t("Revaluation")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/fixed-asset/retirement">{props.t("Retirement")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/fixed-asset/asset-register">{props.t("Asset Register")}</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/#" className="has-arrow">
                    {props.t("Reports")}
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/financials/report/general-ledger">{props.t("General Ledger")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/trial-balance">{props.t("Trial Balance")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/income-statement">{props.t("Income Statement")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/financial-position">{props.t("Statement of Financial Position")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/cash-flow">{props.t("Statement of Cash Flow")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/cash-flow-forecast">{props.t("Cash Flow Forecast")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/business-partner-aging">{props.t("Business Partner Aging")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/wht">{props.t("WHT")}</Link>
                    </li>
                    <li>
                      <Link to="/financials/report/vat">{props.t("VAT")}</Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* Master Data */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-data"></i>
                <span>{props.t("Master Data")}</span>
              </Link>
              <ul className="has-arrow ">
                <li>
                  <Link to="/master-data/business-partners">{props.t("Business Partners")}</Link>
                </li>
                <li>
                  <Link to="/master-data/items">{props.t("Items")}</Link>
                </li>
                <li>
                  <Link to="/master-data/warehouses">{props.t("Warehouses")}</Link>
                </li>
                <li>
                  <Link to="/master-data/accounts">{props.t("Accounts")}</Link>
                </li>
                <li>
                  <Link to="/master-data/employees">{props.t("Employees")}</Link>
                </li>
              </ul>
            </li>

            {/* Revenue */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="mdi mdi-finance "></i>
                <span>{props.t("Revenue")}</span>
              </Link>
              <ul className="has-arrow ">
                <li>
                  <Link to="/revenue/pos">{props.t("Point of Sale")}</Link>
                </li>
                <li>
                  <Link to="/revenue/quotation">{props.t("Quotation")}</Link>
                </li>
                <li>
                  <Link to="/revenue/order">{props.t("Order")}</Link>
                </li>
                <li>
                  <Link to="/revenue/delivery">{props.t("Delivery")}</Link>
                </li>
                <li>
                  <Link to="/revenue/return">{props.t("Return")}</Link>
                </li>
                <li>
                  <Link to="/revenue/invoice">{props.t("Invoice")}</Link>
                </li>
                <li>
                  <Link to="/revenue/credit-note">{props.t("Credit Note")}</Link>
                </li>
              </ul>
            </li>


            {/* Purchasing  */}
            <li>
              <Link to="/purchasing" className="has-arrow ">
                <i className="mdi mdi-account-cash-outline"></i>
                <span>{props.t("Purchasing")}</span>
              </Link>
              <ul className="has-arrow ">
                <li>
                  <Link to="/purchasing/user-request">{props.t("User Request")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/bid">{props.t("Bid")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/bid-selection">{props.t("Bid Selection")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/order">{props.t("Order")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/goods-receipt">{props.t("Goods Receipt")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/goods-return">{props.t("Goods Return")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/invoice">{props.t("Invoice")}</Link>
                </li>
                <li>
                  <Link to="/purchasing/debit-note">{props.t("Debit Note")}</Link>
                </li>
              </ul>
            </li>

            {/* Stock */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-box"></i>
                <span>{props.t("Stock")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/stock/warehouse-transfer-request">{props.t("Warehouse Transfer Request")}</Link>
                </li>
                <li>
                  <Link to="/stock/warehouse-transfer-delivery">{props.t("Warehouse Transfer Delivery")}</Link>
                </li>
                <li>
                  <Link to="/stock/warehouse-transfer-receipt">{props.t("Warehouse Transfer Receipt")}</Link>
                </li>
                <li>
                  <Link to="/stock/goods-issue">{props.t("Goods Issue")}</Link>
                </li>
                <li>
                  <Link to="/stock/goods-receipt">{props.t("Goods Receipt")}</Link>
                </li>
                <li>
                  <Link to="/stock/counting">{props.t("Stock Counting")}</Link>
                </li>

                <li>
                  <Link to="/#" className="has-arrow">
                    {props.t("Reports")}
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/stock/reports/item-transaction">{props.t("Item Transactions")}</Link>
                    </li>
                    <li>
                      <Link to="/stock/reports/item-list">{props.t("Items List")}</Link>
                    </li>

                  </ul>
                </li>
              </ul>
            </li>


            {/* Banking */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="fas fa-piggy-bank"></i>
                <span>{props.t("Banking")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/banking/receipts">{props.t("Receipts")}</Link>
                </li>
                <li>
                  <Link to="/banking/payments">{props.t("Payments")}</Link>
                </li>
                <li>
                  <Link to="/banking/deposits">{props.t("Deposits")}</Link>
                </li>
                <li>
                  <Link to="/banking/bank-reconciliation">{props.t("Bank Reconciliation")}</Link>
                </li>

                <li>
                  <Link to="/#" className="has-arrow">
                    {props.t("Reports")}
                  </Link>
                  <ul className="sub-menu">
                    {/* <li>
                      <Link to="/#">{props.t("Item Transactions")}</Link>
                    </li>
                    <li>
                      <Link to="/#">{props.t("Items List")}</Link>
                    </li> */}

                  </ul>
                </li>
              </ul>
            </li>


            {/* Payroll */}
            <li>
              <Link to="/calendar" className="has-arrow ">
                <i className="bx bx-calendar"></i>
                <span>{props.t("Payroll")}</span>
              </Link>
              <ul className="has-arrow ">
                <li>
                  <Link to="/payroll/pay-run">{props.t("Pay Run")}</Link>
                </li>
                <li>
                  <Link to="/payroll/time-attendance">{props.t("Time & Attendance")}</Link>
                </li>
                <li>
                  <Link to="/payroll/loan">{props.t("Loan")}</Link>
                </li>
              </ul>
            </li>

            {/* HR */}
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-user"></i>
                <span>{props.t("HR")}</span>
              </Link>
              <ul className="has-arrow">
                <li>
                  <Link to="/hr/org-unit">{props.t("Organizational Unit")}</Link>
                </li>
                <li>
                  <Link to="/hr/org-structure">{props.t("Organizational Structure")}</Link>
                </li>
                <li>
                  <Link to="/hr/position">{props.t("Positions")}</Link>
                </li>
              </ul>
            </li>

            {/* <li className="menu-title">{props.t("Apps")}</li> */}

            {/* 

            <li>
              <Link to="/calendar" >
                <i className="bx bx-calendar"></i>
                <span>{props.t("Calendar")}</span>
              </Link>
            </li>

            <li>
              <Link to="/chat" >
                <i className="bx bx-chat"></i>
                <span>{props.t("Chat")}</span>
              </Link>
            </li>
            <li>
              <Link to="/apps-filemanager" >
                <i className="bx bx-file"></i>
                <span>{props.t("File Manager")}</span>
              </Link>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-store"></i>
                <span>{props.t("Ecommerce")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/ecommerce-products">{props.t("Products")}</Link>
                </li>
                <li>
                  <Link to="/ecommerce-product-detail/1">
                    {props.t("Product Detail")}
                  </Link>
                </li>
                <li>
                  <Link to="/ecommerce-orders">{props.t("Orders")}</Link>
                </li>
                <li>
                  <Link to="/ecommerce-customers">{props.t("Customers")}</Link>
                </li>
                <li>
                  <Link to="/ecommerce-cart">{props.t("Cart")}</Link>
                </li>
                <li>
                  <Link to="/ecommerce-checkout">{props.t("Checkout")}</Link>
                </li>
                <li>
                  <Link to="/ecommerce-shops">{props.t("Shops")}</Link>
                </li>
                <li>
                  <Link to="/ecommerce-add-product">
                    {props.t("Add Product")}
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-bitcoin"></i>
                <span>{props.t("Crypto")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/crypto-wallet">{props.t("Wallet")}</Link>
                </li>
                <li>
                  <Link to="/crypto-buy-sell">{props.t("Buy/Sell")}</Link>
                </li>
                <li>
                  <Link to="/crypto-exchange">{props.t("Exchange")}</Link>
                </li>
                <li>
                  <Link to="/crypto-lending">{props.t("Lending")}</Link>
                </li>
                <li>
                  <Link to="/crypto-orders">{props.t("Orders")}</Link>
                </li>
                <li>
                  <Link to="/crypto-kyc-application">
                    {props.t("KYC Application")}
                  </Link>
                </li>
                <li>
                  <Link to="/crypto-ico-landing">{props.t("ICO Landing")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-envelope"></i>
                <span>{props.t("Email")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/email-inbox">{props.t("Inbox")}</Link>
                </li>
                <li>
                  <Link to="/email-read">{props.t("Read Email")} </Link>
                </li>
                <li>
                  <Link to="/#" className="has-arrow ">
                    <span key="t-email-templates">{props.t("Templates")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/email-template-basic">
                        {props.t("Basic Action")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/email-template-alert">
                        {props.t("Alert Email")}{" "}
                      </Link>
                    </li>
                    <li>
                      <Link to="/email-template-billing">
                        {props.t("Billing Email")}{" "}
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-receipt"></i>
                <span>{props.t("Invoices")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/invoices-list">{props.t("Invoice List")}</Link>
                </li>
                <li>
                  <Link to="/invoices-detail">{props.t("Invoice Detail")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-briefcase-alt-2"></i>
                <span>{props.t("Projects")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/projects-grid">{props.t("Projects Grid")}</Link>
                </li>
                <li>
                  <Link to="/projects-list">{props.t("Projects List")}</Link>
                </li>
                <li>
                  <Link to="/projects-overview">
                    {props.t("Project Overview")}
                  </Link>
                </li>
                <li>
                  <Link to="/projects-create">{props.t("Create New")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-task"></i>
                <span>{props.t("Tasks")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/tasks-list">{props.t("Task List")}</Link>
                </li>
                <li>
                  <Link to="/tasks-create">{props.t("Create Task")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bxs-user-detail"></i>
                <span>{props.t("Contacts")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/contacts-grid">{props.t("User Grid")}</Link>
                </li>
                <li>
                  <Link to="/contacts-list">{props.t("User List")}</Link>
                </li>
                <li>
                  <Link to="/contacts-profile">{props.t("Profile")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bxs-detail" />

                <span>{props.t("Blog")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/blog-list">{props.t("Blog List")}</Link>
                </li>
                <li>
                  <Link to="/blog-grid">{props.t("Blog Grid")}</Link>
                </li>
                <li>
                  <Link to="/blog-details">{props.t("Blog Details")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#">
                <span className="badge rounded-pill bg-success float-end" key="t-new">New</span>
                <i className="bx bx-briefcase-alt"></i>
                <span key="t-jobs">{props.t("Jobs")}</span>
              </Link>
              <ul className="sub-menu">
                <li><Link to="/job-list">{props.t("Job List")}</Link></li>
                <li><Link to="/job-grid">{props.t("Job Grid")}</Link></li>
                <li><Link to="/job-apply">{props.t("Apply Job")}</Link></li>
                <li><Link to="/job-details">{props.t("Job Details")}</Link></li>
                <li><Link to="/job-categories">{props.t("Jobs Categories")}</Link></li>
                <li>
                  <Link to="/#" className="has-arrow">{props.t("Candidate")}</Link>
                  <ul className="sub-menu" aria-expanded="true">
                    <li><Link to="/candidate-list">{props.t("List")}</Link></li>
                    <li><Link to="/candidate-overview">{props.t("Overview")}</Link></li>
                  </ul>
                </li>
              </ul>
            </li> */}

            {/* <li className="menu-title">Pages</li>
            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-user-circle"></i>
                <span>{props.t("Authentication")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/pages-login">{props.t("Login")}</Link>
                </li>
                <li>
                  <Link to="/pages-login-2">{props.t("Login 2")}</Link>
                </li>
                <li>
                  <Link to="/pages-register">{props.t("Register")}</Link>
                </li>
                <li>
                  <Link to="/pages-register-2">{props.t("Register 2")}</Link>
                </li>
                <li>
                  <Link to="/page-recoverpw">
                    {props.t("Recover Password")}
                  </Link>
                </li>
                <li>
                  <Link to="/page-recoverpw-2">
                    {props.t("Recover Password 2")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth-lock-screen">{props.t("Lock Screen")}</Link>
                </li>
                <li>
                  <Link to="/auth-lock-screen-2">
                    {props.t("Lock Screen 2")}
                  </Link>
                </li>
                <li>
                  <Link to="/page-confirm-mail">{props.t("Confirm Mail")}</Link>
                </li>
                <li>
                  <Link to="/page-confirm-mail-2">
                    {props.t("Confirm Mail 2")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth-email-verification">
                    {props.t("Email Verification")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth-email-verification-2">
                    {props.t("Email Verification 2")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth-two-step-verification">
                    {props.t("Two Step Verification")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth-two-step-verification-2">
                    {props.t("Two Step Verification 2")}
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-file"></i>
                <span>{props.t("Utility")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/pages-starter">{props.t("Starter Page")}</Link>
                </li>
                <li>
                  <Link to="/pages-maintenance">{props.t("Maintenance")}</Link>
                </li>
                <li>
                  <Link to="/pages-comingsoon">{props.t("Coming Soon")}</Link>
                </li>
                <li>
                  <Link to="/pages-timeline">{props.t("Timeline")}</Link>
                </li>
                <li>
                  <Link to="/pages-faqs">{props.t("FAQs")}</Link>
                </li>
                <li>
                  <Link to="/pages-pricing">{props.t("Pricing")}</Link>
                </li>
                <li>
                  <Link to="/pages-404">{props.t("Error 404")}</Link>
                </li>
                <li>
                  <Link to="/pages-500">{props.t("Error 500")}</Link>
                </li>
              </ul>
            </li> */}

            <li className="menu-title">{props.t("Components (Dev)")}</li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-tone" />
                <span>{props.t("UI Elements")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/ui-alerts">{props.t("Alerts")}</Link>
                </li>
                <li>
                  <Link to="/ui-buttons">{props.t("Buttons")}</Link>
                </li>
                <li>
                  <Link to="/ui-cards">{props.t("Cards")}</Link>
                </li>
                <li>
                  <Link to="/ui-carousel">{props.t("Carousel")}</Link>
                </li>
                <li>
                  <Link to="/ui-dropdowns">{props.t("Dropdowns")}</Link>
                </li>
                <li>
                  <Link to="/ui-offcanvas">{props.t("OffCanvas")}</Link>
                </li>
                <li>
                  <Link to="/ui-grid">{props.t("Grid")}</Link>
                </li>
                <li>
                  <Link to="/ui-images">{props.t("Images")}</Link>
                </li>
                <li>
                  <Link to="/ui-lightbox">{props.t("Lightbox")}</Link>
                </li>
                <li>
                  <Link to="/ui-modals">{props.t("Modals")}</Link>
                </li>
                <li>
                  <Link to="/ui-rangeslider">
                    {props.t("Range Slider")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-session-timeout">
                    {props.t("Session Timeout")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-progressbars">
                    {props.t("Progress Bars")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-placeholders">{props.t("Placeholders")}</Link>
                </li>
                {/* <li>
                  <Link to="/ui-sweet-alert">
                    {props.t("Sweet-Alert")}
                  </Link>
                </li> */}
                <li>
                  <Link to="/ui-tabs-accordions">
                    {props.t("Tabs & Accordions")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-typography">
                    {props.t("Typography")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-toasts">{props.t("Toasts")}</Link>
                </li>
                <li>
                  <Link to="/ui-video">{props.t("Video")}</Link>
                </li>
                <li>
                  <Link to="/ui-general">{props.t("General")}</Link>
                </li>
                <li>
                  <Link to="/ui-colors">{props.t("Colors")}</Link>
                </li>
                <li>
                  <Link to="/ui-rating">{props.t("Rating")}</Link>
                </li>
                <li>
                  <Link to="/ui-notifications">
                    {props.t("Notifications")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-breadcrumb">
                    {props.t("Breadcrumb")}
                  </Link>
                </li>
                <li>
                  <Link to="/ui-utilities">
                    {props.t("Utilities")}
                    <span className="badge rounded-pill bg-success float-end" key="t-new">New</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" >
                <i className="bx bxs-eraser"></i>
                <span className="badge rounded-pill bg-danger float-end">
                  10
                </span>
                <span>{props.t("Forms")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/form-elements">{props.t("Form Elements")}</Link>
                </li>
                <li>
                  <Link to="/form-layouts">{props.t("Form Layouts")}</Link>
                </li>
                <li>
                  <Link to="/form-validation">
                    {props.t("Form Validation")}
                  </Link>
                </li>
                <li>
                  <Link to="/form-advanced">{props.t("Form Advanced")}</Link>
                </li>
                <li>
                  <Link to="/form-editors">{props.t("Form Editors")}</Link>
                </li>
                <li>
                  <Link to="/form-uploads">{props.t("Form File Upload")} </Link>
                </li>
                <li>
                  <Link to="/form-repeater">{props.t("Form Repeater")}</Link>
                </li>
                <li>
                  <Link to="/form-wizard">{props.t("Form Wizard")}</Link>
                </li>
                <li>
                  <Link to="/form-mask">{props.t("Form Mask")}</Link>
                </li>
                {/* <li>
                  <Link to="/dual-listbox">{props.t("Transfer List")}</Link>
                </li> */}
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-list-ul"></i>
                <span>{props.t("Tables")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/tables-basic">{props.t("Basic Tables")}</Link>
                </li>
                <li>
                  <Link to="/tables-datatable">{props.t("Data Tables")}</Link>
                </li>
                <li>
                  <Link to="/tables-responsive">
                    {props.t("Responsive Table")}
                  </Link>
                </li>
                <li>
                  <Link to="/tables-dragndrop">{props.t("Drag & Drop Table")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bxs-bar-chart-alt-2"></i>
                <span>{props.t("Charts")}</span>
              </Link>

              <ul className="sub-menu">
                <li>
                  <Link to="/apex-charts">{props.t("Apex charts")}</Link>
                </li>
                <li>
                  <Link to="/chartist-charts">{props.t("Chartist Chart")}</Link>
                </li>
                <li>
                  <Link to="/chartjs-charts">{props.t("Chartjs Chart")}</Link>
                </li>
                <li>
                  <Link to="/e-charts">{props.t("E Chart")}</Link>
                </li>
                <li>
                  <Link to="/sparkline-charts">
                    {props.t("Sparkline Chart")}
                  </Link>
                </li>
                <li>
                  <Link to="/charts-knob">{props.t("Knob Chart")}</Link>
                </li>
                <li>
                  <Link to="/re-charts">{props.t("Re Chart")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-aperture"></i>
                <span>{props.t("Icons")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/icons-boxicons">{props.t("Boxicons")}</Link>
                </li>
                <li>
                  <Link to="/icons-materialdesign">
                    {props.t("Material Design")}
                  </Link>
                </li>
                <li>
                  <Link to="/icons-dripicons">{props.t("Dripicons")}</Link>
                </li>
                <li>
                  <Link to="/icons-fontawesome">{props.t("Font awesome")}</Link>
                </li>
              </ul>
            </li>

            {/* <li>
              <Link to="/#" className="has-arrow ">
                <i className="bx bx-map"></i>
                <span>{props.t("Maps")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/maps-google">{props.t("Google Maps")}</Link>
                </li>
                <li>
                  <Link to="/maps-vector">{props.t("Vector Maps")}</Link>
                </li>
                <li>
                  <Link to="/maps-leaflet">{props.t("Leaflet Maps")}</Link>
                </li>
              </ul>
            </li> */}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
