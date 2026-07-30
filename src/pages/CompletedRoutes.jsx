import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    CheckCircle2,
    Download,
    Activity,
    ChevronRight,
    Truck,
    Clock,
    X,
    AlertCircle,
    Eye,
    User,
    Loader2,
    Calendar,
    Phone,
    Map,
    FileText,
    File,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    FolderOpen,
    BarChart3,
    FileSpreadsheet,
    Printer
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { SummaryApi } from "../api/SummaryApi";
import * as XLSX from 'xlsx';

// Image Viewer Modal Component
function ImageViewerModal({
    isOpen,
    onClose,
    imageUrl,
    fileName,
    darkMode,
    textColor,
    subTextColor,
    borderColor,
    containerBg
}) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [fitToScreen, setFitToScreen] = useState(true);

    if (!isOpen) return null;

    const handleZoomIn = () => {
        setFitToScreen(false);
        setZoom(prev => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setFitToScreen(false);
        setZoom(prev => Math.max(prev - 0.2, 0.2));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setFitToScreen(true);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleImageLoad = (e) => {
        const img = e.target;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
        });
    };

    const handleFitToScreen = () => {
        setFitToScreen(true);
        setZoom(1);
    };

    const getFitZoom = () => {
        if (!fitToScreen) return zoom;
        const containerWidth = window.innerWidth * 0.85;
        const containerHeight = window.innerHeight * 0.7;
        if (imageDimensions.width > 0 && imageDimensions.height > 0) {
            const widthRatio = containerWidth / imageDimensions.width;
            const heightRatio = containerHeight / imageDimensions.height;
            return Math.min(widthRatio, heightRatio, 1);
        }
        return 1;
    };

    const displayZoom = fitToScreen ? getFitZoom() : zoom;

    return (
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
                background: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                padding: "20px"
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                    background: containerBg,
                    borderRadius: "16px",
                    padding: "24px",
                    maxWidth: isFullscreen ? "98%" : "92%",
                    width: "100%",
                    maxHeight: isFullscreen ? "98vh" : "92vh",
                    height: isFullscreen ? "98vh" : "auto",
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${borderColor}`,
                    boxShadow: darkMode ? "0 25px 50px rgba(0,0,0,0.8)" : "0 25px 50px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        paddingBottom: "12px",
                        borderBottom: `1px solid ${borderColor}`,
                        flexShrink: 0
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                background: "#4f46e5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}
                        >
                            <ImageIcon size={18} color="#ffffff" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "700", color: textColor, margin: 0 }}>
                                Image Viewer
                            </h3>
                            <p style={{ fontSize: "12px", color: subTextColor, margin: "2px 0 0 0" }}>
                                {fileName || 'Document Image'}
                                {imageDimensions.width > 0 && ` • ${imageDimensions.width} × ${imageDimensions.height}`}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button
                            onClick={handleFitToScreen}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0 12px",
                                height: "32px",
                                borderRadius: "6px",
                                background: fitToScreen ? (darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff") : (darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"),
                                border: `1px solid ${fitToScreen ? "#4f46e5" : borderColor}`,
                                color: fitToScreen ? "#4f46e5" : textColor,
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Fit to Screen
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                                cursor: "pointer"
                            }}
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                                cursor: "pointer"
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Image Controls */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "12px",
                        flexWrap: "wrap"
                    }}
                >
                    <button
                        onClick={handleZoomIn}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        <ZoomIn size={14} /> Zoom In
                    </button>
                    <button
                        onClick={handleZoomOut}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        <ZoomOut size={14} /> Zoom Out
                    </button>
                    <button
                        onClick={handleRotate}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            <polyline points="21 3 21 9 15 9" />
                        </svg>
                        Rotate
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        Reset
                    </button>
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                            border: `1px solid ${borderColor}`,
                            color: subTextColor,
                            fontSize: "12px",
                            fontWeight: "500"
                        }}
                    >
                        Zoom: {Math.round((fitToScreen ? getFitZoom() : zoom) * 100)}%
                    </span>
                </div>

                {/* Image Viewer */}
                <div
                    style={{
                        flex: 1,
                        minHeight: isFullscreen ? "calc(100vh - 200px)" : "500px",
                        maxHeight: isFullscreen ? "calc(100vh - 200px)" : "650px",
                        background: darkMode ? "#0f172a" : "#f1f5f9",
                        borderRadius: "8px",
                        overflow: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {imageUrl ? (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "20px"
                            }}
                        >
                            <motion.img
                                src={imageUrl}
                                alt={fileName || 'Document Image'}
                                onLoad={handleImageLoad}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    transform: `scale(${displayZoom}) rotate(${rotation}deg)`,
                                    transition: "transform 0.3s ease",
                                    cursor: displayZoom > 1 ? "grab" : "default"
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                draggable={displayZoom > 1}
                            />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: subTextColor }}>
                            <ImageIcon size={48} style={{ marginBottom: "16px" }} />
                            <p>No image available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: `1px solid ${borderColor}`
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 24px",
                            borderRadius: "8px",
                            background: "transparent",
                            border: `1px solid ${borderColor}`,
                            color: subTextColor,
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        Close
                    </button>
                    {imageUrl && (
                        <a
                            href={imageUrl}
                            download={`${fileName || 'document'}.png`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 24px",
                                borderRadius: "8px",
                                background: "#4f46e5",
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: "600",
                                textDecoration: "none",
                                cursor: "pointer"
                            }}
                        >
                            <Download size={16} /> Download
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Main CompletedRoutes Component
export default function CompletedRoutes() {
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

    const [completedRoutes, setCompletedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeStations, setRouteStations] = useState([]);
    const [routeStats, setRouteStats] = useState(null);
    const [showStationsModal, setShowStationsModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageFileName, setImageFileName] = useState("");
    const [loadingImage, setLoadingImage] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [showFilesModal, setShowFilesModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchCompletedRoutes();
    }, []);

    const fetchCompletedRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosClient({
                method: SummaryApi.completedRoutes.method,
                url: SummaryApi.completedRoutes.url,
                data: { flagId: 1 }
            });

            console.log("Completed Routes Response:", response.data);

            if (response.data?.status === true) {
                setCompletedRoutes(response.data.result || []);
            } else {
                throw new Error(response.data?.message || "Failed to fetch completed routes");
            }
        } catch (err) {
            console.error("Error fetching completed routes:", err);
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleViewStations = async (route) => {
        try {
            setSelectedRoute(route);
            setLoading(true);

            const response = await axiosClient({
                method: SummaryApi.completedRoutes.method,
                url: SummaryApi.completedRoutes.url,
                data: {
                    flagId: 2,
                    AssignRouteId: route.AssignRouteId
                }
            });

            console.log("Route Stations Response:", response.data);

            if (response.data?.status === true) {
                const result = response.data.result;
                setRouteStations(result.stations || []);
                setRouteStats({
                    totalSubStationCount: result.totalSubStationCount || 0,
                    uploadedCount: result.uploadedCount || 0,
                    remainingCount: result.remainingCount || 0
                });
                setShowStationsModal(true);
            } else {
                throw new Error(response.data?.message || "Failed to fetch route stations");
            }
        } catch (err) {
            console.error("Error fetching route stations:", err);
            alert("Failed to load route stations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewFiles = (station) => {
        setSelectedStation(station);
        setShowFilesModal(true);
    };

    const handleViewImage = async (file) => {
        try {
            setLoadingImage(true);

            const response = await axiosClient({
                method: SummaryApi.completedRoutes.method,
                url: SummaryApi.completedRoutes.url,
                data: {
                    flagId: 3,
                    stationSubmissionFileId: file.stationSubmissionFileId,
                    FileTypeId: file.fileTypeId
                },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], {
                type: response.headers?.['content-type'] || 'image/png'
            });
            const url = window.URL.createObjectURL(blob);

            setImageUrl(url);
            setImageFileName(file.fileName || 'document.png');
            setShowImageModal(true);
            setShowFilesModal(false);

        } catch (error) {
            console.error("Error fetching image:", error);
            alert("Failed to load image. Please try again.");
        } finally {
            setLoadingImage(false);
        }
    };

    // Export main table to Excel
    const handleExportToExcel = () => {
        try {
            setExporting(true);

            const exportData = completedRoutes.map((route, index) => ({
                'S.No': index + 1,
                'Driver Name': route.DriverName || 'N/A',
                'Mobile Number': route.MobileNumber || 'N/A',
                'Truck Number': route.TruckNumber || 'N/A',
                'Zone': route.ZoneMasterName || 'N/A',
                'Route Plan': route.RoutePlanPoint || 'N/A',
                'Completed At': formatDate(route.CompletedAt)
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const colWidths = [
                { wch: 6 }, { wch: 20 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
            ];
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Completed Routes");

            const date = new Date();
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const fileName = `Completed_Routes_${dateStr}.xlsx`;

            XLSX.writeFile(wb, fileName);

        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("Failed to export data. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const handleExportRouteDetails = () => {
        try {
            if (!selectedRoute || !routeStations.length) return;

            // Calculate driver completion statistics
            const totalStations = routeStations.length;
            const completedStations = routeStations.filter(s => s.statusId === 3 || s.remarks?.toLowerCase() === 'completed').length;
            const pendingStations = totalStations - completedStations;

            // Route Summary Sheet with driver performance
            const summaryData = [{
                'Driver Name': selectedRoute.DriverName || 'N/A',
                'Mobile Number': selectedRoute.MobileNumber || 'N/A',
                'Truck Number': selectedRoute.TruckNumber || 'N/A',
                'Zone': selectedRoute.ZoneMasterName || 'N/A',
                'Route Plan': selectedRoute.RoutePlanPoint || 'N/A',
                'Route Completed At': formatDate(selectedRoute.CompletedAt),
                'Total Stations Assigned': totalStations,
                'Stations Completed by Driver': completedStations,
                'Stations Pending': pendingStations,
                'Driver Completion Rate': `${totalStations > 0 ? Math.round((completedStations / totalStations) * 100) : 0}%`,
                'Total Files Uploaded': routeStats?.uploadedCount || 0,
                'Files Pending': routeStats?.remainingCount || 0
            }];

            // Stations Detail Sheet with driver completion status for each station
            const stationsData = routeStations.map((station, index) => {
                const isCompleted = station.statusId === 3 || station.remarks?.toLowerCase() === 'completed';
                return {
                    'S.No': index + 1,
                    'Station Name': station.station || 'N/A',
                    'Substation Address': station.subStationAddress || 'N/A',
                    'Taluk': station.taluk || 'N/A',
                    'Voltage Class': station.voltageClass || 'N/A',
                    'Pin Code': station.pinCode || 'N/A',
                    'In Charge': station.inChargeAEJEName || 'N/A',
                    'Contact Number': station.contactNumber || 'N/A',
                    'Latitude': station.latitude || 'N/A',
                    'Longitude': station.longitude || 'N/A',
                    'Visited At (Completed Time)': isCompleted ? formatDate(station.visitedAt) : 'Not Completed',
                    'Driver Status': isCompleted ? 'Completed ✓' : 'Pending',
                    'Remarks': station.remarks || 'N/A',
                    'Files Uploaded': station.files?.length || 0,
                    'Files Status': station.files?.length > 0 ? 'Uploaded' : 'No Files'
                };
            });

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Summary sheet with driver performance
            const wsSummary = XLSX.utils.json_to_sheet(summaryData);
            const summaryColWidths = [
                { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 22 }, { wch: 20 }, { wch: 22 },
                { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 15 }
            ];
            wsSummary['!cols'] = summaryColWidths;

            XLSX.utils.book_append_sheet(wb, wsSummary, "Driver Summary");

            // Stations sheet with driver completion details
            const wsStations = XLSX.utils.json_to_sheet(stationsData);
            const stationsColWidths = [
                { wch: 6 }, { wch: 25 }, { wch: 50 }, { wch: 15 },
                { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 25 },
                { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
            wsStations['!cols'] = stationsColWidths;

            XLSX.utils.book_append_sheet(wb, wsStations, "Station Details");

            // Generate filename
            const date = new Date();
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const fileName = `Driver_Report_${selectedRoute.DriverName}_${dateStr}.xlsx`;

            XLSX.writeFile(wb, fileName);

        } catch (error) {
            console.error("Error exporting route details:", error);
            alert("Failed to export route details. Please try again.");
        }
    };

    // Print / Export PDF
    const handleExportToPDF = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading && completedRoutes.length === 0) {
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
                <Loader2 size={40} color={darkMode ? "#818cf8" : "#4f46e5"} className="animate-spin" />
                <p style={{ color: subTextColor, marginTop: "16px" }}>Loading completed routes...</p>
            </div>
        );
    }

    if (error) {
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
                        onClick={fetchCompletedRoutes}
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
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        .print-section, .print-section * { visibility: visible; }
                        .print-section { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            {/* PAGE HEADER */}
            <div
                className="no-print"
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
                        <CheckCircle2 size={24} color="#10b981" />
                        Completed Routes
                    </h1>
                    <p style={{ fontSize: "13px", color: subTextColor, marginTop: "4px", marginBottom: 0 }}>
                        View all completed routes and their station images
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: darkMode ? "rgba(16, 185, 129, 0.15)" : "#d1fae5",
                            padding: "6px 14px",
                            borderRadius: "10px",
                            border: darkMode ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #6ee7b7"
                        }}
                    >
                        <CheckCircle2 size={16} color="#10b981" />
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#10b981" }}>
                            {completedRoutes.length} Routes Completed
                        </span>
                    </div>

                    {/* Export Buttons */}
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={handleExportToExcel}
                            disabled={exporting || completedRoutes.length === 0}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: exporting ? "#94a3b8" : "#10b981",
                                border: "none",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: exporting || completedRoutes.length === 0 ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                opacity: completedRoutes.length === 0 ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!exporting && completedRoutes.length > 0) {
                                    e.currentTarget.style.background = "#059669";
                                    e.currentTarget.style.transform = "scale(1.05)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!exporting && completedRoutes.length > 0) {
                                    e.currentTarget.style.background = "#10b981";
                                    e.currentTarget.style.transform = "scale(1)";
                                }
                            }}
                            title="Export to Excel"
                        >
                            {exporting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={16} />
                                    Excel
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleExportToPDF}
                            disabled={completedRoutes.length === 0}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "#4f46e5",
                                border: "none",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: completedRoutes.length === 0 ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                opacity: completedRoutes.length === 0 ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (completedRoutes.length > 0) {
                                    e.currentTarget.style.background = "#6366f1";
                                    e.currentTarget.style.transform = "scale(1.05)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (completedRoutes.length > 0) {
                                    e.currentTarget.style.background = "#4f46e5";
                                    e.currentTarget.style.transform = "scale(1)";
                                }
                            }}
                            title="Print / Export to PDF"
                        >
                            <Printer size={16} />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div
                className="print-section"
                style={{
                    background: containerBg,
                    borderRadius: "12px",
                    padding: "24px",
                    border: `1px solid ${borderColor}`,
                    boxShadow: shadowStyle
                }}
            >
                {completedRoutes.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px"
                        }}
                    >
                        <CheckCircle2 size={48} color={subTextColor} style={{ marginBottom: "16px" }} />
                        <p style={{ color: textColor, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                            No Completed Routes
                        </p>
                        <p style={{ color: subTextColor, fontSize: "14px", marginTop: "4px" }}>
                            Completed routes will appear here once available
                        </p>
                    </div>
                ) : (
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
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Driver Name
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Mobile Number
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Truck Number
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Zone
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Route Plan
                                    </th>
                                    <th style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Completed At
                                    </th>
                                    <th className="no-print" style={{
                                        padding: "12px 16px",
                                        textAlign: "center",
                                        color: subTextColor,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedRoutes.map((route, index) => (
                                    <motion.tr
                                        key={route.AssignRouteId || index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            borderBottom: `1px solid ${borderColor}`,
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
                                                {route.DriverName || 'N/A'}
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
                                            color: subTextColor
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Truck size={14} color={subTextColor} />
                                                {route.TruckNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            color: subTextColor
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <MapPin size={14} color={subTextColor} />
                                                {route.ZoneMasterName || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            color: subTextColor
                                        }}>
                                            {route.RoutePlanPoint || 'N/A'}
                                        </td>
                                        <td style={{
                                            padding: "12px 16px",
                                            color: subTextColor
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Calendar size={14} color={subTextColor} />
                                                {formatDate(route.CompletedAt)}
                                            </div>
                                        </td>
                                        <td className="no-print" style={{ padding: "12px 16px", textAlign: "center" }}>
                                            <button
                                                onClick={() => handleViewStations(route)}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "6px 16px",
                                                    borderRadius: "6px",
                                                    background: "#10b981",
                                                    border: "none",
                                                    color: "#ffffff",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "#059669";
                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "#10b981";
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }}
                                            >
                                                <Eye size={14} />
                                                View Stations
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stations Modal */}
            <AnimatePresence>
                {showStationsModal && selectedRoute && (
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
                        onClick={() => {
                            setShowStationsModal(false);
                            setSelectedStation(null);
                            setRouteStats(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: containerBg,
                                borderRadius: "16px",
                                padding: "32px",
                                maxWidth: "1400px",
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
                                                background: "#10b981",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <MapPin size={20} color="#ffffff" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: "20px", fontWeight: "700", color: textColor, margin: 0 }}>
                                                Route Stations
                                            </h2>
                                            <p style={{ fontSize: "13px", color: subTextColor, margin: "2px 0 0 0" }}>
                                                {selectedRoute.DriverName} • {selectedRoute.ZoneMasterName} • {routeStations.length} Stations
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={handleExportRouteDetails}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            background: "#10b981",
                                            border: "none",
                                            color: "#ffffff",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#059669";
                                            e.currentTarget.style.transform = "scale(1.05)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "#10b981";
                                            e.currentTarget.style.transform = "scale(1)";
                                        }}
                                    >
                                        <FileSpreadsheet size={14} />
                                        Export Excel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowStationsModal(false);
                                            setSelectedStation(null);
                                            setRouteStats(null);
                                        }}
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
                            </div>

                            {/* Statistics Cards */}
                            {routeStats && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                        gap: "12px",
                                        marginBottom: "24px"
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "10px",
                                            background: darkMode ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
                                            border: `1px solid ${darkMode ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe"}`,
                                            textAlign: "center"
                                        }}
                                    >
                                        <div style={{ fontSize: "24px", fontWeight: "700", color: "#3b82f6" }}>
                                            {routeStats.totalSubStationCount}
                                        </div>
                                        <div style={{ fontSize: "11px", color: subTextColor, fontWeight: "500", marginTop: "4px" }}>
                                            Total Stations
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "10px",
                                            background: darkMode ? "rgba(16, 185, 129, 0.1)" : "#f0fdf4",
                                            border: `1px solid ${darkMode ? "rgba(16, 185, 129, 0.3)" : "#bbf7d0"}`,
                                            textAlign: "center"
                                        }}
                                    >
                                        <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                                            {routeStats.uploadedCount}
                                        </div>
                                        <div style={{ fontSize: "11px", color: subTextColor, fontWeight: "500", marginTop: "4px" }}>
                                            Uploaded
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "10px",
                                            background: darkMode ? "rgba(245, 158, 11, 0.1)" : "#fffbeb",
                                            border: `1px solid ${darkMode ? "rgba(245, 158, 11, 0.3)" : "#fde68a"}`,
                                            textAlign: "center"
                                        }}
                                    >
                                        <div style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                                            {routeStats.remainingCount}
                                        </div>
                                        <div style={{ fontSize: "11px", color: subTextColor, fontWeight: "500", marginTop: "4px" }}>
                                            Remaining
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "10px",
                                            background: darkMode ? "rgba(99, 102, 241, 0.1)" : "#eef2ff",
                                            border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.3)" : "#c7d2fe"}`,
                                            textAlign: "center"
                                        }}
                                    >
                                        <div style={{ fontSize: "24px", fontWeight: "700", color: "#4f46e5" }}>
                                            {routeStats.totalSubStationCount > 0
                                                ? Math.round((routeStats.uploadedCount / routeStats.totalSubStationCount) * 100)
                                                : 0}%
                                        </div>
                                        <div style={{ fontSize: "11px", color: subTextColor, fontWeight: "500", marginTop: "4px" }}>
                                            Completion
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stations Table */}
                            {routeStations.length === 0 ? (
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
                                        No stations found for this route
                                    </p>
                                </div>
                            ) : (
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
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Station Name
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Substation Address
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Taluk
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Voltage Class
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    In Charge
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Contact
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Completed At
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Status
                                                </th>
                                                <th style={{
                                                    padding: "12px 16px",
                                                    textAlign: "center",
                                                    color: subTextColor,
                                                    fontWeight: "600",
                                                    fontSize: "11px",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Files
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {routeStations.map((station, index) => (
                                                <motion.tr
                                                    key={station.routeStationStatusId || index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    style={{
                                                        borderBottom: index === routeStations.length - 1
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
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <MapPin size={14} color="#10b981" />
                                                            {station.station || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td style={{
                                                        padding: "12px 16px",
                                                        color: subTextColor,
                                                        maxWidth: "300px"
                                                    }}>
                                                        <div style={{
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "300px"
                                                        }}>
                                                            {station.subStationAddress || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td style={{
                                                        padding: "12px 16px",
                                                        color: subTextColor
                                                    }}>
                                                        {station.taluk || 'N/A'}
                                                    </td>
                                                    <td style={{
                                                        padding: "12px 16px",
                                                        color: subTextColor
                                                    }}>
                                                        {station.voltageClass || 'N/A'}
                                                    </td>
                                                    <td style={{
                                                        padding: "12px 16px",
                                                        color: subTextColor
                                                    }}>
                                                        {station.inChargeAEJEName || 'N/A'}
                                                    </td>
                                                    <td style={{
                                                        padding: "12px 16px",
                                                        color: subTextColor
                                                    }}>
                                                        {station.contactNumber || 'N/A'}
                                                    </td>
                                                    <td style={{
                                                        padding: "12px 16px",
                                                        color: subTextColor
                                                    }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <Calendar size={14} color={subTextColor} />
                                                            {formatDate(station.visitedAt)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <CheckCircle2 size={16} color="#10b981" />
                                                            <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "500" }}>
                                                                {station.remarks || 'Completed'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                        {station.files && station.files.length > 0 ? (
                                                            <button
                                                                onClick={() => handleViewFiles(station)}
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    padding: "6px 14px",
                                                                    borderRadius: "6px",
                                                                    background: "#4f46e5",
                                                                    border: "none",
                                                                    color: "#ffffff",
                                                                    fontSize: "12px",
                                                                    fontWeight: "600",
                                                                    cursor: "pointer",
                                                                    transition: "all 0.2s ease"
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = "#6366f1";
                                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = "#4f46e5";
                                                                    e.currentTarget.style.transform = "scale(1)";
                                                                }}
                                                            >
                                                                <FolderOpen size={14} />
                                                                {station.files.length} Files
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: subTextColor, fontSize: "12px" }}>
                                                                No files
                                                            </span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Files Modal */}
            <AnimatePresence>
                {showFilesModal && selectedStation && (
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
                            zIndex: 1500,
                            padding: "20px"
                        }}
                        onClick={() => setShowFilesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: containerBg,
                                borderRadius: "16px",
                                padding: "32px",
                                maxWidth: "600px",
                                width: "100%",
                                maxHeight: "80vh",
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
                                                background: "#4f46e5",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <FolderOpen size={20} color="#ffffff" />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: "20px", fontWeight: "700", color: textColor, margin: 0 }}>
                                                Station Files
                                            </h2>
                                            <p style={{ fontSize: "13px", color: subTextColor, margin: "2px 0 0 0" }}>
                                                {selectedStation.station || 'Station'} • {selectedStation.files?.length || 0} Files
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFilesModal(false)}
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

                            {/* Files List */}
                            {selectedStation.files && selectedStation.files.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {selectedStation.files.map((file, index) => (
                                        <motion.div
                                            key={file.stationSubmissionFileId || index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 16px",
                                                borderRadius: "8px",
                                                background: darkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                                border: `1px solid ${borderColor}`,
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <FileText size={20} color={subTextColor} />
                                                <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "600", color: textColor }}>
                                                        {file.fileTypeName || 'File'}
                                                    </div>
                                                    <div style={{ fontSize: "11px", color: subTextColor }}>
                                                        {file.fileName || 'No name'}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewImage(file)}
                                                disabled={loadingImage}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "6px 14px",
                                                    borderRadius: "6px",
                                                    background: loadingImage ? "#94a3b8" : "#10b981",
                                                    border: "none",
                                                    color: "#ffffff",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    cursor: loadingImage ? "not-allowed" : "pointer",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!loadingImage) {
                                                        e.currentTarget.style.background = "#059669";
                                                        e.currentTarget.style.transform = "scale(1.05)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!loadingImage) {
                                                        e.currentTarget.style.background = "#10b981";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {loadingImage ? (
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
                                        No files found for this station
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Viewer Modal */}
            <ImageViewerModal
                isOpen={showImageModal}
                onClose={() => {
                    setShowImageModal(false);
                    setImageUrl(null);
                    setImageFileName("");
                }}
                imageUrl={imageUrl}
                fileName={imageFileName}
                darkMode={darkMode}
                textColor={textColor}
                subTextColor={subTextColor}
                borderColor={borderColor}
                containerBg={containerBg}
            />
        </div>
    );
}