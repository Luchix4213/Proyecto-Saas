import { useState, useEffect } from 'react';
import { Clock, CalendarDays, Calendar } from 'lucide-react';

interface ScheduleEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const ScheduleEditor = ({ value, onChange }: ScheduleEditorProps) => {
    // State for structured times
    const [weekdaysOpen, setWeekdaysOpen] = useState('09:00');
    const [weekdaysClose, setWeekdaysClose] = useState('18:00');
    const [saturdayOpen, setSaturdayOpen] = useState('09:00');
    const [saturdayClose, setSaturdayClose] = useState('13:00');

    // State for toggles
    const [hasWeekdays, setHasWeekdays] = useState(true);
    const [hasSaturday, setHasSaturday] = useState(true);

    // Initial parsing (simple heuristic)
    useEffect(() => {
        if (!value) return;

        // Try to extract times if format matches expected pattern "Lun - Vie: HH:mm - HH:mm | Sab: HH:mm - HH:mm"
        // This is a loose parser to try and pre-fill if data exists
        const weekMatch = value.match(/Lun\s*-\s*Vie:?\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i);
        if (weekMatch) {
            setWeekdaysOpen(weekMatch[1]);
            setWeekdaysClose(weekMatch[2]);
            setHasWeekdays(true);
        }

        const satMatch = value.match(/S[áa]b:?\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i);
        if (satMatch) {
            setSaturdayOpen(satMatch[1]);
            setSaturdayClose(satMatch[2]);
            setHasSaturday(true);
        } else if (value.includes('Sab: Cerrado') || value.includes('Sáb: Cerrado')) {
             setHasSaturday(false);
        }
    }, []); // Only run on mount to avoid overwriting user edits if we used [value]

    // Update parent string whenever local state changes
    useEffect(() => {
        const parts = [];

        if (hasWeekdays) {
            parts.push(`Lun - Vie: ${weekdaysOpen} - ${weekdaysClose}`);
        } else {
             parts.push(`Lun - Vie: Cerrado`);
        }

        if (hasSaturday) {
            parts.push(`Sáb: ${saturdayOpen} - ${saturdayClose}`);
        } else {
             // Optional: Don't show Saturday if closed, or show 'Cerrado'
             // Let's omit if closed to keep string shorter, or append explicit closed if weekdays are set?
             // Standard: "Lun - Vie: 09:00 - 18:00" implies weekends closed usually.
             // But let's be explicit if user desires.
        }

        // If nothing is selected
        if (parts.length === 0) {
            onChange('');
            return;
        }

        onChange(parts.join(' | '));
    }, [weekdaysOpen, weekdaysClose, saturdayOpen, saturdayClose, hasWeekdays, hasSaturday]);

    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
            {/* Weekdays Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasWeekdays ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                        <CalendarDays size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-700">Lunes a Viernes</span>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={hasWeekdays} onChange={(e) => setHasWeekdays(e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                            </label>
                        </div>
                        <p className="text-xs text-slate-400">Días laborales estándar</p>
                    </div>
                </div>

                {hasWeekdays && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <div className="relative">
                            <input
                                type="time"
                                value={weekdaysOpen}
                                onChange={(e) => setWeekdaysOpen(e.target.value)}
                                className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            />
                            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">a</span>
                        <div className="relative">
                            <input
                                type="time"
                                value={weekdaysClose}
                                onChange={(e) => setWeekdaysClose(e.target.value)}
                                className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            />
                            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Saturday Section */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasSaturday ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Calendar size={20} />
                    </div>
                    <div>
                         <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-700">Sábados</span>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={hasSaturday} onChange={(e) => setHasSaturday(e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>
                        <p className="text-xs text-slate-400">Atención de fin de semana</p>
                    </div>
                </div>

                {hasSaturday && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <div className="relative">
                            <input
                                type="time"
                                value={saturdayOpen}
                                onChange={(e) => setSaturdayOpen(e.target.value)}
                                className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                            />
                            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">a</span>
                        <div className="relative">
                            <input
                                type="time"
                                value={saturdayClose}
                                onChange={(e) => setSaturdayClose(e.target.value)}
                                className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                            />
                            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Section */}
            <div className="pt-2 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Vista Previa</p>
                <div className="inline-block px-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg font-mono">
                    { !hasWeekdays && !hasSaturday ? 'Cerrado Temporalmente' :
                      `${hasWeekdays ? `Lun-Vie: ${weekdaysOpen}-${weekdaysClose}` : ''} ${hasWeekdays && hasSaturday ? '|' : ''} ${hasSaturday ? `Sáb: ${saturdayOpen}-${saturdayClose}` : ''}`
                    }
                </div>
            </div>
        </div>
    );
};
