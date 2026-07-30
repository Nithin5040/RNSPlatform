import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Route,
    Users,
    CheckCircle2,
    Zap,
    Download,
    Activity,
    BarChart3,
    PieChart as PieIcon,
    Check,
    TrendingUp,
    Award,
    ChevronRight,
    Package,
    Truck,
    Clock,
    X,
    AlertCircle,
    Circle,
    Eye,
    Navigation,
    Calendar,
    User,
    Loader2,
    ChevronDown,
    ChevronUp,
    Home,
    Flag,
    Map,
    Search
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { SummaryApi } from "../api/SummaryApi";

// Number Rolling Animation Component
function AnimatedNumber({ target, duration = 1000, startDelay = 0, className = "" }) {
    const [current, setCurrent] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const timeout = setTimeout(() => {
            let startTime = null;
            const startValue = 0;
            const endValue = target;

            const animateNumber = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(eased * (endValue - startValue) + startValue);
                setCurrent(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animateNumber);
                } else {
                    setCurrent(endValue);
                }
            };

            requestAnimationFrame(animateNumber);
        }, startDelay);

        return () => clearTimeout(timeout);
    }, [target, duration, isVisible, startDelay]);

    return <span ref={elementRef} className={className}>{current}</span>;
}

// Route Details Section Component
function RouteDetailsSection({
    selectedZone,
    darkMode,
    textColor,
    subTextColor,
    borderColor,
    containerBg
}) {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [substationData, setSubstationData] = useState(null);
    const [loadingSubstations, setLoadingSubstations] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#10b981';
            case 'in-progress': return '#f59e0b';
            case 'pending': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    const getStatusIcon = (status, size = 16) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'completed':
                return <CheckCircle2 size={size} color="#10b981" />;
            case 'in-progress':
                return <Clock size={size} color="#f59e0b" />;
            case 'pending':
                return <Clock size={size} color="#3b82f6" />;
            default:
                return <Circle size={size} color="#94a3b8" />;
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'pending': return 'Pending';
            default: return 'Unknown';
        }
    };

    const handleViewRoute = async (route) => {
        try {
            setLoadingSubstations(true);
            console.log("Fetching substation data for route:", route.AssignRouteId);

            const response = await axiosClient({
                method: SummaryApi.substationCountBasedonAssignedRoot.method,
                url: SummaryApi.substationCountBasedonAssignedRoot.url,
                data: {
                    flagId: 4,
                    AssignRouteId: route.AssignRouteId
                }
            });

            console.log("Substation Response:", response.data);

            if (response.data?.status === true && response.data?.data?.length > 0) {
                const routeDetails = response.data.data[0]?.RouteDetails;
                if (routeDetails) {
                    setSubstationData(routeDetails);
                    setSelectedRoute(route);
                    setShowRouteModal(true);
                } else {
                    alert("No substation data found for this route");
                }
            } else {
                throw new Error(response.data?.message || "Failed to fetch substation data");
            }
        } catch (error) {
            console.error("Error fetching substation data:", error);
            alert("Failed to load substation details. Please try again.");
        } finally {
            setLoadingSubstations(false);
        }
    };

    // Filter routes based on search term
    const filteredRoutes = selectedZone?.routes?.filter(route => {
        const searchLower = searchTerm.toLowerCase();
        return (
            route.DriverName?.toLowerCase().includes(searchLower) ||
            route.MobileNumber?.includes(searchTerm) ||
            route.RoutePlanPoint?.toLowerCase().includes(searchLower) ||
            route.StatusName?.toLowerCase().includes(searchLower)
        );
    }) || [];

    if (!selectedZone) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: containerBg,
                    borderRadius: "12px",
                    padding: "40px",
                    border: `1px solid ${borderColor}`,
                    boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(15, 23, 42, 0.04)",
                    textAlign: "center",
                    marginTop: "24px"
                }}
            >
                <MapPin size={40} color={subTextColor} style={{ marginBottom: "12px" }} />
                <p style={{ color: textColor, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                    Select a Zone
                </p>
                <p style={{ color: subTextColor, fontSize: "14px", marginTop: "4px" }}>
                    Click on any zone card above to view route details
                </p>
            </motion.div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                    background: containerBg,
                    borderRadius: "12px",
                    padding: "24px",
                    border: `1px solid ${borderColor}`,
                    boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.2)" : "0 4px 12px rgba(15, 23, 42, 0.04)",
                    marginTop: "24px"
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        gap: "10px"
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontSize: "18px",
                                fontWeight: "700",
                                color: textColor,
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                        >
                            <Truck size={22} color={selectedZone.color} />
                            {selectedZone.name} - Route Details
                        </h3>
                        <p style={{ fontSize: "13px", color: subTextColor, margin: "3px 0 0 0" }}>
                            {selectedZone.totalRoutes} Total Routes • {selectedZone.routesCompleted} Completed • {selectedZone.pendingCount} Pending
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: selectedZone.color,
                            background: darkMode ? `rgba(99, 102, 241, 0.15)` : "#eef2ff",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            border: darkMode ? `1px solid rgba(99, 102, 241, 0.3)` : "1px solid #c7d2fe"
                        }}
                    >
                        <span>{selectedZone.code}</span>
                    </div>
                </div>

                {/* Search Box */}
                <div
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minWidth: "200px",
                            position: "relative",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <Search
                            size={18}
                            color={subTextColor}
                            style={{
                                position: "absolute",
                                left: "12px",
                                pointerEvents: "none"
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search by Driver, Mobile, Route Plan, or Status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px 10px 40px",
                                borderRadius: "8px",
                                border: `1px solid ${borderColor}`,
                                background: darkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                                color: textColor,
                                fontSize: "13px",
                                outline: "none",
                                transition: "all 0.2s ease",
                                boxShadow: darkMode ? "0 2px 4px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.04)"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "#4f46e5";
                                e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = borderColor;
                                e.target.style.boxShadow = "none";
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                style={{
                                    position: "absolute",
                                    right: "8px",
                                    background: "none",
                                    border: "none",
                                    color: subTextColor,
                                    cursor: "pointer",
                                    padding: "4px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "12px",
                            color: subTextColor,
                            gap: "6px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        <span style={{ fontWeight: "600" }}>
                            {filteredRoutes.length}
                        </span>
                        <span>routes found</span>
                    </div>
                </div>

                {/* Routes Table */}
                {filteredRoutes.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "13px"
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                        borderBottom: `2px solid ${borderColor}`
                                    }}
                                >
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "12px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        DRIVER NAME
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "12px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        MOBILE NUMBER
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "12px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        ROUTE PLAN
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "12px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        STATUS
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "center",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "12px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoutes.map((route, index) => (
                                    <motion.tr
                                        key={route.AssignRouteId || index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            borderBottom: index === filteredRoutes.length - 1
                                                ? "none"
                                                : `1px solid ${borderColor}`,
                                            transition: "background 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <td style={{
                                            padding: "12px 16px",
                                            color: textColor,
                                            fontWeight: "500"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <User size={14} color={subTextColor} />
                                                {route.DriverName || `Route ${index + 1}`}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            color: subTextColor
                                        }}>
                                            {route.MobileNumber || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            color: textColor,
                                            fontWeight: "500"
                                        }}>
                                            {route.RoutePlanPoint || 'N/A'}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "4px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    background: darkMode
                                                        ? `${getStatusColor(route.StatusName)}22`
                                                        : `${getStatusColor(route.StatusName)}11`,
                                                    color: getStatusColor(route.StatusName),
                                                    border: `1px solid ${getStatusColor(route.StatusName)}33`
                                                }}
                                            >
                                                {getStatusIcon(route.StatusName, 14)}
                                                {getStatusText(route.StatusName)}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                            <button
                                                onClick={() => handleViewRoute(route)}
                                                disabled={loadingSubstations}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "6px 16px",
                                                    borderRadius: "6px",
                                                    background: loadingSubstations ? "#94a3b8" : "#4f46e5",
                                                    border: "none",
                                                    color: "#ffffff",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    cursor: loadingSubstations ? "not-allowed" : "pointer",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!loadingSubstations) {
                                                        e.currentTarget.style.background = "#6366f1";
                                                        e.currentTarget.style.transform = "scale(1.05)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!loadingSubstations) {
                                                        e.currentTarget.style.background = "#4f46e5";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {loadingSubstations ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye size={14} />
                                                        View
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px",
                            background: darkMode ? "rgba(255,255,255,0.02)" : "#fafafa",
                            borderRadius: "12px",
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        {searchTerm ? (
                            <>
                                <Search size={40} color={subTextColor} style={{ marginBottom: "12px" }} />
                                <p style={{ color: textColor, fontSize: "14px", fontWeight: "500", margin: 0 }}>
                                    No routes match your search
                                </p>
                                <p style={{ color: subTextColor, fontSize: "13px", marginTop: "4px" }}>
                                    Try adjusting your search terms
                                </p>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={40} color={subTextColor} style={{ marginBottom: "12px" }} />
                                <p style={{ color: textColor, fontSize: "14px", fontWeight: "500", margin: 0 }}>
                                    No routes assigned to this zone
                                </p>
                                <p style={{ color: subTextColor, fontSize: "13px", marginTop: "4px" }}>
                                    Routes will appear here once assigned
                                </p>
                            </>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Route Details Modal with Substation Flow */}
            <AnimatePresence>
                {showRouteModal && selectedRoute && substationData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                            padding: "20px"
                        }}
                        onClick={() => setShowRouteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: containerBg,
                                borderRadius: "16px",
                                padding: "32px",
                                maxWidth: "800px",
                                width: "100%",
                                maxHeight: "85vh",
                                overflow: "auto",
                                border: `1px solid ${borderColor}`,
                                boxShadow: darkMode ? "0 25px 50px rgba(0,0,0,0.8)" : "0 25px 50px rgba(0,0,0,0.15)"
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "20px"
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "10px",
                                                background: selectedZone?.color || "#4f46e5",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <Map size={20} color="#ffffff" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: "20px", fontWeight: "700", color: textColor, margin: 0 }}>
                                                Substation Journey
                                            </h2>
                                            <p style={{ fontSize: "13px", color: subTextColor, margin: "2px 0 0 0" }}>
                                                {substationData.DriverName} • {substationData.RoutePlanPoint || 'Route'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRouteModal(false)}
                                    style={{
                                        background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: textColor
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Driver Info Summary */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: "12px",
                                    marginBottom: "24px",
                                    padding: "16px",
                                    borderRadius: "10px",
                                    background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                    border: `1px solid ${borderColor}`
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500", marginBottom: "2px" }}>
                                        Driver
                                    </div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: textColor, display: "flex", alignItems: "center", gap: "6px" }}>
                                        <User size={14} color={subTextColor} />
                                        {substationData.DriverName || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500", marginBottom: "2px" }}>
                                        Mobile
                                    </div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: textColor }}>
                                        {substationData.MobileNumber || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500", marginBottom: "2px" }}>
                                        Route Plan
                                    </div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: textColor }}>
                                        {substationData.RoutePlanPoint || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {substationData.SubStations && substationData.SubStations.length > 0 && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                                        gap: "12px",
                                        marginTop: "24px",
                                        padding: "16px",
                                        borderRadius: "10px",
                                        background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                        border: `1px solid ${borderColor}`
                                    }}
                                >
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981" }}>
                                            <AnimatedNumber
                                                target={substationData.CompletedCount || 0}
                                                duration={1200}
                                                startDelay={100}
                                            />
                                        </div>
                                        <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500" }}>
                                            Completed
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "18px", fontWeight: "700", color: "#f59e0b" }}>
                                            <AnimatedNumber
                                                target={substationData.SubStations.filter(s => s.StatusName?.toLowerCase() === 'in-progress').length || 0}
                                                duration={1200}
                                                startDelay={200}
                                            />
                                        </div>
                                        <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500" }}>
                                            In Progress
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "18px", fontWeight: "700", color: "#3b82f6" }}>
                                            <AnimatedNumber
                                                target={substationData.PendingCount || 0}
                                                duration={1200}
                                                startDelay={300}
                                            />
                                        </div>
                                        <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500" }}>
                                            Pending
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "18px", fontWeight: "700", color: "#4f46e5" }}>
                                            <AnimatedNumber
                                                target={substationData.TotalSubStationCount > 0 ? Math.round((substationData.CompletedCount / substationData.TotalSubStationCount) * 100) : 0}
                                                duration={1200}
                                                startDelay={400}
                                            />%
                                        </div>
                                        <div style={{ fontSize: "10px", color: subTextColor, fontWeight: "500" }}>
                                            Completion Rate
                                        </div>
                                    </div>
                                </div>
                            )}
                            <br />

                            {/* Substation Flow */}
                            <div>
                                <h4 style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: textColor,
                                    margin: "0 0 16px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    <Flag size={16} color={selectedZone?.color} />
                                    Substation Journey Flow
                                    <span style={{
                                        fontSize: "11px",
                                        fontWeight: "400",
                                        color: subTextColor,
                                        marginLeft: "auto"
                                    }}>
                                        {substationData.SubStations?.length || 0} Stations
                                    </span>
                                </h4>

                                {substationData.SubStations && substationData.SubStations.length > 0 ? (
                                    <div style={{ position: "relative", paddingLeft: "30px" }}>
                                        {/* Vertical Timeline Line */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: "10px",
                                                top: "10px",
                                                bottom: "10px",
                                                width: "3px",
                                                background: darkMode ? "#334155" : "#e2e8f0",
                                                borderRadius: "2px"
                                            }}
                                        />

                                        {substationData.SubStations.map((station, index) => (
                                            <motion.div
                                                key={station.ExcelDataId || index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.08 }}
                                                style={{
                                                    position: "relative",
                                                    marginBottom: index === substationData.SubStations.length - 1 ? "0" : "20px",
                                                    paddingLeft: "20px"
                                                }}
                                            >
                                                {/* Status Dot */}
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        left: "-20px",
                                                        top: "8px",
                                                        width: "20px",
                                                        height: "20px",
                                                        borderRadius: "50%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background: station.StatusName?.toLowerCase() === 'completed'
                                                            ? (darkMode ? "rgba(16, 185, 129, 0.2)" : "#d1fae5")
                                                            : station.StatusName?.toLowerCase() === 'in-progress'
                                                                ? (darkMode ? "rgba(245, 158, 11, 0.2)" : "#fef3c7")
                                                                : (darkMode ? "rgba(59, 130, 246, 0.2)" : "#dbeafe"),
                                                        border: `2px solid ${station.StatusName?.toLowerCase() === 'completed'
                                                            ? "#10b981"
                                                            : station.StatusName?.toLowerCase() === 'in-progress'
                                                                ? "#f59e0b"
                                                                : "#3b82f6"
                                                            }`,
                                                        zIndex: 1
                                                    }}
                                                >
                                                    {station.StatusName?.toLowerCase() === 'completed' && <CheckCircle2 size={12} color="#10b981" />}
                                                    {station.StatusName?.toLowerCase() === 'in-progress' && <Clock size={12} color="#f59e0b" />}
                                                    {station.StatusName?.toLowerCase() === 'pending' && <Circle size={12} color="#3b82f6" />}
                                                </div>

                                                {/* Station Card */}
                                                <div
                                                    style={{
                                                        padding: "14px 16px",
                                                        borderRadius: "10px",
                                                        background: station.StatusName?.toLowerCase() === 'completed'
                                                            ? (darkMode ? "rgba(16, 185, 129, 0.05)" : "#f0fdf4")
                                                            : station.StatusName?.toLowerCase() === 'in-progress'
                                                                ? (darkMode ? "rgba(245, 158, 11, 0.05)" : "#fffbeb")
                                                                : (darkMode ? "rgba(59, 130, 246, 0.05)" : "#eff6ff"),
                                                        border: `1px solid ${station.StatusName?.toLowerCase() === 'completed'
                                                            ? (darkMode ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0")
                                                            : station.StatusName?.toLowerCase() === 'in-progress'
                                                                ? (darkMode ? "rgba(245, 158, 11, 0.3)" : "#fde68a")
                                                                : (darkMode ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe")
                                                            }`,
                                                        transition: "all 0.2s ease"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "flex-start",
                                                            flexWrap: "wrap",
                                                            gap: "8px"
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div
                                                                style={{
                                                                    fontSize: "14px",
                                                                    fontWeight: "600",
                                                                    color: textColor,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    flexWrap: "wrap"
                                                                }}
                                                            >
                                                                <MapPin size={14} color={station.StatusName?.toLowerCase() === 'completed' ? "#10b981" : station.StatusName?.toLowerCase() === 'in-progress' ? "#f59e0b" : "#3b82f6"} />
                                                                {station.StationName || 'N/A'}
                                                                <span
                                                                    style={{
                                                                        fontSize: "10px",
                                                                        fontWeight: "500",
                                                                        color: station.StatusName?.toLowerCase() === 'completed'
                                                                            ? "#10b981"
                                                                            : station.StatusName?.toLowerCase() === 'in-progress'
                                                                                ? "#f59e0b"
                                                                                : "#3b82f6",
                                                                        background: station.StatusName?.toLowerCase() === 'completed'
                                                                            ? (darkMode ? "rgba(16, 185, 129, 0.2)" : "#d1fae5")
                                                                            : station.StatusName?.toLowerCase() === 'in-progress'
                                                                                ? (darkMode ? "rgba(245, 158, 11, 0.2)" : "#fef3c7")
                                                                                : (darkMode ? "rgba(59, 130, 246, 0.2)" : "#dbeafe"),
                                                                        padding: "2px 10px",
                                                                        borderRadius: "12px",
                                                                        textTransform: "capitalize"
                                                                    }}
                                                                >
                                                                    {station.StatusName || 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: "12px",
                                                                    color: subTextColor,
                                                                    marginTop: "6px",
                                                                    display: "grid",
                                                                    gridTemplateColumns: "1fr 1fr",
                                                                    gap: "4px 12px"
                                                                }}
                                                            >
                                                                <div>
                                                                    <span style={{ fontWeight: "500" }}>Voltage:</span> {station.VoltageClass || 'N/A'}
                                                                </div>
                                                                <div>
                                                                    <span style={{ fontWeight: "500" }}>Taluk:</span> {station.Taluk || 'N/A'}
                                                                </div>
                                                                <div style={{ gridColumn: "1 / -1" }}>
                                                                    <span style={{ fontWeight: "500" }}>In Charge:</span> {station.InChargeAEJEName || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: "10px",
                                                                fontWeight: "600",
                                                                color: station.StatusName?.toLowerCase() === 'completed' ? "#10b981" : station.StatusName?.toLowerCase() === 'in-progress' ? "#f59e0b" : "#3b82f6",
                                                                background: darkMode ? "rgba(255,255,255,0.05)" : "#ffffff",
                                                                padding: "2px 10px",
                                                                borderRadius: "12px",
                                                                border: `1px solid ${station.StatusName?.toLowerCase() === 'completed'
                                                                    ? (darkMode ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0")
                                                                    : station.StatusName?.toLowerCase() === 'in-progress'
                                                                        ? (darkMode ? "rgba(245, 158, 11, 0.3)" : "#fde68a")
                                                                        : (darkMode ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe")
                                                                    }`,
                                                                whiteSpace: "nowrap"
                                                            }}
                                                        >
                                                            Station {index + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "40px",
                                            background: darkMode ? "rgba(255,255,255,0.02)" : "#fafafa",
                                            borderRadius: "12px",
                                            border: `1px solid ${borderColor}`
                                        }}
                                    >
                                        <AlertCircle size={40} color={subTextColor} style={{ marginBottom: "12px" }} />
                                        <p style={{ color: textColor, fontSize: "14px", fontWeight: "500", margin: 0 }}>
                                            No substations found for this route
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Zone List Component
function ZoneList({
    darkMode,
    textColor,
    subTextColor,
    borderColor,
    containerBg,
    shadowStyle,
    zoneData,
    zoneCounts,
    loading,
    onZoneSelect,
    selectedZoneId
}) {
    const [loadingRoutes, setLoadingRoutes] = useState(false);

    const getColorForZone = (id) => {
        const colors = ['#4f46e5', '#d97706', '#0284c7', '#64748b', '#10b981', '#8b5cf6'];
        return colors[(id - 1) % colors.length];
    };

    const getZoneCounts = (zoneId) => {
        const zoneCount = zoneCounts.find(
            item => item.ZoneMasterId === zoneId
        );

        if (zoneCount) {
            return {
                total: zoneCount.TotalAssignedCount || 0,
                completed: zoneCount.CompletedCount || 0,
                pending: zoneCount.PendingCount || 0,
                inProgress: 0
            };
        }
        return { total: 0, completed: 0, pending: 0, inProgress: 0 };
    };

    const zonesWithCounts = zoneData.map(zone => {
        const counts = getZoneCounts(zone.ZoneMasterId);
        return {
            id: zone.ZoneMasterId,
            name: zone.ZoneMasterName,
            code: zone.ZoneMasterName?.substring(0, 3).toUpperCase() || "",
            color: getColorForZone(zone.ZoneMasterId),
            totalRoutes: counts.total,
            routesCompleted: counts.completed,
            pendingCount: counts.pending,
            zoneMasterId: zone.ZoneMasterId
        };
    });

    const handleZoneClick = async (zone) => {
        try {
            setLoadingRoutes(true);
            console.log("Fetching routes for zone:", zone.zoneMasterId);

            const response = await axiosClient({
                method: SummaryApi.assignroutebasedonzone.method,
                url: SummaryApi.assignroutebasedonzone.url,
                data: {
                    flagId: 3,
                    ZoneMasterId: zone.zoneMasterId
                }
            });

            console.log("Route Response:", response.data);

            if (response.data?.status === true && response.data?.data?.length > 0) {
                const zoneData = response.data.data[0];
                zone.routes = zoneData.Routes || [];
            } else {
                zone.routes = [];
            }

            onZoneSelect(zone);
        } catch (error) {
            console.error("Error fetching zone routes:", error);
            zone.routes = [];
            onZoneSelect(zone);
        } finally {
            setLoadingRoutes(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                background: containerBg,
                borderRadius: "12px",
                border: `1px solid ${borderColor}`,
                marginTop: "24px"
            }}>
                <Loader2 size={40} color={darkMode ? "#818cf8" : "#4f46e5"} className="animate-spin" />
            </div>
        );
    }

    if (zoneData.length === 0) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                background: containerBg,
                borderRadius: "12px",
                border: `1px solid ${borderColor}`,
                marginTop: "24px",
                textAlign: "center"
            }}>
                <AlertCircle size={40} color={darkMode ? "#818cf8" : "#4f46e5"} />
                <p style={{ color: textColor, marginTop: "16px", fontSize: "16px", fontWeight: "600" }}>
                    No Zones Available
                </p>
                <p style={{ color: subTextColor, fontSize: "14px" }}>
                    No zone data found. Please check back later.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                background: containerBg,
                borderRadius: "12px",
                padding: "24px",
                border: `1px solid ${borderColor}`,
                boxShadow: shadowStyle,
                marginTop: "24px"
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "10px"
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: textColor,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <MapPin size={22} color={darkMode ? "#818cf8" : "#4f46e5"} />
                        Zone List
                    </h2>
                    <p style={{ fontSize: "13px", color: subTextColor, margin: "3px 0 0 0" }}>
                        Click on any zone to view route details below
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: darkMode ? "#818cf8" : "#4f46e5",
                        background: darkMode ? "rgba(99, 102, 241, 0.15)" : "#eef2ff",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        border: darkMode ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #c7d2fe"
                    }}
                >
                    <Truck size={15} />
                    <span>{zoneData.length} Active Zones</span>
                </div>
            </div>

            {/* Loading Overlay for Routes */}
            {loadingRoutes && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    borderRadius: "12px"
                }}>
                    <Loader2 size={24} color="#4f46e5" className="animate-spin" />
                </div>
            )}

            {/* Zone Cards Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "12px",
                    position: "relative"
                }}
            >
                {zonesWithCounts.map((zone) => (
                    <motion.div
                        key={zone.id}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleZoneClick(zone)}
                        style={{
                            background: selectedZoneId === zone.id
                                ? (darkMode ? "rgba(99, 102, 241, 0.15)" : "#eef2ff")
                                : (darkMode ? "rgba(255,255,255,0.03)" : "#ffffff"),
                            borderRadius: "10px",
                            padding: "14px 12px",
                            border: selectedZoneId === zone.id
                                ? `2px solid ${zone.color}`
                                : `1px solid ${borderColor}`,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: selectedZoneId === zone.id
                                ? `0 4px 12px ${zone.color}22`
                                : "none",
                            minWidth: 0
                        }}
                    >
                        {/* Zone Color Indicator */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "3px",
                                background: zone.color
                            }}
                        />

                        {/* Selected Indicator */}
                        {selectedZoneId === zone.id && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "4px",
                                    right: "4px",
                                    background: zone.color,
                                    color: "#ffffff",
                                    fontSize: "8px",
                                    fontWeight: "600",
                                    padding: "1px 6px",
                                    borderRadius: "8px"
                                }}
                            >
                                Selected
                            </div>
                        )}

                        {/* Zone Header */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "8px"
                            }}
                        >
                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        color: textColor,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {zone.name}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "8px",
                                            fontWeight: "600",
                                            color: zone.color,
                                            background: darkMode ? `rgba(99, 102, 241, 0.15)` : "#eef2ff",
                                            padding: "1px 6px",
                                            borderRadius: "8px",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {zone.code}
                                    </span>
                                </div>
                                <div style={{ fontSize: "10px", color: subTextColor, marginTop: "1px" }}>
                                    Routes: {zone.totalRoutes}
                                </div>
                            </div>
                            <ChevronRight size={14} color={subTextColor} style={{ flexShrink: 0 }} />
                        </div>

                        {/* Route Statistics */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                gap: "4px",
                                marginTop: "6px"
                            }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6" }}>
                                    <AnimatedNumber
                                        target={zone.totalRoutes}
                                        duration={1000}
                                        startDelay={100 + (zone.id * 50)}
                                    />
                                </div>
                                <div style={{ fontSize: "7px", color: subTextColor, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                    Initiated
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#f59e0b" }}>
                                    <AnimatedNumber
                                        target={zone.pendingCount}
                                        duration={1000}
                                        startDelay={200 + (zone.id * 50)}
                                    />
                                </div>
                                <div style={{ fontSize: "7px", color: subTextColor, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                    Pending
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#10b981" }}>
                                    <AnimatedNumber
                                        target={zone.routesCompleted}
                                        duration={1000}
                                        startDelay={300 + (zone.id * 50)}
                                    />
                                </div>
                                <div style={{ fontSize: "7px", color: subTextColor, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                    Completed
                                </div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: zone.color }}>
                                    <AnimatedNumber
                                        target={zone.totalRoutes > 0 ? Math.round((zone.routesCompleted / zone.totalRoutes) * 100) : 0}
                                        duration={1000}
                                        startDelay={400 + (zone.id * 50)}
                                    />%
                                </div>
                                <div style={{ fontSize: "7px", color: subTextColor, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                    Completion
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Responsive CSS */}
            <style>
                {`
                    @media (max-width: 1400px) {
                        div[style*="grid-template-columns: repeat(6, 1fr)"] {
                            grid-template-columns: repeat(3, 1fr) !important;
                        }
                    }
                    @media (max-width: 768px) {
                        div[style*="grid-template-columns: repeat(6, 1fr)"] {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }
                    }
                    @media (max-width: 480px) {
                        div[style*="grid-template-columns: repeat(6, 1fr)"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

// Main Dashboard Component
export default function AdminDashboard() {
    const { theme } = useTheme();
    const darkMode = theme === "dark";

    const containerBg = darkMode ? "#1e293b" : "#ffffff";
    const pageBg = darkMode ? "#0f172a" : "#f1f5f9";
    const textColor = darkMode ? "#f8fafc" : "#0f172a";
    const subTextColor = darkMode ? "#94a3b8" : "#64748b";
    const borderColor = darkMode ? "#334155" : "#e2e8f0";
    const shadowStyle = darkMode
        ? "0 4px 12px rgba(0, 0, 0, 0.3)"
        : "0 4px 12px rgba(15, 23, 42, 0.04)";

    const [zoneData, setZoneData] = useState([]);
    const [zoneCounts, setZoneCounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("Fetching zone data...");
                // Fetch zones
                const zoneResponse = await axiosClient({
                    method: SummaryApi.adminzone.method,
                    url: SummaryApi.adminzone.url,
                    data: { flagId: 1 }
                });

                console.log("Zone Response:", zoneResponse.data);

                if (zoneResponse.data?.status === true) {
                    setZoneData(zoneResponse.data.data || []);
                } else {
                    throw new Error(zoneResponse.data?.message || "Failed to fetch zones");
                }

                console.log("Fetching zone counts...");
                // Fetch zone counts
                const countResponse = await axiosClient({
                    method: SummaryApi.assignroutecount.method,
                    url: SummaryApi.assignroutecount.url,
                    data: { flagId: 2 }
                });

                console.log("Count Response:", countResponse.data);

                if (countResponse.data?.status === true) {
                    setZoneCounts(countResponse.data.data?.RouteStatus || []);
                } else {
                    throw new Error(countResponse.data?.message || "Failed to fetch counts");
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleZoneSelect = (zone) => {
        setSelectedZone(zone);
    };

    if (error && !zoneData.length) {
        return (
            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",
                    padding: "24px",
                    background: pageBg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <div
                    style={{
                        background: containerBg,
                        borderRadius: "12px",
                        padding: "40px",
                        textAlign: "center",
                        border: `1px solid ${borderColor}`,
                        maxWidth: "500px",
                        width: "100%"
                    }}
                >
                    <AlertCircle size={48} color="#ef4444" />
                    <h2 style={{ color: textColor, marginTop: "16px" }}>Error Loading Data</h2>
                    <p style={{ color: subTextColor }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: "20px",
                            padding: "10px 24px",
                            borderRadius: "8px",
                            background: "#4f46e5",
                            border: "none",
                            color: "#ffffff",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                padding: "24px 24px 40px 24px",
                background: pageBg,
                transition: "all 0.3s ease"
            }}
        >
            {/* PAGE HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px"
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: "700",
                            color: textColor,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <Activity size={24} color={darkMode ? "#818cf8" : "#4f46e5"} />
                        Zone Dashboard
                    </h1>
                    <p style={{ fontSize: "13px", color: subTextColor, marginTop: "4px", marginBottom: 0 }}>
                        Zone-wise operational metrics and route status
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: darkMode ? "rgba(99, 102, 241, 0.15)" : "#eef2ff",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        border: darkMode ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #c7d2fe",
                        boxShadow: shadowStyle
                    }}
                >
                    <div
                        style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: darkMode ? "#818cf8" : "#4f46e5",
                            boxShadow: darkMode ? "0 0 8px #818cf8" : "0 0 8px #4f46e5"
                        }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: darkMode ? "#818cf8" : "#4f46e5" }}>
                        {zoneData.length} Zones Active
                    </span>
                </div>
            </div>

            {/* ZONE LIST COMPONENT */}
            <ZoneList
                darkMode={darkMode}
                textColor={textColor}
                subTextColor={subTextColor}
                borderColor={borderColor}
                containerBg={containerBg}
                shadowStyle={shadowStyle}
                zoneData={zoneData}
                zoneCounts={zoneCounts}
                loading={loading}
                onZoneSelect={handleZoneSelect}
                selectedZoneId={selectedZone?.id}
            />

            {/* ROUTE DETAILS SECTION */}
            <RouteDetailsSection
                selectedZone={selectedZone}
                darkMode={darkMode}
                textColor={textColor}
                subTextColor={subTextColor}
                borderColor={borderColor}
                containerBg={containerBg}
            />
        </div>
    );
}