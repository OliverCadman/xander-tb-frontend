document.addEventListener("DOMContentLoaded", () => {
    BASE_API_URL = 'http://127.0.0.1:8000/api/orders';

    const oldKey = 'delivery_postcode__postcode_area';
    const newKey = 'postcode_area';

    const displayBarChart = (data) => {
        convertPostCodeAreaToPostcode(data)
    }

    const convertPostCodeAreaToPostcode = (data) => {
        for (i in postcodeObj) {
            for (j in data) {
                if (data[j].delivery_postcode__postcode_area === i) {
                    data[j].delivery_postcode__postcode_area = postcodeObj[i]
                }
              
            }
        }

        console.log(data)
    }


    const init = async () => {


        const tb2000SalesURL = '/full_orders/get_total_sales_by_postcode';
        const tb2000QueryString = '?toothbrush_type=toothbrush_2000'
        const tb2000SalesData = await getData(`${tb2000SalesURL}${tb2000QueryString}`)

        displayBarChart(tb2000SalesData);
    }



    init();


})