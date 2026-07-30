import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/ThemeContext";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCloudUploadAlt,
    FaSpinner,
    FaTrash,
    FaFileUpload
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

// React Select Styling matching UserCreation style
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

export default function MasterRouteUpload() {
    const { theme } = useTheme();
    const darkMode = theme === "dark";
    const navigate = useNavigate();

    const [form, setForm] = useState({
        zone: "",
        routePoint: ""
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [routePointOptions, setRoutePointOptions] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loadingZones, setLoadingZones] = useState(false);
    const [loadingRoutePoints, setLoadingRoutePoints] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch Zones on component mount
    useEffect(() => {
        fetchZones();
    }, []);

    // Fetch Zones from API
    const fetchZones = async () => {
        setLoadingZones(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.masterroutedpdwns.method,
                url: SummaryApi.masterroutedpdwns.url,
                data: { flagId: 1 }
            });

            if (response.data.status === true || response.data.status === false) {
                // Format zones for react-select
                const formattedZones = response.data.result.map(zone => ({
                    value: zone.ZoneMasterId.toString(),
                    label: zone.ZonePrefix,
                    zoneId: zone.ZoneMasterId,
                    zonePrefix: zone.ZonePrefix
                }));
                setZoneOptions(formattedZones);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Fetch Zones",
                    text: response.data.Message || "Failed to fetch zones",
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
                text: error.response?.data?.Message || "Failed to fetch zones. Please try again.",
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
        } finally {
            setLoadingZones(false);
        }
    };

    // Fetch Route Points based on selected Zone
    const fetchRoutePoints = async (zoneMasterId) => {
        if (!zoneMasterId) {
            setRoutePointOptions([]);
            return;
        }

        setLoadingRoutePoints(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.masterroutedpdwns.method,
                url: SummaryApi.masterroutedpdwns.url,
                data: {
                    flagId: 2,
                    ZoneMasterId: parseInt(zoneMasterId)
                }
            });

            if (response.data.status === true || response.data.status === false) {
                // Format route points for react-select with correct field names
                const formattedPoints = response.data.result.map(point => ({
                    value: point.RoutePlanId?.toString() || point.RoutePointId?.toString() || point.id?.toString(),
                    label: point.RoutePlanPoint || point.RoutePointName || point.label || point.name || "Route Point",
                    routePlanId: point.RoutePlanId,
                    routePlanPoint: point.RoutePlanPoint,
                    zoneMasterId: point.ZoneMasterId || zoneMasterId
                }));
                setRoutePointOptions(formattedPoints);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Fetch Route Points",
                    text: response.data.Message || "Failed to fetch route points",
                    confirmButtonColor: "#ef4444",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });
                setRoutePointOptions([]);
            }
        } catch (error) {
            console.error("Error fetching route points:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.Message || "Failed to fetch route points. Please try again.",
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
            setRoutePointOptions([]);
        } finally {
            setLoadingRoutePoints(false);
        }
    };

    const handleSelectChange = (selectedOption, { name }) => {
        const value = selectedOption ? selectedOption.value : "";
        setForm((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "zone") {
                updated.routePoint = "";
                if (selectedOption) {
                    fetchRoutePoints(selectedOption.zoneId || selectedOption.value);
                } else {
                    setRoutePointOptions([]);
                }
            }
            return updated;
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setErrorMessage("");
    };

    // File Selection Handler
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file) => {
        const validExtensions = [".csv", ".xlsx", ".xls"];
        const fileName = file.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            setErrors((prev) => ({ ...prev, file: "Invalid file type. Upload .xlsx, .xls or .csv file." }));
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setErrors((prev) => ({ ...prev, file: "" }));
        setErrorMessage("");
    };

    const removeSelectedFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFile(null);
        setErrors((prev) => ({ ...prev, file: "" }));
    };

    const validateForm = async () => {
        let valid = true;
        const newErrors = {};

        if (!form.zone) {
            newErrors.zone = "Zone is required";
            valid = false;
        }

        if (!form.routePoint) {
            newErrors.routePoint = "Route Point is required";
            valid = false;
        }

        if (!selectedFile) {
            newErrors.file = "Document file is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) return;

        setUploading(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const selectedZoneObj = zoneOptions.find((z) => z.value === form.zone);
            const selectedRoutePointObj = routePointOptions.find((rp) => rp.value === form.routePoint);

            // Get UserId from session storage
            const userId = sessionStorage.getItem("userId");

            if (!userId) {
                throw new Error("User not authenticated. Please login again.");
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("excel", selectedFile);
            formData.append("ZoneMasterId", selectedZoneObj?.zoneId || form.zone);
            formData.append("RoutePlanId", selectedRoutePointObj?.routePlanId || selectedRoutePointObj?.value || form.routePoint);
            formData.append("CreatedByUserId", userId);

            const response = await axiosClient({
                method: SummaryApi.masterrouteexcelupload.method,
                url: SummaryApi.masterrouteexcelupload.url,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Check if upload was successful
            if (response.data.status === true) {
                // Show success message with response details
                await Swal.fire({
                    icon: "success",
                    title: "Upload Successful!",
                    html: `
                        <div style="text-align: left; font-size: 14px; margin-top: 10px;">
                            <p><b>Message:</b> ${response.data.message}</p>
                            <p><b>Zone:</b> ${selectedZoneObj?.label || form.zone}</p>
                            
                           
                            <p><b>Uploaded Document:</b> ${selectedFile.name}</p>
                            ${response.data.result ? `
                               
                                <p><b>Total Records:</b> ${response.data.result.TotalRecords || 'N/A'}</p>
                            ` : ''}
                        </div>
                    `,
                    confirmButtonText: "Done",
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });

                setSuccessMessage(response.data.message || `Document "${selectedFile.name}" uploaded successfully!`);

                // Reset form
                setForm({ zone: "", routePoint: "" });
                setSelectedFile(null);
                setRoutePointOptions([]);

                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
            } else {
                throw new Error(response.data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Master Route Upload Error:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.Message || error.message || "An error occurred during file upload.";
            setErrorMessage(errorMsg);
            Swal.fire({
                icon: "error",
                title: "Upload Failed!",
                text: errorMsg,
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`min-h-full py-12 px-6 transition-colors duration-300 ${darkMode ? "bg-[#0f172a]" : "bg-gray-50"}`}>
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
                <form onSubmit={handleUploadSubmit} noValidate>
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

                                {/* Field 2: Select Route Point Dropdown */}
                                <div className="w-full sm:w-64 md:w-72 max-w-[280px]">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                        <span className="text-red-500 mr-1">*</span>Select Route Point
                                    </label>
                                    <Select
                                        name="routePoint"
                                        options={routePointOptions}
                                        value={routePointOptions.find((option) => option.value === form.routePoint) || null}
                                        onChange={(option) => handleSelectChange(option, { name: "routePoint" })}
                                        placeholder={!form.zone ? "Select zone first" : (loadingRoutePoints ? "Loading route points..." : "Select route point...")}
                                        noOptionsMessage={() => !form.zone ? "Please select a zone first" : (loadingRoutePoints ? "Loading..." : "No route points found")}
                                        styles={getSelectStyles(darkMode, errors.routePoint)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        isDisabled={!form.zone || loadingRoutePoints}
                                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.routePoint} />
                                </div>

                                {/* Field 3: Upload Document */}
                                <div className="w-full sm:w-80 md:w-96 max-w-sm">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                        <span className="text-red-500 mr-1">*</span>Upload Document
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="document-file-input"
                                            accept=".csv, .xlsx, .xls"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="document-file-input"
                                            className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg border cursor-pointer transition-all ${darkMode
                                                ? "bg-[#0f172a] border-slate-800 text-white hover:border-[#4f46e5]"
                                                : "bg-white border-gray-300 text-gray-900 hover:border-[#4f46e5]"
                                                } ${errors.file ? "border-red-500" : ""}`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                <FaFileUpload className={selectedFile ? "text-indigo-500" : (darkMode ? "text-gray-500" : "text-gray-400")} size={16} />
                                                <span className={`text-sm truncate ${selectedFile ? "font-semibold text-indigo-500" : (darkMode ? "text-gray-400" : "text-gray-500")}`}>
                                                    {selectedFile ? selectedFile.name : "Choose file (.xlsx, .csv)"}
                                                </span>
                                            </div>

                                            {selectedFile ? (
                                                <button
                                                    type="button"
                                                    onClick={removeSelectedFile}
                                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded flex-shrink-0"
                                                    title="Remove File"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-[#4f46e5] text-white rounded text-xs font-semibold flex items-center gap-1 flex-shrink-0 shadow-xs">
                                                    Browse
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                    <ErrorMessage message={errors.file} />
                                </div>

                            </div>

                            {/* Action Row - Upload Button */}
                            <div className={`pt-8 border-t mt-8 flex justify-end ${darkMode ? "border-[#334155]" : "border-slate-100"}`}>
                                <motion.button
                                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                                    whileTap={{ scale: uploading ? 1 : 0.97 }}
                                    type="submit"
                                    disabled={uploading || !form.zone || !form.routePoint || !selectedFile}
                                    className={`w-full sm:w-auto px-10 py-3.5 text-sm font-semibold text-white rounded-lg transition-all transform flex items-center justify-center gap-2.5 ${uploading || !form.zone || !form.routePoint || !selectedFile
                                        ? "bg-[#4f46e5] opacity-70 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] hover:shadow-[0_4px_25px_rgba(79,70,229,0.35)]"
                                        }`}
                                >
                                    {uploading ? (
                                        <>
                                            <FaSpinner className="animate-spin" size={16} />
                                            Uploading Document...
                                        </>
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt size={18} />
                                            Upload Master Route
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