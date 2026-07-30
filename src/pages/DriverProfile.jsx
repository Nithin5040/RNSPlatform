import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    FaSearch,
    FaTimes,
    FaUser,
    FaPhone,
    FaTruck,
    FaEye,
    FaFileAlt,
    FaFilePdf,
    FaFileImage,
    FaFile,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaUserCircle,
    FaCamera,
    FaIdCard,
    FaTachometerAlt,
    FaAddressCard,
    FaFileContract,
    FaCertificate,
    FaSpinner,
    FaEdit,
    FaSave,
    FaTimes as FaTimesIcon
} from "react-icons/fa";
import { SummaryApi } from "../api/SummaryApi";
import { useTheme } from "../contexts/ThemeContext";
import Pagination from "../components/Pagination";
import { motion, AnimatePresence } from "framer-motion";

const MySwal = withReactContent(Swal);

// Document field configuration - All 7 document types
const DOCUMENT_FIELDS = [
    { id: "driverPhoto", label: "Driver Photo", fileTypeId: 1, icon: FaCamera },
    { id: "aadhaarPhoto", label: "Driver Aadhaar Card", fileTypeId: 2, icon: FaIdCard },
    { id: "odometerPhoto", label: "Odometer Photo", fileTypeId: 3, icon: FaTachometerAlt },
    { id: "truckPhoto", label: "Truck Photo", fileTypeId: 4, icon: FaTruck },
    { id: "rcCardPhoto", label: "RC Card", fileTypeId: 5, icon: FaAddressCard },
    { id: "fcFile", label: "FC File", fileTypeId: 6, icon: FaFileContract },
    { id: "permitFile", label: "Permit File", fileTypeId: 7, icon: FaCertificate }
];

