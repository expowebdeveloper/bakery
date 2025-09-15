import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CommonTextEditor from "../Form Fields/CommonTextEditor";
import RadioGroup from "../Form Fields/RadioGroup";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonTextField from "../Form Fields/CommonTextField";
import {
  convertValuesIntoLabelAndValue,
  createAdvancedPayload,
  createInventoryPayload,
  createPreview,
  createProductSeo,
  createRequiredValidation,
  createVariantPayload,
  createVariantsData,
  extractOption,
  extractSelectOptions,
  generateSlug,
  handleCategory,
  prefillFormValues,
} from "../utils/helpers";
import CommonButton from "../Components/Common/CommonButton";
import { draftIcon, pencilIcon, publishIcon } from "../assets/Icons/Svg";
import ProductDataSection from "../Components/ProductDataSection";
import CategorySection from "../Components/CategorySection";
import ImageUploadSection from "../Form Fields/ImageUploadSection";
import {
  allowedImageTypes,
  DEFAULT_ERROR_MESSAGE,
  MEASURE_OPTIONS,
  PNG_AND_JPG,
} from "../constant";
import {
  generateSku,
  INSTANCE,
  makeApiRequest,
  METHODS,
} from "../api/apiFunctions";
import { PRODUCT_ENDPOINT } from "../api/endpoints";
import { successType, toastMessage } from "../utils/toastMessage";
import { useLocation, useNavigate } from "react-router-dom";
import { SPECIAL_CHARACTERS_REGEX } from "../regex/regex";
import MultipleImageUploadField from "../Form Fields/MultipleImageUploadField";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import BackButton from "../Components/Common/BackButton";
import Checkbox from "../Form Fields/Checkbox";
import ErrorMessage from "../Components/Common/ErrorMessage";
const options = [
  { label: "option1", value: "options1" },
  { label: "option2", value: "options2" },
  { label: "option3", value: "options3" },
  { label: "option4", value: "options4" },
];
const PRODUCT_TAG_OPTIONS = [{ label: "Hot Deals", value: "hot-deals" }];
const DEFAULT_BULKING_PRICE = [
  {
    quantity_from: null,
    quantity_to: null,
    price: "",
  },
];

const DEFAULT_VARIANTS_DATA = [
  {
    sku: "",
    regular_price: "",
    sale_price: "",
    sale_price_dates_from: "",
    sale_price_dates_to: "",
    quantity: null,
    weight: "",
    unit: "",
    enabled: false,
    managed_stock: false,
    allow_backorders: "",
    description: "",
  },
];

