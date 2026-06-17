import { httpsCallable } from "firebase/functions";
import { functions } from "./client";

export type OmilPostulantInput = {
  legalName: string;
  email: string;
  phone?: string;
  headline: string;
  summary: string;
  skills: string[];
  area: string;
  region: string;
  city: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  workMode?: "remote" | "hybrid" | "onsite";
};

export async function createOmilPostulantProfile(input: OmilPostulantInput) {
  const callable = httpsCallable(functions, "createOmilPostulantProfile");
  const result = await callable(input);
  return result.data as {
    workerId: string;
    profileCode: string;
    profileExpiresAt: string;
  };
}
