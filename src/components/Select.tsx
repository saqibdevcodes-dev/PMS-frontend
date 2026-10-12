import { useState, type Ref } from 'react';
import { SearchSelect } from './SearchSelect';
import { t, useLocale } from '../lib/i18n';

export type SelectOption = { value: string; label: string; group?: string };
export function Select({
  value,
  onChange,
  options,
  placeholder,
  id,
  disabled,
  onBlur,
  ref,
  'aria-label': label,
  'aria-invalid': invalid,
  'aria-describedby': describedBy,
}: {
  value?: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}) {
  useLocale();
  const [search, setSearch] = useState('');
  const selected = options.find((option) => option.value === String(value ?? ''));
  return (
    <SearchSelect
      id={id}
      ref={ref}
      value={String(value ?? '')}
      onChange={onChange}
      options={options.filter((option) =>
        `${option.label} ${option.value} ${option.group ?? ''}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase()),
      )}
      search={search}
      onSearch={setSearch}
      searchLabel={t('Search options…')}
      selectedLabel={selected?.label}
      placeholder={placeholder ?? t('Choose')}
      disabled={disabled}
      onBlur={onBlur}
      ariaLabel={label}
      invalid={invalid}
      describedBy={describedBy}
      clearable={false}
    />
  );
}
