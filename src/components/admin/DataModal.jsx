import React from 'react';

const DataModal = ({ isOpen, onClose, title, children, onConfirm }) => {
    if (!isOpen) return null;

    const styles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        },
        modal: {
            backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
            width: '500px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        },
        header: {
            fontSize: '18px', fontWeight: 'bold', marginBottom: '16px',
            borderBottom: '1px solid #eee', paddingBottom: '8px'
        },
        footer: {
            marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'
        },
        btn: {
            padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
        },
        cancelBtn: { backgroundColor: '#f5f5f5', color: '#666' },
        confirmBtn: { backgroundColor: '#1890ff', color: 'white' }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>{title}</div>
                <div>{children}</div>
                <div style={styles.footer}>
                    <button style={{...styles.btn, ...styles.cancelBtn}} onClick={onClose}>取消</button>
                    <button style={{...styles.btn, ...styles.confirmBtn}} onClick={onConfirm}>保存</button>
                </div>
            </div>
        </div>
    );
};

export default DataModal;