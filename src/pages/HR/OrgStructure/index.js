import React, { useContext, useMemo, useState } from "react";
import { Container, CardBody, Nav, Card, NavItem, NavLink, Row, TabContent, Form, TabPane, Table, Alert } from 'reactstrap';

import { useEffect } from "react";
import { OrgChartComponent } from "./OrgChart";

import * as d3 from 'd3';
import { useGet } from "hook/useGet";
import classnames from "classnames";
import { useGetById } from "hook/useGetById";
import { PositionChartComponent } from "./PositionChart";
import { EmployeeChartComponent } from "./EmpChart";
//First Name, Last Name, Username, Email, Status(Active/Inactive), Role, Phone #




const Users = () => {
  //meta title
  document.title = "Biz-360 ERP| Organizational Structure";

  const [data, setData] = useState(null);
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const [showImage, setShowImage] = useState(false)
  let addNodeChildFunc = null;

  function addNode() {
    const node = {
      nodeId: 'new Node',
      parentNodeId: 'O-6066',
    };

    addNodeChildFunc(node);
  }

  function onNodeClick(nodeId) {
    // console.log('d3', d3.event);
    // alert('clicked ' + nodeId);
  }

  function addParentIdProperty(data, parentId = "") {
    const result = [];
    data.forEach(item => {
      const newItem = { ...item, parentId: parentId, sub: item?.sub?.length || 0 };
      result.push(newItem);
      if (item.sub && item.sub.length > 0) {
        const subResult = addParentIdProperty(item.sub, item.id);
        result.push(...subResult);
      }
    });
    return result;
  }

  // Example usage:




  useEffect(() => {
    d3.csv(
      'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/org.csv'
    ).then((data) => {
      // setData(data.slice(0,3));
    });
  }, [true]);

  const onSuccess = (data) => {
    setData(null)

    console.log({ onSuccess: data });

    const result = addParentIdProperty(data);
    console.log({ result });

    setData(result)

  }

  const {refetch} = useGetById(`${process.env.REACT_APP_ADMIN_URL}/OrgStructure/OrganisationalUnits`, "unit","unit", onSuccess)
  const {refetch: refetchPositions, isLoading:isPostionLoading} = useGetById(`${process.env.REACT_APP_ADMIN_URL}/OrgStructure/Positions`, "Positions", "Positions", onSuccess)
  const {refetch: refetchEmployees, isLoading:isEmployeeLoading} = useGetById(`${process.env.REACT_APP_ADMIN_URL}/OrgStructure/Employees`, "Employees", "Employees", onSuccess)

  const toggleCustom = tab => {
    if(tab === "2"){
      setShowImage(false)
      refetchPositions()
    }
    if(tab === "3"){
      refetchEmployees()
    }else if (tab === "1"){
      setShowImage(true)
      refetch()
    }
    
    if (customActiveTab !== tab) {
      setShowImage(false)
        setcustomActiveTab(tab);
    }
};

useEffect(() => {
  
  refetch()
  return () => {
    
  }
}, [])



  return (
    <React.Fragment>


      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          {/* <Breadcrumbs title="Administration" breadcrumbItem="Users" /> */}
          <Card>
            <CardBody>
            <Nav tabs className="nav-tabs-custom nav-justified">
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
                <span className="d-none d-sm-block">Units</span>
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
                <span className="d-none d-sm-block">Position</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({
                  active: customActiveTab === "3",
                })}
                onClick={() => {
                  toggleCustom("3");
                }}
              >
                <span className="d-block d-sm-none">
                  <i className="far fa-user"></i>
                </span>
                <span className="d-none d-sm-block">Empoyees</span>
              </NavLink>
            </NavItem>

          </Nav>

              <TabContent
                activeTab={customActiveTab}
                className="p-3 text-muted"
                style={{width:"100%"}}
              >
                <TabPane tabId="1">
                  <OrgChartComponent
                    setClick={(click) => (addNodeChildFunc = click)}
                    onNodeClick={onNodeClick}
                    data={data}
                    showImage={false}
                  />


                </TabPane>
                <TabPane tabId="2">
                  
                  {
                    isPostionLoading ? "Loading" :  <PositionChartComponent
                    setClick={(click) => (addNodeChildFunc = click)}
                    onNodeClick={onNodeClick}
                    data={data}
                  />

                  }

                </TabPane>
                <TabPane tabId="3">

                    {
                      isEmployeeLoading ? "loading...":  <EmployeeChartComponent
                      setClick={(click) => (addNodeChildFunc = click)}
                      onNodeClick={onNodeClick}
                      data={data}
                     
                    />
  
                    }
                  
                </TabPane>

              </TabContent>



            </CardBody>

          </Card>



        </Container>
      </div>
    </React.Fragment>
  )
}

export default Users;
