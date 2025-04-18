import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const App = () => {
  const [barcode, setBarcode] = useState("");
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  const fetchProduct = async (barcode) => {
    try {
      const apiUrl = `https://barkod-okuyucu-server.vercel.app/barcode/${barcode}`;
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error("Ürün bulunamadı.");

      const data = await response.json();
      setProductData(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setProductData(null);
    }
  };

  const startScanner = () => {
    setScanning(true);

    // DOM oluşması için bir tık gecikme
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
          formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13]
        },
        (decodedText) => {
          html5QrCode.stop();
          setBarcode(decodedText);
          setScanning(false);
          fetchProduct(decodedText);
        },
        (err) => {
          console.warn("Tarama hatası", err);
        }
      );
    }, 300); // 300ms sonra DOM kesin oluşmuş olur
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProduct(barcode);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>📦 Barkod ile Ürün Bilgisi Getir</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barkod numarasını girin"
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button type="submit" style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
          Gönder
        </button>
      </form>

      <button
        onClick={scanning ? stopScanner : startScanner}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        {scanning ? "Kamerayı Kapat" : "📷 Kameradan Oku"}
      </button>

      {scanning && <div id="reader" style={{ width: "300px", marginTop: "1rem" }}></div>}

      <div style={{ marginTop: "2rem" }}>
        {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
        {productData && (
          <pre
            style={{
              backgroundColor: "#f4f4f4",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto"
            }}
          >
            {JSON.stringify(productData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default App;
