import React from "react";
import { Navigate } from "react-router-dom";

// Pages Component
import Chat from "../pages/Chat/Chat";

// File Manager
import FileManager from "../pages/FileManager/index";

// Profile
import UserProfile from "../pages/Authentication/user-profile";

// Pages Calendar
import Calendar from "../pages/Calendar/index";

// //Tasks
import TasksList from "../pages/Tasks/tasks-list";
import TasksCreate from "../pages/Tasks/tasks-create";

// //Projects
import ProjectsGrid from "../pages/Projects/projects-grid";
import ProjectsList from "../pages/Projects/projects-list";
import ProjectsOverview from "../pages/Projects/ProjectOverview/projects-overview";
import ProjectsCreate from "../pages/Projects/projects-create";

// //Ecommerce Pages
import EcommerceProducts from "../pages/Ecommerce/EcommerceProducts/index";
import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProducts/EcommerceProductDetail";
import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
import EcommerceCustomers from "../pages/Ecommerce/EcommerceCustomers/index";
import EcommerceCart from "../pages/Ecommerce/EcommerceCart";
import EcommerceCheckout from "../pages/Ecommerce/EcommerceCheckout";
import EcommerceShops from "../pages/Ecommerce/EcommerceShops/index";
import EcommerceAddProduct from "../pages/Ecommerce/EcommerceAddProduct";

//Email
import EmailInbox from "../pages/Email/email-inbox";
import EmailRead from "../pages/Email/email-read";
import EmailBasicTemplte from "../pages/Email/email-basic-templte";
import EmailAlertTemplte from "../pages/Email/email-template-alert";
import EmailTemplateBilling from "../pages/Email/email-template-billing";

//Invoices
import InvoicesList from "../pages/Invoices/invoices-list";
import InvoiceDetail from "../pages/Invoices/invoices-detail";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";
import Signinoidc from "../pages/Authentication/Signinoidc";

//  // Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login";
import Login2 from "../pages/AuthenticationInner/Login2";
import Register1 from "../pages/AuthenticationInner/Register";
import Register2 from "../pages/AuthenticationInner/Register2";
import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
import Recoverpw2 from "../pages/AuthenticationInner/Recoverpw2";
import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
import ForgetPwd2 from "../pages/AuthenticationInner/ForgetPassword2";
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen";
import LockScreen2 from "../pages/AuthenticationInner/auth-lock-screen-2";
import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "../pages/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "../pages/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "../pages/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "../pages/AuthenticationInner/auth-two-step-verification-2";

// Dashboard
import Dashboard from "../pages/Dashboard/index";
import DashboardSaas from "../pages/Dashboard-saas/index";
import DashboardCrypto from "../pages/Dashboard-crypto/index";
import Blog from "../pages/Dashboard-Blog/index";
import DashboardJob from "../pages/DashboardJob/index";

//Crypto
import CryptoWallet from "../pages/Crypto/CryptoWallet/crypto-wallet";
import CryptoBuySell from "../pages/Crypto/crypto-buy-sell";
import CryptoExchange from "../pages/Crypto/crypto-exchange";
import CryptoLending from "../pages/Crypto/crypto-lending";
import CryptoOrders from "../pages/Crypto/CryptoOrders/crypto-orders";
import CryptoKYCApplication from "../pages/Crypto/crypto-kyc-application";
import CryptoIcoLanding from "../pages/Crypto/CryptoIcoLanding/index";

// Charts
import ChartApex from "../pages/Charts/Apexcharts";
import ChartistChart from "../pages/Charts/ChartistChart";
import ChartjsChart from "../pages/Charts/ChartjsChart";
import EChart from "../pages/Charts/EChart";
import SparklineChart from "../pages/Charts/SparklineChart";
import ChartsKnob from "../pages/Charts/charts-knob";
import ReCharts from "../pages/Charts/ReCharts";

// Maps
import MapsGoogle from "../pages/Maps/MapsGoogle";
import MapsVector from "../pages/Maps/MapsVector";
import MapsLeaflet from "../pages/Maps/MapsLeaflet";

//Icons
import IconBoxicons from "../pages/Icons/IconBoxicons";
import IconDripicons from "../pages/Icons/IconDripicons";
import IconMaterialdesign from "../pages/Icons/IconMaterialdesign";
import IconFontawesome from "../pages/Icons/IconFontawesome";

