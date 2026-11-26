import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type YearSelectorProps = {
  value: number;
  onChange: (year: number) => void;
};

export function YearSelector({ value, onChange }: YearSelectorProps) {
  const years = Array.from({ length: 11 }, (_, index) => value - 5 + index)
    .filter((year) => year > 0);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Selecionar ano">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Ano anterior"
        title="Ano anterior"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Ano"
        className="h-9 rounded-md border bg-background px-2 text-sm"
      >
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Próximo ano"
        title="Próximo ano"
        onClick={() => onChange(value + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
