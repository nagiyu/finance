import { Alert } from '@mui/material';

type ErrorAlertProps = {
    message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
    return (
        <Alert severity='error'>
            {message}
        </Alert>
    )
}
