import React, { useEffect, useState } from "react";
import CommonDateField from "../../Form Fields/CommonDateField";
import { createRequiredValidation } from "../../utils/helpers";
import { today } from "../../constant";

const ActiveDates = ({ formConfig }) => {
  const [showEndDate, setShowEndDate] = useState(false);
  const { watch, setValue } = formConfig;
  const { end_date, start_time, start_date } = watch();
  useEffect(() => {}, []);
  const toggleEndDate = () => {
    if (showEndDate) {
      setValue("end_date", "");
    }
    setShowEndDate((prev) => !prev);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow_custom">
      <div className="mb-4 label_custom">Active Dates</div>
      <div className="flex gap-4 mb-4 w-full">
        <CommonDateField
          label="Start Date *"
          className="px-4 py-2 w-full rounded-lg bg-[#F5F5F5]"
          labelClassName="label_custom"
          minDate={today}
          fieldName="start_date"
          rules={createRequiredValidation("Start date")}
          formConfig={formConfig}
        />
        <CommonDateField
          type="time"
          label="Start Time *"
          labelClassName="label_custom"
          className="px-4 py-2 w-full rounded-lg bg-[#F5F5F5]"
          fieldName="start_time"
          rules={createRequiredValidation("start time")}
          formConfig={formConfig}
        />
      </div>
      {/* commented for future use */}

      {/* <div
        className="text-[#FF6D2F] underline cursor-pointer"
        onClick={toggleEndDate}
      >
        {showEndDate ? "Remove End Date" : "Set End Date"}
      </div> */}

      {/* {showEndDate && (
        <CommonDateField
          label="End Date *"
          formConfig={formConfig}
          fieldName="end_date"
          minDate={watch("start_date")}
          rules={{
            ...createRequiredValidation("End date"),
            validate: (value) =>
              value >= watch("start_date") ||
              "End date must be greater than or equal to the start date",
          }}
        />
      )} */}
      <div className="flex gap-4 mb-4 w-full">
        <CommonDateField
          label="End Date *"
          formConfig={formConfig}
          fieldName="end_date"
          minDate={watch("start_date")}
          labelClassName="label_custom"
          rules={{
            ...createRequiredValidation("End date"),
            validate: (value) =>
              value >= watch("start_date") ||
              "End date must be greater than or equal to the start date",
          }}
        />
        <CommonDateField
          label="End Time *"
          formConfig={formConfig}
          type="time"
          fieldName="end_time"
          minDate={watch("end_time")}
          rules={createRequiredValidation("End time")}
          labelClassName="label_custom"
        />
      </div>
    </div>
  );
};

export default ActiveDates;
