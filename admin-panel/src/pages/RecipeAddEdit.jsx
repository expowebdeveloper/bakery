import React, { useEffect, useState } from "react";
import CommonTextField from "../Form Fields/CommonTextField";
import { useForm } from "react-hook-form";
import { RecipeValidations } from "../Validations/validations";
import FormWrapper from "../Wrappers/FormWrapper";
import { draftIcon, publishIcon } from "../assets/Icons/Svg";
import CommonButton from "../Components/Common/CommonButton";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonFieldArray from "../Components/Common/CommonFieldArray";
import {
  DEFAULT_ERROR_MESSAGE,
  DIETRY_OPTIONS,
  PNG_AND_JPG,
  RECIPE_MEASURE_OPTIONS,
} from "../constant";
import CommonTextEditor from "../Form Fields/CommonTextEditor";
import {
  appendStepCountInObject,
  convertIntoSelectOptions,
  createIngredientPayload,
  createPreview,
  createRequiredValidation,
  extractAllergenInfo,
  extractOption,
  formatAllergenInfo,
  handleCategory,
  handleIngredients,
  prefillFormValues,
} from "../utils/helpers";
import { INSTANCE, makeApiRequest, METHODS } from "../api/apiFunctions";
import { RECIPE_ALLERGEN_ENDPOINT, RECIPE_ENDPOINT } from "../api/endpoints";
import { successType, toastMessage } from "../utils/toastMessage";
import { useLocation, useNavigate } from "react-router-dom";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import CategorySection from "../Components/CategorySection";
import ImageUploadSection from "../Form Fields/ImageUploadSection";
import { SPECIAL_CHARACTERS_REGEX } from "../regex/regex";
import { T } from "../utils/languageTranslator";
import InfiniteCreatableSelect from "../Form Fields/InfiniteCreatableSelect";
const ALLERGEN_OPTIONS = [{ value: "CN", label: T["contain_nuts"] }];
const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "E" },
  { label: "Medium", value: "M" },
  { label: "Hard", value: "H" },
];
const INGREDIENT_TO_APPEND = { name: "", quantity: "", unit_of_measure: "" };
const INSTRUCTION_TO_APPEND = { step_count: null, instructions: "", notes: "" };
const INGREDIENTS_ITEMS = [
  {
    fieldName: "name",
    placeholder: T["enter_name"],
    label: `${T["ingredient_name"]} *`,
    isRequired: true,
  },
  {
    fieldName: "quantity",
    placeholder: T["enter_quantity"],
    label: `${T["ingredient_quantity"]} *`,
    isRequired: true,
    isNumberOnly: true,
  },
  {
    fieldName: "unit_of_measure",
    placeholder: T["select_unit"],
    label: `${T["unit_of_measure"]} *`,
    field_type: "react-select",
    isRequired: true,
    options: RECIPE_MEASURE_OPTIONS,
  },
];
const INSTRUCTION_ITEMS = [
  {
    fieldName: "step_count",
    placeholder: T["enter_name"],
    label: T["step_count"],
    isNumberOnly: true,
    isStepCount: true,
    field_type: "stepCount",
  },
  {
    fieldName: "instructions",
    placeholder: T["enter_instructions"],
    label: `${T["instructions"]} *`,
    isRequired: true,
  },
  {
    fieldName: "notes",
    placeholder: T["enter_notes"],
    label: T["notes"],
    isRequired: false,
  },
];
const DEFAULT_INSTRUCTION = [{ step_count: "", instructions: "", notes: "" }];
const DEFAULT_INGREDIENT = [{ name: "", quantity: "", unit_of_measure: "" }];

const RecipeAddEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recipeId = location?.state?.recipe_id;
  const { pageLoader, toggleLoader } = useLoader();
  const formConfig = useForm({
    defaultValues: {
      ingredients: [{ name: "", quantity: "", unit_of_measure: "" }],
      instructions: [{ step_count: "", instructions: "", notes: "" }],
    },
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalData, setTotalData] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { setValue } = formConfig;

  const [btnLoaders, setBtnLoaders] = useState({
    publish: false,
    draft: false,
  });
  const [file, setFile] = useState();
  const [allergenOptions, setAllergenOptions] = useState([]);

  useEffect(() => {
    if (recipeId) {
      toggleLoader("pageLoader");
      const recipeRequest = makeApiRequest({
        endPoint: `${RECIPE_ENDPOINT}${recipeId}/`,
        method: METHODS.get,
      });

      const allergenOptionsRequest = makeApiRequest({
        endPoint: RECIPE_ALLERGEN_ENDPOINT,
        method: METHODS.get,
      });

      // Wait for both API calls to complete
      Promise.all([recipeRequest, allergenOptionsRequest])
        .then(([recipeRes, allergenRes]) => {
          const response = recipeRes?.data;
          const allergenOptions = allergenRes?.data?.results || [];
          const formattedAllergenOptions = convertIntoSelectOptions(
            allergenOptions,
            "name",
            "id"
          );
          console.log(formattedAllergenOptions, "log one");
          setAllergenOptions(formattedAllergenOptions);
          console.log(response?.allergen_information, "log two");
          const filteredOptions = formattedAllergenOptions.filter(option =>
            response?.allergen_information?.some(info => info.id === option.value)
          );
          setValue("allergen_information", filteredOptions);
          console.log(filteredOptions, "filteredOptions")
          const prefillKeys = [
            "recipe_title",
            "preparation_time",
            "notes",
            "cook_time",
            "serving_size",
            "description",
          ];
          prefillFormValues(response, prefillKeys, setValue);

          const difficultyOption = extractOption(
            DIFFICULTY_OPTIONS,
            response?.difficulty_level,
            "value"
          );

          let dietryOptions = [];
          if (response?.dietary_plan?.length) {
            response.dietary_plan.forEach(element => {
              const dietryOption = extractOption(
                DIETRY_OPTIONS,
                element,
                "value"
              );
              if (dietryOption) {
                dietryOptions.push(dietryOption);

              }
            });
            setValue("dietary_plan", dietryOptions);
          } else {
            setValue("dietary_plan", []);
          }

          setValue("difficulty_level", difficultyOption);

          if (response?.instructions?.length) {
            setValue("instructions", response?.instructions);
          } else {
            setValue("instructions", DEFAULT_INSTRUCTION);
          }

          if (response?.ingredients?.length) {
            const formattedIngredients = handleIngredients(
              response?.ingredients
            );
            setValue("ingredients", formattedIngredients);
          } else {
            setValue("ingredients", DEFAULT_INGREDIENT);
          }

          setValue("category", handleCategory(response?.category));

          if (response?.recipe_images?.length) {
            setFile({
              file: null,
              preview: createPreview(response?.recipe_images?.[0]?.image),
            });
          }
        })
        .catch((err) => {
          toastMessage("Recipe not found");
          navigate("/recipe");
        })
        .finally(() => {
          toggleLoader("pageLoader");
        });
    } else {
      fetchRecipeAllergen();
    }
  }, []);

  useEffect(() => {
    fetchRecipeAllergen();
  }, [page]);

  const fetchRecipeAllergen = () => {
    const apiFilters = {
      page: page,
    }
    setIsLoading(true);
    makeApiRequest({
      endPoint: `${RECIPE_ALLERGEN_ENDPOINT}`,
      method: METHODS.get,
      params: apiFilters,
    })
      .then((res) => {
        const formattedOptions = convertIntoSelectOptions(
          res?.data?.results,
          "name",
          "id"
        );
        setAllergenOptions(formattedOptions);
        setTotalData(res?.data?.count);
        // if(recipeId){
        //   const allergenInfo = extractAllergenInfoOptions(formattedOptions)
        // }
        const totalLoaded = (page - 1) * 10 + formattedOptions.length;
        setHasMore(totalLoaded < res?.data?.count);

      })
      .catch((err) => { }).finally(() => {
        setIsLoading(false);
      });
  };
  const onSubmit = (values, event) => {
    // if (file?.error) {
    //   return;
    // }
    const buttonType = event.nativeEvent.submitter.name;
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });
    const payload = {
      ...values,
      preparation_time: +values?.preparation_time,
      is_active: buttonType === "publish" ? true : false,
      serving_size: +values?.serving_size,
      cook_time: +values?.cook_time,
      instructions: appendStepCountInObject(values?.instructions),
      ingredients: createIngredientPayload(values?.ingredients),
      difficulty_level: values?.difficulty_level?.value,
      dietary_plan: formatAllergenInfo(values?.dietary_plan),
      allergen_information: formatAllergenInfo(values?.allergen_information),
      // allergen_information: [],
      status: buttonType === "publish" ? "publish" : "draft",
      category: values?.category
        ? Array.isArray(values?.category)
          ? values?.category.map(Number)
          : [values?.category]
        : null,
    };
    const formData = new FormData();
    console.log(payload, "recipe payload");
    for (let key in payload) {
      if (
        key === "ingredients" ||
        key === "instructions" ||
        key === "category" ||
        key === "allergen_information" ||
        key === "dietary_plan"
      ) {
        const striginfiedResult = JSON.stringify(payload[key]);
        formData.append(key, striginfiedResult);
      } else {
        formData.append(key, payload[key]);
      }
    }
    // formData.append("allergen_information", JSON.stringify([]));

    // Appending files here
    // files.forEach(({ file }) => {
    //   if (file) {
    //     formData.append("recipe_images", file);
    //   }
    // });
    if (file?.file) {
      formData.append("recipe_images", file?.file);
    } else if (!file?.file && !file?.preview) {
      formData.append("recipe_images", "");
    } else if (!file?.file && file?.preview) {
      formData.append("recipe_images", file?.preview);
    }
    // Appending files here

    const data = Object.fromEntries(formData.entries()); // Convert to object
    // if receipe id is there in the params means it is a edit scenario
    makeApiRequest({
      endPoint: RECIPE_ENDPOINT,
      payload: formData,
      method: recipeId ? METHODS?.patch : METHODS?.post,
      update_id: recipeId && recipeId,
      instanceType: INSTANCE.formInstance,
    })
      .then(() => {
        toastMessage(
          `Recipe ${recipeId ? "updated" : "added"} successfully`,
          successType
        );
        navigate("/recipe");
      })
      .catch((err) => {
        const titleError = err?.response?.data?.recipe_title?.[0];
        const recipeError = err?.response?.data?.error;
        if (titleError) {
          toastMessage(titleError);
        } else {
          toastMessage(titleError || recipeError || DEFAULT_ERROR_MESSAGE);
        }
      })
      .finally(() => {
        setBtnLoaders({ publish: false, draft: false });
      });
  };
  console.log(formConfig.watch("allergen_information"), "allergen value");
  console.log(file, "this is file");

  const handleAddAllergenOpt = async (opt) => {
    const payload = { name: opt };

    try {
      const res = await makeApiRequest({
        endPoint: "/recipe/allergens/",
        method: METHODS.post,
        payload: payload,
      });

      // Assuming the response contains the newly created allergen
      return { label: opt, value: res?.data?.id || opt };
    } catch (err) {
      console.error("Failed to add allergen:", err);
      return null; // Return null or empty object if the request fails
    }
  };

  return (
    <div>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <div className="flex w-full relative">
          <FormWrapper
            formConfig={formConfig}
            onSubmit={onSubmit}
            isCustomButtons={true}
          >
            <div className="gap-4 w-full">
              <div className="flex gap-4 w-full recipe-wrapper">
                <div className="flex gap-4 w-[calc(100%-420px)] main_side">
                  <div className="w-full">
                    <CommonTextField
                      formConfig={formConfig}
                      label={`${T["recipe_title"]} *`}
                      fieldName="recipe_title"
                      placeholder={T["enter_recipe_title"]}
                      className="px-4 py-2 w-full rounded-lg"
                      labelClassName=""
                      rules={{
                        ...createRequiredValidation("Recipe title"),
                        pattern: {
                          value: SPECIAL_CHARACTERS_REGEX,
                          message: "Special characters are not allowed",
                        },
                      }}
                    />
                    <div className="description mt-4 p-4 rounded-lg bg-white mt-4">
                      <CommonTextEditor
                        label={T["description"]}
                        fieldName="description"
                        formConfig={formConfig}
                        placeholder={`${T["type"]}...`}
                        isRecipe={true}
                        requiredMessage={T["description_required"]} //validations works a bit different in text editor that's why
                      />
                      {/* <div className="max-text text-right mt-2 text-500-[#3E3232]">
                        Max 2500 characters
                      </div> */}
                    </div>

                    <div className="px-4 py-2 rounded-lg bg-white mt-4">
                      <div className="recipe-section-two">
                        <div className="sec-1 flex gap-4 mt-2">
                          <div className="flex-1">
                            <CommonTextField
                              formConfig={formConfig}
                              label={`${T["preparation_time"]} *`}
                              fieldName="preparation_time"
                              placeholder={T["enter_the_prep"]}
                              labelClassName=""
                              className="recipe-input"
                              rules={{
                                ...createRequiredValidation("Preparation time"),
                                ...RecipeValidations["preparation_time"],
                              }}
                              isNumberOnly={true}
                            />
                          </div>
                          <div className="flex-1">
                            <CommonTextField
                              formConfig={formConfig}
                              label={`${T["cook_time_minut"]} *`}
                              fieldName="cook_time"
                              placeholder={T["enter_the_cook_time"]}
                              className="recipe-input"
                              rules={{
                                ...createRequiredValidation("Cook time"),
                                ...RecipeValidations["cook_time"],
                              }}
                              isNumberOnly={true}
                            />
                          </div>
                        </div>

                        <div className="sec-2 mt-2 flex gap-4">
                          <div className="flex-1">
                            <CommonTextField
                              formConfig={formConfig}
                              label={`${T["serving_size"]} *`}
                              fieldName="serving_size"
                              placeholder={T["number_of_servings"]}
                              className="recipe-input"
                              rules={{
                                ...createRequiredValidation("Serving size"),
                                ...RecipeValidations["serving_size"],
                              }}
                              isNumberOnly={true}
                            />
                          </div>
                          <div className="flex-1">
                            <CommonSelect
                              formConfig={formConfig}
                              label={`${T["difficulty_level"]} *`}
                              fieldName="difficulty_level"
                              placeholder={T["select_difficulty_level"]}
                              className="bg-[#e3e3e3] w-full border border-gray-300 rounded-md focus:outline-none"
                              selectType="react-select"
                              options={DIFFICULTY_OPTIONS}
                              rules={createRequiredValidation(
                                "Difficulty level"
                              )}
                              labelClassName="text-[16px] text-[#3E3232] font-[600]"
                            />
                          </div>
                        </div>

                        <div className="ingredients-section mt-4">
                          <CommonFieldArray
                            heading={T["ingredients"]}
                            fieldArrayName="ingredients"
                            formConfig={formConfig}
                            itemToAppend={INGREDIENT_TO_APPEND}
                            items={INGREDIENTS_ITEMS}
                          />
                        </div>
                        <div className="instructions-section mt-4">
                          <CommonFieldArray
                            heading={T["instructions_steps"]}
                            fieldArrayName="instructions"
                            formConfig={formConfig}
                            itemToAppend={INSTRUCTION_TO_APPEND}
                            items={INSTRUCTION_ITEMS}
                          />
                        </div>

                        <div className="dietry-section flex items-center space-x-4 mt-4 flex">
                          <div className="flex-1">
                            <CommonSelect
                              label={T["dietary_information"]}
                              isMulti={true}
                              selectType="creatable"
                              options={DIETRY_OPTIONS}
                              fieldName="dietary_plan"
                              formConfig={formConfig}
                              placeholder={T["select"]}
                            // rules={RecipeValidations["dietary_plan"]}
                            />
                          </div>
                          <div className="flex-1">
                            {/* <CommonSelect
                              label={T["allergen_informations"]}
                              selectType="creatable"
                              options={allergenOptions}
                              fieldName="allergen_information"
                              formConfig={formConfig}
                              placeholder={T["select"]}
                              isMulti={true}
                              // rules={RecipeValidations["allergen_informations"]}
                            /> */}
                            <InfiniteCreatableSelect
                              label={T["allergen_informations"]}
                              options={allergenOptions}
                              fieldName="allergen_information"
                              formConfig={formConfig}
                              handleCreateOption={handleAddAllergenOpt}
                              placeholder={T["select"]}
                              loadMoreOptions={() => { setPage(page + 1) }}
                              isMulti={true}
                              hasMore={hasMore}
                              isLoading={isLoading}
                              setIsLoading={setIsLoading}
                            />

                          </div>
                        </div>
                        <div className="notes mt-4">
                          <CommonTextField
                            formConfig={formConfig}
                            label={T["notes_information"]}
                            fieldName="notes"
                            placeholder={T["any_additional_notes"]}
                            className="recipe-input"
                            rules={RecipeValidations["notes"]}
                            type="textarea"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="button-section flex flex-col gap-4 mt-3 w-[400px] ms-[20px] right_sidebar">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center recipe-btn-wrapper gap-4">
                      <CommonButton
                        type="submit"
                        text={T["publish"]}
                        icon={publishIcon}
                        className="orange_btn w-full justify-center"
                        name="publish"
                        loader={btnLoaders?.publish}
                        disabled={btnLoaders?.publish || btnLoaders?.draft}
                      />
                      <CommonButton
                        type="button"
                        onClick={() => navigate("/recipe")}
                        text={T["cancel"]}
                        // icon={draftIcon}
                        className="orange_btn w-full justify-center"
                        name="draft"
                        // loader={btnLoaders?.draft}
                        disabled={btnLoaders?.publish || btnLoaders?.draft}
                      />
                    </div>
                    <div className="recipe-image-upload">
                      <ImageUploadSection
                        file={file}
                        setFile={setFile}
                        label={T["recipe_image"]}
                        accept={PNG_AND_JPG}
                      />
                    </div>
                  </div>
                </div>
                {/* </form> */}
              </div>
            </div>
          </FormWrapper>
          <div className="recipe-category">
            <CategorySection
              formConfig={formConfig}
              fieldName="category"
              rules={createRequiredValidation("Category")}
            />
          </div>
          <div className="mt-[70px]"></div>
        </div>
      )}
    </div>
  );
};

export default RecipeAddEdit;
