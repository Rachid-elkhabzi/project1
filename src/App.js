import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";

const PRODUCTS = [
  { name: "Laptop", price: 1000 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 50 },
  { name: "Monitor", price: 200 },
  { name: "Headphones", price: 80 },
];

export default function App() {
  const [company, setCompany] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleProduct = (prod) =>
    setSelected((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );

  const handleSend = async () => {
    if (!company || !username || !email || selected.length === 0) {
      alert("Please fill all fields and select at least one product.");
      return;
    }

    /* ---------- create PDF ---------- */
    const doc = new jsPDF();
    doc.setFontSize(18).text(company, 20, 20);
    doc
      .setFontSize(12)
      .text(`Client: ${username}`, 20, 30)
      .text(`Date: ${new Date().toLocaleString()}`, 20, 38);

    autoTable(doc, {
      startY: 45,
      head: [["Product", "Price ($)"]],
      body: selected.map((p) => [p.name, p.price.toFixed(2)]),
    });

    const total = selected.reduce((s, p) => s + p.price, 0);
    const y = doc.lastAutoTable?.finalY || 55;
    doc.text(`TOTAL: $${total.toFixed(2)}`, 20, y + 10);

    /* ---------- convert PDF to Base‑64 ---------- */
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    /* ---------- POST to /api/sendReceipt ---------- */
    await fetch("http://localhost:5000/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        company,
        client: username,
        pdf: doc.output("datauristring").split(",")[1],
      }),
    });
  };
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: 700 }}>
        <h2 className="text-center mb-4">🧾 Product → PDF + Email</h2>

        <div className="mb-3">
          <label className="form-label">🏢 Company</label>
          <input
            className="form-control"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">👤 Client</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">✉️ Recipient E‑mail</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <h5 className="text-center mb-3">🛒 Select Products</h5>
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selected.includes(p)}
                    onChange={() => toggleProduct(p)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center mt-4">
          <button
            className="btn btn-primary btn-lg px-5"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending…" : "Send PDF Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
