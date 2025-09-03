'use client';

import React from 'react';

import Avatar from '@mui/material/Avatar';
import Person from '@mui/icons-material/Person';

interface UserIconAvatarProps {
    onClick?: () => void;
}

export default function UserIconAvatar({
    onClick
}: UserIconAvatarProps) {
    return (
        <Avatar alt='User' onClick={onClick}>
            <Person />
        </Avatar>
    )
}
