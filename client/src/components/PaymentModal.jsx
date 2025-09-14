import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const PaymentModal = ({ onClose }) => {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { getPaymentInfo, verifyPayment } = useAuth();

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      const info = await getPaymentInfo();
      if (info.success) {
        setPaymentInfo(info.paymentInfo);
      }
    };
    fetchPaymentInfo();
  }, []);

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    if (!transactionId || !amount) {
      setMessage("Transaction ID and amount are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await verifyPayment(transactionId, amount);
      if (result.success) {
        setMessage(result.message);
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("Payment verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("GPay ID copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  if (!paymentInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Upgrade to Premium
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Pricing Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Premium Plan
            </h3>
            <p className="text-2xl font-bold text-blue-600 mb-3">
              {paymentInfo.pricing.premium}
            </p>
            <ul className="space-y-2">
              {paymentInfo.pricing.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-700"
                >
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Instructions */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Payment Instructions:
            </h4>
            <ol className="space-y-2 text-sm text-gray-700">
              {paymentInfo.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* GPay ID */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPay ID:
            </label>
            <div className="flex items-center space-x-2">
              <code className="bg-white px-3 py-2 rounded border flex-1 font-mono text-lg">
                {paymentInfo.gpayId}
              </code>
              <button
                onClick={() => copyToClipboard(paymentInfo.gpayId)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerifyPayment} className="space-y-4">
            <div>
              <label
                htmlFor="transactionId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter transaction ID from GPay"
                required
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount Paid (₹)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="299"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.includes("success") ||
                  message.includes("verified") ||
                  message.includes("copied")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Payment"}
            </button>
          </form>

          <div className="text-xs text-gray-500 text-center">
            Note: Payment verification is usually instant. If you face any
            issues, please contact support.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
