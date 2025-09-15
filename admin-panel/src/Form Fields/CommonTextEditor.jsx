import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ErrorMessage from "../Components/Common/ErrorMessage";
import { stripHtmlTags } from "../utils/helpers";

const defaultToolBar = [
  [{ header: [1, 2, 3, false] }], // Dropdown for H1, H2, H3, and Paragraph
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  // [{ color: [] }, { background: [] }], // Add color and background color
  // [{ align: [] }],
  ["link"],
  //   ["link", "image", "code-block"],
  // ["clean"], // remove formatting button
];

const CommonTextEditor = ({
  placeholder = "",
  className = "",
  toolbarOptions = defaultToolBar,
  formConfig,
  rules,
  fieldName,
  requiredMessage,
  label,
  disabled = false,
  isRecipe = false,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
  } = formConfig;
  const descriptionRef = useRef(null);
  const handleDescriptionText = (html) => {
    if (descriptionRef?.current) {
      const editor = descriptionRef.current.getEditor();
      const plainText = stripHtmlTags(html);

      if (plainText.length <= 2500) {
        setValue(fieldName, editor.root.innerHTML);
      } else {
        const excessCharacters = plainText.length - 2500;
        editor.deleteText(2500, excessCharacters);
        setValue(fieldName, editor.root.innerHTML);
      }
    }
  };
  return (
    <div>
      <label className="text-[16px] text-[#3E3232] font-[600]">
        {label} {requiredMessage && "*"}
      </label>
      <Controller
        control={control}
        name={fieldName}
        rules={{
          ...rules,
          validate: (value) => {
            const isEmpty =
              value === "" || value === "<p><br></p>" || value === undefined;
            return isEmpty && requiredMessage ? requiredMessage : true;
          },
        }}
        render={({ field }) => (
          <>
            {/* {isRecipe ? (
              <ReactQuill
                {...field}
                ref={descriptionRef}
                placeholder={placeholder}
                className={className}
                readOnly={disabled}
                theme="snow"
                modules={{ toolbar: toolbarOptions }}
                onChange={(html) => {
                  handleDescriptionText(html);
                }}
              />
            ) : (
              <ReactQuill
                {...field}
                ref={descriptionRef}
                placeholder={placeholder}
                className={className}
                readOnly={disabled}
                theme="snow"
                modules={{ toolbar: toolbarOptions }}
              />
              
            )} */}
            <ReactQuill
              {...field}
              ref={descriptionRef}
              placeholder={placeholder}
              className={className}
              readOnly={disabled}
              theme="snow"
              modules={{ toolbar: toolbarOptions }}
            />
          </>
        )}
      />
      <ErrorMessage errors={errors} fieldName={fieldName} />
    </div>
  );
};

export default CommonTextEditor;
