import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { ThemeMode } from '../../types';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  isAction?: boolean;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  dropdownClassName?: string;
  theme?: ThemeMode;
  id?: string;
  name?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '-- เลือกรายการ --',
  disabled = false,
  searchable = true,
  searchPlaceholder = 'พิมพ์ค้นหา...',
  className = '',
  dropdownClassName = '',
  theme = 'dark',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUpwards: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < 320 && rect.top > 320;

    setCoords({
      top: openUpwards ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 240),
      openUpwards,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setSearchQuery('');
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);

      // Auto-focus search input when opened
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.isAction ||
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-[42px] px-3.5 py-2 rounded-xl border text-xs sm:text-[13px] font-medium flex items-center justify-between gap-2 outline-hidden transition select-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 cursor-pointer'
            : 'cursor-pointer'
        } ${
          theme === 'light'
            ? 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
            : 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700'
        } ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption?.value ? 'text-slate-400 dark:text-slate-500' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: coords.openUpwards ? undefined : `${coords.top}px`,
              bottom: coords.openUpwards ? `${window.innerHeight - coords.top}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={`rounded-2xl border p-2 shadow-2xl flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-150 ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
                : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
            } ${dropdownClassName}`}
          >
            {/* Search Input Filter Bar */}
            {searchable && (
              <div className="relative mb-2 p-0.5 shrink-0">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={`w-full pl-9 pr-8 h-9 text-xs font-medium rounded-xl border outline-none transition shadow-2xs ${
                      theme === 'light'
                        ? 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15'
                        : 'bg-slate-950 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredOptions.length > 0 && !filteredOptions[0].isAction) {
                          onChange(filteredOptions[0].value);
                          setIsOpen(false);
                        }
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition"
                      title="ล้างคำค้นหา"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="flex-1 overflow-y-auto space-y-0.5 enterprise-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-normal">
                  ไม่พบข้อมูลที่ตรงกับ "{searchQuery}"
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] font-medium flex items-center justify-between gap-2 transition select-none ${
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : opt.isAction
                          ? 'text-blue-500 dark:text-blue-400 hover:text-white hover:bg-blue-600 font-semibold bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/30 mt-1 cursor-pointer'
                          : isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : theme === 'light'
                          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className={`text-[11px] shrink-0 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                      {isSelected && !opt.isAction && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
