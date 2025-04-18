import React, { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const App = () => {
  const [barcode, setBarcode] = useState("");
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  const fetchProduct = async (barcode) => {
    try {
      const apiUrl = `https://barkod-okuyucu-server.vercel.app/barcode/${barcode}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Ürün bulunamadı.");
      const data = await response.json();

      if (data.successful) {
        setProductData(data);
        setError("");
      } else {
        setError("Ürün bulunamadı");
        setProductData(null);
      }
    } catch (err) {
      setError(err.message);
      setProductData(null);
    }
  };

  const startScanner = async () => {
    setScanning(true);
    setProductData(null);
    setError("");

    codeReader.current = new BrowserMultiFormatReader();

    try {
      await codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText();
            stopScanner();
            setBarcode(code);
            fetchProduct(code);
          }
        }
      );
    } catch (err) {
      console.error("Kamera başlatılamadı:", err);
      setError("Kamera başlatılamadı.");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setScanning(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProduct(barcode);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
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

      <div style={{ marginTop: "1rem" }}>
        <video ref={videoRef} style={{ width: "300px", height: "200px" }} />
      </div>

      <div style={{ marginTop: "2rem" }}>
        {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
        {productData && (
          <>
            <h2>{productData.data.name}</h2>
            <div><strong>Mal No: </strong>{productData.data.sku}</div>
            <div><strong>Fiyat: </strong> {(productData.data.regularPrice / 100).toString().replace(".", ",")} TL</div>
            {productData.data.regularPrice !== productData.data.loyaltyPrice && (
              <div><strong>İndirimli Fiyat: </strong> {(productData.data.loyaltyPrice / 100).toString().replace(".", ",")} TL</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;