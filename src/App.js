import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";   // helper fn for v5
import "bootstrap/dist/css/bootstrap.min.css";

const PRODUCTS = [
  { name: "Laptop",     price: 1000 },
  { name: "Mouse",      price: 25  },
  { name: "Keyboard",   price: 50  },
  { name: "Monitor",    price: 200 },
  { name: "Headphones", price: 80  },
];

export default function App() {
  const [company, setCompany]         = useState("");
  const [username, setUsername]       = useState("");
  const [selected, setSelected]       = useState([]);

  const toggleProduct = (prod) =>
    setSelected((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );

  const generatePDF = () => {
    if (!company || !username || selected.length === 0) {
      alert("Please fill in all fields and select at least one product.");
      return;
    }

    /* ---------- create PDF ---------- */
    const doc = new jsPDF();

    // header texts
    doc.setFontSize(18);
    doc.text(company, 20, 20);               // company
    doc.setFontSize(12);
    doc.text(`Client: ${username}`, 20, 30);  // client name
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 38); // date‑time

    // product table
    autoTable(doc, {
      startY: 45,
      head: [["Product", "Price ($)"]],
      body: selected.map((p) => [p.name, p.price.toFixed(2)]),
    });

    // total
    const total = selected.reduce((sum, p) => sum + p.price, 0);
    const y = doc.lastAutoTable?.finalY || 55;
    doc.text(`TOTAL: $${total.toFixed(2)}`, 20, y + 10);

    // save
    doc.save(`receipt_${username}_${Date.now()}.pdf`);

    /* ---------- reset form ---------- */
    setCompany("");
    setUsername("");
    setSelected([]);
    alert("✅ PDF generated and form cleared!");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "700px" }}>
        <h2 className="text-center mb-4">🧾 Product PDF Generator</h2>

        {/* company input */}
        <div className="mb-3">
          <label className="form-label">🏢 Company Name</label>
          <input
            type="text"
            className="form-control"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company"
          />
        </div>

        {/* client input */}
        <div className="mb-3">
          <label className="form-label">👤 Client Name</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter client"
          />
        </div>

        {/* product table */}
        <h5 className="text-center mb-3">🛒 Select Products</h5>
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Price ($)</th>
              <th className="text-center">Select</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td className="text-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selected.includes(p)}
                    onChange={() => toggleProduct(p)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* action button */}
        <div className="text-center mt-4">
          <button className="btn btn-primary btn-lg px-5" onClick={generatePDF}>
            🧾 Buy & Download
          </button>
        </div>
      </div>
    </div>
  );
}
