import React, { useEffect, useState } from "react";
import { dummyCreationData } from "../assets/assets";
import { Gem, Sparkles, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [filteredCreations, setFilteredCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const { user, getToken } = useAuth();

  const creationTypes = [
    { value: "all", label: "All Types" },
    { value: "article", label: "Articles" },
    { value: "blog-title", label: "Blog Titles" },
    { value: "image", label: "Images" },
    { value: "social-media", label: "Social Media" },
    { value: "resume-review", label: "Resume Reviews" },
  ];

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setCreations(data.creations);
        setFilteredCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // Filter and sort functionality
  useEffect(() => {
    let filtered = [...creations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredCreations(filtered);
  }, [creations, searchTerm, selectedType, sortOrder]);

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creations Card  */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>

        {/* Active Plan Card  */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              {user?.isPaid ? "Premium" : "Free"}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-3/4">
          <div className="animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1">
              <p className="mb-4 text-lg font-medium">
                Your Creations ({filteredCreations.length})
              </p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="max-w-5xl flex flex-col lg:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by prompt or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
              >
                {creationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
              >
                {sortOrder === "newest" ? (
                  <>
                    <SortDesc className="w-4 h-4" />
                    Newest First
                  </>
                ) : (
                  <>
                    <SortAsc className="w-4 h-4" />
                    Oldest First
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {filteredCreations.length > 0 ? (
              filteredCreations.map((item) => (
                <CreationItem key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedType !== "all" ? (
                  <div>
                    <p className="text-lg mb-2">No creations found</p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg mb-2">No creations yet</p>
                    <p className="text-sm">
                      Start creating content with our AI tools!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
