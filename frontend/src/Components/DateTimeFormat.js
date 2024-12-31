import React from 'react';

const DateTimeFormat = ({ timestamp }) => {
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    };

    const formattedDate = new Date(timestamp).toLocaleString('en-US', options) + ' WIB';
    return formattedDate;
};

export default DateTimeFormat;
