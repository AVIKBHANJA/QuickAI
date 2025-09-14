import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Plan = () => {
  const { isPaid } = useAuth();

  return (
    <div className='max-w-2xl mx-auto z-20 my-30'>

      <div className='text-center'>
        <h2 className='text-slate-700 text-[42px] font-semibold'>Choose Your Plan</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>Start for free and scale up as you grow. Find the perfect plan for your content creation needs.</p>
      </div>

      <div className='mt-14 max-sm:mx-8'>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-lg shadow-lg border">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              ₹0<span className="text-lg font-normal">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                50 free generations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Basic AI tools
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Community access
              </li>
            </ul>
            <button className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-medium">
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className={`bg-white p-8 rounded-lg shadow-lg border-2 ${isPaid ? 'border-green-500' : 'border-blue-500'}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium</h3>
            <p className="text-gray-600 mb-6">Unlimited access to all features</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              ₹999<span className="text-lg font-normal">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited generations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                All AI tools & features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced collaboration
              </li>
            </ul>
            {isPaid ? (
              <button className="w-full py-3 px-6 bg-green-500 text-white rounded-lg font-medium">
                Current Plan
              </button>
            ) : (
              <button className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
                Pay via GPay: avikbhanja2@oksbi
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Plan
