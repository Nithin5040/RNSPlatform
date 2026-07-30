import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as yup from 'yup';
import {
    FaPlus,
    FaEdit,
    FaSearch,
    FaTimes,
    FaRoad,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaUserCircle,
    FaRoute,
    FaTag
} from "react-icons/fa";
import { SummaryApi } from "../api/SummaryApi";
import { useTheme } from "../contexts/ThemeContext";
import Pagination from "../components/Pagination";
import Select from "react-select";

const MySwal = withReactContent(Swal);

// Yup validation schema for Route
const routeSchema = yup.object().shape({
    zoneMasterId: yup
        .number()
        .required('Zone is required')
        .positive('Please select a valid zone'),

    routePoint: yup
        .string()
        .required('Route point is required')
        .min(2, 'Route point must be at least 2 characters')
        .max(100, 'Route point cannot exceed 100 characters')
});

// Route Modal Component
const RouteModal = ({ isOpen, onClose, onSubmit, initialData = null, loading, darkMode, zones, fetchZones }) => {
    const [formData, setFormData] = useState({
        zoneMasterId: "",
        routePoint: ""
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [selectedZone, setSelectedZone] = useState(null);
    const [routePrefix, setRoutePrefix] = useState("");
    const [fetchingPrefix, setFetchingPrefix] = useState(false);
    const [zonesLoaded, setZonesLoaded] = useState(false);

    // Fetch zones when modal opens if not loaded
    useEffect(() => {
        if (isOpen && !zones.length) {
            fetchZones();
        }
    }, [isOpen, zones.length, fetchZones]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                zoneMasterId: initialData.ZoneMasterId || initialData.zoneMasterId || "",
                routePoint: initialData.RoutePlanPoint || initialData.routePoint || ""
            });
            const zone = zones.find(z => z.value === (initialData.ZoneMasterId || initialData.zoneMasterId));
            setSelectedZone(zone || null);
            setRoutePrefix(initialData.RoutePrefix || initialData.routePrefix || "");
        } else {
            setFormData({
                zoneMasterId: "",
                routePoint: ""
            });
            setSelectedZone(null);
            setRoutePrefix("");
        }
        setErrors({});
        setTouched({});
    }, [initialData, isOpen, zones]);

    // Fetch route prefix when zone changes
    const fetchRoutePrefix = async (zoneId) => {
        setFetchingPrefix(true);
        try {
            const payload = {
                flagId: 2,
                zonemasterId: parseInt(zoneId)
            };

            const response = await axiosClient({
                method: SummaryApi.routeplandpdwns.method,
                url: SummaryApi.routeplandpdwns.url,
                data: payload
            });

            if (response.data?.status === true && response.data?.result && response.data.result.length > 0) {
                const prefix = response.data.result[0].ZonePrefix || "";
                setRoutePrefix(prefix);
                return prefix;
            } else {
                setRoutePrefix("");
                return "";
            }
        } catch (error) {
            console.error("Error fetching route prefix:", error);
            setRoutePrefix("");
            return "";
        } finally {
            setFetchingPrefix(false);
        }
    };

    const validateField = async (name, value) => {
        try {
            await routeSchema.validateAt(name, { [name]: value });
            setErrors(prev => ({ ...prev, [name]: "" }));
            return true;
        } catch (err) {
            setErrors(prev => ({ ...prev, [name]: err.message }));
            return false;
        }
    };

    const validateForm = async () => {
        try {
            await routeSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const validationErrors = {};
            err.inner.forEach(error => {
                validationErrors[error.path] = error.message;
            });
            setErrors(validationErrors);
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === "routePoint") {
            processedValue = value.replace(/[^a-zA-Z0-9\s\-_.,]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));

        if (touched[name]) {
            validateField(name, processedValue);
        }
    };

    const handleZoneChange = async (selectedOption) => {
        setSelectedZone(selectedOption);
        const zoneId = selectedOption ? selectedOption.value : "";
        setFormData(prev => ({ ...prev, zoneMasterId: zoneId }));
        setErrors(prev => ({ ...prev, zoneMasterId: "" }));
        setTouched(prev => ({ ...prev, zoneMasterId: true }));

        if (zoneId) {
            await fetchRoutePrefix(zoneId);
        } else {
            setRoutePrefix("");
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        const isValid = await validateForm();
        if (isValid) {
            onSubmit({
                zoneMasterId: formData.zoneMasterId,
                routePoint: formData.routePoint,
                routePrefix: routePrefix
            });
        }
    };

    if (!isOpen) return null;

    // React Select styles — matching app theme
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
            borderColor: errors.zoneMasterId && touched.zoneMasterId
                ? '#EF4444'
                : state.isFocused
                    ? '#4f46e5'
                    : darkMode ? '#334155' : '#D1D5DB',
            borderWidth: '1px',
            borderRadius: '0.5rem',
            minHeight: '42px',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(79,70,229,0.2)' : 'none',
            '&:hover': {
                borderColor: errors.zoneMasterId && touched.zoneMasterId ? '#EF4444' : '#4f46e5'
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            zIndex: 9999
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        }),
        option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
                ? '#4f46e5'
                : isFocused
                    ? (darkMode ? 'rgba(99,102,241,0.18)' : '#f1f5f9')
                    : 'transparent',
            color: isSelected
                ? '#ffffff'
                : (darkMode ? '#f8fafc' : '#0f172a'),
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#4f46e5'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: darkMode ? '#f8fafc' : '#0f172a'
        }),
        placeholder: (base) => ({
            ...base,
            color: darkMode ? '#94a3b8' : '#9ca3af',
            fontSize: '0.875rem'
        })
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`${darkMode ? 'bg-[#1e293b] border border-[rgba(79, 70, 229,0.3)] shadow-[0_10px_50px_rgba(0,0,0,0.5)]' : 'bg-white border border-gray-200 shadow-xl'} rounded-2xl w-full max-w-md`}>

                {/* Modal Header */}
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-[rgba(79, 70, 229,0.25)]' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                                <FaRoute className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={18} />
                            </div>
                            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {initialData ? "Edit Route Point" : "Create New Route Point"}
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

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">

                        {/* Zone Selection */}
                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Zone <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={zones}
                                value={selectedZone}
                                onChange={handleZoneChange}
                                placeholder={zones.length === 0 ? "Loading zones..." : "Select zone..."}
                                noOptionsMessage={() => zones.length === 0 ? "Loading zones..." : "No zones found"}
                                styles={selectStyles}
                                classNamePrefix="react-select"
                                isSearchable
                                isLoading={zones.length === 0}
                                menuPortalTarget={document.body}
                            />
                            {errors.zoneMasterId && touched.zoneMasterId && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <FaTimes size={10} />
                                    {errors.zoneMasterId}
                                </p>
                            )}
                        </div>

                        {/* Route Prefix Display */}
                        {fetchingPrefix && (
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#0f172a] border border-[rgba(79, 70, 229,0.2)]' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4f46e5]"></div>
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fetching prefix...</span>
                                </div>
                            </div>
                        )}

                        {routePrefix && !fetchingPrefix && (
                            <div className={`p-3 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-indigo-900/30 border border-[rgba(79, 70, 229,0.3)]' : 'bg-indigo-50 border border-indigo-200'}`}>
                                <FaTag className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={14} />
                                <p className={`text-sm ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                    <span className="font-semibold">Route Prefix:</span> {routePrefix}
                                </p>
                            </div>
                        )}

                        {/* Route Point */}
                        <div>
                            <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Route Point <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaMapMarkerAlt
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                                    size={14}
                                />
                                <input
                                    type="text"
                                    name="routePoint"
                                    value={formData.routePoint}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={routePrefix ? `${routePrefix} - Enter route point` : "Enter route point"}
                                    maxLength={100}
                                    disabled={fetchingPrefix}
                                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                                        ${darkMode
                                            ? 'bg-[#0f172a] border-[rgba(79, 70, 229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]'
                                        }
                                        ${fetchingPrefix ? 'opacity-60 cursor-not-allowed' : ''}
                                        ${errors.routePoint && touched.routePoint
                                            ? 'border-red-500 focus:ring-red-400 focus:border-red-400'
                                            : ''
                                        }`}
                                />
                            </div>
                            {errors.routePoint && touched.routePoint && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <FaTimes size={10} />
                                    {errors.routePoint}
                                </p>
                            )}
                            {routePrefix && formData.routePoint && !fetchingPrefix && (
                                <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span className="font-medium">Preview:</span> {routePrefix} - {formData.routePoint}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className={`flex justify-end gap-3 mt-6 pt-4 border-t ${darkMode ? 'border-[rgba(79, 70, 229,0.25)]' : 'border-gray-200'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode
                                ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-[rgba(79, 70, 229,0.3)]'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || fetchingPrefix || zones.length === 0}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${(loading || fetchingPrefix || zones.length === 0)
                                ? 'bg-[#4f46e5]/60 cursor-not-allowed'
                                : 'bg-[#4f46e5] hover:bg-[#2e29a8]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>{initialData ? "Updating..." : "Creating..."}</span>
                                </>
                            ) : (
                                <>
                                    {initialData ? <FaEdit size={14} /> : <FaPlus size={14} />}
                                    {initialData ? "Update Route" : "Create Route"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Route Management Component
export default function RouteCreation() {
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const navigate = useNavigate();

    const [routes, setRoutes] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [fetchingZones, setFetchingZones] = useState(false);

    // Get logged-in user info from sessionStorage
    const getLoggedInUser = () => {
        const storedUser = sessionStorage.getItem("auth_user");
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    // Get user name from sessionStorage (prioritizing firstName)
    const getUserName = () => {
        const storedFirstName = sessionStorage.getItem("firstName");
        if (storedFirstName && storedFirstName.trim()) {
            return storedFirstName.trim();
        }
        const user = getLoggedInUser();
        return user?.FirstName || user?.firstName || "";
    };

    // Get user ID from sessionStorage
    const getUserId = () => {
        const storedUserId = sessionStorage.getItem("userId");
        if (storedUserId) {
            const parsed = parseInt(storedUserId, 10);
            if (!isNaN(parsed)) return parsed;
        }
        const user = getLoggedInUser();
        return user?.UserId || user?.userId || user?.id;
    };

    const fetchingZonesRef = useRef(false);

    // Fetch zones only when needed, avoiding double requests
    const fetchZones = useCallback(async () => {
        if (zones.length > 0 || fetchingZonesRef.current) return zones;

        fetchingZonesRef.current = true;
        setFetchingZones(true);
        try {
            const response = await axiosClient({
                method: SummaryApi.routeplandpdwns.method,
                url: SummaryApi.routeplandpdwns.url,
                data: { flagId: 1 }
            });

            if (response.data?.status === true && response.data?.result) {
                const formattedZones = response.data.result.map(zone => ({
                    value: zone.ZoneMasterId,
                    label: zone.ZoneMasterName,
                    zoneMasterId: zone.ZoneMasterId,
                    zoneMasterName: zone.ZoneMasterName
                }));
                setZones(formattedZones);
                return formattedZones;
            }
            return [];
        } catch (error) {
            console.error("Error fetching zones:", error);
            return [];
        } finally {
            setFetchingZones(false);
            fetchingZonesRef.current = false;
        }
    }, [zones.length]);

    // Fetch routes on component mount
    useEffect(() => {
        fetchRoutes();
    }, []);

    // Fetch routes
    const fetchRoutes = async () => {
        try {
            setLoading(true);

            const response = await axiosClient({
                method: SummaryApi.fetchrouteplan.method,
                url: SummaryApi.fetchrouteplan.url,
                data: { flagId: 1 }
            });

            if (response.data?.status === true && response.data?.result) {
                setRoutes(response.data.result);
            }

        } catch (error) {
            console.error("Error fetching routes:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch routes. Please refresh the page.",
                timer: 3000,
                showConfirmButton: false,
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
            });
        } finally {
            setLoading(false);
        }
    };

    // Create route
    const handleCreateRoute = async (formData) => {
        try {
            setModalLoading(true);

            const userName = getUserName();
            const userId = getUserId();

            const response = await axiosClient({
                method: SummaryApi.createrouteplan.method,
                url: SummaryApi.createrouteplan.url,
                data: {
                    flagId: 1,
                    ZoneMasterId: parseInt(formData.zoneMasterId),
                    RouteNumber: formData.routePoint,
                    CreatedByUserId: userId,
                    CreatedByUserName: userName
                }
            });

            if (response.data?.status) {
                MySwal.fire({
                    icon: "success",
                    title: "Success!",
                    text: response.data.message || "Route point created successfully",
                    timer: 1500,
                    showConfirmButton: false,
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                });
                fetchRoutes();
                setModalOpen(false);
            } else {
                throw new Error(response.data?.message || "Failed to create route point");
            }
        } catch (error) {
            console.error("Error creating route:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || error.message || "Failed to create route point",
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Update route
    const handleUpdateRoute = async (formData) => {
        try {
            setModalLoading(true);

            const userName = getUserName();
            const userId = getUserId();

            const response = await axiosClient({
                method: SummaryApi.updaterouteplan.method,
                url: SummaryApi.updaterouteplan.url,
                data: {
                    flagId: 1,
                    RoutePlanId: editingRoute.RoutePlanId,
                    ZoneMasterId: parseInt(formData.zoneMasterId),
                    RoutePlanPoint: formData.routePoint,
                    UpdatedByUserId: userId,
                    UpdatedByUserName: userName
                }
            });

            if (response.data?.status) {
                MySwal.fire({
                    icon: "success",
                    title: "Success!",
                    text: response.data.message || "Route point updated successfully",
                    timer: 1500,
                    showConfirmButton: false,
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                });
                fetchRoutes();
                setModalOpen(false);
                setEditingRoute(null);
            } else {
                throw new Error(response.data?.message || "Failed to update route point");
            }
        } catch (error) {
            console.error("Error updating route:", error);
            MySwal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || error.message || "Failed to update route point",
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter routes
    const filteredRoutes = useMemo(() => {
        if (!searchTerm.trim()) return routes;
        const term = searchTerm.toLowerCase();
        return routes.filter(route =>
            route.RoutePlanPoint?.toLowerCase().includes(term) ||
            route.ZoneMasterName?.toLowerCase().includes(term) ||
            route.CreatedByUserName?.toLowerCase().includes(term)
        );
    }, [routes, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);
    const showingFrom = filteredRoutes.length > 0 ? startIndex + 1 : 0;
    const showingTo = Math.min(endIndex, filteredRoutes.length);

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

    // Get zone name by ID
    const getZoneName = (zoneId) => {
        const zone = zones.find(z => z.value === zoneId);
        return zone ? zone.label : "N/A";
    };

    return (
        <div className={`min-h-full py-8 px-6 transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-bold flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <FaRoute className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={22} />
                            Route Point Management
                        </h1>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Manage and configure route points across all operating zones
                        </p>
                    </div>
                </div>

                {/* Search and Create Button */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#1e293b] border-[rgba(79, 70, 229,0.25)] shadow-[0_10px_35px_rgba(0,0,0,0.3)]' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:w-96 relative">
                            <FaSearch
                                className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                                size={13}
                            />
                            <input
                                type="text"
                                placeholder="Search routes by name, zone, user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode
                                    ? 'bg-[#0f172a] border-[rgba(79, 70, 229,0.35)] text-white placeholder-gray-500 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]'
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

                        <button
                            onClick={() => {
                                setEditingRoute(null);
                                setModalOpen(true);
                            }}
                            className="w-full sm:w-auto px-5 py-2.5 bg-[#4f46e5] text-white text-sm font-semibold rounded-lg hover:bg-[#2e29a8] transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-900/30"
                        >
                            <FaPlus size={13} />
                            Create Route Point
                        </button>
                    </div>
                </div>

                {/* Routes Table */}
                <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#1e293b] border-[rgba(79, 70, 229,0.25)] shadow-[0_10px_35px_rgba(0,0,0,0.3)]' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left text-xs">
                            <thead className={`${darkMode
                                ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white'
                                : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white'} uppercase tracking-wider`}>
                                <tr>
                                    <th className="py-3.5 px-4 font-semibold">S.No</th>
                                    <th className="py-3.5 px-4 font-semibold">Route Point</th>
                                    <th className="py-3.5 px-4 font-semibold">Zone</th>
                                    <th className="py-3.5 px-4 font-semibold">Created At</th>
                                    <th className="py-3.5 px-4 font-semibold">Created By</th>
                                    <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-[rgba(79, 70, 229,0.12)]' : 'divide-gray-100'}`}>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className={`px-4 py-10 text-center ${darkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5] mb-3"></div>
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading routes...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedRoutes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className={`px-4 py-10 text-center ${darkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
                                            <div className="flex flex-col items-center justify-center">
                                                <FaRoute className={`text-3xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {searchTerm ? "No routes found matching your search" : "No routes found"}
                                                </span>
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => setSearchTerm("")}
                                                        className={`mt-2 text-xs px-3 py-1 rounded-lg ${darkMode
                                                            ? 'bg-white/5 text-[#818cf8] hover:bg-white/10 border border-[rgba(79, 70, 229,0.3)]'
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
                                    paginatedRoutes.map((route, index) => (
                                        <tr
                                            key={route.RoutePlanId || index}
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
                                                        <FaRoad className={darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'} size={12} />
                                                    </div>
                                                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {route.RoutePlanPoint || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {route.ZoneMasterName || getZoneName(route.ZoneMasterId)}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={11} />
                                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {formatDate(route.CreatedAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <FaUserCircle className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={12} />
                                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {route.CreatedByUserName || 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setEditingRoute(route);
                                                        setModalOpen(true);
                                                    }}
                                                    className={`p-2 rounded-lg transition-colors ${darkMode
                                                        ? 'text-[#818cf8] hover:bg-white/10'
                                                        : 'text-[#4f46e5] hover:bg-indigo-50'
                                                        }`}
                                                    title="Edit Route"
                                                >
                                                    <FaEdit size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filteredRoutes.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredRoutes.length}
                            showingFrom={showingFrom}
                            showingTo={showingTo}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            itemsPerPageOptions={[5, 10, 15, 20]}
                            darkMode={darkMode}
                        />
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <RouteModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingRoute(null);
                }}
                onSubmit={editingRoute ? handleUpdateRoute : handleCreateRoute}
                initialData={editingRoute}
                loading={modalLoading}
                darkMode={darkMode}
                zones={zones}
                fetchZones={fetchZones}
            />
        </div>
    );
}