import React, { useEffect, useState } from "react";
import { INSTANCE, makeApiRequest, METHODS } from "../api/apiFunctions";
import { CATEGORIES_ENDPOINT } from "../api/endpoints";
import AddEditCategorySection from "./AddEditCategorySection";
import { useForm } from "react-hook-form";
import ErrorMessage from "./Common/ErrorMessage";
import { successType, toastMessage } from "../utils/toastMessage";
import { DEFAULT_ERROR_MESSAGE } from "../constant";
import { T } from "../utils/languageTranslator";
import InfiniteScroll from "react-infinite-scroll-component";
import usePagination from "../hooks/usePagination";

const CategorySection = ({
  formConfig,
  fieldName,
  rules,
  isViewOnly = false,
  isProduct = false,
}) => {
  const { page, setPage } = usePagination();
  const [file, setFile] = useState();
  const [hasMore, setHasMore] = useState(true);
  const {
    register,
    formState: { errors },
  } = formConfig;
  console.log(errors,"these are errors")
  const categoryFormConfig = useForm();
  const { reset } = categoryFormConfig;
  const [categories, setCategories] = useState([]);
  const [showCategoryAddSection, setShowCateoryAddSection] = useState(false);
  const [btnLoaders, setBtnLoaders] = useState({
    publish: false,
    draft: false,
  });
  const editCategoryInfo = { isEdit: false, editItem: null };
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = (params = {}) => {
    makeApiRequest({
      endPoint: CATEGORIES_ENDPOINT,
      method: METHODS.get,
      params: params,
    })
      .then((res) => {
        setCategories(res?.data?.results);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleButtonLoaders = (type) => {
    setBtnLoaders({ ...btnLoaders, [type]: !btnLoaders[type] });
  };

  const handleAddCategory = (values, event) => {
    const buttonType = event.nativeEvent.submitter.name;

    handleButtonLoaders(buttonType);
    // const payload = {
    //   ...values,
    //   is_active: buttonType === "publish",
    // };
    const payload = {
      name: values.name,
      slug: values.slug,
      // category_image: file.file,
      description: values.description,
      is_active: buttonType === "publish",
    };
    delete payload.image;
    // converting payload into form data
    const formData = new FormData();

    for (let key in payload) {
      formData.append(key, payload[key]);
    }
    // appending file
    if (file?.file) {
      formData.append("category_image", file.file);
    }

    const data = Object.fromEntries(formData.entries()); // Convert to object
    makeApiRequest({
      endPoint: CATEGORIES_ENDPOINT,
      method: METHODS?.post,
      payload: formData,
      instanceType: INSTANCE.formInstance,
      // payload: payload,
    })
      .then((res) => {
        setCategories((prev) => [...prev, res?.data]);
        setBtnLoaders({ publish: false });
        toastMessage(`Category added sucessfully`, successType);
        setShowCateoryAddSection(false);
        reset();
        setPage(1);
        setFile(null);
      })
      .catch((err) => {
        const fieldError =
          err?.response?.data?.name?.[0] || err?.response?.data?.slug?.[0];
        if (fieldError) {
          toastMessage(fieldError);
        } else {
          toastMessage(DEFAULT_ERROR_MESSAGE);
          setShowCateoryAddSection(false);
          reset();
          setFile(null);
        }
        setBtnLoaders({ publish: false });
      });
  };
  const fetchMoreData = () => {
    const params = {
      page: page + 1,
    };
    makeApiRequest({
      endPoint: CATEGORIES_ENDPOINT,
      method: METHODS.get,
      params: params,
    })
      .then((res) => {
        const newData = res?.data?.results;
        if (newData.length === 0) {
          setHasMore(false);
        } else {
          setCategories((prevItems) => [...prevItems, ...newData]);
          setPage((prev) => prev + 1);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <div className={` ${errors?.[fieldName]?.message ? "error-class" : ""} category-container p-4 w-full product-data-section`}>
        <div className="category-heading">
          <h5>{T["categories"]}</h5>
          {!isViewOnly  && (
            <span
              onClick={() => {
                setShowCateoryAddSection(true);
              }}
              className="text-[#FF6D2F]"
            >
              {`+${T["add"]}`}
            </span>
          )}
        </div>
        <div className="catgoryListing mt-4 ">
          {categories?.length > 0 ? (
            <InfiniteScroll
              dataLength={categories?.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<h4>Loading...</h4>}
              endMessage={<p style={{ textAlign: "center" }}></p>}
            >
              {categories.map(({ id, name }, index) => {
                return (
                  <label
                    key={index}
                    className="flex items-center gap-2 capitalize cursor-pointer"
                  >
                    <input
                      {...register(fieldName, rules)}
                      type="checkbox"
                      disabled={isViewOnly}
                      value={id}
                    />
                    {name}
                  </label>
                );
              })}
            </InfiniteScroll>
          ) : (
            <div>No categories yet</div>
          )}
        </div>
      </div>
      <div className="mb-4">
      <ErrorMessage customError={errors?.[fieldName]?.message} />

      </div>

      {showCategoryAddSection && (
        <AddEditCategorySection
          onClose={() => {
            setShowCateoryAddSection(false);
            handleReset();
          }}
          onSubmit={handleAddCategory}
          formConfig={categoryFormConfig}
          file={file}
          fromRecipe={true}
          setFile={setFile}
          btnLoaders={btnLoaders}
          editCategoryInfo={editCategoryInfo}
        />
      )}
    </div>
  );
};

export default CategorySection;
