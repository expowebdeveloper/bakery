import React, { useEffect, useState } from "react";
import {
  checkedIcon,
  closeIcon,
  downloadIcon,
  editIcon,
  printIcon,
} from "../assets/Icons/Svg";
import CommonButton from "../Components/Common/CommonButton";
import CommonTextField from "../Form Fields/CommonTextField";
import { useForm } from "react-hook-form";
import {
  generateDefaultIngredientList,
  handleIngredients,
  updatedIngredients,
} from "../utils/helpers";

const PrintModal = ({
  onCancel,
  onRecipeSubmit,
  printLoaders,
  printModalInfo,
  buttonLoader,
}) => {
  const formConfig = useForm();
  const [defaultList, setDefaultList] = useState(null);
  const [servingQuantity, setServingQuantity] = useState(1);
  const { item } = printModalInfo;
  const baseQuantity = item?.serving_size;
  const [isEdit, setIsEdit] = useState(false);
  const { handleSubmit, setValue, watch } = formConfig;
  const INGREDIENT_HEADINGS = ["Ingredient Name", "Quantity", "Unit"];
  useEffect(() => {
    if (item?.serving_size) {
      setValue("quantity", item?.serving_size);
    }
    if (item?.ingredients) {
      const result = generateDefaultIngredientList(item?.ingredients);
      setDefaultList(result);
    }
  }, []);
  useEffect(() => {
    const formattedIngredients = handleIngredients(item?.ingredients);
    const result = updatedIngredients(formattedIngredients, watch("quantiy"));
    // setValue("ingredients", formattedIngredients);
  }, [watch("quantity")]);
  const handleIconClick = () => {
    setServingQuantity(formConfig.watch("quantity"));
    setIsEdit((prev) => !prev);

    if (isEdit) {
      const updatedList = defaultList.map((ingredient) => ({
        ...ingredient,
        quantity:
          ingredient.quantity *
          (formConfig.watch("quantity") / item.serving_size),
      }));
      setDefaultList(updatedList);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-10 w-full shadow-lg w-full max-w-[800px] delete_modal relative">
        <form onSubmit={handleSubmit(onRecipeSubmit)}>
          <div className="flex justify-center">
            {/* <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center"></div> */}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mt-4">
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
            fieldName="quantity"
            rules={{ required: "Serving size is required" }}
            label="Serving Size *"
            formConfig={formConfig}
            customClass="edit_recipee"
            isNumberOnly={true}
            icon={!isEdit && editIcon}
            onIconClick={() => handleIconClick()}
            disabled={!isEdit}
          />
          {isEdit ? (
            <CommonButton
              text="Save Serving Size"
              type="button"
              className="orange_btn print_button mt-2 text-center"
              onClick={handleIconClick}
            />
          ) : (
            ""
          )}
          <div className="ingredient-section">
            <table>
              <thead>
                {INGREDIENT_HEADINGS?.map((hd, idx) => (
                  <th key={idx}>{hd}</th>
                ))}
              </thead>
              <tbody>
                {defaultList?.map((it) => (
                  <tr>
                    <td>{it?.name}</td>
                    <td>{parseFloat(it?.quantity)?.toFixed(2)}</td>
                    <td>{it?.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-center text-gray-600 mt-2"></p>
          <div className="flex justify-center mt-6 space-x-3">
            {!isEdit ? (
              <>
                <CommonButton
                  text="Save"
                  type="submit"
                  name="save"
                  className="orange_btn print_button mx-auto"
                  loader={buttonLoader}
                  disabled={buttonLoader}
                />
                {/* <CommonButton
                  text="Download"
                  type="submit"
                  name="download"
                  className="orange_btn print_button mx-auto "
                  loader={printLoaders?.download}
                  icon={downloadIcon}
                />
                <CommonButton
                  text="Print"
                  type="submit"
                  className="orange_btn print_button"
                  name="print"
                  loader={printLoaders?.print}
                  icon={printIcon}
                /> */}
              </>
            ) : (
              ""
            )}
            <CommonButton
              //   text="Cancel"
              icon={closeIcon}
              type="button"
              className="print_close_icon"
              onClick={onCancel}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrintModal;
