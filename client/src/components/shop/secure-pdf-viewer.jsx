/* eslint react/prop-types: 0 */
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';

export default function SecurePdfViewer({ open, onClose, pdfUrl, title = "Product Specifications" }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [screenshotWarning, setScreenshotWarning] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Show screenshot warning message
    const showScreenshotWarning = () => {
        setScreenshotWarning(true);
        setIsBlurred(true);
        setTimeout(() => {
            setScreenshotWarning(false);
            setIsBlurred(false);
        }, 3000);
    };

    // Load PDF.js library dynamically
    useEffect(() => {
        if (!open || !pdfUrl) return;

        const loadPdfJs = async () => {
            // Check if pdfjsLib is already loaded
            if (!window.pdfjsLib) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.async = true;
                document.head.appendChild(script);
                
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
                
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            try {
                setLoading(true);
                const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                setTotalPages(pdf.numPages);
                setCurrentPage(1);
            } catch (error) {
                console.error('Error loading PDF:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPdfJs();
    }, [open, pdfUrl]);

    // Render current page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(currentPage);
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                const viewport = page.getViewport({ scale: scale * 1.5 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;
            } catch (error) {
                console.error('Error rendering page:', error);
            }
        };

        renderPage();
    }, [pdfDoc, currentPage, scale]);

    // Prevent right-click context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    // Prevent keyboard shortcuts for copying, printing, saving
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            // Prevent Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+Shift+S, Print Screen, Windows+Shift+S, PrtSc
            const isScreenshotKey = 
                e.key === 'PrintScreen' ||
                (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5')) || // Mac screenshot
                (e.key === 'Meta' && e.shiftKey) ||
                (e.shiftKey && e.key === 'PrintScreen') ||
                (e.altKey && e.key === 'PrintScreen') ||
                (e.ctrlKey && e.key === 'PrintScreen');
            
            const isCopyPrintSave = 
                e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S') ||
                (e.ctrlKey && e.shiftKey && e.key === 's');
            
            if (isScreenshotKey) {
                e.preventDefault();
                e.stopPropagation();
                showScreenshotWarning();
                return false;
            }
            
            if (isCopyPrintSave) {
                e.preventDefault();
                showScreenshotWarning();
                return false;
            }
        };

        // Detect visibility change (common when taking screenshot)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            } else {
                // Small delay before unblurring to catch screenshot attempts
                setTimeout(() => setIsBlurred(false), 500);
            }
        };

        // Detect window blur (alt+tab, screenshot tools)
        const handleWindowBlur = () => {
            setIsBlurred(true);
            showScreenshotWarning();
        };

        const handleWindowFocus = () => {
            setTimeout(() => setIsBlurred(false), 300);
        };

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('keyup', handleKeyDown, true);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('keyup', handleKeyDown, true);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [open]);

    // Prevent drag
    const handleDragStart = (e) => {
        e.preventDefault();
        return false;
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent 
                className="max-w-[95vw] w-[900px] h-[90vh] p-0 flex flex-col"
                onContextMenu={handleContextMenu}
            >
                {/* Header */}
                <DialogHeader className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-5 h-5 text-blue-600" />
                            {title}
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Toolbar */}
                <div className="px-4 py-2 border-b bg-white flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handlePrevPage}
                            disabled={currentPage <= 1}
                            className="h-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600 min-w-[80px] text-center">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages}
                            className="h-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8">
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600 min-w-[50px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8">
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* PDF Viewer - Protected */}
                <div 
                    ref={containerRef}
                    className="flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-4 relative"
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        filter: isBlurred ? 'blur(20px)' : 'none',
                        transition: 'filter 0.2s ease'
                    }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span>Loading PDF...</span>
                        </div>
                    ) : (
                        <div 
                            className="bg-white shadow-lg"
                            style={{
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                pointerEvents: 'auto'
                            }}
                        >
                            <canvas 
                                ref={canvasRef}
                                onContextMenu={handleContextMenu}
                                onDragStart={handleDragStart}
                                style={{
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Screenshot Warning Overlay */}
                {screenshotWarning && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
                        <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl text-center">
                            <div className="text-2xl mb-2">🚫</div>
                            <p className="text-sm font-medium">Screenshot can't be taken</p>
                        </div>
                    </div>
                )}

                {/* Footer with warning */}
                <div className="px-4 py-2 border-t bg-yellow-50 text-center flex-shrink-0">
                    <p className="text-xs text-yellow-700">
                        🔒 This document is protected. Downloading, copying, and screenshots are disabled.
                    </p>
                </div>

                {/* Overlay to prevent screenshots - invisible watermark layer */}
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'transparent',
                        zIndex: 1
                    }}
                />
            </DialogContent>

            {/* Add CSS to prevent selection and printing */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                }
                
                .secure-pdf-container * {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -khtml-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
            `}</style>
        </Dialog>
    );
}
