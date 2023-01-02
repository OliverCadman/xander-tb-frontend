document.addEventListener("DOMContentLoaded", () => {
  const BASE_API_URL = "http://0.0.0.0:8000/api/orders";

  const displayMap = (salesPostcodes, fullDataByPostcode) => {
    console.log(fullDataByPostcode);

    var width = window.innerWidth / 2;
    var height = window.innerHeight;

    var projection = d3
      .geoAlbers()
      .center([0, 55.4])
      .rotate([4.4, 0])
      .parallels([50, 60])
      .scale(650 * 5)
      .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let keys = [5, 10, 30, 50, 100, 200, 350, 500];

    var color = d3.scaleThreshold().domain(keys).range(d3.schemeBlues[7]);

    d3.json("../assets/data/uk-postcode-area.json", function (error, uk) {
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
      console.log(topo);
      _.each(topo, function (item) {
        obj[item.id] = item.properties.total_tb_sales;
      });

      console.log(obj);

      console.log(d3.extent(_.toArray(obj)));

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
        .on("mouseleave", mouseLeave);

      svg
        .append("path")
        .datum(
          topojson.mesh(uk, uk.objects["uk-postcode-area"], function (a, b) {
            return a !== b;
          })
        )
        .attr("class", "mesh")
        .attr("d", path);
    });

    svg
      .selectAll(".legend-dots")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", 10)
      .attr("cy", function (d, i) {
        return 100 + i * 25;
      })
      .attr("r", 7)
      .style("fill", function (d) {
        return color(d);
      });

    svg
      .selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 25)
      .attr("y", function (d, i) {
        return 100 + i * 25;
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function (d) {
        return color(d);
      })
      .text(function (d) {
        return `${d} sales`;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .attr("font-family", "Open Sans, sans-serif");

    let toolTip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let mouseOver = function (d) {
      console.log(d);
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.1);
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
        .style("lineWidth", 5);

      
      console.log(d.properties.delivery_postcode__postcode_area)

      if (d.properties.hasOwnProperty('total_tb_sales')) {
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
                  Average Time taken to deliver: ${d.properties.avg_delivery_delta}
                </p>
              `
            )
            .style("left", window.innerWidth / 2 + "px")
            .style("top", "0px");
      }  
    };

    let mouseLeave = function (d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.8);
      d3.select(this).transition().duration(200).style("stroke", "transparent");

      toolTip.style("opacity", 0);
    };
  };

  function getPostcodesJSON() {
    let request = new XMLHttpRequest();
    request.open("GET", "../assets/data/uk-postcode-area.json", false);
    request.send(null);
    let data = JSON.parse(request.responseText);
    return data;
  }

  async function getData(endpoint) {
    const url = `${BASE_API_URL}/full_orders/${endpoint}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      return data;
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }

  const init = async () => {
    const totalSalesByPostcodeArea = await getData(
      "get_total_sales_by_postcode"
    );
    const fullDataByPostcode = await getData("get_full_data_by_postcode");
    const postcodeAreaJSON = getPostcodesJSON();
    displayMap(totalSalesByPostcodeArea, fullDataByPostcode);
  };
  init();
});
