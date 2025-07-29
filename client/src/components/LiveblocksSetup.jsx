import React from "react";

const LiveblocksSetup = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        🚀 Collaborative Editor Setup Guide
      </h1>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            📋 Quick Setup Instructions
          </h2>
          <p className="text-blue-800">
            To enable real-time collaboration, you need to set up a Liveblocks
            account and configure your API key.
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900">
              Step 1: Create Liveblocks Account
            </h3>
            <p className="text-gray-600">
              Visit{" "}
              <a
                href="https://liveblocks.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                liveblocks.io
              </a>{" "}
              and create a free account.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900">
              Step 2: Get Your API Key
            </h3>
            <p className="text-gray-600">
              Go to your{" "}
              <a
                href="https://liveblocks.io/dashboard/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                dashboard
              </a>{" "}
              and copy your public API key.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900">
              Step 3: Update Environment Variables
            </h3>
            <p className="text-gray-600 mb-2">
              Open your{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>{" "}
              file and replace the placeholder:
            </p>
            <div className="bg-gray-100 p-3 rounded border text-sm font-mono">
              REACT_APP_LIVEBLOCKS_PUBLIC_KEY=pk_dev_YOUR_ACTUAL_KEY_HERE
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900">
              Step 4: Restart Development Server
            </h3>
            <p className="text-gray-600">
              Restart your dev server to load the new environment variables:
            </p>
            <div className="bg-gray-100 p-3 rounded border text-sm font-mono">
              npm run dev
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ✨ Features Available
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Real-time collaborative editing</li>
            <li>• Live cursors showing other users</li>
            <li>• Comments and threaded discussions</li>
            <li>• Rich text formatting (bold, italic, headings, etc.)</li>
            <li>• Task lists and checkboxes</li>
            <li>• Image and YouTube video embedding</li>
            <li>• Undo/redo with collaborative history</li>
            <li>• Offline support (experimental)</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">🎯 Next Steps</h3>
          <p className="text-green-800">Once configured, you can:</p>
          <ul className="text-green-800 mt-2 space-y-1">
            <li>• Share the editor URL with team members</li>
            <li>• Customize the editor with additional Tiptap extensions</li>
            <li>• Integrate with your authentication system</li>
            <li>• Add custom document management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LiveblocksSetup;