//Tables
import BasicTables from "../pages/Tables/BasicTables";
import DatatableTables from "../pages/Tables/DatatableTables";
import ResponsiveTables from "../pages/Tables/ResponsiveTables";
import DragDropTables from "../pages/Tables/DragDropTables";

//Blog
import BlogList from "../pages/Blog/BlogList/index";
import BlogGrid from "../pages/Blog/BlogGrid/index";
import BlogDetails from "../pages/Blog/BlogDetails";

//Job
import JobGrid from "../pages/JobPages/JobGrid/index";
import JobDetails from "../pages/JobPages/JobDetails";
import JobCategories from "../pages/JobPages/JobCategories";
import JobList from "../pages/JobPages/JobList";
import ApplyJobs from "../pages/JobPages/ApplyJobs/index";
import CandidateList from "../pages/JobPages/CandidateList";
import CandidateOverview from "../pages/JobPages/CandidateOverview";

// Forms
import FormElements from "../pages/Forms/FormElements";
import FormLayouts from "../pages/Forms/FormLayouts";
import FormAdvanced from "../pages/Forms/FormAdvanced";
import FormEditors from "../pages/Forms/FormEditors";
import FormValidations from "../pages/Forms/FormValidations";
import FormMask from "../pages/Forms/FormMask";
import FormRepeater from "../pages/Forms/FormRepeater";
import FormUpload from "../pages/Forms/FormUpload";
import FormWizard from "../pages/Forms/FormWizard";

//Ui
import UiAlert from "../pages/Ui/UiAlert";
import UiButtons from "../pages/Ui/UiButtons";
import UiCards from "../pages/Ui/UiCards";
import UiCarousel from "../pages/Ui/UiCarousel";
import UiColors from "../pages/Ui/UiColors";
import UiDropdown from "../pages/Ui/UiDropdown";
import UiGeneral from "../pages/Ui/UiGeneral";
import UiGrid from "../pages/Ui/UiGrid";
import UiImages from "../pages/Ui/UiImages";
import UiLightbox from "../pages/Ui/UiLightbox";
import UiModal from "../pages/Ui/UiModal";
import UiProgressbar from "../pages/Ui/UiProgressbar";
import UiTabsAccordions from "../pages/Ui/UiTabsAccordions";
import UiTypography from "../pages/Ui/UiTypography";
import UiVideo from "../pages/Ui/UiVideo";
import UiSessionTimeout from "../pages/Ui/UiSessionTimeout";
import UiRating from "../pages/Ui/UiRating";
import UiRangeSlider from "../pages/Ui/UiRangeSlider";
import UiNotifications from "../pages/Ui/ui-notifications";
import UiOffCanvas from "pages/Ui/UiOffCanvas";
import UiUtilitie from "../pages/Ui/UiUtilitie";
import UiPlaceholders from "../pages/Ui/UiPlaceholders";
import UiToasts from "../pages/Ui/UiToast";

//Pages
import PagesStarter from "../pages/Utility/pages-starter";
import PagesMaintenance from "../pages/Utility/pages-maintenance";
import PagesComingsoon from "../pages/Utility/pages-comingsoon";
import PagesTimeline from "../pages/Utility/pages-timeline";
import PagesFaqs from "../pages/Utility/pages-faqs";
import PagesPricing from "../pages/Utility/pages-pricing";
import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";

