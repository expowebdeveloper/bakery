import React, { useState } from "react";
import { checkedIconWhite, copyToClipboardIconWhite, passwordInfoIcon, publishIcon } from "../assets/Icons/Svg";
import CommonButton from "../Components/Common/CommonButton";
import { T } from "../utils/languageTranslator";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

const SignupLinkSection = ({
    signupLink,
    onCancel,
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(signupLink);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy text: ", error);
        }
    }; return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-10 w-full shadow-lg max-w-[800px] delete_modal">
                <div className="flex justify-center">
                    <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center">
                        {passwordInfoIcon}
                    </div>
                </div>
                <h2 className="text-lg font-semibold text-center text-gray-900 mt-4">
                    Signup Link Generated
                </h2>
                <p className="text-sm text-center text-gray-600 mt-2">
                {   T["signup_link_description"]}
                </p>
                <div className="bg-gray-100 p-3 rounded-md text-center mt-4">
                    <a href={signupLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {signupLink}
                    </a>
                </div>
                <div className="flex justify-center mt-6 space-x-3">
                    <CommonButton
                        text={isCopied ? T["copied"] : T["copy_to_clipboard"]}
                        type="button"
                        onClick={handleCopy}
                        className="orange_btn"
                        icon={isCopied ? checkedIconWhite : copyToClipboardIconWhite}
                    />
                    <CommonButton
                        text={T["close"]}
                        onClick={onCancel}
                        type="button"
                        className="grey_btn"
                    />
                </div>
            </div>
        </div>
    );
};

export default SignupLinkSection;
