/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useState } from 'react';

import ErrorUtil from '@common/utils/ErrorUtil';
import DateUtil from '@common/utils/DateUtil';
import { TimeType } from '@common/interfaces/TimeType';
import TimeUtil from '@common/utils/TimeUtil';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicDatePicker from '@client-common/components/inputs/Dates/BasicDatePicker';
import BasicNumberField from '@client-common/components/inputs/TextFields/BasicNumberField';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import ControlledCheckbox from '@client-common/components/inputs/checkbox/ControlledCheckbox';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';

// Field type definitions
export type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'time-range';

export interface SelectOption {
    value: string;
    label: string;
}

export interface FieldConfig {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: SelectOption[];
    dependsOn?: string; // Field name this field depends on
    conditional?: string; // Field name that controls visibility (for checkboxes)
    validation?: (value: any, allValues: Record<string, any>) => string | null;
    transform?: (value: any) => any; // Transform value before setting
}

export interface AdminEditDialogProps<T> {
    open: boolean;
    onClose: () => void;
    isNew: boolean;
    title: string;
    data: T | null;
    fields: FieldConfig[];
    onConfirm: (formData: Record<string, any>) => Promise<void>;
    additionalData?: Record<string, any>; // For passing exchanges, tickers, etc.
}

export default function AdminEditDialog<T extends Record<string, any>>({
    open,
    onClose,
    isNew,
    title,
    data,
    fields,
    onConfirm,
    additionalData = {}
}: AdminEditDialogProps<T>) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [error, setError] = useState<string | null>(null);

    // Initialize form data when dialog opens
    useEffect(() => {
        if (open) {
            const initialData: Record<string, any> = {};
            
            fields.forEach(field => {
                if (field.type === 'date') {
                    initialData[field.name] = data?.[field.name] || DateUtil.getTodayStartTimestamp();
                } else if (field.type === 'checkbox') {
                    // For checkboxes, check if related fields have values or use computed values
                    if (additionalData.computedValues?.[field.name] !== undefined) {
                        initialData[field.name] = additionalData.computedValues[field.name];
                    } else {
                        const relatedFields = fields.filter(f => f.conditional === field.name);
                        const hasRelatedValues = relatedFields.some(f => data?.[f.name] != null);
                        initialData[field.name] = data?.[field.name] || hasRelatedValues || false;
                    }
                } else if (field.type === 'number') {
                    initialData[field.name] = data?.[field.name] || 0;
                } else if (field.type === 'select') {
                    const options = getFieldOptions(field, initialData);
                    initialData[field.name] = data?.[field.name] || (options[0]?.value || '');
                } else if (field.type === 'time-range') {
                    initialData[field.name] = data?.[field.name] || TimeUtil.parseTime('0:00');
                } else {
                    initialData[field.name] = data?.[field.name] || '';
                }
            });
            
            setFormData(initialData);
        }
    }, [open, data, fields, additionalData]);

    // Handle field dependencies (e.g., exchange -> ticker filtering)
    useEffect(() => {
        fields.forEach(field => {
            if (field.dependsOn && formData[field.dependsOn]) {
                const options = getFieldOptions(field, formData);
                if (options.length > 0 && (!formData[field.name] || !options.find(opt => opt.value === formData[field.name]))) {
                    setFormData(prev => ({
                        ...prev,
                        [field.name]: options[0].value
                    }));
                }
            }
        });
    }, [fields.map(f => f.dependsOn ? formData[f.dependsOn] : null).join(',')]);

    const getFieldOptions = (field: FieldConfig, currentData: Record<string, any>): SelectOption[] => {
        if (!field.options) return [];
        
        // Handle dependent fields (e.g., ticker depends on exchange)
        if (field.dependsOn && currentData[field.dependsOn]) {
            const dependentValue = currentData[field.dependsOn];
            // Filter options based on dependent field
            if (additionalData.allTickers && field.name.includes('ticker')) {
                return additionalData.allTickers
                    .filter((ticker: any) => ticker.exchange === dependentValue)
                    .map((ticker: any) => ({ value: ticker.id, label: ticker.name }));
            }
        }
        
        return field.options;
    };

    const handleFieldChange = (fieldName: string, value: any, field: FieldConfig) => {
        let transformedValue = value;
        
        if (field.transform) {
            transformedValue = field.transform(value);
        }

        setFormData(prev => {
            const newData = { ...prev, [fieldName]: transformedValue };
            
            // Handle special cases like clearing conditional fields
            if (field.type === 'checkbox' && !value) {
                const conditionalFields = fields.filter(f => f.conditional === fieldName);
                conditionalFields.forEach(cf => {
                    if (cf.type === 'date') {
                        newData[cf.name] = null;
                    } else if (cf.type === 'number') {
                        newData[cf.name] = null;
                    } else {
                        newData[cf.name] = '';
                    }
                });
            }
            
            return newData;
        });
    };

    const validateForm = (): string | null => {
        for (const field of fields) {
            const value = formData[field.name];
            
            // Required field validation
            if (field.required) {
                if (value === undefined || value === null || value === '') {
                    return `${field.label} is required`;
                }
            }

            // Custom validation
            if (field.validation) {
                const validationError = field.validation(value, formData);
                if (validationError) {
                    return validationError;
                }
            }

            // Type-specific validation
            if (field.type === 'number' && field.required && value <= 0) {
                if (field.name.includes('quantity')) {
                    return `${field.label} must be greater than zero`;
                } else if (value < 0) {
                    return `${field.label} must be non-negative`;
                }
            }
        }
        
        return null;
    };

    const handleConfirm = async () => {
        setError(null);
        try {
            const validationError = validateForm();
            if (validationError) {
                ErrorUtil.throwError(validationError);
            }

            await onConfirm(formData);
            onClose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("不明なエラーが発生しました");
            }
        }
    };

    const renderField = (field: FieldConfig) => {
        const value = formData[field.name];

        // Handle conditional rendering
        if (field.conditional && !formData[field.conditional]) {
            return null;
        }

        switch (field.type) {
            case 'text':
                return (
                    <BasicTextField
                        key={field.name}
                        label={field.label}
                        value={value || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
                    />
                );

            case 'number':
                return (
                    <BasicNumberField
                        key={field.name}
                        label={field.label}
                        value={value || 0}
                        onChange={(e) => handleFieldChange(field.name, Number(e.target.value), field)}
                    />
                );

            case 'select':
                const options = getFieldOptions(field, formData);
                return (
                    <BasicSelect
                        key={field.name}
                        label={field.label}
                        options={options}
                        value={value || ''}
                        defaultValue={value || ''}
                        onChange={(newValue) => handleFieldChange(field.name, newValue, field)}
                    />
                );

            case 'date':
                return (
                    <BasicDatePicker
                        key={field.name}
                        label={field.label}
                        value={value ? new Date(value) : null}
                        onChange={(date) => handleFieldChange(field.name, date ? DateUtil.toStartOfDay(date) : null, field)}
                    />
                );

            case 'checkbox':
                return (
                    <ControlledCheckbox
                        key={field.name}
                        label={field.label}
                        checked={value || false}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked, field)}
                    />
                );

            case 'time-range':
                const timeValue = value || TimeUtil.parseTime('0:00');
                return (
                    <DirectionStack key={field.name}>
                        <BasicNumberField
                            label={`${field.label} Hour`}
                            value={timeValue.hour || 0}
                            onChange={(e) => handleFieldChange(field.name, { ...timeValue, hour: Number(e.target.value) }, field)}
                        />
                        <BasicNumberField
                            label={`${field.label} Minute`}
                            value={timeValue.minute || 0}
                            onChange={(e) => handleFieldChange(field.name, { ...timeValue, minute: Number(e.target.value) }, field)}
                        />
                    </DirectionStack>
                );

            default:
                return null;
        }
    };

    const renderFields = () => {
        const renderedFields: React.ReactNode[] = [];
        
        fields.forEach(field => {
            const fieldElement = renderField(field);
            if (fieldElement) {
                renderedFields.push(fieldElement);
            }
        });

        return renderedFields;
    };

    return (
        <BasicDialog
            open={open}
            title={`${isNew ? 'Create' : 'Edit'} ${title}`}
            onClose={onClose}
            onConfirm={handleConfirm}
            confirmText={isNew ? 'Create' : 'Update'}
            closeText="Cancel"
        >
            {error && <ErrorAlert message={error} />}
            <BasicStack>
                {renderFields()}
            </BasicStack>
        </BasicDialog>
    );
}