import React from 'react';
import '../styles/CustomModal.css';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <button className="custom-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="custom-modal-content">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
