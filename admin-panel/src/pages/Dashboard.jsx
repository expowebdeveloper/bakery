import React, { useEffect, useState } from "react";
import basketImg from "../assets/images/cookie_img.png";
import {
  CubesCategoryIcon,
  decrease_arrowIcon,
  Increase_arrowIcon,
  ProductDocIcon,
  ProfileIcon,
} from "../assets/Icons/Svg";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { T } from "../utils/languageTranslator";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { DASHBOARD_ENDPOINT } from "../api/endpoints";
import {
  transformUserSummaryToChartData,
} from "../utils/helpers";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import { PRICE_UNIT } from "../constant";
ChartJS.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userSummaryData, setUserSummaryData] = useState({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label:T["this_month"],
        data: [],
        borderColor: "#475857",
        backgroundColor: "#475857",
        fill: false,
        tension: 0.4,
      },
      {
        label: T["last_month"],
        data: [],
        borderColor: "#B7AE90",
        backgroundColor: "#B7AE90",
        fill: true,
        tension: 0.4,
      },
    ],
  });
  const { pageLoader, setPageLoader } = useLoader();

  const weeklySalesData = dashboardData?.weekly_sales_data;

  useEffect(() => {
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: DASHBOARD_ENDPOINT,
      method: METHODS.get,
    })
      .then((res) => {
        setDashboardData(res.data);
        if (res?.data?.user_summary_data?.current_month_summary?.length) {
          setUserSummaryData(
            transformUserSummaryToChartData(res?.data?.user_summary_data)
          );
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  }, []);


  const salesData = {
    labels: !weeklySalesData?.length
      ? []
      : weeklySalesData?.map((item) => item.week),
    datasets: [
      {
        label: "Sales",
        data: !weeklySalesData?.length
          ? []
          : weeklySalesData?.map((item) => item.total_sales),
        borderColor: "#475857",
        backgroundColor: "#475857",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const salesOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4000,
        ticks: {
          stepSize: 1000,
          font: {
            family: "Montserrat",
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: "Montserrat",
          },
        },
      },
    },
  };

  // Dummy Data for Users Summary chart
  // const usersData = {
  //   labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  //   datasets: [
  //     {
  //       label: "This Month",
  //       data: [5000, 8000, 6500, 7000],
  //       borderColor: "#475857",
  //       backgroundColor: "#475857",
  //       fill: false,
  //       tension: 0.4,
  //     },
  //     {
  //       label: "Last Month",
  //       data: [7000, 6000, 7500, 5500],
  //       borderColor: "#B7AE90",
  //       backgroundColor: "#B7AE90",
  //       fill: true,
  //       tension: 0.4,
  //     },
  //   ],
  // };

  const usersOptions = {
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { usePointStyle: true },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10000,
        ticks: {
          stepSize: 2000,
          font: {
            family: "Montserrat",
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: "Montserrat",
          },
        },
      },
    },
  };

  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <>
          <section className="top_cat">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
              <div className="md:col-span-3 bg-gradient-to-r from-yellow-200 to-orange-300 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center relative h-full">
                  <div className="w-full md:w-2/3 h-full flex flex-col justify-between">
                    <div className="text-left">
                      <span className="text-lg font-semibold text-gray-700">
                        {T["total_revenue"]}
                      </span>
                      <h2 className="text-4xl font-bold text-gray-900">
                         {dashboardData?.total_revenue ? dashboardData?.total_revenue : 0} {PRICE_UNIT}
                      </h2>
                    </div>
                    <div className="flex space-x-4 mt-4">
                      {/* Total Order Placed Card */}
                      <div className="bg-[#FAF2D5] p-4 rounded-lg flex flex-col items-start">
                        <h5 className="text-sm font-medium text-gray-600">
                          {T["total_order_placed"]}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-3">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {dashboardData?.total_orders_in_period
                              ? dashboardData?.total_orders_in_period
                              : 0}
                          </h3>
                          {dashboardData?.order_added_percentage ? (
                            <div className="flex items-center text-green-600 text-sm font-semibold mt-1">
                              <span>
                                {dashboardData?.order_added_percentage
                                  ? dashboardData?.order_added_percentage
                                  : "0%"}
                              </span>
                              {Increase_arrowIcon}
                            </div>
                          ) : ""}
                        </div>
                      </div>
                      {/* Total Customers Card */}
                      <div className="bg-[#FAF2D5] p-4 rounded-lg flex flex-col items-start">
                        <h5 className="text-sm font-medium text-gray-600 mr-4">
                          {T["total_customers"]}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-3">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {dashboardData?.total_bakery_customers ? dashboardData?.total_bakery_customers : 0}
                          </h3>
                          {dashboardData?.customer_added_percentage ? (
                            <div className="flex items-center text-red-600 text-sm font-semibold mt-1">
                              <span>
                                {dashboardData?.customer_added_percentage ? dashboardData?.customer_added_percentage : 0}
                              </span>
                              {decrease_arrowIcon}
                            </div>
                          ) : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Image Section */}
                  <div className="w-1/3 hidden xl:block image_total_revenue">
                    <img
                      src={basketImg}
                      alt="Basket of bread"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 gap-4">
                {/* Total Products Card */}
                <div className="bg-[#FFEFE7] rounded-lg p-6 flex flex-col justify-between relative">
                  <div>
                    <div className="product-section flex items-center justify-between">
                      <div className="total-products">
                        <h2 className="text-black font-semibold text-lg">
                          {T["total_products"]}
                        </h2>
                        <p className="text-4xl font-bold text-black">
                          {dashboardData?.total_products_in_period ? dashboardData?.total_products_in_period : 0}
                        </p>
                      </div>
                      <div className="published-products">
                        <h2 className="text-black font-semibold text-lg">
                          {T["published_products"]}
                        </h2>
                        <p className="text-4xl font-bold text-black">
                          {dashboardData?.published_products_in_period ? dashboardData?.published_products_in_period : 0}
                        </p>
                      </div>


                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-3">
                      <p className="text-red-500 mt-2">
                        {dashboardData?.total_product_added_today ? dashboardData?.total_product_added_today : 0}{" "}
                        {T["products_added"]}
                      </p>
                      {/* <div className="mt-0 flex items-center text-red-500">
                        <span className="text-sm">{T["past_month"]}</span>
                        <svg
                          className="w-6 h-6 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          ></path>
                        </svg>
                      </div> */}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 dashcat_icons">
                    {ProductDocIcon}
                  </div>
                </div>
                {/* Categories and Total Users Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categories Card */}
                  <div className="bg-[#E8F0FB] rounded-lg p-6 relative">
                    <h2 className="text-black font-semibold text-lg">
                      {T["categories"]}
                    </h2>
                    <p className="text-4xl font-bold text-black">
                      {dashboardData?.total_categories ? dashboardData?.total_categories : 0}
                    </p>
                    <div className="flex justify-end mt-4 dashcat_icons">
                      {CubesCategoryIcon}
                    </div>
                  </div>
                  {/* Total Users Card */}
                  <div className="bg-[#FDEBF9] rounded-lg p-6 relative">
                    <h2 className="text-black font-semibold text-lg">
                      {T["total_employees"]}
                    </h2>
                    <p className="text-4xl font-bold text-black">
                      {dashboardData?.total_workers ? dashboardData?.total_workers : 0}
                    </p>
                    <div className="flex justify-end mt-4 dashcat_icons">
                      {ProfileIcon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="inventory_Dash mt-5">
            <h3>{T["inventory_management"]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mt-3">
              <div className="bg-[#FFEFE7] p-4 rounded-lg flex flex-col items-start gap-4">
                <h5 className="text-sm font-medium text-gray-600">
                  {T["total_running_orders"]}
                </h5>
                <h3 className="text-2xl font-bold text-gray-800 mt-3">
                  {dashboardData?.total_running_orders ? dashboardData?.total_running_orders : 0}
                </h3>
              </div>

              <div className="bg-[#FFEFE7] p-4 rounded-lg flex flex-col items-start gap-4">
                <h5 className="text-sm font-medium text-gray-600">
                  {T["low_stock_items"]}
                </h5>
                <h3 className="text-2xl font-bold text-gray-800 mt-3">
                  {dashboardData?.low_stock_products ? dashboardData?.low_stock_products : 0}
                </h3>
              </div>
              <div className="bg-[#FFEFE7] p-4 rounded-lg flex flex-col items-start gap-4">
                <h5 className="text-sm font-medium text-gray-600">
                  {T["in_progress_orders"]}
                </h5>
                <h3 className="text-2xl font-bold text-gray-800 mt-3">
                  {dashboardData?.total_in_progress_orders ? dashboardData?.total_in_progress_orders : 0}
                </h3>
              </div>

              <div className="bg-[#FFEFE7] p-4 rounded-lg flex flex-col items-start gap-4">
                <h5 className="text-sm font-medium text-gray-600">
                  {T["today_order_value"]}
                </h5>
                <h3 className="text-2xl font-bold text-gray-800 mt-3">
                {dashboardData?.total_order_price_in_period ? dashboardData?.total_order_price_in_period : 0} {PRICE_UNIT}
                </h3>
              </div>
            </div>
          </section>

          <section className="graph_dash mt-5">
            <div className="flex gap-4">
              {/* Sales Summary Card */}
              <div className="bg-white rounded-lg p-6 shadow-md w-1/2">
                <h2 className="text-gray-600 font-semibold">
                  {T["sales_summary"]}
                </h2>
                <p className="text-3xl font-bold text-gray-500 text-sm font-normal">
                  {/* calculateTotal() */}
                  <p>
                    {T["this_week_sale"]} {": "}{" "}
                    <b>{dashboardData?.current_week_sales ? dashboardData?.current_week_sales : 0}</b> {PRICE_UNIT}
                  </p>
                </p>
                <div className="mt-4">
                  <Line data={salesData} options={salesOptions} />
                </div>
              </div>

              {/* Users Summary Card */}
              <div className="bg-white rounded-lg p-6 shadow-md w-1/2">
                <h2 className="text-gray-600 font-semibold">
                  {T["customer_summary"]}
                </h2>
                <p className="text-3xl font-bold text-gray-900">
                  {/* {calculateTotal(userSummaryData?.last_month_summary,"total_customers")} */}
                  {dashboardData?.last_thirty_day_customer}
                  <span className="text-gray-500 text-sm font-normal">
                    {T["past_30_days"]}
                  </span>
                </p>

                <div className="mt-4">
                  <Line
                    data={
                      userSummaryData?.datasets?.length ? userSummaryData : []
                    }
                    options={usersOptions}
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Dashboard;
