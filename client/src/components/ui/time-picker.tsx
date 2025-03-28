import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerProps {
  value: string | undefined;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  startTime?: number;
  endTime?: number;
  interval?: number;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className,
  disabled = false,
  startTime = 8, // 8 AM
  endTime = 20, // 8 PM
  interval = 30 // 30 minutes
}: TimePickerProps) {
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${displayHour}:${formattedMinute} ${period}`;
        options.push(time);
      }
    }
    return options;
  }, [startTime, endTime, interval]);

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <Clock className="mr-2 h-4 w-4" />
        <SelectValue placeholder={placeholder}>
          {value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
