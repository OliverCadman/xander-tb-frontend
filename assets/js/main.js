document.addEventListener("DOMContentLoaded", () => {
    const scrollTargets = document.querySelectorAll(".scroll-target");

  const handleScroll = () => {
    const triggerBottom = (window.innerHeight / 5) * 4;

    const targetEl2000 = document.getElementById("tb-2000--meta");
    const targetTop2000 = targetEl2000.getBoundingClientRect().top;
    const targetEl4000 = document.getElementById("tb-4000--meta");
    const targetTop4000 = targetEl4000.getBoundingClientRect().top;

    scrollTargets.forEach((target) => {
      if (target.classList.contains("2000")) {
        if (targetTop2000 < triggerBottom) {
          target.classList.add("show");
          tb2000HeaderTargetHit = true;
        }
      } else {
        if (targetTop4000 < triggerBottom) {
          target.classList.add("show");
          tb4000HeaderTargetHit = true;
        }
      }
    });
  };

  document.addEventListener("scroll", handleScroll);


  let toolTipBar = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip-bar");

  const displayHeader = (content) => {
    $('#header').text(content);
  }

  const toggleActiveBtnStyles = (toothbrushType) => {
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((button) => {
      if (button.classList.contains("active")) {
        button.classList.remove("active");
      }

      if (button.classList.contains(toothbrushType)) {
        button.classList.add("active");
      }
    });
  };


  const fd = null;
  const fdTB2000 = null;
  const fdTB4000 = null;
  
  const keys = [5, 10, 30, 50, 100, 200, 350, 500];
  let color = d3.scaleThreshold().domain(keys).range(d3.schemeBlues[9]);

  var width = window.innerWidth / 2;
  var height = window.innerHeight;

  var projection = d3
    .geoAlbers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(650 * 5)
    .translate([width / 2, height / 2]);

  var svg = d3.select("#sales-map").attr("width", width).attr("height", height);

  // Bar Chart - Global Variables
  // set the dimensions and margins of the graph
  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svgBarChart = d3
    .select("#sales-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  let bottomAxis, leftAxis;

  // Legend

  svg
    .append("text")
    .attr("x", 40)
    .attr("y", 75)
    .attr("font-family", "Jost, sans-serif")
    .attr("font-size", "2rem")
    .attr("font-weight", "300")
    .text("Sales Per Postcode");

  svg
    .selectAll(".legend-dots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", 50)
    .attr("cy", function (d, i) {
      return 110 + i * 25;
    })
    .attr("r", 10)
    .style("fill", function (d) {
      return color(d);
    });

  svg
    .selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 70)
    .attr("y", function (d, i) {
      return 110 + i * 25;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", "#9B9B9B")
    .text(function (d, i) {
      const curr = keys[i];
      const next = keys[i + 1];

      return next !== undefined ? `${curr} - ${next}` : `${curr}+`;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .attr("font-family", "Open Sans, sans-serif");
  

  // Default filter button style
  $('#toggle_all_toothbrushes').addClass('active');


  const displayMap = (fullDataByPostcode, toothbrushType=null) => {
    let nullPostcodes = [];
    let topo;
    var path = d3.geoPath().projection(projection);

    d3.json("../assets/data/uk-postcode-area.json", function (error, uk) {
      topo = topojson.feature(
        uk,
        uk.objects["uk-postcode-area"]
      ).features;

      for (let i = 0; i < topo.length; i++) {
        for (let j = 0; j < fullDataByPostcode.length; j++) {
          let item = fullDataByPostcode[j];
          if (
            topo[i].id ===
            fullDataByPostcode[j].delivery_postcode__postcode_area
          ) {
            topo[i].properties.avg_customer_age = item.avg_customer_age;
            topo[i].properties.avg_delivery_delta = item.avg_delivery_delta;
            topo[i].properties.tb_2000_sales = item.tb_2000_sales;
            topo[i].properties.tb_4000_sales = item.tb_4000_sales;
            topo[i].properties.total_tb_sales = item.total_tb_sales;
          }
        }
      }

      let obj = {};
      _.each(topo, function (item) {
        obj[item.id] = item.properties.total_tb_sales;
      });

      for (i in topo) {
        if (topo[i].hasOwnProperty('properties')) {
          if (_.isEmpty(topo[i].properties)) {
            nullPostcodes.push(topo[i].id)
          }
        }
     }

     if (nullPostcodes) {

        $('#null-postcode-btn')
        .css('visibility', 'visible')
        .text(`${nullPostcodes.length} unexplored UK districts!`)
        
        const nullPostcodeHTML = nullPostcodes.map((postcode) => {
          return `<li>${postcodeObj[postcode]}</li>`
        }).join('')
        
        $('#null-postcode-header').text(`${nullPostcodes.length} UK Districts`)
        $('#null-postcode-list').html(nullPostcodeHTML)

     }

      svg.append('div').attr('x', 45).attr('y', window.innerHeight / 2).html(
        `<p>hello</p>`
      )

      svg
        .append("path")
        .datum(
          topojson.mesh(uk, uk.objects["uk-postcode-area"], function (a, b) {
            return a !== b;
          })
        )
        .attr("class", "mesh")
        .attr("d", path);

      svg.selectAll(".postcode_area").remove();

      svg
        .selectAll(".postcode_area")
        .data(topo)
        .enter()
        .append("path")
        .attr("class", "postcode_area")
        .attr("d", path)
        .style("stroke", "#aaa")
        .style("fill", function (d) {
          //Get data value
          var sales_count = d.properties.total_tb_sales;

          if (sales_count) {
            return color(sales_count);
          } else {
            return "#ECECEC";
          }
        })
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave);
    });

    let toolTip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")

    let mouseOver = function (d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
      d3.select(this)
        .style("stroke", "black")
        .transition()
        .duration(200)
        .style("lineWidth", 5)
        .style("cursor", "pointer");

      if (d.properties.hasOwnProperty("total_tb_sales")) {
        toolTip
          .style("opacity", 1)
          .style("padding", ".75rem") 
       
        
        if (!toothbrushType || toothbrushType === "all_toothbrushes") {
          toolTip.html(
            `
                <h3>${postcodeObj[d.id]}</h3>
                <dl>
                  <dt class='tooltip-header'>Total Sales</dt>
                  <dd class='tooltip-data'>${d.properties.total_tb_sales}</dd>
                  <dt class='tooltip-header'>Toothbrush 2000 Sales</dt>
                  <dd class='tooltip-data'>${d.properties.tb_2000_sales}</dd>
                  <dt class='tooltip-header'>Toothbrush 4000 Sales</dt>
                  <dd class='tooltip-data'>${d.properties.tb_4000_sales}</dd>
                  <dt class='tooltip-header'>Average Customer Age</dt>
                  <dd class='tooltip-data'>${d.properties.avg_customer_age}</dd>
                  <dt class='tooltip-header'>Average Delivery Time</dt>
                  <dd class='tooltip-data'>${formatDelta(
                    d.properties.avg_delivery_delta
                  )}</dd>
                </dl>
              `
          );
        } else if (toothbrushType === "toothbrush_2000") {
          toolTip.html(
            `
                <h3>${postcodeObj[d.id]}</h3>
                <dl>
                  <dt class='tooltip-header'>Total Toothbrush 2000 Sales</dt>
                  <dd class='tooltip-data'>${d.properties.tb_2000_sales}</dd>
                  <dt class='tooltip-header'>Average Customer Age</dt>
                  <dd class='tooltip-data'>${d.properties.avg_customer_age}</dd>
                  <dt class='tooltip-header'>Average Delivery Time</dt>
                  <dd class='tooltip-data'>${formatDelta(
                    d.properties.avg_delivery_delta
                  )}</dd>
                </dl>
              `
          );
        } else if (toothbrushType === "toothbrush_4000") {
          toolTip.html(
            `
                <h3>${postcodeObj[d.id]}</h3>
                <dl>
                  <dt class='tooltip-header'>Total Toothbrush 4000 Sales</dt>
                  <dd class='tooltip-data'>${d.properties.tb_4000_sales}</dd>
                  <dt class='tooltip-header'>Average Customer Age</dt>
                  <dd class='tooltip-data'>${d.properties.avg_customer_age}</dd>
                  <dt class='tooltip-header'>Average Delivery Time</dt>
                  <dd class='tooltip-data'>${formatDelta(
                    d.properties.avg_delivery_delta
                  )}</dd>
                </dl>
              `
          );
        }
       

          toolTip.transition()
          .style("left", d3.event.x + "px")
          .style("top", () => {
            const mousePosition = d3.mouse(this);
            const mouseY = mousePosition[1];
            const bottomHalf = window.innerHeight / 2;
            if (mouseY > bottomHalf) {
              return d3.event.y - bottomHalf / 2 - 175 + "px";
            }
            return d3.event.y + 25 + "px";
          });
      }
    };

    let mouseLeave = function (d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
      d3.select(this).transition().duration(200).style("stroke", "#aaa");

      toolTip.style("opacity", 0);
    };
  };

  const displayMetaData = (
    deliveryDeltas,
    customerAges,
    overallTBSales = null
  ) => {
    let tbSalesObj, tb2000Sales, tb4000Sales, totalTBSales;

    if (overallTBSales) {
      tbSalesObj = overallTBSales[0];
      tb2000Sales = tbSalesObj.max_toothbrush_2000;
      tb4000Sales = tbSalesObj.max_toothbrush_4000;
      totalTBSales = tb2000Sales + tb4000Sales;

      $("#tb_2000").text(`Toothbrush 2000: ${tbSalesObj.max_toothbrush_2000}`);
      $("#tb_4000").text(`Toothbrush 4000: ${tbSalesObj.max_toothbrush_4000}`);
      $("#total_sales").text(`Total Toothbrush Sales: ${totalTBSales}`);
    }

    const deltaAvg = formatDelta(deliveryDeltas.avg_delivery_delta);
    const deltaMax = formatDelta(deliveryDeltas.max_delivery_delta);
    const deltaMin = formatDelta(deliveryDeltas.min_delivery_delta);

    const avgCustomerAge = customerAges.avg_customer_age;
    const maxCustomerAge = customerAges.max_customer_age;
    const minCustomerAge = customerAges.min_customer_age;

    $("#avg-delivery-delta").text(`Average Delivery Time: ${deltaAvg}`);
    $("#max-delivery-delta").text(`Longest Delivery Time: ${deltaMax}`);
    $("#min-delivery-delta").text(`Shortest Delivery Time: ${deltaMin}`);

    $("#avg-customer-age").text(`Average Age of Customer: ${avgCustomerAge}`);
    $("#max-customer-age").text(`Oldest Customer: ${maxCustomerAge}`);
    $("#min-customer-age").text(`Youngest Customer: ${minCustomerAge}`);
  };

  const displayTBData = (tb2000Data, tb4000Data) => {
    // TB 2000 Section

    const tb2000CustomerAge = tb2000Data.avg_customer_age;
    const tb2000TotalSales = tb2000Data.total_sales;
    const tb2000DeliveryDelta = formatDelta(tb2000Data.avg_delivery_delta);

    const tb4000CustomerAge = tb4000Data.avg_customer_age;
    const tb4000TotalSales = tb4000Data.total_sales;
    const tb4000DeliveryDelta = formatDelta(tb4000Data.avg_delivery_delta);

    $("#tb-2000-sales-result").text(tb2000TotalSales);
    $("#tb-2000-avg-cust-age").text(tb2000CustomerAge);
    $("#tb-2000-avg-delivery-time").text(tb2000DeliveryDelta);

    $("#tb-4000-sales-result").text(tb4000TotalSales);
    $("#tb-4000-avg-cust-age").text(tb4000CustomerAge);
    $("#tb-4000-avg-delivery-time").text(tb4000DeliveryDelta);

    if (tb2000CustomerAge < tb4000CustomerAge) {
      $("#tb-2000-lead-1").text(resultPrompts.customer_age.younger.lead);
      $("#tb-4000-lead-1").text(resultPrompts.customer_age.older.lead);

      $("#tb-2000-strategy-1").text(resultPrompts.customer_age.younger.p1);
      $("#tb-2000-strategy-2").text(resultPrompts.customer_age.younger.p1);

      $("#tb-4000-strategy-1").text(resultPrompts.customer_age.older.p1);
      $("#tb-4000-strategy-2").text(resultPrompts.customer_age.older.p1);
    } else {
      $("#tb-2000-lead-1").text(resultPrompts.customer_age.older.lead);
      $("#tb-4000-lead-1").text(resultPrompts.customer_age.younger.lead);

      $("#tb-2000-strategy-1").text(resultPrompts.customer_age.older.p1);
      $("#tb-2000-strategy-2").text(resultPrompts.customer_age.older.p2);

      $("#tb-4000-strategy-1").text(resultPrompts.customer_age.younger.p1);
      $("#tb-4000-strategy-2").text(resultPrompts.customer_age.younger.p2);
    }

    if (tb2000TotalSales < tb4000TotalSales) {
      $("#tb-2000-lead-2").text(resultPrompts.sales.lower);
      $("#tb-4000-lead-2").text(resultPrompts.sales.higher);
    } else {
      $("#tb-2000-lead-2").text(resultPrompts.sales.higher);
      $("#tb-4000-lead-2").text(resultPrompts.sales.lower);
    }
  };

  const formatDelta = (delta) => {
    // 1s = 1000ms
    // 1m = 60s
    // 1hr = 60m
    // 1d = 24h

    let day, hour, minute;

    const deltaSplit = delta.split(":");

    const isDayIncluded = deltaSplit[0].includes("day");

    if (isDayIncluded) {
      let daySplit = deltaSplit[0];
      daySplit = daySplit.split(",");
      day = daySplit[0];
      hour = daySplit[1];
      minute = deltaSplit[1];

      if (parseInt(hour) !== 0) {
        return `${day}, ${hour > 1 ? `${hour} hours` : `${hour} hour`}, ${
          minute > 1 ? `${minute} minutes` : `${minute} minute`
        }`;
      } else {
        return `${day}, ${
          minute > 1 ? `${minute} minutes` : `${minute} minute`
        }`;
      }
    } else {
      hour = deltaSplit[0];
      minute = deltaSplit[1];

      if (parseInt(hour) !== 0) {
        return `${hour > 1 ? `${hour} hours` : `${hour} hour`}, ${
          minute > 1 ? `${minute} minutes` : `${minute} minute`
        }`;
      } else {
        return `${minute > 1 ? `${minute} minutes` : `${minute} minute`}`;
      }
    }
  };

  const displaySalesByAgeChart = (data) => {
    
    svgBarChart.selectAll("rect").remove();
    svgBarChart.selectAll("g").remove();

    const convertedObj = convertSalesByAgeObj(data);

    const ageKeys = Object.keys(convertedObj);
    // X axis
    var x = d3.scaleBand().range([0, width]).domain(ageKeys).padding(0.2);
    
    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, d3.max(ageKeys, (d) => convertedObj[d])])
      .range([height, 0]);
    leftAxis = d3.axisLeft(y);

    svgBarChart
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .style("font-family", "Jost, sans-serif")
      .call(d3.axisBottom(x).tickFormat((d, i) => {
        if (i === 0) {
          return `0 - ${d}`;
        } else {
          return `${String(parseInt(d) - 10)} - ${d}`;
        }
      }));

    
    svgBarChart.append("g").style("font-family", "Jost, sans-serif").call(d3.axisLeft(y));

    // Bars
    svgBarChart
      .selectAll("mybar")
      .data(ageKeys)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d))
      .attr("y", (d) => y(convertedObj[d]))
      .attr("width", x.bandwidth())
      .on("mouseover", onMouseOverBar, ageKeys)
      .on("mouseout", onMouseOutBar)
      .transition()
      .ease(d3.easeElastic)
      .duration(1000)
      .delay((d, i) => i * 50)
      .attr("height", (d) => height - y(convertedObj[d]))
      .attr("fill", "#69b3a2");

       function onMouseOverBar(d, i, m) {
         const xPos = d3.event.x
         const yPos = d3.event.y

         toolTipBar

           .html(
             `
            <dl>
              <dt class='tooltip-header'>Total Sales</dt>
              <dd class='tooltip-data'>${convertedObj[d]}</dd>
            </dl>
         `
           )
           .style("cursor", "pointer")
           .transition()
           .duration(200)
           .style("opacity", 1)
           .style("left", xPos + "px")
           .style("top", yPos + "px");
          

       }

       function onMouseOutBar() {
        toolTipBar.transition().duration(200).style("opacity", 0);
       }

  };

    const displayOrderQuantityBarChart = (divID, data, property) => {
      let convertedObj;
      let elID = divID;
      let keys;

      let targetHit = false;
      const barChart = d3
        .select(elID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      if (property === "customer_age") {
        convertedObj = convertData(data, "customer_age", "order_quantity");
      }

      keys = Object.keys(convertedObj);

      // X axis
      var x = d3.scaleBand().range([0, width]).domain(keys).padding(0.2);

      // Add Y axis
      var y = d3
        .scaleLinear()
        .domain([0, d3.max(keys, (d) => convertedObj[d])])
        .range([height, 0]);
      leftAxis = d3.axisLeft(y);

      barChart
        .append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Age Group");

      barChart
        .append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("y", -55)
        .attr("x", -170)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Order Quantity");

      barChart
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .style("font-family", "Jost, sans-serif")
        .attr("font-size", "0.2rem")
        .call(
          d3.axisBottom(x).tickFormat((d, i) => {
            if (i === 0) {
              return `0 - ${d}`;
            } else {
              return `${String(parseInt(d) - 10)} - ${d}`;
            }
          })
        );

      barChart
        .append("g")
        .style("font-family", "Jost, sans-serif")
        .call(d3.axisLeft(y));

      // Bars

      document.addEventListener("scroll", () => {
        if (targetHit) return;

        const triggerBottom = (window.innerHeight / 5) * 3;
        const triggerEl = $(elID)[0];
        const elTop = triggerEl.getBoundingClientRect().top;

        if (elTop < triggerBottom) {
          barChart
            .selectAll("mybar")
            .data(keys)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d))
            .attr("y", (d) => y(convertedObj[d]))
            .attr("width", x.bandwidth())
            .on("mouseover", onMouseOverBar)
            .on("mouseout", onMouseOutBar)
            .transition()
            .ease(d3.easeElastic)
            .duration(1000)
            .delay((d, i) => i * 50)
            .attr("height", (d) => height - y(convertedObj[d]))
            .attr("fill", "#69b3a2");

          targetHit = true;
        }
      });

      function onMouseOverBar(d, i, m) {
        let scrollTop = $(window).scrollTop();

        let el = $(elID);
        let elOffset = el.offset().top;

        const xPos = d3.event.x;
        const yPos = d3.event.y / 2 + elOffset;

        toolTipBar
          .html(
            `
            <dl>
              <dt class='tooltip-header'>Total Orders</dt>
              <dd class='tooltip-data'>${convertedObj[d]}</dd>
            </dl>
         `
          )
          .style("cursor", "pointer")
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("left", xPos + "px")
          .style("top", yPos + "px");
      }

      function onMouseOutBar() {
        toolTipBar.transition().duration(200).style("opacity", 0);
      }
    };

  const displayTableData = (data, tableID, startIndex, endIndex = null) => {
    let dataSlice;
    if (endIndex) {
      dataSlice = data.slice(startIndex, endIndex);
    } else {
      dataSlice = data.slice(startIndex);
    }

    const html = dataSlice
      .map((item) => {
        return `
      <tr>
        <td>${postcodeObj[item.delivery_postcode__postcode_area]}</td>
        <td>${item.order_quantity}</td>
      </tr>
    `;
      })
      .join("");

    $(tableID).html(html);
  };

  // Buttons to switch data sets
  d3.selectAll(".filter-btn").on("click", async function () {
    let fullData, header, toothbrushType;

    const btnID = d3.select(this).attr("id");
    if (btnID === "toggle_toothbrush_2000") {

        fullData = await getData(
          "/full_orders/get_full_data?toothbrush_type=toothbrush_2000"
        );
    

      header = 'Toothbrush 2000';
      toothbrushType = 'toothbrush_2000'
    } else if (btnID === "toggle_toothbrush_4000") {
      
       fullData = await getData(
         "/full_orders/get_full_data?toothbrush_type=toothbrush_4000"
       );

      header = 'Toothbrush 4000';
      toothbrushType = 'toothbrush_4000'
    } else {
       fullData = await getData(
         "/full_orders/get_full_data"
       );

      header = "All Toothbrushes";
      toothbrushType = 'all_toothbrushes'
    }

    console.log(fullData)

    displayMap(fullData.data_by_postcode, toothbrushType);
    displaySalesByAgeChart(fullData.sales_by_age);
    displayHeader(header);
    toggleActiveBtnStyles(toothbrushType);
  });

  const init = async () => {
    // Make the various API requests

    const fullData = await getData("/full_orders/get_full_data");

    const tb2000FullData = await getData(
      "/full_orders/get_full_data_by_tb_type?toothbrush_type=toothbrush_2000"
    );
    const tb4000FullData = await getData(
      "/full_orders/get_full_data_by_tb_type?toothbrush_type=toothbrush_4000"
    );

    displayMap(fullData.data_by_postcode);

    displayTBData(tb2000FullData, tb4000FullData);

    displaySalesByAgeChart(fullData.tb_sales_by_age);

    // Display Barcharts displaying order quantities for age groups
    displayOrderQuantityBarChart(
      "#order-quantity-tb2000-age",
      fullData.tb_2000_orders_by_age,
      "customer_age"
    );

    displayOrderQuantityBarChart(
      "#order-quantity-tb4000-age",
      fullData.tb_4000_orders_by_age,
      "customer_age"
    );

    // Display tables for highest and lowest order quantities per postcode, per toothbrush type
    // TB2000
    // - Best Peforming Postcodes
    displayTableData(fullData.tb_2000_orders_by_postcode, "#table-data-best", 0, 5);
    // - Worst Performing Postcodes
    displayTableData(fullData.tb_4000_orders_by_postcode, "#table-data-worst", -5);

    // TB4000
    // - Best Peforming Postcodes
    displayTableData(
      fullData.tb_4000_orders_by_postcode,
      "#table-data-tb4000-best",
      0,
      5
    );
    // - Worst Performing Postcodes
    displayTableData(
      fullData.tb_4000_orders_by_postcode,
      "#table-data-tb4000-worst",
      -5
    );

    let header = "All Toothbrushes";
    displayHeader(header);
  };

  init();
});

// ---------------------- Utility Functions

const convertPostCodeAreaToPostcode = (data) => {
  for (i in postcodeObj) {
    for (j in data) {
      if (data[j].delivery_postcode__postcode_area === i) {
        data[j].delivery_postcode__postcode_area = postcodeObj[i];
      }
    }
  }
 return data;
};

const convertSalesByAgeObj = (data) => {
  let convertedObj = {};

  let salesCount = 0;

  for (let i = 0; i < data.length; i++) {
    const customerAge = data[i].customer_age;
    if (customerAge > 0) {
      salesCount += data[i].total_sales;

      if (customerAge % 10 === 0) {
        convertedObj[customerAge] = salesCount;
        salesCount = 0;
        continue;
      }
    }
  }
  return convertedObj;
};

const convertData = (data, property1, property2) => {
  let convertedObj = {};

  let salesCount = 0;

  for (let i = 0; i < data.length; i++) {
    const customerAge = data[i][property1];
    if (customerAge > 0) {
      salesCount += data[i][property2];
      if (customerAge % 10 === 0) {
        convertedObj[customerAge] = salesCount;
        salesCount = 0;
        continue;
      }
    }
  }
  return convertedObj;
};


