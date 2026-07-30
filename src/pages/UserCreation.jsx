import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { SummaryApi } from "../api/SummaryApi";
import Swal from 'sweetalert2';
import { useTheme } from "../contexts/ThemeContext";
import * as yup from 'yup';
import Select from 'react-select';
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser,
    FaPhone,
    FaSpinner,
    FaUserPlus,
    FaEye,
    FaEyeSlash,
    FaLock,
    FaEnvelope
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

// React Select Styling with Royal Indigo Theme
const getSelectStyles = (darkMode, error) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        borderColor: error ? '#EF4444' : (state.isFocused ? '#4f46e5' : (darkMode ? '#334155' : '#D1D5DB')),
        borderWidth: '1px',
        borderRadius: '0.5rem',
        minHeight: '44px',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none',
        '&:hover': {
            borderColor: error ? '#EF4444' : '#4f46e5'
        }
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
                ? (darkMode ? 'rgba(99,102,241,0.15)' : '#f1f5f9')
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
});

export default function UserCreation() {
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const navigate = useNavigate();

    const initialFormState = {
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "",
        role: "",
        gender: ""
    };

    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Dropdown states
    const [roles, setRoles] = useState([]);
    const [genders, setGenders] = useState([]);

    // Loading states
    const [fetchingRoles, setFetchingRoles] = useState(false);
    const [fetchingGenders, setFetchingGenders] = useState(false);

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

    // Get username from sessionStorage
    const getCreatedByUserName = () => {
        const user = getLoggedInUser();
        if (user) {
            // Try to get userName from various possible keys
            return user.userName ||
                user.username ||
                user.name ||
                `${user.FirstName || ''} ${user.LastName || ''}`.trim() ||
                "Admin";
        }
        return "Admin";
    };

    // Check authentication on component mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem("auth_user");
        if (!storedUser) {
            navigate("/login");
        }
    }, [navigate]);

    // Fetch dropdowns on component mount
    useEffect(() => {
        fetchRoles();
        fetchGenders();
    }, []);

    // Fetch Roles from API
    const fetchRoles = async () => {
        try {
            setFetchingRoles(true);
            const payload = {
                flagId: 7
            };

            const response = await axiosClient({
                method: SummaryApi.userdpwns.method,
                url: SummaryApi.userdpwns.url,
                data: payload
            });

            if (response.data?.status === true && response.data?.result) {
                const formattedRoles = response.data.result.map(role => ({
                    value: role.RoleId ? role.RoleId.toString() : (role.RoleCode || role.RoleName),
                    label: role.RoleName,
                    roleId: role.RoleId
                }));
                setRoles(formattedRoles);
            } else {
                setRoles([]);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch roles. Please refresh the page.',
                timer: 3000,
                showConfirmButton: false,
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
            });
        } finally {
            setFetchingRoles(false);
        }
    };

    // Fetch Genders from API
    const fetchGenders = async () => {
        try {
            setFetchingGenders(true);
            const payload = {
                flagId: 6
            };

            const response = await axiosClient({
                method: SummaryApi.userdpwns.method,
                url: SummaryApi.userdpwns.url,
                data: payload
            });

            if (response.data?.status === true && response.data?.result) {
                const formattedGenders = response.data.result.map(gender => ({
                    value: gender.GenderId.toString(),
                    label: gender.GenderName,
                    genderId: gender.GenderId
                }));
                setGenders(formattedGenders);
            } else {
                setGenders([]);
            }
        } catch (error) {
            console.error("Error fetching genders:", error);
            setGenders([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch genders. Please refresh the page.',
                timer: 3000,
                showConfirmButton: false,
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
            });
        } finally {
            setFetchingGenders(false);
        }
    };

    // Auto-capitalize first letter of each word
    const capitalizeWords = (str) => {
        return str.split(' ').map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let validatedValue = value;

        if (name === "firstName" || name === "lastName") {
            validatedValue = value.replace(/[^a-zA-Z\s]/g, '');
            if (validatedValue.startsWith(' ')) {
                validatedValue = validatedValue.trimStart();
            }
            validatedValue = validatedValue.slice(0, 50);
            validatedValue = capitalizeWords(validatedValue);
        } else if (name === "mobile") {
            validatedValue = value.replace(/\D/g, '').slice(0, 10);
        } else if (name === "password") {
            validatedValue = value.slice(0, 20);
        } else if (name === "email") {
            validatedValue = value.slice(0, 100);
        }

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
        setErrorMessage("");
        setForm((prev) => ({ ...prev, [name]: validatedValue }));
    };

    const handleSelectChange = (selectedOption, { name }) => {
        const value = selectedOption ? selectedOption.value : '';

        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = async () => {
        try {
            const schema = yup.object().shape({
                firstName: yup
                    .string()
                    .max(50, 'First name cannot exceed 50 characters')
                    .matches(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),

                lastName: yup
                    .string()
                    .max(50, 'Last name cannot exceed 50 characters')
                    .matches(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),

                email: yup
                    .string()
                    .email('Please enter a valid email address')
                    .max(100, 'Email cannot exceed 100 characters'),

                mobile: yup
                    .string()
                    .required('Mobile number is required')
                    .matches(/^[6-9]\d{9}$/, 'Mobile number must be a valid 10-digit number starting with 6-9'),

                password: yup
                    .string()
                    .required('Password is required')
                    .min(8, 'Password must be at least 8 characters')
                    .max(20, 'Password cannot exceed 20 characters'),

                role: yup
                    .string()
                    .required('Role is required'),

                gender: yup
                    .string()
                    .required('Gender is required'),
            });

            await schema.validate(form, { abortEarly: false });

            setErrors({});
            return true;
        } catch (err) {
            const validationErrors = {};
            if (err.inner) {
                err.inner.forEach(error => {
                    validationErrors[error.path] = error.message;
                });
            }
            setErrors(prev => ({ ...prev, ...validationErrors }));
            return false;
        }
    };

    const resetForm = () => {
        setForm(initialFormState);
        setErrors({});
        setSuccessMessage("");
        setErrorMessage("");
        setShowPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const storedUser = sessionStorage.getItem("auth_user");
        if (!storedUser) {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Error',
                text: 'Your session has expired. Please login again.',
                timer: 3000,
                showConfirmButton: true,
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
            }).then(() => {
                navigate("/login");
            });
            return;
        }

        if (!await validateForm()) {
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // Get the username from sessionStorage
            const createdByUserName = getCreatedByUserName();

            // Get selected role and gender objects
            const selectedRole = roles.find(r => r.value === form.role);
            const selectedGender = genders.find(g => g.value === form.gender);

            // Build payload with null values for empty optional fields
            const payload = {
                firstName: form.firstName && form.firstName.trim() !== "" ? form.firstName.trim() : null,
                lastName: form.lastName && form.lastName.trim() !== "" ? form.lastName.trim() : null,
                email: form.email && form.email.trim() !== "" ? form.email.trim() : null,
                mobileNumber: form.mobile,
                password: form.password,
                roleId: selectedRole ? parseInt(selectedRole.value) : parseInt(form.role),
                genderId: selectedGender ? parseInt(selectedGender.value) : parseInt(form.gender),
                createdByUserName: createdByUserName
            };

            console.log("Sending payload:", payload); // For debugging

            const response = await axiosClient({
                method: SummaryApi.createUser.method,
                url: SummaryApi.createUser.url,
                data: payload
            });

            if (response.data?.status === true) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data?.message || "User created successfully!",
                    timer: 3000,
                    showConfirmButton: true,
                    background: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                    confirmButtonColor: '#4f46e5'
                });

                setSuccessMessage(response.data?.message || "User created successfully!");
                resetForm();

                setTimeout(() => {
                    setSuccessMessage("");
                }, 5000);
            } else {
                throw new Error(response.data?.message || "Failed to create user");
            }

        } catch (error) {
            console.error("Error submitting form:", error);
            const errorMsg = error.response?.data?.message || error.message || "An error occurred while creating user. Please try again.";

            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMsg,
                timer: 3000,
                showConfirmButton: true,
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                confirmButtonColor: '#4f46e5'
            });
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = roles;
    const genderOptions = genders;

    return (
        <div className={`min-h-full py-12 px-6 transition-colors duration-300 ${darkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
            <div className="max-w-[1600px] mx-auto">
                {/* Status Messages */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-6 p-4 border rounded-lg text-center font-semibold text-sm ${darkMode ? 'bg-indigo-950/30 border-indigo-700 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}
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
                            className={`mb-6 p-4 border rounded-lg text-center font-semibold text-sm ${darkMode ? 'bg-red-950/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}
                        >
                            {errorMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Wrapper */}
                <form onSubmit={handleSubmit} noValidate>
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`${darkMode ? 'bg-[#1e293b] border-[#334155] shadow-[0_10px_35px_rgba(0,0,0,0.4)]' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border min-h-[220px]`}
                    >
                        {/* Gradient divider line at top */}
                        <div className="h-1.5 bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] rounded-t-2xl" />

                        <div className="p-8">
                            {/* Responsive 4-Column Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                                {/* Select Role - Required (1st field) */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        <span className="text-red-500 mr-1">*</span>Select Role
                                    </label>
                                    <Select
                                        name="role"
                                        options={roleOptions}
                                        value={roleOptions.find(option => option.value === form.role) || null}
                                        onChange={(option) => handleSelectChange(option, { name: 'role' })}
                                        isLoading={fetchingRoles}
                                        isDisabled={fetchingRoles}
                                        placeholder={fetchingRoles ? "Loading roles..." : "Select role..."}
                                        noOptionsMessage={() => fetchingRoles ? 'Loading...' : 'No roles found'}
                                        styles={getSelectStyles(darkMode, errors.role)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.role} />
                                </div>

                                {/* First Name - Optional */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                        <input
                                            placeholder="Enter first name"
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            maxLength={50}
                                            className={`w-full rounded-lg border pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                ? 'bg-[#0f172a] border-slate-800 text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                } ${errors.firstName ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage message={errors.firstName} />
                                </div>

                                {/* Last Name - Optional */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                        <input
                                            placeholder="Enter last name"
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            maxLength={50}
                                            className={`w-full rounded-lg border pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                ? 'bg-[#0f172a] border-slate-800 text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                } ${errors.lastName ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage message={errors.lastName} />
                                </div>

                                {/* Email - Optional */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        Email
                                    </label>
                                    <div className="relative">
                                        <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                        <input
                                            placeholder="Enter email address"
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            maxLength={100}
                                            className={`w-full rounded-lg border pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                ? 'bg-[#0f172a] border-slate-800 text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                } ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage message={errors.email} />
                                </div>

                                {/* Mobile Number - Required */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        <span className="text-red-500 mr-1">*</span>Mobile Number
                                    </label>
                                    <div className="relative">
                                        <FaPhone className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                        <input
                                            placeholder="Enter mobile number"
                                            required
                                            name="mobile"
                                            value={form.mobile}
                                            onChange={handleChange}
                                            maxLength={10}
                                            className={`w-full rounded-lg border pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                ? 'bg-[#0f172a] border-slate-800 text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                } ${errors.mobile ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    <ErrorMessage message={errors.mobile} />
                                </div>

                                {/* Password - Required */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        <span className="text-red-500 mr-1">*</span>Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            required
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            maxLength={20}
                                            className={`w-full rounded-lg border pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${darkMode
                                                ? 'bg-[#0f172a] border-slate-800 text-white placeholder-slate-500 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#4f46e5] focus:border-[#4f46e5]'
                                                } ${errors.password ? 'border-red-500' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                        </button>
                                    </div>
                                    <ErrorMessage message={errors.password} />
                                </div>

                                {/* Select Gender - Required */}
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-[#818cf8]' : 'text-[#4f46e5]'}`}>
                                        <span className="text-red-500 mr-1">*</span>Select Gender
                                    </label>
                                    <Select
                                        name="gender"
                                        options={genderOptions}
                                        value={genderOptions.find(option => option.value === form.gender) || null}
                                        onChange={(option) => handleSelectChange(option, { name: 'gender' })}
                                        isLoading={fetchingGenders}
                                        isDisabled={fetchingGenders}
                                        placeholder={fetchingGenders ? "Loading genders..." : "Select gender..."}
                                        noOptionsMessage={() => fetchingGenders ? 'Loading...' : 'No genders found'}
                                        styles={getSelectStyles(darkMode, errors.gender)}
                                        classNamePrefix="react-select"
                                        isSearchable
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    />
                                    <ErrorMessage message={errors.gender} />
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div className={`pt-8 border-t mt-8 flex justify-end ${darkMode ? 'border-[#334155]' : 'border-slate-100'}`}>
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.97 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full sm:w-auto px-10 py-3.5 text-sm font-semibold text-white rounded-lg transition-all transform flex items-center justify-center gap-2 ${loading
                                        ? 'bg-[#4f46e5] opacity-70 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#4f46e5] to-[#4338ca] hover:from-[#4338ca] hover:to-[#3730a3] hover:shadow-[0_4px_25px_rgba(79,70,229,0.35)]'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" size={14} />
                                            Creating User...
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus size={14} />
                                            Create User
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