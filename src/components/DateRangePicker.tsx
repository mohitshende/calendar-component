import React, { useState, useRef, useEffect } from "react";
import "./DateRangePickerStyles.css";
import {
  calculateWeekendsInRange,
  formatDate,
  generateCalendarGrid,
  parseDate,
  normalizeDate,
  isWeekend,
} from "../utils/datepickerUtils";
import { IoCalendarOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from "react-icons/io";

type DateRange = [string, string] | null;
type Weekends = string[];

interface DateRangePickerProps {
  predefinedRanges?: { label: string; range: [Date, Date] }[];
  onChange: (range: DateRange, weekends: Weekends) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  predefinedRanges = [],
  onChange,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"date" | "month" | "year">("date");
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const parts = value.split(" ~ ");
    if (parts.length === 2) {
      const parsedStart = parseDate(parts[0]);
      const parsedEnd = parseDate(parts[1]);

      if (parsedStart && parsedEnd && parsedStart <= parsedEnd) {
        setTempStartDate(parsedStart);
        setTempEndDate(parsedEnd);
      }
    }
  };

  const cancelSelection = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  // Close the calendar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsOpen(false);
        cancelSelection();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleDateClick = (date: Date) => {
    const normalizedDate = normalizeDate(date);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(normalizedDate);
      setTempEndDate(null);
    } else if (normalizedDate > tempStartDate) {
      setTempEndDate(normalizedDate);
    } else if (normalizedDate < tempStartDate) {
      setTempStartDate(normalizedDate);
      setTempEndDate(tempStartDate);
    }
  };

  const applyDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);

      const weekends = calculateWeekendsInRange(tempStartDate, tempEndDate);
      onChange([formatDate(tempStartDate), formatDate(tempEndDate)], weekends);

      setInputValue(
        `${formatDate(tempStartDate)} ~ ${formatDate(tempEndDate)}`
      );
    }
    setIsOpen(false);
  };

  const applyPredefinedRange = (range: [Date, Date]) => {
    const [start, end] = range;
    const normalizedStartDate = normalizeDate(start);
    const normalizedEndDate = normalizeDate(end);

    setTempStartDate(normalizedStartDate);
    setTempEndDate(normalizedEndDate);
  };

  const renderPredefinedRanges = () => (
    <div className="predefined-ranges">
      {predefinedRanges.map((range) => (
        <button
          key={range.label}
          className="predefined-range-button"
          onClick={() => applyPredefinedRange(range.range)}
        >
          {range.label}
        </button>
      ))}
    </div>
  );

  const renderCalendarCell = (date: Date, idx: number) => {
    const normalizedDate = normalizeDate(date);
    const isSelected =
      (tempStartDate && normalizedDate.getTime() === tempStartDate.getTime()) ||
      (tempEndDate && normalizedDate.getTime() === tempEndDate.getTime());
    const isInRange =
      tempStartDate &&
      tempEndDate &&
      normalizedDate >= tempStartDate &&
      normalizedDate <= tempEndDate;
    const isToday = normalizedDate.toDateString() === new Date().toDateString();

    const isDateWeekend = isWeekend(normalizedDate);

    return (
      <td
        key={idx}
        className={`${isToday ? "current-date" : ""} ${
          isSelected ? "selected" : ""
        } ${isInRange ? "in-range" : ""} ${isDateWeekend ? "weekend" : ""}`}
        onClick={() => {
          if (isDateWeekend) return;
          handleDateClick(date);
        }}
      >
        {date.getDate()}
      </td>
    );
  };

  const renderMonthSelector = () => (
    <div className="month-selector">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="month-cell"
          onClick={() => {
            setCurrentMonth(i);
            setViewMode("date");
          }}
        >
          {new Date(0, i).toLocaleString("default", { month: "short" })}
        </div>
      ))}
    </div>
  );

  const renderYearSelector = () => (
    <div className="year-selector-container">
      <div className="year-change-buttons">
        <button onClick={() => setCurrentYear((prev) => prev - 12)}>
          <IoIosArrowBack />
        </button>
        <button onClick={() => setCurrentYear((prev) => prev + 12)}>
          <IoIosArrowForward />
        </button>
      </div>
      <div className="year-selector">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="year-cell"
            onClick={() => {
              setCurrentYear(currentYear - 6 + i);
              setViewMode("month");
            }}
          >
            {currentYear - 6 + i}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDualCalendar = () => (
    <div className="dual-calendar">
      {[0, 1].map((offset) => (
        <div key={offset}>
          <header>
            {offset === 0 && (
              <>
                <button
                  className="month-change-button"
                  onClick={() => {
                    if (currentMonth > 0) setCurrentMonth((prev) => prev - 1);
                    else {
                      setCurrentMonth(11);
                      setCurrentYear((prev) => prev - 1);
                    }
                  }}
                >
                  <IoIosArrowBack />
                </button>
              </>
            )}
            <div className="month-year-label">
              <span onClick={() => setViewMode("month")}>
                {new Date(currentYear, currentMonth + offset).toLocaleString(
                  "default",
                  { month: "long" }
                )}
              </span>
              <span onClick={() => setViewMode("year")}>
                {new Date(currentYear, currentMonth + offset).toLocaleString(
                  "default",
                  { year: "numeric" }
                )}
              </span>
            </div>
            {offset === 1 && (
              <>
                <button
                  className="month-change-button"
                  onClick={() => {
                    if (currentMonth < 11) setCurrentMonth((prev) => prev + 1);
                    else {
                      setCurrentMonth(0);
                      setCurrentYear((prev) => prev + 1);
                    }
                  }}
                >
                  <IoIosArrowForward />
                </button>
              </>
            )}
          </header>
          <table>
            <thead>
              <tr>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <th key={day}>{day}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {generateCalendarGrid(currentYear, currentMonth + offset).map(
                (week, idx) => (
                  <tr key={idx}>
                    {week.map((date, idx) => renderCalendarCell(date, idx))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  function clearDate() {
    setStartDate(null);
    setEndDate(null);
    setTempEndDate(null);
    setTempStartDate(null);
    setInputValue("");
  }

  return (
    <div className="date-range-picker">
      <div className="input-box">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          className="date-input"
          readOnly
        />
        {inputValue ? (
          <IoMdClose className="clear-input-button" onClick={clearDate} />
        ) : (
          <IoCalendarOutline />
        )}
      </div>

      {isOpen && (
        <div ref={calendarRef} className="calendar-container">
          {viewMode === "date" && renderDualCalendar()}
          {viewMode === "month" && renderMonthSelector()}
          {viewMode === "year" && renderYearSelector()}

          <footer>
            {renderPredefinedRanges()}
            <button
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              disabled={
                (!tempStartDate && !tempEndDate) ||
                (tempStartDate && !tempEndDate)
              }
              onClick={applyDateRange}
            >
              OK
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
