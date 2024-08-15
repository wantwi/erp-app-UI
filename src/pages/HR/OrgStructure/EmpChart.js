import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { OrgChart } from 'd3-org-chart';
import IMG from "../../../assets/images/users/avatar-2.jpg"

export const EmployeeChartComponent = (props, ref) => {
  const d3Container = useRef(null);
  let chart = null;

  function addNode(node) {
    chart.addNode(node);
  }

  props.setClick(addNode);

  // We need to manipulate DOM
  useLayoutEffect(() => {
    if (props.data && d3Container.current) {
      if (!chart) {
        chart = new OrgChart();
      }
      chart
        .container(d3Container.current)
        .data(props.data)
        .nodeWidth((d) => 200)
        .nodeHeight((d) => 120)
        .onNodeClick((d, i, arr) => {
          console.log(d, 'Id of clicked node ');
          props.onNodeClick(d);
        })
        .nodeContent(function (d, i, arr, state) {
          return `
          <div style="padding-top:30px;background-color:none;margin-left:1px;height:${
            d.height
          }px;border-radius:2px;overflow:visible">
            <div style="height:${
              d.height - 32
            }px;padding-top:0px;background-color:white;border:1px solid lightgray;">

              <img src=" ${IMG}" style="margin-top:-30px;margin-left:${d.width / 2 - 30}px;border-radius:100px;width:60px;height:60px;" />

             <div style="margin-right:10px;margin-top:15px;float:right">${
               d.data.id
             }</div>
             
             <div style="margin-top:-30px;background-color:#2a3042;height:10px;width:${
               d.width - 2
             }px;border-radius:1px"></div>

             <div style="padding:20px; padding-top:35px;text-align:center">
                 <div style="color:#111672;font-size:16px;font-weight:bold"> ${
                   d.data.name
                 } </div>
                 <div style="color:#404040;font-size:16px;margin-top:4px"> ${
                   d.data.numberOfPositions
                 } </div>
             </div> 
            
            </div>     
    </div>
`;
        })
        .render();
    }
  }, [props.data, d3Container.current]);

  return (
    <div>
      <div ref={d3Container} />
    </div>
  );
};


{/* <div style="display:flex;justify-content:space-between;padding-left:15px;padding-right:15px;">
<div > Manages:  ${d.data._directSubordinates} 👤</div>  
<div > Oversees: ${d.data._totalSubordinates} 👤</div>    
</div> */}