//Contacts
import ContactsGrid from "../pages/Contacts/contacts-grid";
import ContactsList from "../pages/Contacts/ContactList/contacts-list";
import ContactsProfile from "../pages/Contacts/ContactsProfile/contacts-profile";
import Home from "pages/Home";
import Currency from "pages/Administration/Currency";
import Users from "pages/Administration/Users";
import UserRoles from "pages/Administration/UserRoles";
import ItemGroups from "pages/Administration/ItemGroups";
import BusinessPartnerGroups from "pages/Administration/BPGroups";
import Company from "pages/Administration/Company";
import Account from "pages/MasterData/Account";
import BusinessPartners from "pages/MasterData/BusinessPartners";
import CostCenter from "pages/Administration/CostCenters"
import Territories from "pages/Administration/Territories"
import Periods from "pages/Administration/Periods"
import PaymentTerms from "pages/Administration/PaymentTerms"
import AssetClass from "pages/Administration/AssetClass"
import TaxTable from "pages/Administration/TaxTable"
import PriceLists from "pages/Administration/PriceLists"
import Warehouses from "pages/MasterData/Warehouses"
import Items from "pages/MasterData/Items"
import Employees from "pages/MasterData/Employees"
import ApprovalRules from "pages/Approval/Rules"
import ApprovalDecisions from "pages/Approval/Decisions"
import GeneralLedger from "pages/Financials/GeneralLedger"
import ExchangeRate from "pages/Administration/ExchangeRate";
import ChartOfAccount from "pages/Financials/ChartOfAccount"
import OrgUnit from "pages/HR/OrgUnit"
import OrgStructure from "pages/HR/OrgStructure"
import Capitalisation from "pages/Financials/FixedAsset/Capitalization";
import Position from "pages/HR/Position"
import JournalEntry from "pages/Financials/JournalEntry"
import Banks from "pages/Administration/Banks";
import BankAccounts from "pages/Administration/BankAccounts";
import DepreciationRun from "pages/Financials/FixedAsset/DepreciationRun"
import UserRequest from "pages/Purchasing/User Request";
import UnitOfMeasure from "pages/Administration/UnitOfMeasure"
import SalesQuotation from "pages/Revenue/SalesQuotation"
//import Bid from "pages/Purchasing/Bid"
import Order from "pages/Revenue/Order"
import Bid from "pages/Purchasing/PurchaseQuotationBid";
import PayGrade from "pages/Administration/PayLevel";
import Delivery from "pages/Revenue/Delivery"
import Project from "pages/Administration/Project"
import Invoice from "pages/Revenue/Invoice"

