import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/ThemeContext";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaEye,
    FaSpinner,
    FaMapMarkerAlt,
    FaClock,
    FaCheckCircle,
    FaHourglassHalf,
    FaPlayCircle,
    FaTruck,
    FaUser
} from "react-icons/fa";

// Mock Data
const MOCK_ZONES = [
    { value: "1", label: "North Zone", zoneId: 1, zoneName: "North Zone" },
    { value: "2", label: "South Zone", zoneId: 2, zoneName: "South Zone" },
    { value: "3", label: "East Zone", zoneId: 3, zoneName: "East Zone" },
    { value: "4", label: "West Zone", zoneId: 4, zoneName: "West Zone" },
    { value: "5", label: "Central Zone", zoneId: 5, zoneName: "Central Zone" },
];

const MOCK_ROUTE_PLANS = {
    "1": [
        { value: "1", label: "Route A - Station 1 to 5", routePlanId: 1, routePlanPoint: "Route A - Station 1 to 5" },
        { value: "2", label: "Route B - Station 6 to 10", routePlanId: 2, routePlanPoint: "Route B - Station 6 to 10" },
        { value: "3", label: "Route C - Station 11 to 15", routePlanId: 3, routePlanPoint: "Route C - Station 11 to 15" },
    ],
    "2": [
        { value: "4", label: "Route D - Station 16 to 20", routePlanId: 4, routePlanPoint: "Route D - Station 16 to 20" },
        { value: "5", label: "Route E - Station 21 to 25", routePlanId: 5, routePlanPoint: "Route E - Station 21 to 25" },
    ],
    "3": [
        { value: "6", label: "Route F - Station 26 to 30", routePlanId: 6, routePlanPoint: "Route F - Station 26 to 30" },
        { value: "7", label: "Route G - Station 31 to 35", routePlanId: 7, routePlanPoint: "Route G - Station 31 to 35" },
    ],
    "4": [
        { value: "8", label: "Route H - Station 36 to 40", routePlanId: 8, routePlanPoint: "Route H - Station 36 to 40" },
        { value: "9", label: "Route I - Station 41 to 45", routePlanId: 9, routePlanPoint: "Route I - Station 41 to 45" },
    ],
    "5": [
        { value: "10", label: "Route J - Station 46 to 50", routePlanId: 10, routePlanPoint: "Route J - Station 46 to 50" },
        { value: "11", label: "Route K - Station 51 to 55", routePlanId: 11, routePlanPoint: "Route K - Station 51 to 55" },
    ],
};

const MOCK_ROUTE_DATA = [
    {
        id: 1,
        driverName: "Rajesh Kumar",
        zoneName: "North Zone",
        routePlan: "Route A - Station 1 to 5",
        dateStarted: "2026-07-22 08:00 AM",
        status: "in-progress",
        milestones: [
            { id: 1, station: 'Station A - Main Depot', status: 'completed', time: '08:00 AM', description: 'Vehicle departed from depot' },
            { id: 2, station: 'Station B - Distribution Center', status: 'completed', time: '09:15 AM', description: 'Goods loaded for delivery' },
            { id: 3, station: 'Station C - Sector 5', status: 'completed', time: '10:30 AM', description: 'First delivery point reached' },
            { id: 4, station: 'Station D - Sector 12', status: 'in-progress', time: '11:45 AM', description: 'Second delivery in progress' },
            { id: 5, station: 'Station E - Final Destination', status: 'not-started', time: '--:--', description: 'Final delivery pending' },
        ]
    },
    {
        id: 2,
        driverName: "Amit Singh",
        zoneName: "South Zone",
        routePlan: "Route D - Station 16 to 20",
        dateStarted: "2026-07-22 06:30 AM",
        status: "completed",
        milestones: [
            { id: 1, station: 'Station P - Main Depot', status: 'completed', time: '06:30 AM', description: 'Vehicle departed from depot' },
            { id: 2, station: 'Station Q - Warehouse', status: 'completed', time: '07:45 AM', description: 'Goods loaded for delivery' },
            { id: 3, station: 'Station R - Sector 16', status: 'completed', time: '08:30 AM', description: 'First delivery point reached' },
            { id: 4, station: 'Station S - Sector 18', status: 'completed', time: '09:15 AM', description: 'Second delivery completed' },
            { id: 5, station: 'Station T - Sector 20', status: 'completed', time: '10:00 AM', description: 'Final delivery completed' },
        ]
    },
    {
        id: 3,
        driverName: "Suresh Patel",
        zoneName: "East Zone",
        routePlan: "Route F - Station 26 to 30",
        dateStarted: "2026-07-22 09:00 AM",
        status: "not-started",
        milestones: [
            { id: 1, station: 'Station X - Main Depot', status: 'not-started', time: '--:--', description: 'Awaiting departure' },
            { id: 2, station: 'Station Y - Distribution Hub', status: 'not-started', time: '--:--', description: 'Not yet reached' },
            { id: 3, station: 'Station Z - Sector 26', status: 'not-started', time: '--:--', description: 'Not yet reached' },
        ]
    },
    {
        id: 4,
        driverName: "Ravi Sharma",
        zoneName: "West Zone",
        routePlan: "Route H - Station 36 to 40",
        dateStarted: "2026-07-22 07:15 AM",
        status: "in-progress",
        milestones: [
            { id: 1, station: 'Station M - Main Depot', status: 'completed', time: '07:15 AM', description: 'Vehicle departed from depot' },
            { id: 2, station: 'Station N - Logistics Center', status: 'completed', time: '08:30 AM', description: 'Goods loaded' },
            { id: 3, station: 'Station O - Sector 36', status: 'completed', time: '09:45 AM', description: 'First delivery completed' },
            { id: 4, station: 'Station P - Sector 38', status: 'in-progress', time: '10:30 AM', description: 'Second delivery in progress' },
            { id: 5, station: 'Station Q - Sector 40', status: 'not-started', time: '--:--', description: 'Final destination pending' },
        ]
    },
    {
        id: 5,
        driverName: "Deepak Verma",
        zoneName: "Central Zone",
        routePlan: "Route J - Station 46 to 50",
        dateStarted: "2026-07-22 08:45 AM",
        status: "completed",
        milestones: [
            { id: 1, station: 'Station C1 - Main Depot', status: 'completed', time: '08:45 AM', description: 'Vehicle departed' },
            { id: 2, station: 'Station C2 - Warehouse', status: 'completed', time: '09:30 AM', description: 'Goods loaded' },
            { id: 3, station: 'Station C3 - Sector 46', status: 'completed', time: '10:15 AM', description: 'First delivery' },
            { id: 4, station: 'Station C4 - Sector 48', status: 'completed', time: '11:00 AM', description: 'Second delivery' },
            { id: 5, station: 'Station C5 - Sector 50', status: 'completed', time: '11:45 AM', description: 'Final delivery completed' },
        ]
    },
];

