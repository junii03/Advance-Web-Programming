import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, totalCount, itemsPerPage, onPageChange }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Calculate start and end pages for pagination
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // Adjust start page if end page hits the limit
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            // Add first page and ellipsis if needed
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('...');
                }
            }

            // Add visible page numbers
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis and last page if needed
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 theme-card rounded-lg p-4 border">
            {/* Results Info */}
            <div className="text-sm theme-text-secondary">
                Showing <span className="font-medium theme-text">{startItem}</span> to{' '}
                <span className="font-medium theme-text">{endItem}</span> of{' '}
                <span className="font-medium theme-text">{totalCount}</span> results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg theme-btn-ghost hover:theme-btn-ghost-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <div className="px-2 py-1">
                                    <MoreHorizontal className="w-4 h-4 theme-text-muted" />
                                </div>
                            ) : (
                                <button
                                    onClick={() => handlePageChange(page)}
                                    className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'theme-btn-ghost hover:theme-btn-ghost-hover'
                                        }`}
                                    aria-label={`Go to page ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg theme-btn-ghost hover:theme-btn-ghost-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Quick Jump (for mobile) */}
            <div className="sm:hidden flex items-center gap-2 text-sm">
                <label htmlFor="page-select" className="theme-text-secondary">
                    Page:
                </label>
                <select
                    id="page-select"
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="theme-input rounded px-2 py-1 text-sm min-w-[4rem]"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <option key={page} value={page}>
                            {page}
                        </option>
                    ))}
                </select>
                <span className="theme-text-secondary">of {totalPages}</span>
            </div>
        </div>
    );
};

export default Pagination;
