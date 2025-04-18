import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga"; // quagga2 de kullanabilirsin

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
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#reader"),
          constraints: {
            facingMode: "environment", // Arka kamera
          },
        },
        decoder: {
          readers: ["ean_reader"], // EAN-13 barkodları için
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          setError("Kamera başlatılamadı.");
          setScanning(false);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      if (code) {
        Quagga.stop();
        setBarcode(code);
        setScanning(false);
        fetchProduct(code);
      }
    });
  };

  const stopScanner = () => {
    Quagga.stop();
    setScanning(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProduct(barcode);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
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

      <div id="reader" style={{ width: "300px", marginTop: "1rem" }}></div>

      <div style={{ marginTop: "2rem" }}>
        {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
        {productData && (
          <pre
            style={{
              backgroundColor: "#f4f4f4",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto",
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
