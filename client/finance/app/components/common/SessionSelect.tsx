'use client';

import React from 'react';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import SessionUtil from '@/utils/SessionUtil';

interface SessionSelectProps {
  label?: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export default function SessionSelect({
  label = '取引時間',
  value,
  disabled = false,
  onChange
}: SessionSelectProps) {
  return (
    <BasicSelect
      label={label}
      options={SessionUtil.toSelectOptions()}
      value={value || SessionUtil.getDefaultSession()}
      disabled={disabled}
      onChange={onChange}
    />
  );
}