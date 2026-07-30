import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    showingFrom,
    showingTo,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10, 15, 20],
    darkMode: propDarkMode
}) => {
    const { theme } = useTheme();
    const darkMode = propDarkMode !== undefined ? propDarkMode : theme === 'dark';

    // Generate page numbers with dots
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    if (totalItems === 0) return null;

    return (
        <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            } flex items-center justify-between flex-wrap gap-4`}>

            {/* Left side - Rows per page selector */}
            <div className="flex items-center gap-3">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Show
                </span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className={`px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                >
                    {itemsPerPageOptions.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    entries
                </span>
            </div>

            {/* Center - Showing info */}
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {showingFrom} to {showingTo} of {totalItems} entries
            </div>

            {/* Right side - Pagination controls */}
            <div className="flex items-center gap-2">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border transition-colors ${darkMode
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent'
                        }`}
                    title="First Page"
                >
                    <FaAngleDoubleLeft size={14} />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border transition-colors ${darkMode
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent'
                        }`}
                    title="Previous Page"
                >
                    <FaChevronLeft size={14} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            className={`min-w-[32px] h-8 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                                ? 'bg-primary-600 text-black'
                                : darkMode
                                    ? 'text-gray-400 hover:bg-gray-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                } ${page === '...' ? 'cursor-default' : ''}`}
                            disabled={page === '...'}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border transition-colors ${darkMode
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent'
                        }`}
                    title="Next Page"
                >
                    <FaChevronRight size={14} />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border transition-colors ${darkMode
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent'
                        }`}
                    title="Last Page"
                >
                    <FaAngleDoubleRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;