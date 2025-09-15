import React, { useEffect, useState } from "react";
import FormWrapper from "../Wrappers/FormWrapper";
import { draftIcon, publishIcon } from "../assets/Icons/Svg";
import AddEditSectionHeading from "./AddEditSectionHeading";
import CommonTextField from "../Form Fields/CommonTextField";
import { CategoryValidations } from "../Validations/validations";
import CommonSelect from "../Form Fields/CommonSelect";
import ImageUploadSection from "../Form Fields/ImageUploadSection";
import { allowedImageTypes, PNG, PNG_AND_JPG, PNG_TYPE } from "../constant";
import {
  convertIntoSelectOptions,
  createPreview,
  extractOption,
  generateSlug,
  prefillFormValues,
} from "../utils/helpers";
import CommonButton from "./Common/CommonButton";
const PARENT_CATEGORY_OPTIONS = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const keysToPrefill = ["name", "description", "parent_count", "slug"];

const AddEditCategorySection = ({
  onClose,
  formConfig,
  onSubmit,
  editCategoryInfo,
  file,
  setFile,
  btnLoaders,
  fromRecipe = false,
  categories = null,
}) => {
  const { setValue, watch } = formConfig;
  const { isEdit, item, type } = editCategoryInfo;
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    if (isEdit) {
      // function for prefilling normal values
      prefillFormValues(item, keysToPrefill, setValue);
      // for handling custom prefilling logic
      // setValue("image", imagePreview);
      if (item?.category_image) {
        setFile({ preview: createPreview(item?.category_image), file: null });
      }
      const category = extractOption(categories, item?.parent?.id, "id");
      if (category) {
        setValue("parent", { label: category?.name, value: category?.id });
      }
    }
  }, []);

  useEffect(() => {
    const categoryOptions = [];
    if (categories && categories?.length) {
      const temp = convertIntoSelectOptions(categories, "name", "id");
      setCategoryOptions(temp);
    }
  }, [categories]);

  const shouldShowParentCategoryField = () => {
    return !fromRecipe && categories?.length;
  };
  const renderHeading = () => {
    if (isEdit) {
      return `Edit ${type === "category" ? "Category" : "Subcategory"}`;
    } else {
      return shouldShowParentCategoryField()
        ? "Add Category/SubCategory"
        : "Add Category";
    }
  };
  const onCreateSlug = () => {
    const name = watch("name");
    if (name) {
      const slug = generateSlug(name);
      setValue("slug", slug, { shouldValidate: true });
    }
  };
  return (
    // update required: Update this from modal to section according to the figma
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="category-section overflow-auto">
        <AddEditSectionHeading onClose={onClose} text={renderHeading()} />
        {/* here custom logic is required that's why not using form wrapper */}

        <FormWrapper
          onSubmit={onSubmit}
          formConfig={formConfig}
          className="orange_btn"
          // wrapperClass="scroll"
          isCustomButtons={true}
        >
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}{" "}
          <CommonTextField
            label="Title *"
            fieldName="name"
            formConfig={formConfig}
            className="add-edit-input"
            rules={CategoryValidations["name"]}
            placeholder="Enter Title"
          />
          {/* <CommonTextField
            label="Slug *"
            fieldName="slug"
            formConfig={formConfig}
            rules={CategoryValidations["slug"]}
            className="add-edit-input"
            placeholder="Enter Slug e.g (BRE-8700)"
            onCreateSlug={onCreateSlug}
            showSlug={watch("name")}
          /> */}
          {/* update this field according to the API */}
          {shouldShowParentCategoryField() ? (
            <CommonSelect
              selectType="react-select"
              options={categoryOptions}
              rules={CategoryValidations["parent"]}
              fieldName="parent"
              // defaultOption="Select Parent Category"
              formConfig={formConfig}
              // className="add-edit-input"
              label="Parent Category"
              placeholder="Select Parent Category"
            />
          ) : (
            ""
          )}
          <CommonTextField
            label="Description"
            fieldName="description"
            formConfig={formConfig}
            className="add-edit-input"
            rules={CategoryValidations["description"]}
            placeholder="Enter Description"
            rows={4}
            type="textarea"
          />
          <ImageUploadSection
            label="Upload/Add Image"
            formConfig={formConfig}
            fieldName="category_image"
            file={file}
            setFile={setFile}
            allowedTypes={PNG_TYPE}
            uniqueId={"cat-img"}
            accept={PNG}
            invalidTypeError="Please upload a PNG image"
          />
          {!fromRecipe ? (
            <div className="button-section mt-3">
              <CommonButton
                type="submit"
                text="Publish"
                className="orange_btn"
                icon={publishIcon}
                name="publish"
                loader={btnLoaders?.publish}
                disabled={btnLoaders?.publish || btnLoaders?.publish}
              />

              <CommonButton
                type="submit"
                text="Draft"
                className="orange_btn"
                icon={draftIcon}
                name="draft"
                loader={btnLoaders?.draft}
                disabled={btnLoaders?.publish || btnLoaders?.publish}
              />
            </div>
          ) : (
            <CommonButton
              type="submit"
              text="Add category"
              className="orange_btn"
              icon={publishIcon}
              name="publish"
              loader={btnLoaders?.publish}
              disabled={btnLoaders?.publish}
            />
          )}
          {/* </form> */}
        </FormWrapper>
      </div>
    </div>
  );
};

export default AddEditCategorySection;
