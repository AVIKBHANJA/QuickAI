import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Loader2, Copy, Share2, Sparkles } from "lucide-react";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const SocialMedia = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    platform: "",
    topic: "",
    targetAudience: "",
    tone: "professional",
    context: "",
  });

  const platforms = [
    { id: "instagram", name: "Instagram", maxLength: 2200 },
    { id: "twitter", name: "Twitter/X", maxLength: 280 },
    { id: "linkedin", name: "LinkedIn", maxLength: 3000 },
    { id: "threads", name: "Threads", maxLength: 500 },
    { id: "discord", name: "Discord", maxLength: 2000 },
    { id: "whatsapp", name: "WhatsApp", maxLength: 65536 },
    { id: "facebook", name: "Facebook", maxLength: 63206 },
    { id: "youtube", name: "YouTube", maxLength: 5000 },
  ];

  const tones = [
    { id: "professional", name: "Professional" },
    { id: "casual", name: "Casual" },
    { id: "humorous", name: "Humorous" },
    { id: "inspirational", name: "Inspirational" },
    { id: "educational", name: "Educational" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.platform || !formData.topic || !formData.targetAudience) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await axios.post(
        `/api/ai/generate-social-media`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setResult(response.data.content);
        toast.success("Social media content generated successfully!");
      } else {
        toast.error(response.data.message || "Failed to generate content");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Content copied to clipboard!");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column - Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF6B6B]" />
          <h1 className="text-xl font-semibold">Social Media Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Platform</p>
        <select
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
        >
          <option value="">Select platform</option>
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </select>

        <p className="mt-4 text-sm font-medium">Topic/Theme</p>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          required
          placeholder="What's your post about?"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
        />

        <p className="mt-4 text-sm font-medium">Target Audience</p>
        <input
          type="text"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          required
          placeholder="Who is your target audience?"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
        />

        <p className="mt-4 text-sm font-medium">Tone</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {tones.map((tone) => (
            <div
              key={tone.id}
              onClick={() =>
                setFormData((prev) => ({ ...prev, tone: tone.id }))
              }
              className={`px-4 py-2 text-sm rounded cursor-pointer transition-all ${
                formData.tone === tone.id
                  ? "bg-[#FF6B6B] text-white"
                  : "border border-gray-300 text-gray-600 hover:border-[#FF6B6B]"
              }`}
            >
              {tone.name}
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium">
          Additional Context (Optional)
        </p>
        <textarea
          name="context"
          value={formData.context}
          onChange={handleChange}
          placeholder="Add any additional details or specific requirements"
          rows={3}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 resize-none"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-2.5 bg-[#FF6B6B] text-white rounded-md hover:bg-[#FF5252] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </div>
          ) : (
            "Generate Post"
          )}
        </button>
      </form>

      {/* Right Column - Result */}
      {result && (
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 text-[#FF6B6B]" />
              <h2 className="text-xl font-semibold">Generated Content</h2>
            </div>
            <button
              onClick={() => handleCopy(result)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6B6B] text-white text-sm rounded hover:bg-[#FF5252] transition-all"
            >
              <Copy size={16} />
              Copy All
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700">
            <Markdown>{result}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMedia;
