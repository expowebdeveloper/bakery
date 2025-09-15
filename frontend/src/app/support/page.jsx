import SupportPageHeader from "@/_components/SupportPageHeader";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
const SUPPORT_PAGE_CARDS = [
  {
    icon: faEnvelope,
    question: "How do I change my account email?",
    answer:
      "You can log in to your account and change it from your Profile > Edit Profile. Then go to the general tab to change your email.",
  },
  {
    icon: faEnvelope,
    question: "What should I do if my payment fails?",
    answer:
      "If your payment fails, you can use the (COD) payment option, if available on that order. If your payment is debited from your account after a payment failure, it will be credited back within 7-10 days.",
  },
  {
    icon: faEnvelope,
    question: "What should I do if my payment fails?",
    answer:
      "You can now cancel an order when it is in packed/shipped status. Any amount paid will be credited into the same payment mode using which the payment was made",
  },
];
const SupportPage = () => {
  return (
    <div>
      <SupportPageHeader />
      <div className="support-page-cards flex items-center space-x-4 mt-4 mb-4">
        {SUPPORT_PAGE_CARDS?.map(({ icon, question, answer }) => (
          <div className="card">
            <div className="icon">
              <FontAwesomeIcon className="w-20" icon={icon} />
            </div>
            <div className="question text-[#000000]">{question}</div>
            <div className="answer text-[#515151]">{answer}</div>
          </div>
        ))} 
      </div>
    </div>
  );
};

export default SupportPage;
