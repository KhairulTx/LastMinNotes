'use client';

import { Textarea } from '@/components/ui/textarea';

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: TextInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v.length <= 50000) onChange(v);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className="min-h-[220px] resize-y text-base placeholder:text-muted-foreground"
    />
  );
}
