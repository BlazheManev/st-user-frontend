import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import AuthService from "../services/auth.service";
import "../styles/MyQRCode.css"; // Import the CSS file

const MyQRCode = () => {
  const [qrCode, setQrCode] = useState("");
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const jsonData = JSON.stringify({ userID: currentUser.id });
        const qr = await QRCode.toDataURL(jsonData);
        console.log(jsonData);
        setQrCode(qr);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();

    const intervalId = setInterval(generateQRCode, 15000); // regenerate every 15 seconds

    return () => clearInterval(intervalId); // clean up interval on component unmount
  }, [currentUser.id]);

  return (
    <div className="qr-code-container">
      <h2>My QR Code</h2>
      <p>This is to start your working day</p>
      {qrCode ? (
        <img src={qrCode} alt="Generated QR Code" className="qr-code" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MyQRCode;