const PREVIEW_AS_OPTIONS = [
  { value: "desktop", label: T["desktop_result"] },
  { value: "mobile", label: T["mobile_result"] },
];
const AddEditProduct = () => {
  const location = useLocation();
  const editId = location?.state?.id;
  const isViewOnly = location?.state?.isViewOnly;
  const { pageLoader, toggleLoader } = useLoader();
  const navigate = useNavigate();
  const formConfig = useForm({
    defaultValues: {
      bulking_price_rules: DEFAULT_BULKING_PRICE,
      preview_as: "desktop",
      variants: DEFAULT_VARIANTS_DATA,
    },
    mode: "onChange",
    shouldUnregister: false,
  });
  const { watch, trigger, setValue, handleSubmit,formState:{errors} } = formConfig;
  const [activeTab, setActiveTab] = useState("inventory");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productImageError, setProductImageError] = useState([]);
  const [snippetInfo, setSnippetInfo] = useState({
    seo_title: "",
    slug: "",
    meta_description: "",
  });
  const [btnLoaders, setBtnLoaders] = useState({
    publish: false,
    draft: false,
  });
  const [isSnippetEdit, setIsSnippetEdit] = useState(false);
  const [showDateSection, setShowDateSection] = useState(false);

  useEffect(() => {
    if (editId) {
      toggleLoader("pageLoader");
      makeApiRequest({
        endPoint: `${PRODUCT_ENDPOINT}${editId}`,
        method: METHODS.get,
      })
        .then((res) => {
          // value =true,state=true
          const data = res?.data;
          const saleDate = data?.product_detail?.inventory;
          if (
            saleDate?.sale_price_dates_from &&
            saleDate?.sale_price_dates_to
          ) {
            setShowDateSection(true);
          } else {
            setShowDateSection(false);
          }
          console.log(data, "dataaaa");
          // Setting seo snippet section
          const seoSnippetData = {
            seo_title: data?.product_seo?.seo_title,
            slug: data?.product_seo?.slug,
            meta_description: data?.product_seo?.meta_description,
          };
          setSnippetInfo(seoSnippetData);
          // for directly prefilling form values

          // for name and desription
          const prefillKeys = ["name", "description", "hot_deal"];
          prefillFormValues(data, prefillKeys, setValue);
          // for name and desription
          // for seo section
          const seoKeys = [
            "meta_description",
            "preview_as",
            "seo_title",
            "slug",
          ];
          prefillFormValues(data?.product_seo, seoKeys, setValue);
          setValue("category", handleCategory(data?.category));
          // for seo section

          // for categories section
          setValue(
            "focused_keyword",
            convertValuesIntoLabelAndValue(data?.product_seo?.focused_keyword)
          );
          // for categories section

          // for advanced tab
          const advanceTabKeys = ["purchase_note", "min_order_quantity"];
          prefillFormValues(
            data?.product_detail?.advanced,
            advanceTabKeys,
            setValue
          );

          // for advanced tab

          // for inventory
          const inventoryKeys = [
            "regular_price",
            "sale_price",
            "sale_price_dates_from",
            "sale_price_dates_to",
            "sku",
            "weight",
            "bulking_price_rules",
          ];
          prefillFormValues(
            data?.product_detail?.inventory,
            inventoryKeys,
            setValue
          );
          setValue(
            "unit",
            extractOption(
              MEASURE_OPTIONS,
              data?.product_detail?.inventory?.unit,
              "value"
            )
          );
          // for inventory
          // for prefilling form values with custom logic
          setValue(
            "product_tag",
            convertValuesIntoLabelAndValue(data?.product_tag)
          );
          // for variants
          if (data?.product_detail?.variants?.length) {
            const variantsData = createVariantsData(
              data?.product_detail?.variants
            );
            setValue("variants", variantsData);
          } else {
            setValue("variants", DEFAULT_VARIANTS_DATA);
          }
          // for variants
          // for filling images
          if (data?.feature_image) {
            let preview = createPreview(data?.feature_image?.image);
            const result = { file: null, preview: preview, error: null };
            setFeaturedImage(result);
          }
          if (data?.images?.length) {
            let result = [];
            const product_images = data.images;
            product_images?.forEach((img) => {
              const preview = createPreview(img?.image);
              const item = { preview: preview, error: null, file: null };
              result.push(item);
            });
            setProductImages(result);
          }
          // for filling images
        })
        .catch((err) => {
          toastMessage(T["invalid_product_id"]);
          navigate("/products");
        })
        .finally(() => {
          toggleLoader("pageLoader");
        });
    }
  }, [editId]);
  const onSubmit = (values, event) => {
    const buttonType = event.nativeEvent.submitter.name;
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });
    const payload = {
      name: values?.name,
      status: buttonType === "publish",
      description: values?.description,
      product_tag: extractSelectOptions(values?.product_tag, "value"),
      hot_deal: values?.hot_deal,
      category: Array.isArray(values?.category)
        ? values?.category?.map(Number)
        : [values?.category],
      product_seo: createProductSeo(values),
      product_detail: {
        inventory: createInventoryPayload(values),
        variants: createVariantPayload(values),
        advanced: createAdvancedPayload(values),
      },
    };

    // converting payload in form data

    const formData = new FormData();
    for (let key in payload) {
      if (
        key === "product_tag" ||
        key === "product_seo" ||
        key === "product_detail" ||
        key === "category"
      ) {
        const striginfiedResult = JSON.stringify(payload[key]);
        formData.append(key, striginfiedResult);
      } else {
        formData.append(key, payload[key]);
      }
    }

    // appending files
    if (featuredImage?.file) {
      formData.append("feature_image", featuredImage?.file);
    }

    productImages?.forEach((productImage) => {
      if (productImage?.file) {
        formData.append("images", productImage.file);
      }
    });

    const data = Object.fromEntries(formData.entries()); // Convert to object
    // api call
    makeApiRequest({
      endPoint: PRODUCT_ENDPOINT,
      method: editId ? METHODS.patch : METHODS.post,
      payload: formData,
      instanceType: INSTANCE.formInstance,
      update_id: editId,
    })
      .then((res) => {
        toastMessage(
          `Product ${editId ? "Updated" : "Created"} Successfully`,
          successType
        );
        setBtnLoaders({ publish: false, draft: false });
        navigate("/products");
      })
      .catch((err) => {
        console.log(err,"product err");
        const error = err?.response?.data?.name || err?.response?.data?.sku || err?.response?.data?.[0];
        toastMessage(error || DEFAULT_ERROR_MESSAGE);
        setBtnLoaders({ publish: false, draft: false });
      });
  };
  const handleActiveTab = async (tabName) => {
    setActiveTab(tabName);
  };

  const beforeSubmit = async (e) => {
    e.preventDefault();
    // const inventoryFields = [
    //   "sale_price_dates_from",
    //   "sale_price_dates_to",
    //   "weight",
    //   "unit",
    //   "sku",
    //   "sale_price",
    //   "regular_price",
    //   "bulking_price_rules",
    // ];
    // // Use map to create an array of promises
    // const validations = await Promise.all(
    //   inventoryFields.map((field) => trigger(field))
    // );

    // const isInventoryTabComplete = validations.every((it) => it === true);
    // const isVariantTabComplete = await trigger("variants");
    // if (!isInventoryTabComplete && activeTab !== "inventory") {
    //   setActiveTab("inventory");
    // } else if (!isVariantTabComplete && activeTab !== "") {
    //   setActiveTab("variations");
    // }
    // const isValid = await trigger();
    // console.log(isValid, "inside before submit and isvalid");
    if (true) {
      handleSubmit((values, event) => {
        onSubmit(values, event);
      })(e);
    }
  };
  const onCreateSlug = () => {
    const name = watch("seo_title");
    if (name) {
      const slug = generateSlug(name);
      setValue("slug", slug, { shouldValidate: true });
    }
  };
  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <>
          <BackButton prevRoute={"/products"} />
          <div className="flex mt-4 w-full relative">
            <form
              onSubmit={beforeSubmit}
              className="w-full flex xl:flex-row flex-col"
            >
              <div className="flex gap-4 w-[calc(100%-420px)] main_side">
                <div className="flex-1">
                  <div className="product-info-section mb-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <CommonTextField
                          fieldName="name"
                          label={`${T["product_name"]} *`}
                          rules={{
                            ...createRequiredValidation("Product name"),
                            pattern: {
                              value: SPECIAL_CHARACTERS_REGEX,
                              message: "Special characters are not allowed",
                            },
                          }}
                          placeholder={T["product_names"]}
                          formConfig={formConfig}
                          disabled={isViewOnly}
                          className="px-4 py-2 bg-white w-full text-sm outline-[#333] rounded-lg transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <CommonSelect
                          fieldName="product_tag"
                          selectType="creatable"
                          disabled={isViewOnly}
                          rules={createRequiredValidation(
                            null,
                            "Product tags are required"
                          )}
                          options={PRODUCT_TAG_OPTIONS}
                          isMulti={true}
                          formConfig={formConfig}
                          label={`${T["product_tags"]} *`}
                          placeholder={T["select_tags"]}
                          className="mt-2 border-1 border-solid border-black-500 rounded"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="description mt-4 p-4 rounded-lg bg-white my-4">
                    <CommonTextEditor
                      formConfig={formConfig}
                      disabled={isViewOnly}
                      label={`${T["description"]} `}
                      fieldName="description"
                      placeholder={`${T["type"]}...`}
                      // rules={} // for this required validation cannot be passed through rules because it has some different way to handle required validation
                      requiredMessage={"Description is required"} // if this prop is not passed required validation is not applied
                    />
                    <div className="flex items-center mt-4">
                      <label className={` text-gray-700 text-sm mr-2`}>
                        {T["mark_as_hot_deal"]}
                      </label>
                      <input
                        type="checkbox"
                        {...formConfig?.register("hot_deal")}
                        className={`w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 mr-2`}
                      />

                    </div>
                  </div>

                  <ProductDataSection
                    showDateSection={showDateSection}
                    setShowDateSection={setShowDateSection}
                    formConfig={formConfig}
                    disabled={isViewOnly}
                    activeTab={activeTab}
                    handleActiveTab={handleActiveTab}
                  />
                  <div className="seo-section mt-4 bg-white p-4 rounded-lg">
                    <div className="w-full max-w-[800px]">
                      <h5 className="text-black font-medium">SEO</h5>
                      <CommonSelect
                        fieldName="focused_keyword"
                        disabled={isViewOnly}
                        selectType="creatable"
                        // options={PRODUCT_TAG_OPTIONS}
                        isMulti={true}
                        rules={createRequiredValidation()}
                        formConfig={formConfig}
                        label={T["focus_keyphrase"]}
                        placeholder={T["enter_focus"]}
                        className="mt-2 border-2 border-solid border-black-500 rounded"
                      />{" "}
                      <div className="flex gap-8 mt-4">
                        <div>{`${T["preview_as"]}:`}</div>
                        <RadioGroup
                          fieldName="preview_as"
                          disabled={isViewOnly}
                          formConfig={formConfig}
                          options={PREVIEW_AS_OPTIONS}
                          className="flex gap-4"
                        // rules={createRequiredValidation()}
                        />
                      </div>
                      <div
                        className="snippet mb-4"
                        style={{
                          width: watch("preview_as") === "mobile" && "50%",
                        }}
                      >
                        {/* update required: need to integrate this section */}
                        <div className="border p-4 space-y-2 rounded-lg mt-4 shadow-md">
                          <div className="text-black">
                            {snippetInfo?.seo_title || T["title"]}
                          </div>
                          {/* <div className="text-[#FF6D2F] !mt-0">
                            {snippetInfo?.slug || T["slug"]}
                          </div> */}
                          <div className="text-[#666666]">
                            {snippetInfo?.meta_description ||
                              T["meta_description"]}
                          </div>
                        </div>
                        {!isSnippetEdit && !isViewOnly && (
                          <CommonButton
                            text={T["edit_snippet"]}
                            onClick={() => {
                              setIsSnippetEdit(true);
                            }}
                            icon={pencilIcon}
                            type="button"
                            disabled={isViewOnly}
                            className="buttonTwo bg-[#FF6D2F] flex px-4 py-2 rounded-lg mt-4 gap-4 text-white items-center"
                          />
                        )}
                      </div>
                      <CommonTextField
                        fieldName="seo_title"
                        disabled={isViewOnly || !isSnippetEdit}
                        label={`${T["seo_title"]} *`}
                        rules={{
                          ...createRequiredValidation("SEO title"),
                          pattern: {
                            value: SPECIAL_CHARACTERS_REGEX,
                            message: "Special characters are not allowed",
                          },
                        }}
                        placeholder={T["enter_seo_title"]}
                        formConfig={formConfig}
                        maxlength={60}
                        className="w-full p-2 rounded-lg mt-2 bg-[#F5F5F5]"
                      />
                      <div className="max-limit">{T["max60_characters"]}</div>
                      {/* <CommonTextField
                        fieldName="slug"
                        label={`${T["slug"]} *`}
                        disabled={isViewOnly || !isSnippetEdit}
                        rules={createRequiredValidation("Slug")}
                        placeholder={T["enter_page_slug"]}
                        formConfig={formConfig}
                        onCreateSlug={onCreateSlug}
                        showSlug={watch("seo_title") && isSnippetEdit}
                        className="px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm outline-[#333] rounded-lg transition-all my-2"
                      /> */}
                      <div></div>
                      <CommonTextField
                        fieldName="meta_description"
                        disabled={isViewOnly || !isSnippetEdit}
                        label={T["meta_description"]}
                        // rules={createRequiredValidation("Meta Description")}
                        placeholder={T["enter_meta_description"]}
                        formConfig={formConfig}
                        type="textarea"
                        rows={4}
                        maxlength={250}
                        className="w-full p-2 rounded-lg mt-2 bg-[#F5F5F5]"
                      />
                      <div className="max-limit">{T["max160_characters"]}</div>
                      {isSnippetEdit && !isViewOnly && (
                        <CommonButton
                          text="Update Snippet"
                          onClick={() => {
                            setIsSnippetEdit(false);
                            setSnippetInfo({
                              seo_title: watch("seo_title"),
                              // slug: watch("slug"),
                              meta_description: watch("meta_description"),
                            });
                          }}
                          type="button"
                          className="updateSnippet"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-3 w-[400px] ms-[20px] right_sidebar">
                <div className="flex flex-col gap-3">
                  {/* side section */}
                  <div className="flex flex-col w-full">
                    <div className="button-section flex justify-center w-full">
                      <CommonButton
                        text={T["publish"]}
                        name="publish"
                        type="submit"
                        className="orange_btn w-full justify-center"
                        loader={btnLoaders?.publish}
                        disabled={
                          btnLoaders?.publish || btnLoaders?.draft || isViewOnly
                        }
                        icon={publishIcon}
                      />
                      <CommonButton
                        text={T["draft"]}
                        name="draft"
                        type="submit"
                        className="orange_btn w-full justify-center"
                        icon={draftIcon}
                        loader={btnLoaders?.draft}
                        disabled={
                          btnLoaders?.publish || btnLoaders?.draft || isViewOnly
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 flex-col">
                    <div className={`add-feature-image ${(errors?.["category"]?.message) ? "error-class":""}`}>
                      <ImageUploadSection
                        file={featuredImage}
                        setFile={setFeaturedImage}
                        label={T["featured_image"]}
                        uniqueId={`featured-image`}
                        accept={PNG_AND_JPG}
                        disabled={isViewOnly}
                        sizeLimit={5}
                      />
                    </div>{" "}
                    <MultipleImageUploadField
                      files={productImages}
                      setFiles={setProductImages}
                      label={T["product_images"]}
                      allowedTypes={allowedImageTypes}
                      imageError={productImageError}
                      setImageError={setProductImageError}
                      uniqueId={`product-image`}
                      accept={PNG_AND_JPG}
                      uploadButton={{
                        text: T["upload_product_image"],
                        class: "image-upload-icon cursor-pointer",
                      }}
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              </div>
            </form>
            <div className="add-category-product">
              <CategorySection
                isViewOnly={isViewOnly}
                formConfig={formConfig}
                fieldName="category"
                rules={createRequiredValidation("Category")}
                className="w-full"
                isProduct={true}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddEditProduct;
