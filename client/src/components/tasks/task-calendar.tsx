"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

export function TaskCalendar({ tasks, onTaskClick, onDateClick }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize date after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
  }, []);


  // Get tasks for each date (using dueDate or toDoBefore)
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter((task) => {
      if (task.dueDate) {
        return new Date(task.dueDate).toDateString() === dateStr;
      }
      if (task.toDoBefore) {
        return new Date(task.toDoBefore).toDateString() === dateStr;
      }
      return false;
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    if (currentDate) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const goToNextMonth = () => {
    if (currentDate) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted || !currentDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading calendar...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const today = new Date();
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[month]} {year}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8"
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateTasks = getTasksForDate(date);
              const isCurrentDay = isToday(date);
              const isCurrentMonth = date.getMonth() === month;

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "aspect-square border rounded-md p-1.5 cursor-pointer transition-colors",
                    "hover:bg-accent hover:border-ring",
                    !isCurrentMonth && "opacity-40",
                    isCurrentDay && "border-primary border-2 bg-primary/5"
                  )}
                  onClick={() => onDateClick?.(date)}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      isCurrentDay && "text-primary"
                    )}
                  >
                    {date.getDate()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dateTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded truncate",
                          "bg-primary/10 text-primary hover:bg-primary/20",
                          "cursor-pointer"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dateTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dateTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
