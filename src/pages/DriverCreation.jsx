import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/ThemeContext";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../api/axiosClient";
import { SummaryApi } from "../api/SummaryApi";
import {
    FaUser,
    FaPhone,
    FaTruck,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaSpinner,
    FaUserPlus,
    FaCamera,
    FaTachometerAlt,
    FaIdCard,
    FaAddressCard,
    FaFileContract,
    FaCertificate,
    FaTrashAlt,
    FaUpload,
    FaFileUpload,

} from "react-icons/fa";

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-xs text-red-500 flex items-start gap-1">
            <span className="inline-block mt-0.5">⚠️</span>
            <span>{message}</span>
        </p>
    );
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const ALLOWED_ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";

// Document field configuration
const DOCUMENT_FIELDS = [
    {
        id: "driverPhoto",
        label: "Driver Photo",
        icon: FaCamera,
        fileTypeName: "DriverPhoto",
        fileTypeId: 1
    },
    {
        id: "aadhaarPhoto",
        label: "Driver Aadhaar Card",
        icon: FaIdCard,
        fileTypeName: "DriverAadhar",
        fileTypeId: 2
    },
    {
        id: "odometerPhoto",
        label: "Odometer Photo",
        icon: FaTachometerAlt,
        fileTypeName: "OdometerPhoto",
        fileTypeId: 3
    },
    {
        id: "truckPhoto",
        label: "Truck Photo",
        icon: FaTruck,
        fileTypeName: "TruckPhoto",
        fileTypeId: 4
    },
    {
        id: "rcCardPhoto",
        label: "RC Card",
        icon: FaAddressCard,
        fileTypeName: "RC Card",
        fileTypeId: 5
    },
    {
        id: "fcFile",
        label: "FC File",
        icon: FaFileContract,
        fileTypeName: "FC File",
        fileTypeId: 6
    },
    {
        id: "permitFile",
        label: "Permit File",
        icon: FaCertificate,
        fileTypeName: "Permit File",
        fileTypeId: 7
    }
];

// Document Upload Row Component - Styled like main fields
const DocumentUploadRow = ({ field, file, error, onChange, darkMode }) => {
    const fileInputRef = useRef(null);
    const Icon = field.icon;

    const removeFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                {field.label}
            </label>
            <input
                ref={fileInputRef}
                type="file"
                id={field.id}
                accept={ALLOWED_ACCEPT}
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="hidden"
            />

            <div className="relative">
                <label
                    htmlFor={field.id}
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg border cursor-pointer transition-all ${darkMode
                        ? "bg-[#0f172a] border-gray-800 text-white hover:border-[#4f46e5]"
                        : "bg-white border-gray-300 text-gray-900 hover:border-[#4f46e5]"
                        } ${error ? "border-red-500" : ""}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden mr-2 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${file
                            ? "bg-indigo-500/20 text-indigo-400"
                            : darkMode
                                ? "bg-indigo-500/15 text-[#818cf8]"
                                : "bg-indigo-50 text-[#4f46e5]"
                            }`}>
                            <Icon size={14} />
                        </div>
                        <span className={`text-sm truncate ${file
                            ? "font-semibold text-indigo-400"
                            : (darkMode ? "text-gray-400" : "text-gray-500")
                            }`}>
                            {file ? file.name : `Upload ${field.label}`}
                        </span>
                        {file && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold shrink-0">
                                {file.name.split(".").pop().toUpperCase()}
                            </span>
                        )}
                        {file && (
                            <span className={`text-[10px] shrink-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                ({formatFileSize(file.size)})
                            </span>
                        )}
                    </div>

                    {file ? (
                        <button
                            type="button"
                            onClick={removeFile}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                            title="Remove File"
                        >
                            <FaTrashAlt size={14} />
                        </button>
                    ) : (
                        <span className="px-3 py-1 bg-[#4f46e5] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm">
                            <FaUpload size={11} />
                            Browse
                        </span>
                    )}
                </label>
            </div>
            <ErrorMessage message={error} />
        </div>
    );
};

const initialFormState = {
    name: "",
    mobileNumber: "",
    truckNumber: "",
    password: "",
    odometerReading: ""
};