const authProtectedRoutes = [
  { path: "/home", component: <Home /> },
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/self-service", component: <DashboardSaas /> },
  { path: "/dashboard-crypto", component: <DashboardCrypto /> },
  { path: "/blog", component: <Blog /> },
  { path: "/dashboard-job", component: <DashboardJob /> },

  //Admin

  { path: "/admin/users", component: <Users /> },
  { path: "/admin/user-roles", component: <UserRoles /> },
  { path: "/admin/company", component: <Company /> },
  { path: "/admin/periods", component: <Periods /> },
  { path: "/admin/calendar", component: <Calendar /> },
  { path: "/admin/currency", component: <Currency /> },
  { path: "/admin/exchange-rates", component: <ExchangeRate /> },
  { path: "/admin/cost-centers", component: <CostCenter /> },
  { path: "/admin/territories", component: <Territories /> },
  { path: "/admin/payment-terms", component: <PaymentTerms /> },
  { path: "/admin/asset-class", component: <AssetClass /> },
  { path: "/admin/tax-table", component: <TaxTable /> },
  { path: "/admin/price-list", component: <PriceLists /> },
  { path: "/admin/item-groups", component: <ItemGroups /> },
  { path: "/admin/business-partner-groups", component: <BusinessPartnerGroups /> },
  { path: "/admin/pay-grade", component: <PayGrade /> },
  { path: "/admin/deductions", component: <PagesStarter /> },
  { path: "/admin/benefits", component: <PagesStarter /> },
  { path: "/admin/banks", component: <Banks /> },
  { path: "/admin/bank-accounts", component: <BankAccounts /> },
  { path: "/admin/unit-measure", component: <UnitOfMeasure /> },
  { path: "/admin/project", component: <Project /> },

  //Master Data
  { path: "/master-data/business-partners", component: <BusinessPartners /> },
  { path: "/master-data/warehouses", component: <Warehouses /> },
  { path: "/master-data/items", component: <Items /> },
  { path: "/master-data/employees", component: <Employees /> },
  { path: "/master-data/accounts", component: <Account /> },


  //Approvals
  { path: "/approval/rules", component: <ApprovalRules /> },
  { path: "/approval/decisions", component: <ApprovalDecisions /> },


  //Financials
  { path: "/financials/general-ledger", component: <GeneralLedger /> },
  { path: "/financials/chart-account", component: <ChartOfAccount /> },
  { path: "/financials/fixed-asset/capitalisation", component: <Capitalisation /> },
  { path: "/financials/fixed-asset/depreciation-run", component: <DepreciationRun /> },
  { path: "/financials/journal-entry", component: <JournalEntry /> },

  //Purchasing
  { path: "/purchasing/user-request", component: <UserRequest /> },
  { path: "/purchasing/bid", component: <Bid /> },
  { path: "/purchasing/bid-selection", component: <ApprovalDecisions /> },
  { path: "/purchasing/order", component: <ApprovalDecisions /> },
  { path: "/purchasing/goods-receipt", component: <ApprovalDecisions /> },
  { path: "/purchasing/goods-return", component: <ApprovalDecisions /> },
  { path: "/purchasing/invoice", component: <ApprovalDecisions /> },
  { path: "/purchasing/debit-note", component: <ApprovalDecisions /> },

  //HR
  { path: "/hr/org-unit", component: <OrgUnit /> },
  { path: "/hr/org-structure", component: <OrgStructure /> },
  { path: "/hr/position", component: <Position /> },


  //Sales/Revenue
  { path: "/revenue/quotation", component: <SalesQuotation /> },
  { path: "/revenue/order", component: <Order /> },
  { path: "/revenue/delivery", component: <Delivery /> },
  { path: "/revenue/invoice", component: <Invoice /> },
  //

  //Crypto
  { path: "/crypto-wallet", component: <CryptoWallet /> },
  { path: "/crypto-buy-sell", component: <CryptoBuySell /> },
  { path: "/crypto-exchange", component: <CryptoExchange /> },
  { path: "/crypto-lending", component: <CryptoLending /> },
  { path: "/crypto-orders", component: <CryptoOrders /> },
  { path: "/crypto-kyc-application", component: <CryptoKYCApplication /> },

  //chat
  { path: "/chat", component: <Chat /> },

  //File Manager
  { path: "/apps-filemanager", component: <FileManager /> },

  // //profile
  { path: "/profile", component: <UserProfile /> },

  //Ecommerce
  { path: "/ecommerce-product-detail/:id", component: <EcommerceProductDetail /> },
  { path: "/ecommerce-products", component: <EcommerceProducts /> },
  { path: "/ecommerce-orders", component: <EcommerceOrders /> },
  { path: "/ecommerce-customers", component: <EcommerceCustomers /> },
  { path: "/ecommerce-cart", component: <EcommerceCart /> },
  { path: "/ecommerce-checkout", component: <EcommerceCheckout /> },
  { path: "/ecommerce-shops", component: <EcommerceShops /> },
  { path: "/ecommerce-add-product", component: <EcommerceAddProduct /> },

  //Email
  { path: "/email-inbox", component: <EmailInbox /> },
  { path: "/email-read", component: <EmailRead /> },
  { path: "/email-template-basic", component: <EmailBasicTemplte /> },
  { path: "/email-template-alert", component: <EmailAlertTemplte /> },
  { path: "/email-template-billing", component: <EmailTemplateBilling /> },

  //Invoices
  { path: "/invoices-list", component: <InvoicesList /> },
  { path: "/invoices-detail/:id", component: <InvoiceDetail /> },
  { path: "/invoices-detail", component: <InvoiceDetail /> },

  // Tasks
  { path: "/tasks-list", component: <TasksList /> },
  { path: "/tasks-create", component: <TasksCreate /> },

  //Projects
  { path: "/projects-grid", component: <ProjectsGrid /> },
  { path: "/projects-list", component: <ProjectsList /> },
  { path: "/projects-overview", component: <ProjectsOverview /> },
  { path: "/projects-overview/:id", component: <ProjectsOverview /> },
  { path: "/projects-create", component: <ProjectsCreate /> },

  //Blog
  { path: "/blog-list", component: <BlogList /> },
  { path: "/blog-grid", component: <BlogGrid /> },
  { path: "/blog-details", component: <BlogDetails /> },

  //job
  { path: "/job-grid", component: <JobGrid /> },
  { path: "/job-details", component: <JobDetails /> },
  { path: "/job-categories", component: <JobCategories /> },
  { path: "/job-list", component: <JobList /> },
  { path: "/job-apply", component: <ApplyJobs /> },
  { path: "/candidate-list", component: <CandidateList /> },
  { path: "/candidate-overview", component: <CandidateOverview /> },

  // Contacts
  { path: "/contacts-grid", component: <ContactsGrid /> },
  { path: "/contacts-list", component: <ContactsList /> },
  { path: "/contacts-profile", component: <ContactsProfile /> },

  //Charts
  { path: "/apex-charts", component: <ChartApex /> },
  { path: "/chartist-charts", component: <ChartistChart /> },
  { path: "/chartjs-charts", component: <ChartjsChart /> },
  { path: "/e-charts", component: <EChart /> },
  { path: "/sparkline-charts", component: <SparklineChart /> },
  { path: "/charts-knob", component: <ChartsKnob /> },
  { path: "/re-charts", component: <ReCharts /> },

  // Icons
  { path: "/icons-boxicons", component: <IconBoxicons /> },
  { path: "/icons-dripicons", component: <IconDripicons /> },
  { path: "/icons-materialdesign", component: <IconMaterialdesign /> },
  { path: "/icons-fontawesome", component: <IconFontawesome /> },

  // Tables
  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-datatable", component: <DatatableTables /> },
  { path: "/tables-responsive", component: <ResponsiveTables /> },
  { path: "/tables-dragndrop", component: <DragDropTables /> },

  // Maps
  { path: "/maps-google", component: <MapsGoogle /> },
  { path: "/maps-vector", component: <MapsVector /> },
  { path: "/maps-leaflet", component: <MapsLeaflet /> },

  // Forms
  { path: "/form-elements", component: <FormElements /> },
  { path: "/form-layouts", component: <FormLayouts /> },
  { path: "/form-advanced", component: <FormAdvanced /> },
  { path: "/form-editors", component: <FormEditors /> },
  { path: "/form-mask", component: <FormMask /> },
  { path: "/form-repeater", component: <FormRepeater /> },
  { path: "/form-uploads", component: <FormUpload /> },
  { path: "/form-wizard", component: <FormWizard /> },
  { path: "/form-validation", component: <FormValidations /> },

  // Ui
  { path: "/ui-alerts", component: <UiAlert /> },
  { path: "/ui-buttons", component: <UiButtons /> },
  { path: "/ui-cards", component: <UiCards /> },
  { path: "/ui-carousel", component: <UiCarousel /> },
  { path: "/ui-colors", component: <UiColors /> },
  { path: "/ui-dropdowns", component: <UiDropdown /> },
  { path: "/ui-general", component: <UiGeneral /> },
  { path: "/ui-grid", component: <UiGrid /> },
  { path: "/ui-images", component: <UiImages /> },
  { path: "/ui-lightbox", component: <UiLightbox /> },
  { path: "/ui-modals", component: <UiModal /> },
  { path: "/ui-progressbars", component: <UiProgressbar /> },
  { path: "/ui-tabs-accordions", component: <UiTabsAccordions /> },
  { path: "/ui-typography", component: <UiTypography /> },
  { path: "/ui-video", component: <UiVideo /> },
  { path: "/ui-session-timeout", component: <UiSessionTimeout /> },
  { path: "/ui-rating", component: <UiRating /> },
  { path: "/ui-rangeslider", component: <UiRangeSlider /> },
  { path: "/ui-notifications", component: <UiNotifications /> },
  { path: "/ui-offcanvas", component: <UiOffCanvas /> },
  { path: "/ui-utilities", component: <UiUtilitie /> },
  { path: "/ui-placeholders", component: <UiPlaceholders /> },
  { path: "/ui-toasts", component: <UiToasts /> },

  //Utility
  { path: "/pages-starter", component: <PagesStarter /> },
  { path: "/pages-timeline", component: <PagesTimeline /> },
  { path: "/pages-faqs", component: <PagesFaqs /> },
  { path: "/pages-pricing", component: <PagesPricing /> },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },
  { path: "/signin-oidc", component: <Signinoidc /> },
  { path: "/signout-callback-oidc", component: <Login /> },

  { path: "/pages-maintenance", component: <PagesMaintenance /> },
  { path: "/pages-comingsoon", component: <PagesComingsoon /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },
  { path: "/crypto-ico-landing", component: <CryptoIcoLanding /> },

  // Authentication Inner
  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-login-2", component: <Login2 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/pages-register-2", component: <Register2 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/page-recoverpw-2", component: <Recoverpw2 /> },
  { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  { path: "/auth-recoverpw-2", component: <ForgetPwd2 /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
  { path: "/auth-lock-screen-2", component: <LockScreen2 /> },
  { path: "/page-confirm-mail", component: <ConfirmMail /> },
  { path: "/page-confirm-mail-2", component: <ConfirmMail2 /> },
  { path: "/auth-email-verification", component: <EmailVerification /> },
  { path: "/auth-email-verification-2", component: <EmailVerification2 /> },
  { path: "/auth-two-step-verification", component: <TwostepVerification /> },
  { path: "/auth-two-step-verification-2", component: <TwostepVerification2 /> },
];

export { authProtectedRoutes, publicRoutes };
