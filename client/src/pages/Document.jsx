import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

function Document() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [document, setDocument] = useState({
    id: null,
    title: "",
    content: "",
    updated_at: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  const documentId = searchParams.get("id") || "new";

  // Load document on component mount
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (documentId !== "new") {
      loadDocument(documentId);
    }
  }, [user, documentId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (document.content && document.id) {
      const timer = setTimeout(() => {
        saveDocument();
      }, 2000); // Auto-save after 2 seconds of no changes

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [document.content]);

  const loadDocument = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/documents/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
      } else {
        console.error("Failed to load document");
      }
    } catch (error) {
      console.error("Error loading document:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!document.title.trim()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("auth_token");

      const url = document.id
        ? `${
            import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
          }/api/user/documents/${document.id}`
        : `${
            import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
          }/api/user/documents`;

      const method = document.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: document.title,
          content: document.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!document.id) {
          // New document created, update the URL and document state
          setDocument((prev) => ({
            ...prev,
            id: data.document.id,
            updated_at: data.document.updated_at,
          }));
          window.history.replaceState(
            null,
            "",
            `/document?id=${data.document.id}`
          );
        } else {
          setDocument((prev) => ({
            ...prev,
            updated_at: data.document.updated_at,
          }));
        }
      } else {
        console.error("Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setDocument((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (e) => {
    setDocument((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleManualSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    saveDocument();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex-1">
            <input
              type="text"
              value={document.title}
              onChange={handleTitleChange}
              placeholder="Document Title"
              className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 w-full"
            />
            {document.updated_at && (
              <p className="text-sm text-gray-500 mt-1">
                Last saved: {new Date(document.updated_at).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {saving && (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            <button
              onClick={handleManualSave}
              disabled={saving || !document.title.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <textarea
            value={document.content}
            onChange={handleContentChange}
            placeholder="Start writing your document..."
            className="w-full h-96 p-6 border-none outline-none resize-none font-mono text-gray-900 placeholder-gray-400"
            style={{ minHeight: "500px" }}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Changes are automatically saved</p>
        </div>
      </div>
    </div>
  );
}

export default Document;
