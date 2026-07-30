import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/ThemeContext";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaSpinner,
    FaTruck,
    FaUser,
    FaCheckCircle,
    FaClock,
    FaHourglassHalf,
    FaRoute,
    FaMapMarkerAlt
} from "react-icons/fa";

// Mock Data
const MOCK_ZONES = [
    { value: "1", label: "North Zone", zoneId: 1, zoneName: "North Zone" },
    { value: "2", label: "South Zone", zoneId: 2, zoneName: "South Zone" },
    { value: "3", label: "East Zone", zoneId: 3, zoneName: "East Zone" },
    { value: "4", label: "West Zone", zoneId: 4, zoneName: "West Zone" },
    { value: "5", label: "Central Zone", zoneId: 5, zoneName: "Central Zone" },
];

const MOCK_TOTAL_ROUTES = [
    {
        id: 1,
        zone: "North Zone",
        routePlanName: "Route A - Station 1 to 5",
        status: "pending",
        assignedTo: "Unassigned"
    },
    {
        id: 2,
        zone: "North Zone",
        routePlanName: "Route B - Station 6 to 10",
        status: "assigned",
        assignedTo: "Rajesh Kumar"
    },
    {
        id: 3,
        zone: "South Zone",
        routePlanName: "Route C - Station 11 to 15",
        status: "completed",
        assignedTo: "Amit Singh"
    },
    {
        id: 4,
        zone: "South Zone",
        routePlanName: "Route D - Station 16 to 20",
        status: "pending",
        assignedTo: "Unassigned"
    },
    {
        id: 5,
        zone: "East Zone",
        routePlanName: "Route E - Station 21 to 25",
        status: "assigned",
        assignedTo: "Suresh Patel"
    },
    {
        id: 6,
        zone: "East Zone",
        routePlanName: "Route F - Station 26 to 30",
        status: "pending",
        assignedTo: "Unassigned"
    },
    {
        id: 7,
        zone: "West Zone",
        routePlanName: "Route G - Station 31 to 35",
        status: "completed",
        assignedTo: "Ravi Sharma"
    },
    {
        id: 8,
        zone: "West Zone",
        routePlanName: "Route H - Station 36 to 40",
        status: "assigned",
        assignedTo: "Deepak Verma"
    },
    {
        id: 9,
        zone: "Central Zone",
        routePlanName: "Route I - Station 41 to 45",
        status: "pending",
        assignedTo: "Unassigned"
    },
    {
        id: 10,
        zone: "Central Zone",
        routePlanName: "Route J - Station 46 to 50",
        status: "assigned",
        assignedTo: "Priya Patel"
    },
    {
        id: 11,
        zone: "North Zone",
        routePlanName: "Route K - Station 51 to 55",
        status: "completed",
        assignedTo: "Vikram Singh"
    },
    {
        id: 12,
        zone: "South Zone",
        routePlanName: "Route L - Station 56 to 60",
        status: "assigned",
        assignedTo: "Anita Sharma"
    },
];

// React Select Styling
const getSelectStyles = (darkMode, error) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
        borderColor: error ? "#EF4444" : (state.isFocused ? "#4f46e5" : (darkMode ? "rgba(79, 70, 229,0.3)" : "#D1D5DB")),
        borderWidth: "1px",
        borderRadius: "0.5rem",
        minHeight: "44px",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 53, 201, 0.2)" : "none",
        "&:hover": {
            borderColor: error ? "#EF4444" : "#4f46e5"
        }
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
        border: darkMode ? "1px solid rgba(79, 70, 229,0.2)" : "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        zIndex: 9999
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999
    }),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        backgroundColor: isSelected
            ? "#4f46e5"
            : isFocused
                ? (darkMode ? "rgba(79, 70, 229,0.15)" : "#f3f4f6")
                : "transparent",
        color: isSelected
            ? "#ffffff"
            : (darkMode ? "#e2e0ff" : "#111827"),
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#4f46e5"
        }
    }),
    singleValue: (base) => ({
        ...base,
        color: darkMode ? "#e2e0ff" : "#111827"
    }),
    placeholder: (base) => ({
        ...base,
        color: darkMode ? "rgba(165,160,255,0.5)" : "#9ca3af",
        fontSize: "0.875rem"
    })
});

// Error Message Component
const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs text-red-500 flex items-start gap-1">
            <span className="inline-block mt-0.5">⚠️</span>
            <span>{message}</span>
        </p>
    );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'pending': {
            icon: FaHourglassHalf,
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            label: 'Pending'
        },
        'assigned': {
            icon: FaUser,
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            label: 'Assigned'
        },
        'completed': {
            icon: FaCheckCircle,
            color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            label: 'Completed'
        }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

