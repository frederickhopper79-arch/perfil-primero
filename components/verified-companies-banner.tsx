"use client";

import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { demoCompanies } from "@/lib/domain/demo-data";
import { db } from "@/lib/firebase/client";
import type { CompanyProfile } from "@/lib/domain/types";

export function VerifiedCompaniesBanner() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "companyProfiles"),
      where("verificationStatus", "==", "verified"),
      limit(12)
    );
    getDocs(q)
      .then((snap) => setCompanies(snap.docs.map((doc) => doc.data() as CompanyProfile)))
      .catch(() => setCompanies([]));
  }, []);

  const visible = ensureMinimumCompanies(companies.length ? companies : demoCompanies);

  return (
    <section className="logoBand" aria-label="Empresas verificadas">
      <div className="logoBandHeader">
        <div>
          <p className="eyebrow">Empresas verificadas</p>
          <h2>Organizaciones que ya pueden encontrar talento en Perfil Primero.</h2>
          <p>
            Cada empresa visible pasa por revision interna antes de contactar postulantes reales.
          </p>
        </div>
        <span className="verifiedCount">{visible.length}+ verificadas</span>
      </div>
      <div className="logoMarquee" aria-label="Empresas verificadas en movimiento">
        <div className="logoTrack">
          {[...visible, ...visible].map((company, index) => (
            <div className="companyLogoTile" key={`${company.companyId}-${index}`}>
              {company.logoUrl ? <img src={company.logoUrl} alt="" /> : <span>{initials(company.companyName)}</span>}
              <strong>{company.companyName}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ensureMinimumCompanies(companies: CompanyProfile[]) {
  const placeholders: CompanyProfile[] = [
    ...companies,
    {
      companyId: "placeholder-austral",
      companyName: "Austral Servicios SpA",
      legalName: "Austral Servicios SpA",
      taxId: "",
      website: "",
      industry: "Servicios",
      size: "50-200",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-valle",
      companyName: "Valle Central Retail",
      legalName: "Valle Central Retail SpA",
      taxId: "",
      website: "",
      industry: "Retail",
      size: "200-500",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-pacifico",
      companyName: "Pacifico Operaciones",
      legalName: "Pacifico Operaciones SpA",
      taxId: "",
      website: "",
      industry: "Operaciones",
      size: "50-200",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-cordillera",
      companyName: "Cordillera Tech",
      legalName: "Cordillera Tech SpA",
      taxId: "",
      website: "",
      industry: "Tecnología",
      size: "50-200",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-maule",
      companyName: "Maule Agroindustrial",
      legalName: "Maule Agroindustrial S.A.",
      taxId: "",
      website: "",
      industry: "Agroindustria",
      size: "200-500",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-norte",
      companyName: "Norte Grande Minería",
      legalName: "Norte Grande Minería SpA",
      taxId: "",
      website: "",
      industry: "Minería",
      size: "500+",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-biopacific",
      companyName: "BioPacific Salud",
      legalName: "BioPacific Salud Ltda.",
      taxId: "",
      website: "",
      industry: "Salud",
      size: "50-200",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    },
    {
      companyId: "placeholder-araucania",
      companyName: "Araucanía Construcciones",
      legalName: "Araucanía Construcciones SpA",
      taxId: "",
      website: "",
      industry: "Construcción",
      size: "50-200",
      verificationStatus: "verified",
      billingStatus: "inactive",
      reputationScore: 0,
      responseRate: 0,
      averageResponseTimeHours: null
    }
  ];

  const unique = new Map<string, CompanyProfile>();
  placeholders.forEach((company) => unique.set(company.companyName, company));
  return Array.from(unique.values()).slice(0, Math.max(8, companies.length));
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
