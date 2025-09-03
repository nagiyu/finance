import { Alert } from '@mui/material';

type WarningAlertProps = {
    message: string;
}

export default function WarningAlert({ message }: WarningAlertProps) {
    return (
        <Alert severity='warning'>
            {message}
        </Alert>
    )
}
