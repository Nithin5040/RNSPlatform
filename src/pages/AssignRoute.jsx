import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/ThemeContext";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUserCheck,
    FaSpinner,
    FaUser
} from "react-icons/fa";
import axiosClient from "../api/axiosClient";
import { SummaryApi } from "../api/SummaryApi";

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs text-red-500 flex items-start gap-1">
            <span className="inline-block mt-0.5">⚠️</span>
            <span>{message}</span>
        </p>
    );
};

// React Select Styling matching MasterRouteUpload style
const getSelectStyles = (darkMode, error) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
        borderColor: error ? "#EF4444" : (state.isFocused ? "#4f46e5" : (darkMode ? "#334155" : "#D1D5DB")),
        borderWidth: "1px",
        borderRadius: "0.5rem",
        minHeight: "44px",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.2)" : "none",
        "&:hover": {
            borderColor: error ? "#EF4444" : "#4f46e5"
        }
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
        border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
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
                ? (darkMode ? "rgba(99,102,241,0.15)" : "#f1f5f9")
                : "transparent",
        color: isSelected
            ? "#ffffff"
            : (darkMode ? "#f8fafc" : "#0f172a"),
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#4f46e5"
        }
    }),
    singleValue: (base) => ({
        ...base,
        color: darkMode ? "#f8fafc" : "#0f172a"
    }),
    placeholder: (base) => ({
        ...base,
        color: darkMode ? "#94a3b8" : "#9ca3af",
        fontSize: "0.875rem"
    })
});