// React Select Styling matching AssignRoute style
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
        'in-progress': {
            icon: FaPlayCircle,
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            label: 'In Progress'
        },
        'completed': {
            icon: FaCheckCircle,
            color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            label: 'Completed'
        },
        'not-started': {
            icon: FaHourglassHalf,
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
            label: 'Not Yet Started'
        }
    };

    const config = statusConfig[status] || statusConfig['not-started'];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

// Milestone View Modal
const MilestoneModal = ({ isOpen, onClose, routeData, darkMode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#1e293b] border border-[rgba(79, 70, 229,0.25)]" : "bg-white border border-gray-200"
                        }`}
                >
                    {/* Header */}
                    <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8]" />

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    Route Milestones
                                </h3>
                                {routeData && (
                                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        {routeData.driverName} - {routeData.routePlan}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                                    }`}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Milestone Timeline */}
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${darkMode ? "bg-[rgba(79, 70, 229,0.3)]" : "bg-gray-200"
                                }`} />

                            {routeData?.milestones?.map((milestone) => {
                                const statusColors = {
                                    completed: darkMode ? 'bg-indigo-500' : 'bg-indigo-600',
                                    'in-progress': darkMode ? 'bg-blue-500' : 'bg-blue-500',
                                    'not-started': darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                };

                                const statusTextColors = {
                                    completed: darkMode ? 'text-indigo-300' : 'text-indigo-700',
                                    'in-progress': darkMode ? 'text-blue-300' : 'text-blue-700',
                                    'not-started': darkMode ? 'text-gray-500' : 'text-gray-400'
                                };

                                return (
                                    <div key={milestone.id} className="relative pl-12 pb-8 last:pb-0">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 ${darkMode ? 'border-[#1e293b]' : 'border-white'
                                            } ${statusColors[milestone.status]}`}>
                                            {milestone.status === 'completed' && (
                                                <FaCheckCircle className="w-full h-full text-white p-0.5" />
                                            )}
                                            {milestone.status === 'in-progress' && (
                                                <FaSpinner className="w-full h-full text-white p-0.5 animate-spin" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-[#0f172a]' : 'bg-gray-50'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className={`text-sm ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'
                                                        }`} />
                                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                        {milestone.station}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaClock className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'
                                                        }`} />
                                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        {milestone.time}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={`text-sm ${statusTextColors[milestone.status]}`}>
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function RouteMonitoring() {
    const { theme } = useTheme();
    const darkMode = theme === "dark";
    const navigate = useNavigate();

    const [form, setForm] = useState({
        zone: "",
        routePlan: ""
    });

    const [zoneOptions] = useState(MOCK_ZONES);
    const [routePlanOptions, setRoutePlanOptions] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [errors, setErrors] = useState({});
    const [routeData, setRouteData] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);

    // Fetch Route Plans based on selected Zone (Mock)
    const fetchRoutePlans = (zoneMasterId) => {
        if (!zoneMasterId) {
            setRoutePlanOptions([]);
            return;
        }

        // Simulate loading
        setRoutePlanOptions([]);

        // Get route plans for selected zone
        const plans = MOCK_ROUTE_PLANS[zoneMasterId] || [];
        setRoutePlanOptions(plans);
    };

    // Handle Search (Mock)
    const handleSearch = async (e) => {
        e.preventDefault();

        // Validate
        if (!form.zone) {
            setErrors({ zone: "Zone is required" });
            Swal.fire({
                icon: "warning",
                title: "Please Select Zone",
                text: "Zone is required to fetch route monitoring data",
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
            // Filter data based on zone and route plan
            let filteredData = MOCK_ROUTE_DATA;

            if (form.zone) {
                const selectedZone = MOCK_ZONES.find(z => z.value === form.zone);
                if (selectedZone) {
                    filteredData = filteredData.filter(item => item.zoneName === selectedZone.zoneName);
                }
            }

            if (form.routePlan) {
                const selectedPlan = routePlanOptions.find(rp => rp.value === form.routePlan);
                if (selectedPlan) {
                    filteredData = filteredData.filter(item => item.routePlan === selectedPlan.routePlanPoint);
                }
            }

            setRouteData(filteredData);

            if (filteredData.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Data Found",
                    text: "No route monitoring data available for the selected criteria",
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
            if (name === "zone") {
                updated.routePlan = "";
                if (selectedOption) {
                    fetchRoutePlans(selectedOption.zoneId || selectedOption.value);
                } else {
                    setRoutePlanOptions([]);
                }
                // Clear data when zone changes
                setRouteData([]);
            }
            return updated;
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleViewMilestones = (route) => {
        setSelectedRoute(route);
        setShowMilestoneModal(true);
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

                                {/* Field 2: Select Route Plan Dropdown */}
                                <div className="w-full sm:w-64 md:w-72 max-w-[280px]">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                        Select Route Plan
                                    </label>
                                    <Select
                                        name="routePlan"
                                        options={routePlanOptions}
                                        value={routePlanOptions.find((option) => option.value === form.routePlan) || null}
                                        onChange={(option) => handleSelectChange(option, { name: "routePlan" })}
                                        placeholder={!form.zone ? "Select zone first" : "All route plans"}
                                        noOptionsMessage={() => !form.zone ? "Please select a zone first" : "No route plans found"}
                                        styles={getSelectStyles(darkMode, null)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        isClearable
                                        isDisabled={!form.zone}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
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
                                            Driver Name
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Zone Name
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Route Plan
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Date Started
                                        </th>
                                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Status
                                        </th>
                                        <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Actions
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
                                            className={`border-b transition-colors ${darkMode
                                                ? "border-[rgba(79, 70, 229,0.1)] hover:bg-[rgba(79, 70, 229,0.05)]"
                                                : "border-gray-100 hover:bg-gray-50"
                                                }`}
                                        >
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                {index + 1}
                                            </td>
                                            <td className={`py-3 px-4 text-sm flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                <FaUser className={darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"} size={14} />
                                                {item.driverName}
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                {item.zoneName}
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                <div className="flex items-center gap-2">
                                                    <FaTruck className={darkMode ? "text-gray-500" : "text-gray-400"} size={12} />
                                                    {item.routePlan}
                                                </div>
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                <div className="flex items-center gap-2">
                                                    <FaClock className={darkMode ? "text-gray-500" : "text-gray-400"} size={12} />
                                                    {item.dateStarted}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleViewMilestones(item)}
                                                    className={`p-2 rounded-lg transition-colors ${darkMode
                                                        ? "hover:bg-[rgba(79, 70, 229,0.15)] text-[#818cf8]"
                                                        : "hover:bg-[#4f46e5]/10 text-[#4f46e5]"
                                                        }`}
                                                    title="View Milestones"
                                                >
                                                    <FaEye size={18} />
                                                </motion.button>
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
                            <FaSearch className={`mx-auto text-4xl mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                No route monitoring data available for the selected criteria.
                                <br />
                                Please adjust your filters and search again.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Milestone View Modal */}
                <AnimatePresence>
                    {showMilestoneModal && (
                        <MilestoneModal
                            isOpen={showMilestoneModal}
                            onClose={() => {
                                setShowMilestoneModal(false);
                                setSelectedRoute(null);
                            }}
                            routeData={selectedRoute}
                            darkMode={darkMode}
                        />
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}