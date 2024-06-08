import React from 'react';
import {
  useInputControl,
  FieldMetadata,
} from '@conform-to/react';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns-tz";
import jaJP from "date-fns/locale/ja";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { Button } from './button';
import { cn } from '~/lib/utils';
import type { Locale } from "date-fns";

export type DatePickerProps = {
  meta: FieldMetadata<string>
  defaultValue: string
}
export function DatePicker({ meta, defaultValue }: DatePickerProps) {
  const control = useInputControl(meta);
  const date = new Date(control.value || defaultValue)
  React.useEffect(() => {
    // 初回はDBの値をセットしておく
    control.change(format(date, "yyyy-MM-dd"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] pl-3 text-left font-normal border-input",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d: Date | undefined) => {
            control.change(d && format(d, "yyyy-MM-dd"))
          }}
          initialFocus
          locale={jaJP as unknown as Locale}
          pagedNavigation
          showOutsideDays
        />
      </PopoverContent>
    </Popover>
  )
}