export default function AssignRoute() {
    const { theme } = useTheme();
    const darkMode = theme === "dark";
    const navigate = useNavigate();

    const [form, setForm] = useState({
        zone: "",
        routePlan: "",
        driver: ""
    });

    const [zoneOptions, setZoneOptions] = useState([]);
    const [routePlanOptions, setRoutePlanOptions] = useState([]);
    const [driverOptions, setDriverOptions] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [loadingZones, setLoadingZones] = useState(false);
    const [loadingRoutePlans, setLoadingRoutePlans] = useState(false);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch Zones on component mount
    useEffect(() => {
        fetchZones();
        fetchDrivers();
    }, []);

    // Get logged-in user info from sessionStorage
    const getLoggedInUser = () => {
        const authUser = sessionStorage.getItem("auth_user");
        if (authUser) {
            try {
                return JSON.parse(authUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    // Get UserId from sessionStorage
    const getUserId = () => {
        const user = getLoggedInUser();
        if (user) {
            return user.UserId || user.userId || user.id || null;
        }
        return null;
    };

    // Fetch Zones from API using new endpoint
    const fetchZones = async () => {
        setLoadingZones(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.assignroutedpdwns.method,
                url: SummaryApi.assignroutedpdwns.url,
                data: { flagId: 1 }
            });

            if (response.data.status === true || response.data.status === false) {
                const formattedZones = response.data.result.map(zone => ({
                    value: zone.ZoneMasterId.toString(),
                    label: zone.ZoneMasterName,
                    zoneId: zone.ZoneMasterId,
                    zoneName: zone.ZoneMasterName
                }));
                setZoneOptions(formattedZones);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Fetch Zones",
                    text: response.data.message || "Failed to fetch zones",
                    confirmButtonColor: "#ef4444",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });
            }
        } catch (error) {
            console.error("Error fetching zones:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Failed to fetch zones. Please try again.",
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
        } finally {
            setLoadingZones(false);
        }
    };

    // Fetch Route Plans based on selected Zone using new endpoint
    const fetchRoutePlans = async (zoneMasterId) => {
        if (!zoneMasterId) {
            setRoutePlanOptions([]);
            return;
        }

        setLoadingRoutePlans(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.assignroutedpdwns.method,
                url: SummaryApi.assignroutedpdwns.url,
                data: {
                    flagId: 2,
                    ZoneMasterId: parseInt(zoneMasterId)
                }
            });

            if (response.data.status === true || response.data.status === false) {
                const formattedPlans = response.data.result.map(plan => ({
                    value: plan.RoutePlanId.toString(),
                    label: plan.RoutePlanPoint,
                    routePlanId: plan.RoutePlanId,
                    routePlanPoint: plan.RoutePlanPoint
                }));
                setRoutePlanOptions(formattedPlans);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Fetch Route Plans",
                    text: response.data.message || "Failed to fetch route plans",
                    confirmButtonColor: "#ef4444",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });
                setRoutePlanOptions([]);
            }
        } catch (error) {
            console.error("Error fetching route plans:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Failed to fetch route plans. Please try again.",
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
            setRoutePlanOptions([]);
        } finally {
            setLoadingRoutePlans(false);
        }
    };

    // Fetch Drivers from API using new endpoint
    const fetchDrivers = async () => {
        setLoadingDrivers(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.assignroutedpdwns.method,
                url: SummaryApi.assignroutedpdwns.url,
                data: { flagId: 3 }
            });

            if (response.data.status === true || response.data.status === false) {
                const formattedDrivers = response.data.result.map(driver => ({
                    value: driver.DriverDetailId.toString(),
                    label: driver.DriverName,
                    driverId: driver.DriverDetailId,
                    driverName: driver.DriverName
                }));
                setDriverOptions(formattedDrivers);
            } else {
                // If API fails, use fallback data
                setDriverOptions([
                    { value: "1", label: "Rajesh Kumar", driverId: 1, driverName: "Rajesh Kumar" },
                    { value: "2", label: "Amit Singh", driverId: 2, driverName: "Amit Singh" },
                    { value: "3", label: "Suresh Patel", driverId: 3, driverName: "Suresh Patel" },
                    { value: "4", label: "Ravi Sharma", driverId: 4, driverName: "Ravi Sharma" }
                ]);
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
            // Use fallback data on error
            setDriverOptions([
                { value: "1", label: "Rajesh Kumar", driverId: 1, driverName: "Rajesh Kumar" },
                { value: "2", label: "Amit Singh", driverId: 2, driverName: "Amit Singh" },
                { value: "3", label: "Suresh Patel", driverId: 3, driverName: "Suresh Patel" },
                { value: "4", label: "Ravi Sharma", driverId: 4, driverName: "Ravi Sharma" }
            ]);
        } finally {
            setLoadingDrivers(false);
        }
    };

    // Refresh drivers list after assignment (to show updated data)
    const refreshDrivers = async () => {
        try {
            const response = await axiosClient({
                method: SummaryApi.assignroutedpdwns.method,
                url: SummaryApi.assignroutedpdwns.url,
                data: { flagId: 3 }
            });

            if (response.data.status === true || response.data.status === false) {
                const formattedDrivers = response.data.result.map(driver => ({
                    value: driver.DriverDetailId.toString(),
                    label: driver.DriverName,
                    driverId: driver.DriverDetailId,
                    driverName: driver.DriverName
                }));
                setDriverOptions(formattedDrivers);

                // Clear the selected driver after refresh
                setForm(prev => ({ ...prev, driver: "" }));
            }
        } catch (error) {
            console.error("Error refreshing drivers:", error);
        }
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
            }
            return updated;
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setErrorMessage("");
    };

    const validateForm = async () => {
        let valid = true;
        const newErrors = {};

        if (!form.zone) {
            newErrors.zone = "Zone is required";
            valid = false;
        }

        if (!form.routePlan) {
            newErrors.routePlan = "Route Plan is required";
            valid = false;
        }

        if (!form.driver) {
            newErrors.driver = "Driver is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) return;

        setAssigning(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const selectedZoneObj = zoneOptions.find((z) => z.value === form.zone);
            const selectedRoutePlanObj = routePlanOptions.find((rp) => rp.value === form.routePlan);
            const selectedDriverObj = driverOptions.find((d) => d.value === form.driver);

            // Get UserId from session storage
            const userId = getUserId();

            if (!userId) {
                throw new Error("User not authenticated. Please login again.");
            }

            // Prepare data for API - Updated payload structure
            const assignData = {
                flagId: 1,
                ZoneMasterId: selectedZoneObj?.zoneId || parseInt(form.zone),
                RoutePlanId: selectedRoutePlanObj?.routePlanId || parseInt(form.routePlan),
                DriverDetailId: selectedDriverObj?.driverId || parseInt(form.driver),
                CreatedByUserId: parseInt(userId)
            };

            console.log("Assigning Route with payload:", assignData);

            const response = await axiosClient({
                method: SummaryApi.assignroute.method,
                url: SummaryApi.assignroute.url,
                data: assignData
            });

            if (response.data.status === true) {
                await Swal.fire({
                    icon: "success",
                    title: "Route Assigned Successfully!",
                    html: `
                        <div style="text-align: left; font-size: 14px; margin-top: 10px;">
                            <p><b>Message:</b> ${response.data.message || "Route assigned successfully"}</p>
                            <p><b>Zone:</b> ${selectedZoneObj?.label || form.zone}</p>
                            <p><b>Route Plan:</b> ${selectedRoutePlanObj?.label || form.routePlan}</p>
                            <p><b>Driver:</b> ${selectedDriverObj?.label || form.driver}</p>
                        </div>
                    `,
                    confirmButtonText: "Done",
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });

                setSuccessMessage(`Route assigned to ${selectedDriverObj?.label || "driver"} successfully!`);

                // Reset form fields except driver dropdown (will be refreshed)
                setForm({ zone: "", routePlan: "", driver: "" });
                setRoutePlanOptions([]);

                // Refresh the driver dropdown to show updated data
                await refreshDrivers();

                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
            } else {
                // Handle specific error messages from API
                const errorMsg = response.data.message || "Assignment failed";

                // Check if it's a duplicate assignment error
                if (errorMsg.includes("already assigned")) {
                    await Swal.fire({
                        icon: "warning",
                        title: "Route Already Assigned!",
                        text: errorMsg,
                        confirmButtonColor: "#f59e0b",
                        background: darkMode ? "#1e293b" : "#ffffff",
                        color: darkMode ? "#ffffff" : "#000000"
                    });
                } else {
                    throw new Error(errorMsg);
                }
            }
        } catch (error) {
            console.error("Assign Route Error:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.Message || error.message || "An error occurred while assigning route.";
            setErrorMessage(errorMsg);
            Swal.fire({
                icon: "error",
                title: "Assignment Failed!",
                text: errorMsg,
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className={`min-h-full py-12 px-6 transition-colors duration-300 ${darkMode ? "bg-[#0f172a]" : "bg-slate-50"}`}>
            <div className="max-w-[1600px] mx-auto">

                {/* Status Banners */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-6 p-4 border rounded-lg text-center font-semibold text-sm ${darkMode ? "bg-indigo-950/30 border-indigo-700 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}
                        >
                            {successMessage}
                        </motion.div>
                    )}

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-6 p-4 border rounded-lg text-center font-semibold text-sm ${darkMode ? "bg-red-950/30 border-red-800 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}
                        >
                            {errorMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Card Container */}
                <form onSubmit={handleAssignSubmit} noValidate>
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`${darkMode ? "bg-[#1e293b] border-[#334155] shadow-[0_10px_35px_rgba(0,0,0,0.4)]" : "bg-white border-slate-200 shadow-sm"} rounded-2xl border min-h-[220px]`}
                    >
                        {/* Top Gradient Line */}
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] rounded-t-2xl" />

                        <div className="p-8">
                            {/* Row containing fields */}
                            <div className="flex flex-wrap items-start gap-6">

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
                                        placeholder={loadingZones ? "Loading zones..." : "Select zone..."}
                                        noOptionsMessage={() => loadingZones ? "Loading..." : "No zones found"}
                                        styles={getSelectStyles(darkMode, errors.zone)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        isDisabled={loadingZones}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.zone} />
                                </div>

                                {/* Field 2: Select Route Plan Dropdown */}
                                <div className="w-full sm:w-64 md:w-72 max-w-[280px]">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                        <span className="text-red-500 mr-1">*</span>Select Route Plan
                                    </label>
                                    <Select
                                        name="routePlan"
                                        options={routePlanOptions}
                                        value={routePlanOptions.find((option) => option.value === form.routePlan) || null}
                                        onChange={(option) => handleSelectChange(option, { name: "routePlan" })}
                                        placeholder={!form.zone ? "Select zone first" : (loadingRoutePlans ? "Loading route plans..." : "Select route plan...")}
                                        noOptionsMessage={() => !form.zone ? "Please select a zone first" : (loadingRoutePlans ? "Loading..." : "No route plans found")}
                                        styles={getSelectStyles(darkMode, errors.routePlan)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        isDisabled={!form.zone || loadingRoutePlans}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.routePlan} />
                                </div>

                                {/* Field 3: Select Driver Dropdown */}
                                <div className="w-full sm:w-64 md:w-72 max-w-[280px]">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                        <span className="text-red-500 mr-1">*</span>Select Driver
                                    </label>
                                    <Select
                                        name="driver"
                                        options={driverOptions}
                                        value={driverOptions.find((option) => option.value === form.driver) || null}
                                        onChange={(option) => handleSelectChange(option, { name: "driver" })}
                                        placeholder={loadingDrivers ? "Loading drivers..." : "Select driver..."}
                                        noOptionsMessage={() => loadingDrivers ? "Loading..." : "No drivers found"}
                                        styles={getSelectStyles(darkMode, errors.driver)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        isDisabled={loadingDrivers}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.driver} />
                                </div>

                                {/* Driver Info Display - Optional */}
                                {form.driver && (
                                    <div className="w-full sm:w-64 md:w-72 max-w-[280px]">
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            Driver Details
                                        </label>
                                        <div className={`p-3 rounded-lg border ${darkMode ? "bg-[#0f172a] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                                            <div className="flex items-center gap-2 text-sm">
                                                <FaUser className={darkMode ? "text-slate-400" : "text-slate-500"} size={14} />
                                                <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
                                                    {driverOptions.find(d => d.value === form.driver)?.label || "Driver selected"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Action Row - Assign Button */}
                            <div className={`pt-8 border-t mt-8 flex justify-end ${darkMode ? "border-[#334155]" : "border-slate-100"}`}>
                                <motion.button
                                    whileHover={{ scale: assigning ? 1 : 1.02 }}
                                    whileTap={{ scale: assigning ? 1 : 0.97 }}
                                    type="submit"
                                    disabled={assigning || !form.zone || !form.routePlan || !form.driver}
                                    className={`w-full sm:w-auto px-10 py-3.5 text-sm font-semibold text-white rounded-lg transition-all transform flex items-center justify-center gap-2.5 ${assigning || !form.zone || !form.routePlan || !form.driver
                                        ? "bg-[#4f46e5] opacity-70 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] hover:shadow-[0_4px_25px_rgba(79,70,229,0.35)]"
                                        }`}
                                >
                                    {assigning ? (
                                        <>
                                            <FaSpinner className="animate-spin" size={16} />
                                            Assigning Route...
                                        </>
                                    ) : (
                                        <>
                                            <FaUserCheck size={18} />
                                            Assign Route to Driver
                                        </>
                                    )}
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>
                </form>

            </div>
        </div>
    );
}