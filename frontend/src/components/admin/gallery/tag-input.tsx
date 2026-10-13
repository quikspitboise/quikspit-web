'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { CloseIcon, PlusIcon, cx } from '../ui';

/**
 * Chips instead of a comma-separated text field. Enter or a comma adds what
 * was typed; suggestions are one tap away, which matters on a phone.
 */
export function TagInput({
  label,
  hint,
  values,
  onChange,
  suggestions = [],
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const id = useId();
  const [text, setText] = useState('');
  const available = suggestions.filter((suggestion) => !values.includes(suggestion)).slice(0, 8);

  const add = (raw: string) => {
    const additions = raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value && !values.includes(value));
    if (additions.length) onChange([...values, ...new Set(additions)]);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(text);
    } else if (event.key === 'Backspace' && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-200">{label}</label>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 focus-within:border-red-500">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pl-3 pr-1 text-sm text-white">
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((entry) => entry !== value))}
              className="rounded-full p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              aria-label={`Remove ${value}`}
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          enterKeyHint="done"
          autoCapitalize="none"
          placeholder={values.length ? undefined : placeholder}
          onChange={(event) => {
            if (event.target.value.includes(',')) add(event.target.value);
            else setText(event.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => text.trim() && add(text)}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-base text-white outline-none placeholder:text-neutral-600 sm:text-sm"
        />
      </div>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {available.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange([...values, suggestion])}
              className={cx('inline-flex min-h-8 items-center gap-1 rounded-full border border-dashed border-white/15 px-2.5 text-xs text-neutral-400 hover:border-white/30 hover:text-white')}
            >
              <PlusIcon className="h-3 w-3" /> {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
