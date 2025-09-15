import React, { useEffect } from "react";
import {
  closeIcon,
  deleteIcon,
  downloadIcon,
  trashIcon,
} from "../assets/Icons/Svg";
import CommonButton from "../Components/Common/CommonButton";
import { useFetcher } from "react-router-dom";
import { useForm } from "react-hook-form";
import CommonTextField from "../Form Fields/CommonTextField";

const ServingUpdateModal = ({
  icon = trashIcon,
  loader,
  onCancel,
  onServingUpdate,
  formConfig,
  item,
}) => {
  const { handleSubmit, setValue } = formConfig;
  useEffect(() => {
    if (item?.serving_size) {
      setValue("serving", item?.serving_size);
    }
  }, [item]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-10 w-full shadow-lg w-full max-w-[800px] delete_modal relative">
        <form onSubmit={handleSubmit(onServingUpdate)}>
          <div className="flex justify-center">
            {/* <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center"></div> */}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mt-4 text-center">
            {" "}
            <h4>
              {/* Recipe Name :{" "} */}
              <span className="capitalize">{item?.recipe_title}</span>
            </h4>
          </h4>
          {/* <h2 className="text-lg font-semibold text-gray-900 mt-4">
            {" "}
            Adjust Serving Size{" "}
          </h2> */}
          <CommonTextField
            fieldName="serving"
            rules={{ required: "Serving size is required" }}
            label="Serving Size *"
            formConfig={formConfig}
            className="recipe-input"
            customClass="edit_recipee"
            isNumberOnly={true}
            onIconClick={() => handleIconClick()}
          />

          <div className="flex justify-center mt-6 space-x-3">
            <CommonButton
              text="Save serving size"
              type="submit"
              name="download"
              className="orange_btn print_button "
              loader={loader}
            />
          </div>
          <CommonButton
            //   text="Cancel"
            icon={closeIcon}
            type="button"
            className="print_close_icon"
            onClick={onCancel}
          />
        </form>
      </div>
    </div>
  );
};

export default ServingUpdateModal;
