'use client';

import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';
import ErrorAlert from '@client-common/components/feedback/alert/ErrorAlert';
import WarningAlert from '@client-common/components/feedback/alert/WarningAlert';
import { useNotificationManager } from '@client-common/hooks/notification-manager';

type NotificationSettingDialogProps = {
    open: boolean;
    onClose: () => void;
}

export default function NotificationSettingDialog({
    open,
    onClose,
}: NotificationSettingDialogProps) {
    const {
        isSupported,
        subscription,
        error,
        subscribeToPush,
        unsubscribeFromPush,
    } = useNotificationManager();

    return (
        <BasicDialog
            open={open}
            title="Notification Settings"
            onClose={onClose}
        >
            {(loading, runWithLoading) => (
                <>
                    {!isSupported && (
                        <WarningAlert message="Push notifications are not supported in this browser." />
                    )}

                    {error && (
                        <ErrorAlert message={error} />
                    )}

                    <BasicStack>
                        <div>Status: {subscription ? 'Subscribed' : 'Unsubscribed'}</div>
                        <ContainedButton
                            label='Enable'
                            onClick={() => runWithLoading(subscribeToPush)}
                            disabled={loading || !isSupported || !!subscription}
                        />
                        <ContainedButton
                            label='Disable'
                            onClick={() => runWithLoading(unsubscribeFromPush)}
                            disabled={loading || !isSupported || !subscription}
                        />
                    </BasicStack>
                </>
            )}
        </BasicDialog>
    )
}
