import React, { useEffect, useState } from "react";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PRODUCT_ENDPOINT } from "../api/endpoints";
import { createPreview, formatDate, listCategories } from "../utils/helpers";
import { toastMessage } from "../utils/toastMessage";
import BackButton from "../Components/Common/BackButton";
import { YYYY_MM_DD, PRICE_UNIT } from "../constant";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import { imagePlaceholder } from "../assets/Icons/Svg";

const ViewProduct = () => {
  const location = useLocation();
  const productId = location?.state?.id;
  const navigate = useNavigate();
  const [pageLoader, setPageLoader] = useState(false);
  const [product, setProduct] = useState({});
  useEffect(() => {
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: `${PRODUCT_ENDPOINT}${productId}`,
      method: METHODS.get,
    })
      .then((res) => {
        const data = res?.data;
        console.log(data, "this is data");
        setProduct(data);
      })
      .catch((err) => {
        navigate("/products");
        toastMessage("Invalid Product Id");
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  }, []);
  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <div>
          {" "}
          <BackButton prevRoute={"/products"} />
          <div className="mx-auto p-6 bg-white shadow-lg rounded-lg relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Status Tag */}
              <div className="relative">
                <span
                  className={`absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-lg ${
                    product?.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {product?.is_active ? "Published" : "Draft"}
                </span>

                <h1 className="text-3xl font-bold text-gray-800 capitalize">
                  {product?.name}
                </h1>

                <p className="text-gray-600 text-sm mb-1 capitalize">
                  {product?.category?.length === 1 ? "Category" : "Categories"}:{" "}
                  {listCategories(product?.category)}
                </p>
                {/* Created At / Updated At */}
                <div className="mt-2 text-gray-500 text-xs mb-4">
                  <p>
                    <strong>{T["created_at"]}:</strong>{" "}
                    {formatDate(product?.created_at, YYYY_MM_DD)}
                  </p>
                  <p>
                    <strong>{T["updated_at"]}:</strong>{" "}
                    {formatDate(product?.created_at, YYYY_MM_DD)}
                  </p>
                </div>
                {product?.feature_image?.image ? (
                  <img
                    src={
                      product?.feature_image?.image
                        ? createPreview(product.feature_image.image)
                        : "/path-to-dummy-image.jpg"
                    }
                    alt={product?.name}
                    className="w-full h-72 object-cover rounded-lg"
                  />
                ) : (
                  <div className="product-image-placeholder">
                    {imagePlaceholder}
                  </div>
                )}
              </div>
              <div>
                <h3>Product Description</h3>
                {product?.description ? (
                  <div
                    className="mt-2 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: product?.description }}
                  ></div>
                ) : (
                  ""
                )}
                {/* Inventory Details */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {T["inventory_details"]}
                  </h2>
                  {product?.product_detail?.inventory?.weight ? (
                    <p className="text-sm text-gray-600">
                      {T["weight"]}:{" "}
                      {product?.product_detail?.inventory?.weight}{" "}
                      {product?.product_detail?.inventory?.unit}
                    </p>
                  ) : (
                    ""
                  )}
                  {product?.product_detail?.inventory?.total_quantity ? (
                    <p className="text-sm text-gray-600">
                      {T["stock"]}{" "}
                      {product?.product_detail?.inventory?.total_quantity}
                    </p>
                  ) : (
                    ""
                  )}
                  {product?.product_detail?.inventory?.regular_price ? (
                    <p className="text-sm text-gray-600">
                      {T["regular_price"]}:
                      {product?.product_detail?.inventory?.regular_price}
                    </p>
                  ) : (
                    ""
                  )}

                  {product?.product_detail?.inventory?.sale_price ? (
                    <p className="text-sm text-red-600">
                      {T["sale_price"]}:
                      {product?.product_detail?.inventory?.ale_price}
                    </p>
                  ) : (
                    ""
                  )}
                </div>

                {/* Pricing */}
                <div className="mt-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {T["price"]}:
                    <span className="line-through text-gray-500 ml-2">
                      {product?.product_detail?.inventory?.regular_price
                        ? product?.product_detail?.inventory?.regular_price
                        : "-"}{" "}
                      {PRICE_UNIT}
                    </span>
                    <span className="text-red-600 ml-2">
                      {product?.product_detail?.inventory?.sale_price
                        ? product?.product_detail?.inventory?.sale_price
                        : ""}{" "}
                      {PRICE_UNIT}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Variants */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {T["variants"]}:
              </h2>
              <ul className="mt-2 grid grid-cols-2 gap-4 items-start">
                {product?.product_detail?.variants?.length
                  ? product?.product_detail?.variants.map((variant) => (
                      <li
                        key={variant?.sku}
                        className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
                      >
                        <div>
                          {variant?.name ? (
                            <p className="font-medium text-gray-700 capitalize">
                              {variant?.name}
                            </p>
                          ) : (
                            ""
                          )}
                          {variant?.inventory?.weight ? (
                            <p className="text-sm text-gray-500">
                              {T["weight"]}: {variant?.inventory?.weight}{" "}
                            </p>
                          ) : (
                            ""
                          )}
                          {variant?.inventory?.total_quantity ? (
                            <p className="text-sm text-gray-500">
                              {T["stock"]}: {variant?.inventory?.total_quantity}
                            </p>
                          ) : (
                            ""
                          )}

                          <p className="text-sm text-gray-500">
                            {T["backdoor_allowed"]}:{" "}
                            {variant?.allow_backorders === "allow"
                              ? "Allowed"
                              : "Not Allowed"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {variant?.inventory?.sale_price_dates_from &&
                            variant?.inventory?.sale_price_dates_to ? (
                              <>
                                {T["sale_price_duration"]}:{" "}
                                {variant?.inventory?.sale_price_dates_from} to{" "}
                                {variant?.inventory?.sale_price_dates_to}
                              </>
                            ) : (
                              ""
                            )}
                          </p>
                        </div>
                        {variant?.inventory?.sale_price ? (
                          <p className="text-red-600 font-semibold">
                            {variant?.inventory?.sale_price} {PRICE_UNIT}
                          </p>
                        ) : (
                          ""
                        )}
                      </li>
                    ))
                  : ""}
              </ul>
            </div>

            {/* Advanced Data */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                {T["advanced_details"]}
              </h2>
              <p className="text-sm text-gray-600">
                <strong>{T["purchase_note"]}:</strong>{" "}
                {product?.advanced?.purchase_note ?? "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{T["min_order_quantity"]}:</strong>{" "}
                {product?.advanced?.min_order_quantity ?? "N/A"}
              </p>
            </div>

            {/* SEO Metadata */}
            <div className="mt-6 text-gray-500 text-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                {T["seo_details"]}
              </h2>
              <p>
                <strong>{T["seo_title"]}:</strong>{" "}
                {product?.product_seo?.seo_title}
              </p>
              <p>
                <strong>{T["meta_description"]}:</strong>{" "}
                {product?.product_seo?.meta_description}
              </p>
              <p>
                <strong>{T["focused_keywords"]}:</strong>{" "}
                {product?.product_seo?.focused_keyword?.join(", ")}
              </p>
              <p>
                <strong>{T["slug"]}:</strong> {product?.product_seo?.slug}
              </p>
              <p>
                <strong>{T["product_tags"]}:</strong>{" "}
                {product?.product_tag?.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewProduct;
