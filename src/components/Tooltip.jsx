import React from 'react';
export const Ttip = ({ content }) => (
    <div className="tooltip-container">
        <span className="tooltip-icon">?</span>
        <span className="tooltip-content">{content}</span>
    </div>
);