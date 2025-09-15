import React from 'react'
import CommonButton from './_common/CommonButton'

const VerificationModal = ({handleModalSubmit,handleModalClose}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-10 w-full shadow-lg w-full max-w-[800px] delete_modal">
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center">
              <img src="/images/Email_verification.png"/>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-center text-gray-900 mt-4">
          Verification Email Sent
          </h2>
          <p className="text-sm text-center text-gray-600 mt-2">We've sent a verification email to user@example.com. Please check your inbox (and spam/junk folder) and follow the instructions to verify your email address.</p>
          <div className="flex justify-center mt-6 space-x-3">
            <CommonButton
              text="Resend verification"
              type="button"
              className="bg-[#FF6D2F] text-white p-2 rounded-lg"
              // disabled={loader}
              // loader={loader}
              onClick={handleModalSubmit}
            />
            <CommonButton
              text="Change Email Address"
              type="button"
              className="bg-[#E4E4E4] text-[#3E3232BF] p-2 rounded-lg"
              onClick={handleModalClose}
            />
          </div>
        </div>
      </div>
  )
}

export default VerificationModal