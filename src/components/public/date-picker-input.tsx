"use client";

import { format, isValid, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerInputProps = {
  value: string; // ISO format "YYYY-MM-DD" or ""
  onChange: (nextDate: string | null) => void;
  className?: string;
};

export function DatePickerInput({
  value,
  onChange,
  className,
}: DatePickerInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Sincroniza o texto do input com o valor selecionado (ex: da URL)
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parsed = parseISO(value);
      if (isValid(parsed)) {
        setInputValue(format(parsed, "dd/MM/yyyy"));
        return;
      }
    }
    setInputValue("");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Extrai apenas os números (até 8 dígitos)
    const digits = raw.replace(/\D/g, "").slice(0, 8);

    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setInputValue(formatted);

    if (!formatted.trim()) {
      onChange(null);
      return;
    }

    // Quando digitar os 10 caracteres (DD/MM/AAAA), valida e atualiza
    if (formatted.length === 10) {
      const parsed = parse(formatted, "dd/MM/yyyy", new Date());
      if (
        isValid(parsed) &&
        parsed.getFullYear() >= 1900 &&
        parsed.getFullYear() <= 2100
      ) {
        const iso = format(parsed, "yyyy-MM-dd");
        onChange(iso);
      }
    }
  };

  const selectedDateObj =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseISO(value) : undefined;

  return (
    <div className={cn("relative flex items-center", className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          type="button"
          tabIndex={-1}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label="Abrir calendário"
        >
          <CalendarIcon className="size-4 shrink-0" />
        </PopoverTrigger>

        <Input
          type="text"
          placeholder="Filtrar por data (DD/MM/AAAA)..."
          value={inputValue}
          onChange={handleInputChange}
          className="h-9 w-full pl-9 pr-8 text-sm"
        />

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDateObj}
            onSelect={(date) => {
              if (!date) {
                onChange(null);
              } else {
                const iso = format(date, "yyyy-MM-dd");
                if (iso === value) {
                  onChange(null);
                } else {
                  onChange(iso);
                }
              }
              setPopoverOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {inputValue ? (
        <button
          type="button"
          onClick={() => {
            setInputValue("");
            onChange(null);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4 shrink-0" />
          <span className="sr-only">Limpar data</span>
        </button>
      ) : null}
    </div>
  );
}