// Edit Driver Modal Component
const EditDriverModal = ({ isOpen, onClose, driverData, onSave, loading, darkMode }) => {
    const [formData, setFormData] = useState({
        driverName: "",
        mobileNumber: "",
        truckNumber: "",
        odometerReading: ""
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (driverData) {
            setFormData({
                driverName: driverData.driverName || "",
                mobileNumber: driverData.mobileNumber || "",
                truckNumber: driverData.truckNumber || "",
                odometerReading: driverData.odometerReading || ""
            });
        }
    }, [driverData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "mobileNumber") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
        } else if (name === "odometerReading") {
            const numericValue = value.replace(/\D/g, "");
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        setErrors(prev => ({ ...prev, [name]: "" }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        if (!formData[name] && name !== 'odometerReading') {
            setErrors(prev => ({ ...prev, [name]: `${name.replace(/([A-Z])/g, ' $1')} is required` }));
        }
        if (name === "mobileNumber" && formData.mobileNumber.length !== 10) {
            setErrors(prev => ({ ...prev, [name]: "Mobile number must be 10 digits" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.driverName) newErrors.driverName = "Driver name is required";
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
        if (formData.mobileNumber.length !== 10) newErrors.mobileNumber = "Mobile number must be 10 digits";
        if (!formData.truckNumber) newErrors.truckNumber = "Truck number is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        if (validateForm()) {
            onSave({
                driverDetailId: driverData?.id,
                driverName: formData.driverName,
                mobileNumber: formData.mobileNumber,
                truckNumber: formData.truckNumber,
                odometerReading: formData.odometerReading || null
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#1e293b] border border-[rgba(79,70,229,0.3)]" : "bg-white border border-gray-200"}`}
            >
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-[rgba(79,70,229,0.25)]' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                                <FaEdit className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={18} />
                            </div>
                            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Edit Driver
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Driver Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                <input
                                    type="text"
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter driver name"
                                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                                        ${darkMode
                                            ? 'bg-[#0f172a] border-[rgba(79,70,229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]'
                                        }
                                        ${errors.driverName && touched.driverName ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                                />
                            </div>
                            {errors.driverName && touched.driverName && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <FaTimesIcon size={10} />
                                    {errors.driverName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaPhone className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                                        ${darkMode
                                            ? 'bg-[#0f172a] border-[rgba(79,70,229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]'
                                        }
                                        ${errors.mobileNumber && touched.mobileNumber ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                                />
                            </div>
                            {errors.mobileNumber && touched.mobileNumber && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <FaTimesIcon size={10} />
                                    {errors.mobileNumber}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Truck Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaTruck className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                <input
                                    type="text"
                                    name="truckNumber"
                                    value={formData.truckNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter truck number"
                                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                                        ${darkMode
                                            ? 'bg-[#0f172a] border-[rgba(79,70,229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]'
                                        }
                                        ${errors.truckNumber && touched.truckNumber ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : ''}`}
                                />
                            </div>
                            {errors.truckNumber && touched.truckNumber && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <FaTimesIcon size={10} />
                                    {errors.truckNumber}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Odometer Reading <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <div className="relative">
                                <FaTachometerAlt className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                <input
                                    type="text"
                                    name="odometerReading"
                                    value={formData.odometerReading}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter odometer reading"
                                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                                        ${darkMode
                                            ? 'bg-[#0f172a] border-[rgba(79,70,229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`flex justify-end gap-3 mt-6 pt-4 border-t ${darkMode ? 'border-[rgba(79,70,229,0.25)]' : 'border-gray-200'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode
                                ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-[rgba(79,70,229,0.3)]'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${loading
                                ? 'bg-[#4f46e5]/60 cursor-not-allowed'
                                : 'bg-[#4f46e5] hover:bg-[#2e29a8]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave size={14} />
                                    Update Driver
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// Document View Modal
const DocumentViewModal = ({ isOpen, onClose, driverData, darkMode }) => {
    const [documentsStatus, setDocumentsStatus] = useState({});

    if (!isOpen) return null;

    const getDocumentIcon = (fileTypeId) => {
        const field = DOCUMENT_FIELDS.find(f => f.fileTypeId === fileTypeId);
        return field ? field.icon : FaFile;
    };

    const getFileTypeName = (fileTypeId) => {
        const field = DOCUMENT_FIELDS.find(f => f.fileTypeId === fileTypeId);
        return field ? field.label : `Document ${fileTypeId}`;
    };

    const handleDocumentView = async (fileTypeId, driverDetailId) => {
        setDocumentsStatus(prev => ({ ...prev, [fileTypeId]: 'loading' }));

        try {
            const response = await axiosClient({
                method: SummaryApi.viewdriverdoc.method,
                url: SummaryApi.viewdriverdoc.url,
                data: {
                    fileTypeId: fileTypeId,
                    DriverDetailId: driverDetailId
                },
                responseType: 'blob'
            });

            const contentType = response.headers['content-type'];

            if (contentType && contentType.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(response.data);
                const contentDisposition = response.headers['content-disposition'];
                let filename = getFileTypeName(fileTypeId);
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="(.+)"/);
                    if (match && match[1]) {
                        filename = match[1];
                    }
                }

                setDocumentsStatus(prev => ({
                    ...prev,
                    [fileTypeId]: 'loaded',
                    [`${fileTypeId}_data`]: {
                        filePath: imageUrl,
                        fileName: filename,
                        fileType: contentType
                    }
                }));

                MySwal.fire({
                    title: getFileTypeName(fileTypeId),
                    html: `
                        <div style="padding: 10px;">
                            <img src="${imageUrl}" alt="${getFileTypeName(fileTypeId)}" style="max-width: 100%; max-height: 500px; border-radius: 8px;" />
                            ${filename ? `<p style="margin-top: 10px; font-size: 13px; color: #666;">File: ${filename}</p>` : ''}
                        </div>
                    `,
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                    width: '600px',
                    willUnmount: () => {
                        URL.revokeObjectURL(imageUrl);
                    }
                });
            } else if (contentType && contentType === 'application/json') {
                const text = await response.data.text();
                const jsonData = JSON.parse(text);
                const message = jsonData.message || "Document not available";

                setDocumentsStatus(prev => ({ ...prev, [fileTypeId]: 'error' }));

                MySwal.fire({
                    icon: "info",
                    title: getFileTypeName(fileTypeId),
                    text: message,
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000'
                });
            } else {
                setDocumentsStatus(prev => ({ ...prev, [fileTypeId]: 'error' }));
                MySwal.fire({
                    icon: "info",
                    title: getFileTypeName(fileTypeId),
                    text: "Document not available in expected format",
                    confirmButtonColor: "#4f46e5",
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000'
                });
            }
        } catch (error) {
            console.error("Error fetching document:", error);
            setDocumentsStatus(prev => ({ ...prev, [fileTypeId]: 'error' }));

            if (error.response && error.response.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const jsonData = JSON.parse(text);
                    const errorMsg = jsonData.message || "Failed to fetch document";
                    MySwal.fire({
                        icon: "error",
                        title: "Error",
                        text: errorMsg,
                        confirmButtonColor: "#ef4444",
                        background: darkMode ? '#1e293b' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#000000'
                    });
                } catch (e) {
                    MySwal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to fetch document. Please try again.",
                        confirmButtonColor: "#ef4444",
                        background: darkMode ? '#1e293b' : '#ffffff',
                        color: darkMode ? '#ffffff' : '#000000'
                    });
                }
            } else {
                const errorMsg = error.response?.data?.message || error.message || "Failed to fetch document";
                MySwal.fire({
                    icon: "error",
                    title: "Error",
                    text: errorMsg,
                    confirmButtonColor: "#ef4444",
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000'
                });
            }
        } finally {
            setDocumentsStatus(prev => ({ ...prev, [fileTypeId]: 'idle' }));
        }
    };

    const getDocumentData = (fileTypeId) => {
        return documentsStatus[`${fileTypeId}_data`] || null;
    };

    const getDocumentStatus = (fileTypeId) => {
        return documentsStatus[fileTypeId] || 'idle';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#1e293b] border border-[rgba(79,70,229,0.3)]" : "bg-white border border-gray-200"}`}
            >
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-[rgba(79,70,229,0.25)]' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                                <FaFileAlt className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={18} />
                            </div>
                            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Driver Documents
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {driverData && (
                        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-[#0f172a]">
                            <p className={`text-sm flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <FaUser className={darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"} size={14} />
                                <span className="font-medium">{driverData.driverName}</span>
                            </p>
                            <p className={`text-sm flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <FaTruck className={darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"} size={14} />
                                {driverData.truckNumber}
                            </p>
                            <p className={`text-sm flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <FaPhone className={darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"} size={14} />
                                {driverData.mobileNumber}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DOCUMENT_FIELDS.map((field) => {
                            const Icon = field.icon;
                            const docData = getDocumentData(field.fileTypeId);
                            const docStatus = getDocumentStatus(field.fileTypeId);
                            const hasDocument = docData !== null;
                            const isLoading = docStatus === 'loading';

                            return (
                                <div
                                    key={field.fileTypeId}
                                    onClick={() => {
                                        if (!isLoading) {
                                            handleDocumentView(field.fileTypeId, driverData?.id);
                                        }
                                    }}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${isLoading
                                        ? darkMode
                                            ? "bg-[#0f172a] border-[rgba(79,70,229,0.3)]"
                                            : "bg-gray-50 border-gray-300"
                                        : darkMode
                                            ? "bg-[#0f172a] border-[rgba(79,70,229,0.2)] hover:border-[rgba(79,70,229,0.5)] hover:shadow-lg"
                                            : "bg-gray-50 border-gray-200 hover:border-[#4f46e5] hover:shadow-md"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${isLoading
                                            ? darkMode ? "bg-indigo-900/30" : "bg-indigo-50/50"
                                            : darkMode ? "bg-indigo-900/40" : "bg-indigo-50"
                                            }`}>
                                            {isLoading ? (
                                                <FaSpinner className="animate-spin text-[#4f46e5]" size={20} />
                                            ) : (
                                                <Icon className={darkMode ? "text-[#818cf8]" : "text-[#4f46e5]"} size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-medium text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                {field.label}
                                            </p>
                                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {isLoading ? "Loading..." : (hasDocument ? "Click to view" : "Click to check")}
                                            </p>
                                        </div>
                                    </div>
                                    {hasDocument && !isLoading && docData && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {docData.fileName || 'File'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function DriverProfile() {
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const navigate = useNavigate();

    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.driverdetails.method,
                url: SummaryApi.driverdetails.url,
                data: { flagId: 1 }
            });

            if (response.data?.status === true) {
                setDrivers(response.data.data);
            } else {
                MySwal.fire({
                    icon: "error",
                    title: "Failed to Fetch Drivers",
                    text: response.data?.message || "Failed to fetch drivers",
                    confirmButtonColor: "#ef4444",
                    background: darkMode ? "#1e293b" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000"
                });
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Failed to fetch drivers. Please try again.",
                confirmButtonColor: "#ef4444",
                background: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditDriver = async (formData) => {
        setEditLoading(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.editdriverdetails.method,
                url: SummaryApi.editdriverdetails.url,
                data: {
                    flagId: 2,
                    DriverName: formData.driverName,
                    MobileNumber: formData.mobileNumber,
                    TruckNumber: formData.truckNumber,
                    OdometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : null,
                    DriverDetailId: formData.driverDetailId
                }
            });

            if (response.data?.status === true) {
                MySwal.fire({
                    icon: "success",
                    title: "Success!",
                    text: response.data.message || "Driver updated successfully",
                    timer: 1500,
                    showConfirmButton: false,
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000'
                });
                fetchDrivers();
                setShowEditModal(false);
                setSelectedDriver(null);
            } else {
                throw new Error(response.data?.message || "Failed to update driver");
            }
        } catch (error) {
            console.error("Error updating driver:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || error.message || "Failed to update driver",
                confirmButtonColor: "#ef4444",
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000'
            });
        } finally {
            setEditLoading(false);
        }
    };

    const filteredDrivers = useMemo(() => {
        if (!searchTerm.trim()) return drivers;
        const term = searchTerm.toLowerCase();
        return drivers.filter(driver =>
            driver.DriverName?.toLowerCase().includes(term) ||
            driver.MobileNumber?.includes(term) ||
            driver.TruckNumber?.toLowerCase().includes(term)
        );
    }, [drivers, searchTerm]);

    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);
    const showingFrom = filteredDrivers.length > 0 ? startIndex + 1 : 0;
    const showingTo = Math.min(endIndex, filteredDrivers.length);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleViewDocuments = (driver) => {
        setSelectedDriver({
            id: driver.DriverDetailId,
            driverName: driver.DriverName,
            mobileNumber: driver.MobileNumber,
            truckNumber: driver.TruckNumber
        });
        setShowDocumentModal(true);
    };

    const handleEditClick = (driver) => {
        setSelectedDriver({
            id: driver.DriverDetailId,
            driverName: driver.DriverName,
            mobileNumber: driver.MobileNumber,
            truckNumber: driver.TruckNumber,
            odometerReading: driver.OdometerReading || ""
        });
        setShowEditModal(true);
    };

    return (
        <div className={`min-h-full py-8 px-6 transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-[1600px] mx-auto space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-bold flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <FaUser className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={22} />
                            Driver Profiles
                        </h1>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            View, edit and manage driver profiles across all operating zones
                        </p>
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#1e293b] border-[rgba(79,70,229,0.25)] shadow-[0_10px_35px_rgba(0,0,0,0.3)]' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="w-full sm:w-96 relative">
                        <FaSearch
                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            size={13}
                        />
                        <input
                            type="text"
                            placeholder="Search drivers by name, mobile, truck..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode
                                ? 'bg-[#0f172a] border-[rgba(79,70,229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]'
                                }`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <FaTimes size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#1e293b] border-[rgba(79,70,229,0.25)] shadow-[0_10px_35px_rgba(0,0,0,0.3)]' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-xs">
                            <thead className={`${darkMode
                                ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white'
                                : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white'} uppercase tracking-wider`}>
                                <tr>
                                    <th className="py-3.5 px-4 font-semibold">S.No</th>
                                    <th className="py-3.5 px-4 font-semibold">Driver Name</th>
                                    <th className="py-3.5 px-4 font-semibold">Mobile Number</th>
                                    <th className="py-3.5 px-4 font-semibold">Truck Number</th>
                                    <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-[rgba(79,70,229,0.12)]' : 'divide-gray-100'}`}>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className={`px-4 py-10 text-center ${darkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5] mb-3"></div>
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading drivers...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedDrivers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className={`px-4 py-10 text-center ${darkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                                            <div className="flex flex-col items-center justify-center">
                                                <FaUser className={`text-3xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {searchTerm ? "No drivers found matching your search" : "No drivers found"}
                                                </span>
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => setSearchTerm("")}
                                                        className={`mt-2 text-xs px-3 py-1 rounded-lg ${darkMode
                                                            ? 'bg-white/5 text-[#818cf8] hover:bg-white/10 border border-[rgba(79,70,229,0.3)]'
                                                            : 'bg-indigo-50 text-[#4f46e5] hover:bg-indigo-100'
                                                            }`}
                                                    >
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDrivers.map((driver, index) => (
                                        <tr
                                            key={driver.DriverDetailId || index}
                                            className={`transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/80'}`}
                                        >
                                            <td className="py-3.5 px-4">
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {showingFrom + index}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-50'}`}>
                                                        <FaUserCircle className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={14} />
                                                    </div>
                                                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {driver.DriverName || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <FaPhone className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={11} />
                                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {driver.MobileNumber || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <FaTruck className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={11} />
                                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {driver.TruckNumber || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(driver)}
                                                        className={`p-2 rounded-lg transition-colors ${darkMode
                                                            ? 'text-[#818cf8] hover:bg-white/10'
                                                            : 'text-[#4f46e5] hover:bg-indigo-50'
                                                            }`}
                                                        title="Edit Driver"
                                                    >
                                                        <FaEdit size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDocuments(driver)}
                                                        className={`p-2 rounded-lg transition-colors ${darkMode
                                                            ? 'text-[#818cf8] hover:bg-white/10'
                                                            : 'text-[#4f46e5] hover:bg-indigo-50'
                                                            }`}
                                                        title="View Documents"
                                                    >
                                                        <FaEye size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && filteredDrivers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredDrivers.length}
                            showingFrom={showingFrom}
                            showingTo={showingTo}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            itemsPerPageOptions={[5, 10, 15, 20]}
                            darkMode={darkMode}
                        />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showEditModal && (
                    <EditDriverModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedDriver(null);
                        }}
                        driverData={selectedDriver}
                        onSave={handleEditDriver}
                        loading={editLoading}
                        darkMode={darkMode}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDocumentModal && (
                    <DocumentViewModal
                        isOpen={showDocumentModal}
                        onClose={() => {
                            setShowDocumentModal(false);
                            setSelectedDriver(null);
                        }}
                        driverData={selectedDriver}
                        darkMode={darkMode}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}