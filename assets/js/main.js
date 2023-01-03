document.addEventListener("DOMContentLoaded", () => {
  const BASE_API_URL = "http://127.0.0.1:8000/api/orders";

  const keys = [5, 10, 30, 50, 100, 200, 350, 500];

  
    let color = d3.scaleThreshold().domain(keys).range(d3.schemeBlues[9]);

  var width = window.innerWidth / 2;
  var height = window.innerHeight - 60;

  var projection = d3
    .geoAlbers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(650 * 5)
    .translate([width / 2, height / 2]);

  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Legend

  svg
    .append("text")
    .attr("x", 40)
    .attr("y", 75)
    .attr("font-family", "Raleway, sans-serif")
    .attr("font-size", "1.375rem")
    .text("Toothbrush Sales by Postcode");

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

  const displayMap = (fullDataByPostcode) => {
    var path = d3.geoPath().projection(projection);

    d3.json("../assets/data/uk-postcode-area.json", function (error, uk) {
      console.log('hello')
      const topo = topojson.feature(
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

      console.log(svg)

       svg
         .append("path")
         .datum(
           topojson.mesh(uk, uk.objects["uk-postcode-area"], function (a, b) {
             return a !== b;
           })
         )
         .attr("class", "mesh")
         .attr("d", path);
      
      svg.selectAll('.postcode_area').remove()

      svg
        .selectAll(".postcode_area")
        .data(topo)
        .enter()
        .append("path")
        .attr("class", "postcode_area")
        .attr("d", path)
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
        .on("mouseleave", mouseLeave)
    });

    let toolTip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let mouseOver = function (d) {
      console.log('hi')
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.1);
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("lineWidth", 5)
        .style("cursor", "pointer");

      if (d.properties.hasOwnProperty("total_tb_sales")) {
        toolTip
          .style("opacity", 0.8)
          .html(
            `
                <h3>${postcodeObj[d.id]}</h3>
                <p>
                  Total Sales: ${d.properties.total_tb_sales}
                </p>
                 <p>
                  Toothbrush 2000 Sales: ${d.properties.tb_2000_sales}
                </p>
                <p>
                  Toothbrush 4000 Sales: ${d.properties.tb_4000_sales}
                </p>
                <p>
                  Average Customer Age: ${d.properties.avg_customer_age}
                </p>
                <p>
                  Average Delivery Time: ${formatDelta(
                    d.properties.avg_delivery_delta
                  )}
                </p>
              `
          )
          .style("left", window.innerWidth / 2 - 250 + "px")
          .style("top", "45px")
          .style("width", "45vw");
      }
    };

    let mouseLeave = function (d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.8);
      d3.select(this).transition().duration(200).style("stroke", "transparent");

      toolTip.style("opacity", 0);
    };
  };

  const displayMetaData = (
    deliveryDeltas,
    customerAges,
    header,
    overallTBSales = null
  ) => {

    let tbSalesObj, tb2000Sales, tb4000Sales, totalTBSales;

    if (overallTBSales) {
      tbSalesObj = overallTBSales[0];
      tb2000Sales = tbSalesObj.max_toothbrush_2000;
      tb4000Sales = tbSalesObj.max_toothbrush_4000;
      totalTBSales = tb2000Sales + tb4000Sales;

      $("#tb_2000").text(
        `Toothbrush 2000: ${tbSalesObj.max_toothbrush_2000}`
      );
      $("#tb_4000").text(
        `Toothbrush 4000: ${tbSalesObj.max_toothbrush_4000}`
      );
      $("#total_sales").text(`Total Toothbrush Sales: ${totalTBSales}`);
    }

    console.group('MetaData')
    console.log(deliveryDeltas);
    console.log(customerAges);
    console.log(overallTBSales);
    console.groupEnd()

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

    $("#header").text(header);
  };

  async function getData(endpoint) {
    const url = `${BASE_API_URL}${endpoint}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      return data;
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }

  const init = async () => {
    // Make the various API requests
    const fullDataByPostcode = await getData(
      "/full_orders/get_full_data_by_postcode"
    );
    const totalSalesPerTB = await getData("/count_tb_type");

    const deliveryDeltas = await getData("/full_orders/get_delivery_deltas");

    const customerAges = await getData("/full_orders/get_customer_ages");

    displayMap(fullDataByPostcode);
    displayMetaData(deliveryDeltas, customerAges, 'All Toothbrushes',totalSalesPerTB);
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

  // Buttons to switch data sets
  d3.selectAll(".btn").on("click", async function () {

    let deliveryDeltas, customerAges, fullData, header;

    const btnID = d3.select(this).attr("id");
    if (btnID === "toggle_toothbrush_2000") {
      fullData = await getData(
        "/full_orders/get_full_data_by_postcode?toothbrush_type=toothbrush_2000"
      );

      deliveryDeltas = await getData(
        "/full_orders/get_delivery_deltas?toothbrush_type=toothbrush_2000"
      )

      customerAges = await getData(
        "/full_orders/get_customer_ages?toothbrush_type=toothbrush_2000"
      )

      header = "Toothbrush 2000"

    } else if (btnID === "toggle_toothbrush_4000") {
      fullData = await getData(
        "/full_orders/get_full_data_by_postcode?toothbrush_type=toothbrush_4000"
      );

      customerAges = await getData(
        "/full_orders/get_customer_ages?toothbrush_type=toothbrush_4000"
      )

      deliveryDeltas = await getData(
        "/full_orders/get_delivery_deltas?toothbrush_type=toothbrush_4000"
      );

      header = "Toothbrush 4000"

    } else {
      fullData = await getData(
        "/full_orders/get_full_data_by_postcode"
      )

      deliveryDeltas = await getData(
        "/full_orders/get_delivery_deltas"
      )

      customerAges = await getData(
        "/full_orders/get_customer_ages"
      )

      header = "All Toothbrushes"
    }

     displayMap(fullData);
     displayMetaData(deliveryDeltas, customerAges, header);
  });


  init();
});
