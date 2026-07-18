'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { getUserData } from '../../../lib/auth';
import {
  Calendar, Clock, Copy, Plus, Trash2, Save,
  AlertTriangle, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react';

interface TimeSlot {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

interface DaySchedule {
  day: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const validateDaySchedule = (daySchedule: DaySchedule): string[] => {
  if (!daySchedule.isAvailable) return [];
  const errors: string[] = [];
  const parsedSlots: { startVal: number; endVal: number; idx: number }[] = [];
  const timeRegex = /^\d{2}:\d{2}$/;

  daySchedule.slots.forEach((slot, idx) => {
    if (!slot.start || !slot.end) {
      errors.push(`Slot ${idx + 1}: Start and end times are required.`);
      return;
    }
    if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
      errors.push(`Slot ${idx + 1}: Times must be in HH:MM format.`);
      return;
    }

    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM) ||
        startH < 0 || startH > 23 || startM < 0 || startM > 59 ||
        endH < 0 || endH > 23 || endM < 0 || endM > 59) {
      errors.push(`Slot ${idx + 1}: Invalid hours or minutes.`);
      return;
    }

    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;

    if (startVal >= endVal) {
      errors.push(`Slot ${idx + 1}: Start time (${slot.start}) must be before end time (${slot.end}).`);
    } else {
      parsedSlots.push({ startVal, endVal, idx });
    }
  });

  // Check overlaps
  parsedSlots.sort((a, b) => a.startVal - b.startVal);
  for (let i = 1; i < parsedSlots.length; i++) {
    if (parsedSlots[i].startVal < parsedSlots[i - 1].endVal) {
      errors.push(`Overlap: Slot ${parsedSlots[i - 1].idx + 1} and Slot ${parsedSlots[i].idx + 1} overlap.`);
    }
  }

  return errors;
};

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      isAvailable: false,
      slots: [{ start: '09:00', end: '17:00' }]
    }))
  );

  const dayErrors = schedule.reduce((acc, daySchedule) => {
    acc[daySchedule.day] = validateDaySchedule(daySchedule);
    return acc;
  }, {} as Record<string, string[]>);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/provider/availability');
      const backendData = res.data?.data || [];

      if (backendData.length > 0) {
        // Map backend availability list to all 7 days
        const updatedSchedule = DAYS_OF_WEEK.map(day => {
          const found = backendData.find((item: any) => item.day.toLowerCase() === day.toLowerCase());
          if (found) {
            return {
              day,
              isAvailable: true,
              slots: found.slots && found.slots.length > 0 ? found.slots : [{ start: '09:00', end: '17:00' }]
            };
          }
          return {
            day,
            isAvailable: false,
            slots: [{ start: '09:00', end: '17:00' }]
          };
        });
        setSchedule(updatedSchedule);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setSchedule(prev =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleAddSlot = (dayIndex: number) => {
    setSchedule(prev =>
      prev.map((item, idx) => {
        if (idx === dayIndex) {
          // Default to next reasonable slot after last slot
          const lastSlot = item.slots[item.slots.length - 1];
          let start = '09:00';
          let end = '17:00';
          if (lastSlot) {
            const [lastH, lastM] = lastSlot.end.split(':').map(Number);
            const nextH = (lastH + 1) % 24;
            const startHStr = nextH.toString().padStart(2, '0');
            const endHStr = Math.min(nextH + 2, 23).toString().padStart(2, '0');
            start = `${startHStr}:00`;
            end = `${endHStr}:00`;
          }
          return {
            ...item,
            slots: [...item.slots, { start, end }]
          };
        }
        return item;
      })
    );
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    setSchedule(prev =>
      prev.map((item, idx) => {
        if (idx === dayIndex) {
          const updatedSlots = item.slots.filter((_, sIdx) => sIdx !== slotIndex);
          return {
            ...item,
            slots: updatedSlots.length === 0 ? [{ start: '09:00', end: '17:00' }] : updatedSlots
          };
        }
        return item;
      })
    );
  };

  const handleSlotTimeChange = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    val: string
  ) => {
    setSchedule(prev =>
      prev.map((item, idx) => {
        if (idx === dayIndex) {
          const updatedSlots = item.slots.map((slot, sIdx) =>
            sIdx === slotIndex ? { ...slot, [field]: val } : slot
          );
          return { ...item, slots: updatedSlots };
        }
        return item;
      })
    );
  };

  const handleCopyToAll = (sourceDayIndex: number) => {
    const sourceSchedule = schedule[sourceDayIndex];
    if (!sourceSchedule) return;

    setSchedule(prev =>
      prev.map((item, idx) => {
        if (idx === sourceDayIndex) return item;
        return {
          ...item,
          isAvailable: sourceSchedule.isAvailable,
          slots: sourceSchedule.slots.map(s => ({ ...s }))
        };
      })
    );

    setSuccessMsg(`Copied ${sourceSchedule.day}'s availability settings to all other days!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSave = async () => {
    setError('');

    // Validate that schedule has no inline errors
    const allErrors = Object.entries(dayErrors).filter(([_, errs]) => errs.length > 0);
    if (allErrors.length > 0) {
      const firstErr = allErrors[0];
      setError(`Validation Error on ${firstErr[0]}: ${firstErr[1][0]}`);
      return;
    }

    setSaving(true);
    try {
      // Build API Payload
      const availabilityList = schedule
        .filter(item => item.isAvailable)
        .map(item => ({
          day: item.day,
          slots: item.slots.map(s => ({ start: s.start, end: s.end }))
        }));

      await apiClient.put('/provider/availability', {
        availability: availabilityList
      });

      setSuccessMsg('Weekly availability schedule successfully updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save availability schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Manage Weekly Availability
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Specify your weekly working hours and time slots. Customers will only be able to book you during these hours.
          </p>
        </div>
        <button
          onClick={fetchAvailability}
          disabled={loading}
          className="self-start sm:self-center h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-350 hover:text-white transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2Icon className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center gap-2 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-400 hover:text-white">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 border border-zinc-850 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {schedule.map((daySchedule, dayIdx) => (
            <div
              key={daySchedule.day}
              className={`border rounded-2xl p-5 transition-all duration-300 ${
                daySchedule.isAvailable
                  ? 'bg-zinc-900/60 border-zinc-800 shadow-md shadow-black/5'
                  : 'bg-zinc-950/40 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Day status */}
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={daySchedule.isAvailable}
                      onChange={() => handleToggleDay(dayIdx)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                  </label>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{daySchedule.day}</h3>
                    <p className="text-xs text-zinc-505 mt-0.5">
                      {daySchedule.isAvailable ? 'Accepting bookings' : 'Unavailable (Off day)'}
                    </p>
                  </div>
                </div>

                {/* Slots section */}
                {daySchedule.isAvailable && (
                  <div className="flex-1 max-w-xl space-y-3">
                    <div className="space-y-2">
                      {daySchedule.slots.map((slot, slotIdx) => (
                        <div key={slotIdx} className="flex items-center gap-3 animate-slide-down">
                          <div className="flex-1 grid grid-cols-2 gap-3 bg-zinc-950/50 p-2 border border-zinc-900 rounded-xl">
                            <div className="flex items-center gap-2 pl-2">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase">From</span>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) =>
                                  handleSlotTimeChange(dayIdx, slotIdx, 'start', e.target.value)
                                }
                                className="flex-1 h-8 bg-transparent border-0 text-xs font-semibold text-zinc-200 focus:ring-0 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-2 border-l border-zinc-900 pl-3">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase">To</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) =>
                                  handleSlotTimeChange(dayIdx, slotIdx, 'end', e.target.value)
                                }
                                className="flex-1 h-8 bg-transparent border-0 text-xs font-semibold text-zinc-200 focus:ring-0 focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveSlot(dayIdx, slotIdx)}
                            className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-red-950/40 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {dayErrors[daySchedule.day]?.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 space-y-1.5 mt-2">
                        {dayErrors[daySchedule.day].map((err, errIdx) => (
                          <div key={errIdx} className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <button
                        onClick={() => handleAddSlot(dayIdx)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-light transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Slot
                      </button>
                      <button
                        onClick={() => handleCopyToAll(dayIdx)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Copy this configuration to all other days"
                      >
                        <Copy className="w-3 h-3" />
                        Copy to all days
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Action Footer */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-primary/95 text-zinc-950 font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Availability Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LOCAL ICONS ─────────────────────────────────────────────────────────────
function CheckCircle2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
