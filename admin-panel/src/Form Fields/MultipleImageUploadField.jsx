import React from "react";
import { closeIcon, imageUploadIcon } from "../assets/Icons/Svg";
import ErrorMessage from "../Components/Common/ErrorMessage";
import { isValidType } from "../utils/helpers";
import { Controller } from "react-hook-form";

const MultipleImageUploadField = ({
  label,
  files,
  setFiles,
  allowedTypes,
  imageError,
  setImageError,
  uploadButton,
  accept = "image/*",
  disabled = false,
}) => {
  const inputId = `image-upload-${label}`;

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    // add maximum file limit here
    if (files.length + newFiles.length <= 5) {
      newFiles.forEach((file, index) => {
        if (isValidType(file, allowedTypes)) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const itemToAppend = {
              preview: event.target.result,
              file: file,
            };
            setFiles([...files, itemToAppend]);
            setImageError("");
          };
          reader.readAsDataURL(file);
        } else {
          const itemToAppend = {
            file: null,
            preview: "",
          };
          setImageError("Please upload a valid image");
          setFiles([...files, itemToAppend]);
        }
      });
    } else {
      setImageError("At most 5 images can be added");
    }

    e.target.value = ""; // Clear input to allow re-uploading same files
  };

  const removeImage = (index) => {
    if (files?.length === 5) {
      setImageError("");
    }
    setFiles((prev) => prev.filter((curElem, idx) => idx !== index));
  };
  console.log(imageError, "imageError");
console.log(disabled,'diskejdked')
  return (
    <div className="product-data-section p-3 bg-white">
      <div className="label">{label}</div>
      <div className="upload_img_div">
        {!disabled ? (
          <label htmlFor={inputId} className={uploadButton?.class}>
            {imageUploadIcon}
            {uploadButton?.text}
          </label>
        ) : (
          ""
        )}
      </div>
      <input
        onChange={(e) => handleImageUpload(e)}
        type="file"
        id={inputId}
        className="hidden"
        accept={accept}
        multiple={true}
      />
      {files?.length ? (
        <div className="image-preview w-full !border-0 grid grid-cols-4 gap-4">
          {files?.map(
            ({ preview, file }, index) =>
              (file || preview) && (
                <div key={index} className="image-preview-wrapper">
                  <img
                    className="image-preview"
                    src={preview}
                    //   alt={`preview-${index}`}
                  />
                  {!disabled ? (
                    <div
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      {closeIcon}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )
          )}
        </div>
      ) : (
        ""
      )}

      {/* need to update this logic */}
      <ErrorMessage customError={imageError} />
    </div>
  );
};

export default MultipleImageUploadField;
