'use client';

import React from 'react';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import TimeFrameUtil from '@/utils/TimeFrameUtil';
import { TimeFrame } from '@finance/utils/FinanceUtil';

interface TimeFrameSelectProps {
  label?: string;
  value?: TimeFrame;
  disabled?: boolean;
  onChange: (value: TimeFrame) => void;
}

export default function TimeFrameSelect({
  label = '時間枠',
  value,
  disabled = false,
  onChange
}: TimeFrameSelectProps) {
  return (
    <BasicSelect
      label={label}
      options={TimeFrameUtil.toSelectOptions()}
      value={value || TimeFrameUtil.getDefaultTimeFrame()}
      disabled={disabled}
      onChange={(selectedValue) => onChange(selectedValue as TimeFrame)}
    />
  );
}