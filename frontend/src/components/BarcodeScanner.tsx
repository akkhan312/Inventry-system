
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanError, setScanError] = useState<string>('');

    useEffect(() => {
        // Initialize scanner
        const scannerId = "reader";

        // Ensure the element exists
        if (!document.getElementById(scannerId)) return;

        try {
            const scanner = new Html5QrcodeScanner(
                scannerId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                },
                false // verbose
            );

            scannerRef.current = scanner;

            scanner.render(
                (decodedText) => {
                    // Success callback
                    scanner.clear().then(() => {
                        onScanSuccess(decodedText);
                    }).catch(console.error);
                },
                (errorMessage) => {
                    // Error callback (optional, happens on every frame that doesn't decode)
                    // console.log(errorMessage); 
                }
            );
        } catch (err) {
            console.error("Scanner init error", err);
            setScanError("Failed to start camera. Please ensure camera permissions are granted.");
        }

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 z-50"
            >
                <X size={24} />
            </button>

            <div className="w-full max-w-md px-4 relative">
                <h3 className="text-white text-center mb-4 font-semibold text-lg">Scan Barcode</h3>
                <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border border-white/20"></div>
                {scanError && (
                    <p className="text-red-400 text-center mt-4 text-sm">{scanError}</p>
                )}
                <p className="text-gray-400 text-center mt-4 text-sm">
                    Point camera at a barcode to scan
                </p>
            </div>
        </div>
    );
};

export default BarcodeScanner;