export default function TotalRoutes() {
    const { theme } = useTheme();
    const darkMode = theme === "dark";
    const navigate = useNavigate();

    const [form, setForm] = useState({
        zone: ""
    });

    const [zoneOptions] = useState(MOCK_ZONES);
    const [loadingData, setLoadingData] = useState(false);
    const [errors, setErrors] = useState({});
    const [routeData, setRouteData] = useState([]);

    // Handle Search (Mock)
    const handleSearch = async (e) => {
        e.preventDefault();

        // Validate
        if (!form.zone) {
            setErrors({ zone: "Zone is required" });
            Swal.fire({
                icon: "warning",
                title: "Please Select Zone",
                text: "Zone is required to fetch route data",
                confirmButtonColor: "#f59e0b",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
            return;
        }

        setLoadingData(true);
        setErrors({});

        // Simulate API call
        setTimeout(() => {
            // Filter data based on zone
            let filteredData = MOCK_TOTAL_ROUTES;

            if (form.zone) {
                const selectedZone = MOCK_ZONES.find(z => z.value === form.zone);
                if (selectedZone) {
                    filteredData = filteredData.filter(item => item.zone === selectedZone.zoneName);
                }
            }

            setRouteData(filteredData);

            if (filteredData.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Data Found",
                    text: "No routes available for the selected zone",
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });
            }

            setLoadingData(false);
        }, 1000); // Simulate network delay
    };

    const handleSelectChange = (selectedOption, { name }) => {
        const value = selectedOption ? selectedOption.value : "";
        setForm((prev) => {
            const updated = { ...prev, [name]: value };
            return updated;
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
        // Clear data when zone changes
        setRouteData([]);
    };

    // Get status color for the row
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return darkMode ? 'border-yellow-500/30' : 'border-yellow-200';
            case 'assigned':
                return darkMode ? 'border-blue-500/30' : 'border-blue-200';
            case 'completed':
                return darkMode ? 'border-indigo-500/30' : 'border-indigo-200';
            default:
                return '';
        }
    };

    return (
        <div className={`min-h-full py-12 px-6 transition-colors duration-300 ${darkMode ? "bg-[#0f172a]" : "bg-gray-50"}`}>
            <div className="max-w-[1600px] mx-auto">

                {/* Form Card Container */}
                <form onSubmit={handleSearch} noValidate>
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`${darkMode ? "bg-[#1e293b] border-[rgba(79, 70, 229,0.25)] shadow-[0_10px_35px_rgba(0,0,0,0.4)]" : "bg-white border-gray-200 shadow-sm"} rounded-2xl border min-h-[180px]`}
                    >
                        {/* Top Gradient Line */}
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] rounded-t-2xl" />

                        <div className="p-8">
                            {/* Row containing fields */}
                            <div className="flex flex-wrap items-end gap-6">

                                {/* Field 1: Select Zone Dropdown */}
                                <div className="w-full sm:w-64 md:w-72 max-w-[280px]">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                        <span className="text-red-500 mr-1">*</span>Select Zone
                                    </label>
                                    <Select
                                        name="zone"
                                        options={zoneOptions}
                                        value={zoneOptions.find((option) => option.value === form.zone) || null}
                                        onChange={(option) => handleSelectChange(option, { name: "zone" })}
                                        placeholder="Select zone..."
                                        noOptionsMessage={() => "No zones found"}
                                        styles={getSelectStyles(darkMode, errors.zone)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.zone} />
                                </div>

                                {/* Search Button */}
                                <div className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: loadingData ? 1 : 1.02 }}
                                        whileTap={{ scale: loadingData ? 1 : 0.97 }}
                                        type="submit"
                                        disabled={loadingData || !form.zone}
                                        className={`w-full sm:w-auto px-10 py-2.5 text-sm font-semibold text-white rounded-lg transition-all transform flex items-center justify-center gap-2.5 ${loadingData || !form.zone
                                            ? "bg-[#4f46e5] opacity-70 cursor-not-allowed"
                                            : "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] hover:shadow-[0_4px_25px_rgba(59,53,201,0.35)]"
                                            }`}
                                    >
                                        {loadingData ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={16} />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <FaSearch size={16} />
                                                Search
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </form>

                {/* Table Section */}
                {routeData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className={`mt-8 rounded-2xl border overflow-hidden ${darkMode ? "bg-[#1e293b] border-[rgba(79, 70, 229,0.25)]" : "bg-white border-gray-200 shadow-sm"
                            }`}
                    >
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8]" />

                        <div className="p-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${darkMode ? "border-[rgba(79, 70, 229,0.15)]" : "border-gray-200"}`}>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Sl No
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Zone
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Route Plan Name
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Status
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Assigned To
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routeData.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className={`border-l-4 ${getStatusColor(item.status)} border-b transition-colors ${darkMode
                                                ? "border-[rgba(79, 70, 229,0.1)] hover:bg-[rgba(79, 70, 229,0.05)]"
                                                : "border-gray-100 hover:bg-gray-50"
                                                }`}
                                        >
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                {index + 1}
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className={darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"} size={14} />
                                                    {item.zone}
                                                </div>
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                <div className="flex items-center gap-2">
                                                    <FaRoute className={darkMode ? "text-gray-500" : "text-gray-400"} size={14} />
                                                    {item.routePlanName}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                {item.status === 'pending' ? (
                                                    <span className={darkMode ? "text-gray-500" : "text-gray-400"}>
                                                        <FaClock className="inline mr-1.5" size={12} />
                                                        {item.assignedTo}
                                                    </span>
                                                ) : (
                                                    <span>
                                                        <FaUser className="inline mr-1.5" size={12} />
                                                        {item.assignedTo}
                                                    </span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* No Data Message */}
                {routeData.length === 0 && !loadingData && form.zone && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-8 p-12 text-center rounded-2xl border ${darkMode
                            ? "bg-[#1e293b] border-[rgba(79, 70, 229,0.25)]"
                            : "bg-white border-gray-200 shadow-sm"
                            }`}
                    >
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] rounded-t-2xl" />
                        <div className="p-8">
                            <FaRoute className={`mx-auto text-4xl mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                No routes available for the selected zone.
                                <br />
                                Please select a different zone and search again.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Initial State - No Zone Selected */}
                {!form.zone && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-8 p-12 text-center rounded-2xl border ${darkMode
                            ? "bg-[#1e293b] border-[rgba(79, 70, 229,0.25)]"
                            : "bg-white border-gray-200 shadow-sm"
                            }`}
                    >
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] rounded-t-2xl" />
                        <div className="p-8">
                            <FaSearch className={`mx-auto text-4xl mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Please select a zone and click search to view routes.
                            </p>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}