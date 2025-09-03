'use client';

import { useState } from 'react';

import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';
import NotificationSettingDialog from '@client-common/components/feedback/dialog/NotificationSettingDialog';

export default function NotificationSettingButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ContainedButton label='Notification Settings' onClick={() => setOpen(true)} />
            <NotificationSettingDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
