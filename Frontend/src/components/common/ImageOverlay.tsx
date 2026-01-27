import { X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageOverlayProps {
    isOpen: boolean;
    imageSrc: string | null;
    altText?: string;
    onClose: () => void;
}

export const ImageOverlay = ({ isOpen, imageSrc, altText = 'Imagen', onClose }: ImageOverlayProps) => {
    if (!isOpen || !imageSrc) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-md"
                onClick={onClose}
            >
                <div
                    className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Toolbar */}
                    <div className="absolute top-0 right-0 -mt-12 md:-right-12 md:mt-0 flex items-center gap-2">
                         <a
                            href={imageSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                            title="Abrir original"
                         >
                            <ZoomIn size={24} />
                         </a>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        src={imageSrc}
                        alt={altText}
                        className="rounded-lg shadow-2xl max-w-full max-h-[85vh] object-contain border border-white/10"
                    />

                    {altText && (
                        <p className="mt-4 text-white/80 font-medium text-sm text-center bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                            {altText}
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
