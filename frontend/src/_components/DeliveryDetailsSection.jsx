"use client";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import React, {useState} from "react";
import { useForm } from "react-hook-form";
const DELIVERY_DATES = [
  {
    day: "THU",
    date: "19-09",
    time: "Before 2 pm",
  },
  {
    day: "FRI",
    date: "20-09",
    time: "Before 2 pm",
  },
  {
    day: "SAT",
    date: "20-09",
    time: "Before 2 pm",
  },
  {
    day: "SUN",
    date: "20-09",
    time: "Before 2 pm",
  },
  {
    day: "MON",
    date: "20-09",
    time: "Before 2 pm",
  },
];
const DeliveryDetailsSection = ({formConfig}) => {
  const [deliveryDate, setDeliveryDate] = useState("");
  // const formConfig = useForm();
  // const { handleSubmit } = formConfig;
  // const onSubmit = (values) => {
  //   console.log(values, "billing details");
  // };
  return (
    <>
    <h2 className="text-xl font-semibold">Delivery Details</h2>
    <div className="font-sans w-full mx-auto p-6 bg-[#ffffff] shadow-md rounded-lg border">
      <form>
        {/* Delivery Details Section */}
        <CommonTextInput
            formConfig={formConfig}
            placeholder="Select Date"
            fieldName={"expectedDeliveryDate"}
            // rules={BillingDetailsValidations?.["name"]}
            label="Expected Delivery"
          />

        <div className="mb-4 mt-2">
          <label className="block font-medium text-gray-600 mb-2">Expected Delivery *</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DELIVERY_DATES?.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setDeliveryDate(date)}
                className={`text-center p-2 border rounded-md text-sm ${
                  deliveryDate === date ? "bg-yellow-400 text-white" : "bg-white border-gray-300"
                }`}
              >
                {date.date}
                <br />
                <span className="text-xs text-gray-500">{date.time}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDeliveryDate("Custom Date")}
              className={`text-center p-2 border rounded-md text-sm ${
                deliveryDate === "Custom Date"
                  ? "bg-yellow-400 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              CUSTOM DATE
            </button>
          </div>
        </div>
        {/* <textarea
          placeholder="Extra Notes"
          className="w-full p-3 mt-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows="3"
        ></textarea> */}
        <CommonTextInput
        type="textarea"
        rows={6}
        label="Extra Notes"
        fieldName="extra_notes"
        formConfig={formConfig}
      />

        {/* <button
          type="submit"
          className="w-full mt-6 p-3 bg-yellow-400 text-white font-semibold rounded-md hover:bg-yellow-500"
        >
          Submit
        </button> */}
      </form>
    </div>
    </>
  );
};

export default DeliveryDetailsSection;
