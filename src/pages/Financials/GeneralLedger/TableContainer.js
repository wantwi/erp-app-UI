import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
} from "react-table";
import { Table, Row, Col, Button, Input, CardBody, FormGroup, Label, InputGroup } from "reactstrap";
import { Filter, DefaultColumnFilter } from "./filters";
import JobListGlobalFilter from "../../../components/Common/GlobalSearchFilter";
//Import Flatepicker
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import Select from 'react-select';
import { sumValues } from "helpers/utility";
import DatepickerComponent from "components/datepickerComponent/DatepickerComponent";

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  isJobListGlobalFilter
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const [cols, setCols] = useState([])


  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <React.Fragment>
      <Col md={4}>
        <div className="search-box me-xxl-2 my-3 my-xxl-0 d-inline-block">
          <div className="position-relative">
            <label htmlFor="search-bar-0" className="search-label">
              <span id="search-bar-0-label" className="sr-only">
                Search this table
              </span>
              <input
                onChange={e => {
                  setValue(e.target.value);
                  onChange(e.target.value);
                }}
                id="search-bar-0"
                type="text"
                className="form-control form-control-sm"
                placeholder={`${count} records...`}
                value={value || ""}
              />
            </label>
            <i className="bx bx-search-alt search-icon"></i>
          </div>
        </div>

      </Col>
      {isJobListGlobalFilter && (
        <JobListGlobalFilter />
      )}

    </React.Fragment>
  );
}
//const initialState = { hiddenColumns: ['DeviceId'] };
const TableContainer = ({
  columns,
  data,
  isGlobalFilter,
  isJobListGlobalFilter,
  isAddOptions,
  customPageSize,
  className,
  customPageSizeOptions,
  refetch,
  accounts,
  setDateFrom,
  setDateTo,
  setSelectedAccount,
  selectedAccount,

}) => {

  const flatpickrRef = useRef(null);
  const flatpickrRef2 = useRef(null);
  const [showFC, setShowFC] = useState(true)
  const [showLC, setShowLC] = useState(true)


  const clearDateSelection = () => {
    if (flatpickrRef.current) {
      flatpickrRef.current.flatpickr.clear();
    }
  };

  const clearDateSelection2 = () => {
    if (flatpickrRef2.current) {
      flatpickrRef2.current.flatpickr.clear();
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,

    getToggleHideAllColumnsProps,

    setHiddenColumns,
    state: { pageIndex, pageSize },

    toggleHideAllColumns
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize,
        sortBy: [
          {
            desc: true,
          },

        ],
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  const generateSortingIndicator = column => {
    return column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : "";
  };

  const onChangeInSelect = event => {
    setPageSize(Number(event.target.value));
  };

  const onChangeInInput = event => {
    const page = event.target.value ? Number(event.target.value) - 1 : 0;
    gotoPage(page);
  };


  const toggleHidden = (event) => {

    if (event.target.checked) {

      const showcol = state.hiddenColumns.filter(x => x !== event.target.id)

      state.hiddenColumns = showcol

      console.log({ state: state, showcol });
      // setHiddenColumns(showcol)
    } else {
      // const showcol = allColumns.filter(x => x.id !==event.target.i)
      setHiddenColumns(pre => [...pre, event.target.id])
    }
  }
  const handleUndo = () => {
    clearDateSelection()
    clearDateSelection2()
    setDateFrom("")
    setDateTo("")
    setSelectedAccount(null)

    refetch()
  }

  const handleShowFC = (e) => {
    if (e.target.checked) {
      setHiddenColumns([])
      setShowFC(true)

    } else {
      setHiddenColumns(["debitFC", "creditFC", "balanceFC"])
      setShowFC(false)
    }
  }

  const handleShowLC = (e) => {
    if (e.target.checked) {
      setHiddenColumns([])
      setShowLC(true)

    } else {
      setHiddenColumns(["debitLC", "creditLC", "balanceLC"])
      setShowLC(false)
    }
  }

  useEffect(() => {

    if (selectedAccount) {
      setHiddenColumns([])
      setShowFC(true)
      setShowLC(true)
    }


    return () => {

    }
  }, [selectedAccount])

  console.log({ selectedAccount });


  return (
    <Fragment>
      <Row>
        {/* <Col md="2" sm={12}>
          <FormGroup className="">
            <Label>Date Range</Label>
            <GlobalFilter
           preGlobalFilteredRows={preGlobalFilteredRows}
           globalFilter={state.globalFilter}
           setGlobalFilter={setGlobalFilter}
           isJobListGlobalFilter={isJobListGlobalFilter}
          
         />
            </FormGroup>

        </Col> */}
        <Col md="2" sm={12}>
          <FormGroup className="">
            <Label className="m-0">Date From</Label>
            <DatepickerComponent setState={setDateFrom} />
            {/* <InputGroup>
              <Flatpickr
                className="form-control form-control-sm d-block"
                placeholder="dd M,yyyy"
                options={{
                  mode: "single",
                  dateFormat: "d-M-Y"
                }}

                // selectValue={selectedDates}
                onChange={(e) => setDateFrom(e)}
                ref={flatpickrRef}
                style={{ borderRight: 0 }}

              />
              <button className="btn btn-sm" style={{ background: "transparent", border: "1px solid #ced4da", borderLeft: 0 }} onClick={clearDateSelection}>
                <i className="fa fa-times"></i>
              </button>
            </InputGroup> */}
          </FormGroup>

        </Col>
        <Col md="2" sm={12}>
          <FormGroup className="">
            <Label className="m-0">Date To</Label>
            <DatepickerComponent setState={setDateTo} />
            {/* <InputGroup>
              <Flatpickr
                className="form-control form-control-sm d-block"
                placeholder="dd M,yyyy"
                options={{
                  mode: "single",
                  dateFormat: "d-M-Y"
                }}

                // selectValue={selectedDates}
                onChange={(e) => setDateTo(e)}
                ref={flatpickrRef2}
                style={{ borderRight: 0 }}

              />
              <button className="btn btn-sm" style={{ background: "transparent", border: "1px solid #ced4da", borderLeft: 0 }} onClick={clearDateSelection2}>
                <i className="fa fa-times"></i>
              </button>
            </InputGroup> */}
          </FormGroup>

        </Col>
        {/* <Col md="3" sm={12}>
          <FormGroup className="">
            <Label>Company</Label>
            <InputGroup>
              <select className="form-control form-control-sm">
                <option>Select company</option>
                <option>GIJ</option>
                <option>TCL</option>

              </select>
            </InputGroup></FormGroup>

        </Col> */}
        <Col md="3" sm={12}>
          <FormGroup className="row1">
            <Label className="m-0">Account</Label>
            <Select
              value={selectedAccount}
              options={[{ value: 0, label: "All Account" }, ...accounts.map((x) => ({ value: x?.id, label: x?.name }))]}
              placeholder="Select Account"
              isClearable
              onChange={(selectedOption) => {
                setSelectedAccount(selectedOption)

              }}
            // Add any other props you need

            />
            {/* <InputGroup>
              <select className="form-select">
                <option value={0}>All Account</option>
                {
                  accounts?.map(x => <option key={x?.id} value={x?.id}>{x?.name}</option>)
                }

              </select>
            </InputGroup> */}
          </FormGroup>

        </Col>
        <Col md="1" sm={12}>
          <button onClick={handleUndo} title="Clear Filter" className="btn btn-sm btn-primary" style={{ marginTop: 20 }}>
            <i className="fa fa-undo"></i>
          </button>
        </Col>
        <Col sm="4" className="col-offset mt-1">
          <div className="text-sm-end mt-4">
            {
              selectedAccount ? <div className="form-check form-check-right">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="customCheck"
                  defaultChecked
                  onChange={handleShowLC}
                />
                <label
                  className="form-check-label"
                  htmlFor="customCheck2"

                >
                  Show LC columns
                </label>
              </div> :
                <div className="form-check form-check-right">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="customCheck2"
                    defaultChecked
                    onChange={handleShowFC}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="customCheck2"

                  >
                    Show FC columns
                  </label>
                </div>
            }

          </div>
        </Col>
      </Row>
      <Row className="mb-2">

        {/* {isGlobalFilter && (
         <GlobalFilter
           preGlobalFilteredRows={preGlobalFilteredRows}
           globalFilter={state.globalFilter}
           setGlobalFilter={setGlobalFilter}
           isJobListGlobalFilter={isJobListGlobalFilter}
         />
       )} */}
        {/* {isAddOptions && (
         <Col sm="8">
           <div className="text-sm-end">
             <Button
               type="button"
               color="success"
               className="btn-rounded  mb-2 me-2 button-akiti mt-3"
               onClick={() => setmodal_backdrop(true)}
             >
               <i className="mdi mdi-plus me-1" /> 
               Add New User
             </Button>
           </div>
         </Col>
       )} */}
      </Row>

      <div className="table-responsive react-table table-container">
        <Table bordered hover {...getTableProps()} className={className}>
          <thead className="table-light">
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()} >
                {headerGroup.headers.map(column => (
                  <th key={column.id} >
                    <div {...column.getSortByToggleProps()}>
                      {column.render("Header")}
                      {generateSortingIndicator(column)}
                    </div>
                    {/* <Filter column={column} /> */}
                  </th>
                ))}
                {/* <th style={{width:150}}>Action</th> */}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr>
                    {row.cells.map(cell => {
                      // console.log(cell.column.Header)
                      return (
                        <td key={cell.id} {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                    {/* <td><button type="button" className="btn btn-light me-2"><i className="far fa-edit" style={{color:'blue'}}></i></button>
                       <button type="button" className="btn btn-light "><i className="far fa-trash-alt" style={{color:'red'}}></i></button>
                   </td> */}
                  </tr>
                </Fragment>
              );
            })}
            <tr className="colTotal">
              <td></td><td></td><td></td><td></td>
              <td hidden={!showLC}>{sumValues(rows.map(x => Number(x?.original?.debitLC)))}</td>
              <td hidden={!showLC}>{sumValues(rows.map(x => Number(x?.original?.creditLC)))}</td>
              <td hidden={!showFC}>{sumValues(rows.map(x => Number(x?.original?.debitFC)))}</td>
              <td hidden={!showFC}>{sumValues(rows.map(x => Number(x?.original?.creditFC)))}</td>
              <td hidden={!showLC}>{sumValues(rows.map(x => Number(x?.original?.balanceLC)))}</td>
              <td hidden={!showFC}>{sumValues(rows.map(x => Number(x?.original?.balanceFC)))}</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* <Row className="row mt-3">
        <Col md={2}>
          <select
            className="form-select"
            value={pageSize}
            onChange={onChangeInSelect}
          >
            {[5, 10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Col>

        <Col md={10} className="row justify-content-md-end ">
          <Col className="col-md-auto">
            <div className="d-flex gap-1">
              <Button
                color="primary"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                {"<<"}
              </Button>
              <Button
                color="primary"
                onClick={previousPage}
                disabled={!canPreviousPage}
              >
                {"<"}
              </Button>
            </div>
          </Col>
          <Col className="col-md-auto d-none d-md-block">
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>
          </Col>
          <Col className="col-md-auto">
            <Input
              type="number"
              min={1}
              style={{ width: 70 }}
              max={pageOptions.length}
              defaultValue={pageIndex + 1}
              onChange={onChangeInInput}
            />
          </Col>

          <Col className="col-md-auto">
            <div className="d-flex gap-1">
              <Button color="primary" onClick={nextPage} disabled={!canNextPage}>
                {">"}
              </Button>
              <Button
                color="primary"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                {">>"}
              </Button>
            </div>
          </Col>
        </Col>

      </Row> */}
    </Fragment>
  );
};

TableContainer.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default TableContainer;