// Create initial files state
const createInitialFilesState = () => {
    const state = {};
    DOCUMENT_FIELDS.forEach(field => {
        state[field.id] = null;
    });
    return state;
};

export default function DriverCreation() {
    const { theme } = useTheme();
    const darkMode = theme === "dark";
    const navigate = useNavigate();

    const [form, setForm] = useState(initialFormState);
    const [files, setFiles] = useState(createInitialFilesState());
    const [filePreviews, setFilePreviews] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(filePreviews).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "mobileNumber") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setForm((prev) => ({ ...prev, [name]: numericValue }));
            }
        } else if (name === "odometerReading") {
            // Allow only numbers and decimal point for odometer reading
            const cleanedValue = value.replace(/[^0-9.]/g, '');
            // Prevent multiple decimal points
            const parts = cleanedValue.split('.');
            if (parts.length > 2) return;
            setForm((prev) => ({ ...prev, [name]: cleanedValue }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }

        setErrors((prev) => ({ ...prev, [name]: "" }));
        setErrorMessage("");
    };

    const handleFileChange = (fieldId, selectedFile) => {
        if (selectedFile) {
            const fileName = selectedFile.name.toLowerCase();
            const validExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
            const isExtensionValid = validExtensions.some((ext) => fileName.endsWith(ext));
            const isMimeValid = selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf";

            if (!isExtensionValid && !isMimeValid) {
                setErrors((prev) => ({
                    ...prev,
                    [fieldId]: "Invalid format. Please upload JPG, JPEG, PNG or PDF format."
                }));
                return;
            }

            if (selectedFile.size > 10 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, [fieldId]: "File size exceeds 10MB limit" }));
                return;
            }

            if (filePreviews[fieldId]) {
                URL.revokeObjectURL(filePreviews[fieldId]);
            }

            if (selectedFile.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(selectedFile.name)) {
                const url = URL.createObjectURL(selectedFile);
                setFilePreviews((prev) => ({ ...prev, [fieldId]: url }));
            } else {
                setFilePreviews((prev) => ({ ...prev, [fieldId]: null }));
            }

            setFiles((prev) => ({ ...prev, [fieldId]: selectedFile }));
            setErrors((prev) => ({ ...prev, [fieldId]: "" }));
        } else {
            if (filePreviews[fieldId]) {
                URL.revokeObjectURL(filePreviews[fieldId]);
            }
            setFilePreviews((prev) => ({ ...prev, [fieldId]: null }));
            setFiles((prev) => ({ ...prev, [fieldId]: null }));
            setErrors((prev) => ({ ...prev, [fieldId]: "" }));
        }
        setErrorMessage("");
    };

    const validateForm = async () => {
        try {
            const schema = yup.object().shape({
                name: yup.string().required("Driver Name is required").max(100, "Driver name cannot exceed 100 characters"),
                mobileNumber: yup.string().required("Mobile Number is required").matches(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
                truckNumber: yup.string().required("Truck Number is required").max(20, "Truck number cannot exceed 20 characters"),
                password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
                odometerReading: yup.string()
                    .required("Odometer Reading is required")
                    .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid odometer reading (e.g., 12345.67)")
            });

            await schema.validate(form, { abortEarly: false });

            // Check if at least one document is uploaded
            const hasDocuments = Object.values(files).some(file => file !== null);
            if (!hasDocuments) {
                setErrors((prev) => ({ ...prev, documents: "Please upload at least one document" }));
                return false;
            }

            setErrors({});
            return true;
        } catch (err) {
            const validationErrors = {};
            if (err.inner) {
                err.inner.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });
            }
            setErrors(validationErrors);
            return false;
        }
    };

    const resetAllFields = () => {
        setForm(initialFormState);
        Object.values(filePreviews).forEach((url) => {
            if (url) URL.revokeObjectURL(url);
        });
        setFiles(createInitialFilesState());
        setFilePreviews({});
        setSuccessMessage("");
        setErrorMessage("");
    };

    const getUploadedFilesCount = () => {
        return Object.values(files).filter(file => file !== null).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) return;

        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const createdByUserId = sessionStorage.getItem("userId") || 1;

            const formData = new FormData();
            formData.append("flagId", "1");
            formData.append("DriverName", form.name);
            formData.append("MobileNumber", form.mobileNumber);
            formData.append("TruckNumber", form.truckNumber);
            formData.append("Password", form.password);
            formData.append("OdometerReading", form.odometerReading);
            formData.append("CreatedByUserId", String(createdByUserId));

            // Get file type IDs for uploaded documents
            const uploadedFileTypeIds = DOCUMENT_FIELDS
                .filter(field => files[field.id] !== null)
                .map(field => field.fileTypeId);

            formData.append("FileTypeIds", JSON.stringify(uploadedFileTypeIds));

            // Append all uploaded files
            DOCUMENT_FIELDS.forEach(field => {
                if (files[field.id]) {
                    formData.append("files", files[field.id]);
                }
            });

            const response = await axiosClient({
                method: SummaryApi.drivercreation.method,
                url: SummaryApi.drivercreation.url,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data?.status) {
                const uploadedFilesSummary = DOCUMENT_FIELDS
                    .filter(field => files[field.id] !== null)
                    .map(field => {
                        const file = files[field.id];
                        return `<li><b>${field.label}:</b> ${file.name} (${formatFileSize(file.size)})</li>`;
                    })
                    .join("");

                await Swal.fire({
                    icon: "success",
                    title: "Driver Created Successfully!",
                    html: `
                        <div style="text-align: left; font-size: 14px; margin-top: 10px; line-height: 1.6;">
                            <p><b>Driver Name:</b> ${form.name}</p>
                            <p><b>Mobile Number:</b> ${form.mobileNumber}</p>
                            <p><b>Truck Number:</b> ${form.truckNumber}</p>
                            <p><b>Odometer Reading:</b> ${form.odometerReading} km</p>
                            <hr style="margin: 10px 0; border-color: rgba(120,120,120,0.2);"/>
                            <p><b>Uploaded Documents:</b> (${uploadedFilesSummary.split(",").length})</p>
                            <ul style="padding-left: 18px; margin-top: 4px;">${uploadedFilesSummary}</ul>
                        </div>
                    `,
                    confirmButtonText: "Done",
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });

                setSuccessMessage(`Driver "${form.name}" created successfully!`);
                resetAllFields();
            } else {
                throw new Error(response.data?.message || "Failed to create driver");
            }
        } catch (error) {
            console.error("Driver Creation Error:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.Message || error.message || "An error occurred while creating driver.";
            setErrorMessage(errorMsg);
            Swal.fire({
                icon: "error",
                title: "Creation Failed!",
                text: errorMsg,
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
        } finally {
            setLoading(false);
        }
    };

    const uploadedCount = getUploadedFilesCount();
    const totalDocuments = DOCUMENT_FIELDS.length;

    return (
        <div className={`min-h-screen py-8 px-4 sm:py-12 sm:px-6 transition-colors duration-300 ${darkMode ? "bg-[#0f172a]" : "bg-slate-50"}`}>
            <div className="w-full max-w-[1600px] mx-auto">

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

                <form onSubmit={handleSubmit} noValidate>
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`${darkMode ? "bg-[#1e293b] border-[#334155] shadow-[0_10px_35px_rgba(0,0,0,0.4)]" : "bg-white border-slate-200 shadow-sm"} rounded-2xl border`}
                    >
                        {/* Top Gradient Line */}
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] rounded-t-2xl" />

                        <div className="p-4 sm:p-6 lg:p-8">
                            {/* Driver Information Fields - 4 per row */}
                            <div>
                                <h2 className={`text-base font-bold mb-4 sm:mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                    Driver Information
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                                    {/* Field 1: Driver Name */}
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            <span className="text-red-500 mr-1">*</span>Driver Name
                                        </label>
                                        <div className="relative">
                                            <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={14} />
                                            <input
                                                placeholder="Enter driver name"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                maxLength={100}
                                                className={`w-full h-[44px] rounded-lg border pl-10 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                    ? "bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    : "bg-white border-[#D1D5DB] text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    } ${errors.name ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        <ErrorMessage message={errors.name} />
                                    </div>

                                    {/* Field 2: Mobile Number */}
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            <span className="text-red-500 mr-1">*</span>Mobile Number
                                        </label>
                                        <div className="relative">
                                            <FaPhone className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={14} />
                                            <input
                                                placeholder="Enter 10-digit mobile"
                                                name="mobileNumber"
                                                value={form.mobileNumber}
                                                onChange={handleChange}
                                                maxLength={10}
                                                className={`w-full h-[44px] rounded-lg border pl-10 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                    ? "bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    : "bg-white border-[#D1D5DB] text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    } ${errors.mobileNumber ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        <ErrorMessage message={errors.mobileNumber} />
                                    </div>

                                    {/* Field 3: Truck Number */}
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            <span className="text-red-500 mr-1">*</span>Truck Number
                                        </label>
                                        <div className="relative">
                                            <FaTruck className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={14} />
                                            <input
                                                placeholder="Enter truck number"
                                                name="truckNumber"
                                                value={form.truckNumber}
                                                onChange={handleChange}
                                                maxLength={20}
                                                className={`w-full h-[44px] rounded-lg border pl-10 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                    ? "bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    : "bg-white border-[#D1D5DB] text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    } ${errors.truckNumber ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        <ErrorMessage message={errors.truckNumber} />
                                    </div>

                                    {/* Field 4: Password */}
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            <span className="text-red-500 mr-1">*</span>Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={14} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter password"
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                className={`w-full h-[44px] rounded-lg border pl-10 pr-10 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                    ? "bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    : "bg-white border-[#D1D5DB] text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    } ${errors.password ? "border-red-500" : ""}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                                            >
                                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                            </button>
                                        </div>
                                        <ErrorMessage message={errors.password} />
                                    </div>

                                    {/* Field 5: Odometer Reading */}
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                                            <span className="text-red-500 mr-1">*</span>Odometer Reading
                                        </label>
                                        <div className="relative">
                                            <FaTachometerAlt className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={14} />
                                            <input
                                                placeholder="Enter odometer reading"
                                                name="odometerReading"
                                                value={form.odometerReading}
                                                onChange={handleChange}
                                                className={`w-full h-[44px] rounded-lg border pl-10 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                    ? "bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    : "bg-white border-[#D1D5DB] text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                                    } ${errors.odometerReading ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        <ErrorMessage message={errors.odometerReading} />
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload Section - 4 per row */}
                            <div className={`pt-6 mt-6 border-t ${darkMode ? "border-gray-800/60" : "border-gray-100"}`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                            Document Uploads
                                        </h2>
                                        <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            Supported formats: JPG, JPEG, PNG, PDF (Max 10MB per file)
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${uploadedCount > 0
                                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                        : darkMode
                                            ? "bg-gray-800 text-gray-400 border border-gray-700"
                                            : "bg-gray-100 text-gray-600 border border-gray-300"
                                        }`}>
                                        {uploadedCount} / {totalDocuments} Uploaded
                                    </div>
                                </div>

                                {errors.documents && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs">
                                        {errors.documents}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {DOCUMENT_FIELDS.map((field) => (
                                        <DocumentUploadRow
                                            key={field.id}
                                            field={field}
                                            file={files[field.id]}
                                            error={errors[field.id]}
                                            onChange={(file) => handleFileChange(field.id, file)}
                                            darkMode={darkMode}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Action Row - Submit Button */}
                            <div className={`pt-6 mt-6 border-t flex justify-end ${darkMode ? "border-[#334155]" : "border-slate-100"}`}>
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.97 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full sm:w-auto px-8 sm:px-10 py-3.5 text-sm font-semibold text-white rounded-lg transition-all transform flex items-center justify-center gap-2 ${loading
                                        ? "bg-[#4f46e5] opacity-70 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] hover:shadow-[0_4px_25px_rgba(79,70,229,0.35)]"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" size={14} />
                                            Creating Driver...
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus size={14} />
                                            Create Driver
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