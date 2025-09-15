import { passwordInfoIcon } from "@/assets/Icons/Svg";
import { T } from "@/utils/languageTranslator";
import React from "react";
import CommonButton from "./_common/CommonButton";

const MessageModal = ({ onCancel }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-10 w-full shadow-lg max-w-[800px] order_confirmation_modal">
                <div className="flex justify-center">
                    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                        {passwordInfoIcon}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-900 mt-4">
                    Order Confirmation
                </h2>
                <p className="text-sm text-center text-gray-600 mt-2">
                    To place an order, please log in to your account. If you don’t have an account, contact the admin to discuss the details. Once finalized, the admin will provide you with a signup form link to proceed with your order.        </p>
                <div className="flex justify-center mt-6 space-x-3">
                    <CommonButton
                        text={T["got_it"] || "Got it!"}
                        onClick={onCancel}
                        type="button"
                        className="mt-5 w-full bg-btnBackground text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition duration-200 rounded"
                    />
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
