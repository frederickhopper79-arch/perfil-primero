"use client";

import { useEffect, useState } from "react";
import { FileDown, ReceiptText } from "lucide-react";
import { listCompanyBillingDocuments } from "@/lib/firebase/companies";

type BillingDocument = {
  paymentId: string;
  providerPaymentId: string;
  amount: number;
  currency: "CLP" | "USD";
  paymentType: string;
  status: string;
  folioSii: string;
  pdfUrl: string;
  xmlUrl: string;
  siiStatus: string;
  createdAt: string;
};

export function CompanyInvoicesPanel() {
  const [documents, setDocuments] = useState<BillingDocument[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    listCompanyBillingDocuments()
      .then((result) => {
        setDocuments(result.documents);
        setStatus(result.documents.length ? "" : "Aun no hay documentos de pago confirmados.");
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "No se pudieron cargar documentos.");
      });
  }, []);

  return (
    <section className="comparisonTable">
      <div className="formHeader">
        <ReceiptText size={22} aria-hidden="true" />
        <div>
          <h2>Facturas y respaldos</h2>
          <p>Historial de pagos, folio SII y descarga PDF/XML cuando el proveedor tributario este conectado.</p>
        </div>
      </div>

      <div className="paymentList">
        {documents.length ? documents.map((document) => (
          <article key={document.paymentId}>
            <div>
              <strong>{document.currency === "CLP" ? `$${document.amount.toLocaleString("es-CL")}` : `US$${document.amount}`}</strong>
              <span>{document.folioSii ? `Folio SII ${document.folioSii}` : "Folio SII pendiente"}</span>
              <span>{document.siiStatus === "pending_provider" ? "Pendiente de proveedor tributario" : document.siiStatus}</span>
            </div>
            <div className="actions">
              {document.pdfUrl ? (
                <a className="button secondary" href={document.pdfUrl} target="_blank" rel="noreferrer">
                  <FileDown size={16} aria-hidden="true" />
                  PDF
                </a>
              ) : null}
              {document.xmlUrl ? (
                <a className="button secondary" href={document.xmlUrl} target="_blank" rel="noreferrer">
                  <FileDown size={16} aria-hidden="true" />
                  XML
                </a>
              ) : null}
            </div>
          </article>
        )) : (
          <p className="emptyState">{status || "Cargando documentos..."}</p>
        )}
      </div>
    </section>
  );
}
