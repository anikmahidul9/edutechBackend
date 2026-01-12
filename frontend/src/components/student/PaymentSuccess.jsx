import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome } from "react-icons/fa";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <FaCheckCircle className="mx-auto h-24 w-24 text-emerald-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Payment Successful!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your enrollment has been successfully processed. You now have full
          access to the course content.
        </p>
        <div className="mt-5">
          <button
            onClick={() => navigate("/student/my-courses")}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FaHome
                className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400"
                aria-hidden="true"
              />
            </span>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
