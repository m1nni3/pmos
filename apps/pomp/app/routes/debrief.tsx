import { useState } from "react";
import { X } from 'lucide-react'

// ─── DATA ────────────────────────────────────────────────────────────────────

const debriefs = [
  {
    id: 8,
    month: "May 2026",
    monthShort: "May 2026",
    date: "8–11 May 2026",
    title: "Municipal Accounts, Property Management & Operational Update",
    tag: "OPERATIONAL",
    summary: "Comprehensive operational update covering six active matters: MPS municipal resolutions (Indaba, Malindi, Villeroy), Mont Bleu tenant onboarding, KempRent→Trafalgar transition (D26 Malindi), financial administration requests, Oakdale remote audit, and Villeroy Court 135 payment reference issues.",
    sections: [
      {
        heading: "Municipal & Property Solutions – Status",
        body: "Indaba: Interest reversal complete. Account reduced from R69,497 to R818.30. Invoice INV011673 (R2,242.50) paid. Closing invoice INV011763 (R2,300.00) ready for settlement via EFT. Malindi: Account regularised, ownership change complete. ~R18,000 transferred to collections identified. Trust settled R4,360.00 on 15 April. Residual municipal balance R223.00 (due 18 May). R1,150.00 still owed to MPS. Villeroy: Debt relief application submitted to City of Johannesburg (Phase 4 Programme, 1 Nov 2025–31 Oct 2026). Awaiting feedback — not expected before end of May. Statement: R22,632.56 total, R20,952.09 in 90+ days, interest R25.61. If approved: ~50% write-off, full interest waiver, estimated exposure →R11,316.28."
      },
      {
        heading: "Villeroy – Prestige Metering (Utilities, VILL.0135.07)",
        body: "Outstanding balance of R138.09 confirmed by Jeandre Britz (Prestige Metering) and Chandre Barnard (Trafalgar). Instruction given to Trafalgar to settle R138.09 from rental proceeds. Matter resolved pending payment confirmation."
      },
      {
        heading: "Oakdale & Mont Bleu – Municipal Account Access",
        body: "Oakdale: Sarah has existing City of Cape Town e-services profile. Oakdale account should be linked to her existing profile — not a new account. Login credentials required to proceed. No profile created — property not technically registered under Trust, unsure of registered account holder, did not want to interfere without authority. Mont Bleu: Further confirmation required: registered account holder, whether account number changed post-transfer, whether account already linked to Sarah's profile. No action taken — property now managed through VettedStay; access needed to monitor charges, verify payments, track arrears."
      },
      {
        heading: "Mont Bleu – Tenant Onboarding & Occupation",
        body: "Completed: first month rental paid, full deposit paid, BC conduct undertaking signed by Rudy and Angelique, lease executed, emergency contacts received. Remaining: WeConnectU body corporate onboarding (BC side still to finalise). Inspection complete, report on file — tenant sign-off pending (not conducted simultaneously with tenants present). Handover 30 April in excellent condition: newly painted walls, clean throughout. Both sets of keys confirmed received and working. Mosquito netting: netting positioned on wrong side of burglar bars (lounge) — ineffective. Rudy requested pause on ordering additional netting pending full assessment of current installation."
      },
      {
        heading: "KempRent → Trafalgar Transition (D26 Malindi)",
        body: "No funds transferred — neither tenant deposits nor rental income disbursed. Partial ledgers received (2016–2026, provided 8 May 2026). Records remain incomplete. Reconciliation and discrepancy breakdown prepared. Levy discrepancy: ~R790 levy + ~R50 admin deducted monthly by KempRent — BC not reflecting receipt. Proof of payment repeatedly requested, not yet provided. Escalation document being compiled — may need to be referred to Trust's attorneys. Trafalgar banking for deposit transfer: Standard Bank, Account 270739335, Branch 051001, Ref: D26 Malindi. Trafalgar interim inspection completed; revised maintenance schedule prepared by urgency, compliance/risk, owner responsibility, BC responsibility, operational priority. Trafalgar instructed to obtain quotations for all urgent items."
      },
      {
        heading: "Villeroy Court 135 – Tenant Payment Reference Issue",
        body: "Tenant used incorrect payment reference for 3–4 consecutive months, causing repeated reallocation delays. Trafalgar (Natasha Herbst, Pretoria) formally advised on 12 May: move tenant to debit order immediately; credit bureau reporting to be initiated if incorrect references continue; apply lease penalties if payments were late. Trafalgar confirmed on 13 May: all payments received on time; debit order form sent to tenant; lease provides for penalties. Debit order setup in progress — confirmation of completion awaited."
      },
      {
        heading: "Oakdale – Urgent Remote Control Audit",
        body: "Trafalgar issued urgent security notice on 11 May requiring all Oakdale owners to present remotes in person to Glenn Ford for a remote control audit. Follow-up acknowledgement sent to Trafalgar contact on 12 May. Action required: arrange for Oakdale remote(s) to be presented to Glenn Ford at Trafalgar at earliest opportunity."
      },
      {
        heading: "Trust Financial Administration",
        body: "Nedbank notifications: binostribe@gmail.com to be added for all deposits, payments, and account activity. Problem: irregular statement generation (low-activity accounts generate combined multi-month statements) is materially affecting ability to meet 10th-of-month reporting deadline. Historical Nedbank statements pre-February 2025 requested for KempRent reconciliation and analysis. Petty cash tracker updated: municipal matters, vendor payments, property-related expenses, remaining balances across all ongoing matters."
      }
    ],
    financials: [
      { label: "MPS – Indaba balance due (INV011763)", value: "R2,300.00", status: "warning" },
      { label: "MPS – Malindi balance due", value: "R1,150.00", status: "warning" },
      { label: "MPS – Villeroy balance due", value: "R1,673.25", status: "warning" },
      { label: "MPS total outstanding", value: "R5,123.25", status: "warning" },
      { label: "Villeroy municipal outstanding", value: "R22,632.56", status: "danger" },
      { label: "Villeroy if debt relief approved", value: "~R11,316.28", status: "warning" },
      { label: "Villeroy utilities (Prestige)", value: "R138.09", status: "ok" },
      { label: "Indaba municipal (residual)", value: "R818.30", status: "ok" },
      { label: "Malindi municipal (residual)", value: "R223.00", status: "ok" },
    ],
    docs: [
      { name: "Trustee_Debrief_Municipal_Property_Management_May_2026.pdf", file: "Trustee_Debrief_Municipal_Property_Management_May_2026.pdf" },
      { name: "Trustee_Debrief_May2026_update_4.pdf", file: "Trustee_Debrief_May2026_update_4.pdf" },
      { name: "Trustee_Debrief_Final_Familiar_Tone_May_2026.docx", file: "Trustee_Debrief_Final_Familiar_Tone_May_2026.docx" },
      { name: "Trustee_Debrief_-_8_May_2026_docx__1_.pdf", file: "Trustee_Debrief_-_8_May_2026_docx__1_.pdf" },
      { name: "Trustee_Debrief_-_8_May_2026_docx__2_.pdf", file: "Trustee_Debrief_-_8_May_2026_docx__2_.pdf" },
      { name: "Trustee_Debrief_-_11_May_2026_docx__2___1_.pdf", file: "Trustee_Debrief_-_11_May_2026_docx__2___1_.pdf" },
    ],
    properties: ["Indaba", "Malindi", "Villeroy", "Oakdale", "Mont Bleu"]
  },
  {
    id: 7,
    month: "May 2026",
    monthShort: "May 2026",
    date: "May 2026",
    title: "Letting Agent Negotiations, Municipal Accounts & Sectional Title",
    tag: "STRATEGIC",
    summary: "Positive outcomes across financial, operational, and compliance areas. Reduced Trafalgar management fees negotiated for Mont Bleu and Malindi Court. SS Malindi Court municipal account located and being linked. Tshwane 70% interest write-off approved — R42,840.33 settlement offer.",
    sections: [
      {
        heading: "Letting Agent Fee Negotiations – Results",
        body: "Mont Bleu (Cape Town / Trafalgar CT): Original 10% + VAT negotiated to 8% + VAT (effective rate 9.2%). Monthly fee R450.80. Annual fee R5,409.60. Annual saving vs original: R1,352.40. Malindi Court (Pretoria / Trafalgar Pretoria): Original 10% + VAT negotiated to 7% + VAT (effective rate 8.05%). Monthly fee R394.45. Annual fee R4,733.40. Annual saving vs original: R2,028.60. Key insight: Malindi Court operates at a lower cost base, enhancing net rental income."
      },
      {
        heading: "SS Malindi Court – Ekurhuleni Municipality",
        body: "Appointed vendor successfully located the municipal account. Account Number: 1705260024. Current balance: R4,360. Account currently being linked to the Trust's online municipal profile. Critical step toward finalising sectional title registration compliance — enables improved visibility, control, and ongoing management."
      },
      {
        heading: "Tshwane Municipal Account (Property Acquired 2005)",
        body: "Background: Arrears identified approximately R68,000. Formal request submitted for interest relief and account regularisation. Outcome: Request approved. 70% of interest written off. Settlement offer of R42,840.33 extended. Financial impact: significant reduction in historical liability — allows Trust to regularise account at substantially reduced cost."
      },
      {
        heading: "Key Takeaways",
        body: "Successful negotiation of reduced letting agent fees improves overall rental profitability. Meaningful progress made in unlocking sectional title registration requirements. Tshwane intervention delivered material financial relief, reducing legacy risk exposure. Combined annual letting fee saving: R3,381.00. Further optimisation opportunities may be explored as portfolio evolves."
      }
    ],
    financials: [
      { label: "Mont Bleu annual fee saving", value: "R1,352.40", status: "ok" },
      { label: "Malindi Court annual fee saving", value: "R2,028.60", status: "ok" },
      { label: "Combined annual letting fee saving", value: "R3,381.00", status: "ok" },
      { label: "Tshwane settlement offer", value: "R42,840.33", status: "warning" },
      { label: "Interest written off (70%)", value: "~R47,600", status: "ok" },
    ],
    docs: [{ name: "Property_Management_Debrief_.pdf", file: "Property_Management_Debrief_.pdf" }],
    properties: ["Mont Bleu", "Malindi", "Indaba"]
  },
  {
    id: 6,
    month: "May 2026",
    monthShort: "May 2026",
    date: "May 2026",
    title: "Situational Debrief – Municipal Office Engagement",
    tag: "URGENT",
    summary: "Post-meeting debrief following engagement with municipal services office on interest waiver offer and settlement options. Time-sensitive decision required: interest waiver conditional on full settlement within current billing cycle. Debt relief programmes no longer available.",
    sections: [
      {
        heading: "Key Findings from Municipal Office",
        body: "Interest waiver offer strictly conditional on full settlement within the current billing cycle — only a few days remaining. Municipality no longer offers debt relief programmes (previously: interest reversal + structured payment). Two options only: (1) Settle immediately to retain waiver, or (2) Allow to lapse — interest reinstated, payment arrangement possible but interest remains payable."
      },
      {
        heading: "Valuation Dispute Potential",
        body: "Unit historically valued R1.2–1.5M; realistic market value approximately R400,000. Significant overstatement suggests municipal charges and arrears may have been incorrectly calculated based on inflated valuation. Dispute officer only available the following day — viability of this route to be confirmed before committing."
      },
      {
        heading: "Position Taken & Reasoning",
        body: "No commitment made — Trust liquidity position not available at time of engagement. Immediate payment of approximately R45,000 could not be confirmed as feasible. Did not want to enter arrangement that may not be financially viable. Note: current settlement figure is NOT a final conveyancing clearance amount — separate figure required during transfer process."
      },
      {
        heading: "Draft Correspondence & Next Steps",
        body: "Draft correspondence to debt collection department prepared for potential structured payment arrangement (three instalments). Alternative: allow current offer to lapse and reapply at a later stage (account reassessed at that point). Trustees to advise on how to proceed — decision required urgently given the billing cycle deadline."
      }
    ],
    financials: [
      { label: "Estimated immediate settlement required", value: "~R45,000", status: "danger" },
      { label: "Historic full arrears (approximate)", value: "~R68,000", status: "danger" },
    ],
    docs: [{ name: "Situational_Debrief__refined_.pdf", file: "Situational_Debrief__refined_.pdf" }],
    properties: ["Indaba"]
  },
  {
    id: 5,
    month: "May 2026",
    monthShort: "May 2026",
    date: "8 May 2026",
    title: "Malindi Court – Legal Review Debrief",
    tag: "LEGAL",
    summary: "Debrief summarising material deficiencies in Kemprent's management of Malindi Court, prepared for finalising instructions to legal counsel. Covers inspection failures, missing payments, incorrect levy administration, deposit misuse, and maintenance neglect.",
    sections: [
      {
        heading: "Key Issues Identified",
        body: "Failure to conduct proper entry/exit inspections — inspections completed by tenant, not agent. Missing payments not appearing in BC levy statements or Trust bank account. Tenants not held accountable for their maintenance and repair obligations. Cleaning charges incorrectly borne by Trust after deposit already refunded. Multiple inconsistent ledger versions with no satisfactory explanation."
      },
      {
        heading: "Financial & Administrative Irregularities",
        body: "Trust charged for levy payments that were never made — resulting in additional BC fees and penalties. Deposit funds used to offset rental without corresponding owner ledger credit. Trust replaced kitchen cupboards twice in under five years due to inadequate maintenance oversight. Utility recoveries inadequately managed — owner absorbed shortfalls. Outdated marketing images used in advertising the property. Interference with direct communication between Trust's agent and tenant."
      },
      {
        heading: "Preliminary Assessment",
        body: "Pattern of discrepancies indicates material deficiencies in record-keeping, financial administration, tenant management, and maintenance oversight. Pattern may warrant further legal review — particularly regarding accountability for missing funds, duplicate or unsupported charges, and potential breaches of the agent's management mandate."
      },
      {
        heading: "Recommended Next Steps for Legal Counsel",
        body: "1. Finalise detailed review against all inspection records, ledgers, bank statements, levy statements, and deposit reconciliations. 2. Assess whether charges debited to the Trust were unauthorised, duplicated, unsupported, or incorrectly applied. 3. Determine basis for recovery of missing payments, levy penalties, cleaning charges, maintenance costs, and utility shortfalls. 4. Advise whether conduct constitutes breach of mandate, negligence, or other actionable wrongdoing."
      },
      {
        heading: "Recommendation",
        body: "Transfer property management to Trafalgar without delay while continuing to establish the full extent of apparent mismanagement and determining whether further legal or recovery action is warranted. This approach protects Trust interests, improves current property oversight, and limits risk of further administrative or financial prejudice."
      }
    ],
    financials: [],
    docs: [{ name: "Malindi_Debrief.pdf", file: "Malindi_Debrief.pdf" }],
    properties: ["Malindi"]
  },
  {
    id: 4,
    month: "May 2026",
    monthShort: "May 2026",
    date: "8 May 2026",
    title: "D26 Malindi – Kemprent Mandate Termination: Handover Review",
    tag: "FORENSIC",
    summary: "Confidential memorandum reviewing all Kemprent ledger records following mandate termination at D26 Malindi. Covers 11 owner ledgers and 11 tenant ledgers (2016–2026). 44 duplicate files identified and removed. Critical irregularities identified requiring formal follow-up.",
    sections: [
      {
        heading: "Scope of Review",
        body: "22 canonical ledger files reviewed after removing 44 duplicate files (identified by content hash). 11 owner (supplier) ledgers covering financial years 2016–2026. 11 tenant (customer) ledgers covering 7 different tenants over the same period. Two files received with typographical errors in filenames — verified complete and renamed."
      },
      {
        heading: "Owner Ledger Summary (Supplier Account 3525DI)",
        body: "2016: 5 of 12 months, opens Nov 2016 — 7 months missing. Closes R1,063.33 outstanding. 2017: Full year, opens R1,063.33 carried. Closes R15,593.19 outstanding. 2018: 8 of 12 months, closes R0.00. 2019: Near-empty — no transactions, no opening balance. 2020: 3 of 12 months. 2021–2023: Full years, settled. 2024: Full year, closes R3,832.50 outstanding. 2025: Full year, closes −R2,697.32 (negative). 2026: Active YTD, R3,752.40. Total outstanding gross: R18,640.24."
      },
      {
        heading: "Tenant Ledger Summary (7 Tenants)",
        body: "Masilela (2016): Opens with R11,200.86 arrears — marked evicted Sep 2016, closes R11,829.64. Khumalo (2017): Unexplained R120.00 opening, closes R16,986.50. Dadidi (2020): Closes R79.53. Kalambayi (2022): Vacated Sep 2022, closes R698.39. Ncube (2024): Closes R2,450.00. Makhoba (2025): Opens with unexplained R5,114.00 — no prior ledger. Siamaiya (2026): Opens R4,240.00. Total closed account outstanding: R31,043.06."
      },
      {
        heading: "Critical Irregularities",
        body: "CRITICAL: Owner 2019 — near-empty ledger, no transactions — entire year of owner distributions unaccounted for. CRITICAL: Masilela 2016 — opens with R11,200.86 pre-existing arrears, no prior records, no recovery entries anywhere in handover set. CRITICAL: Makhoba 2025 — opens with R5,114.00, no prior ledger provided. Requires clarification: Owner 2016 and 2018 commence mid-year without explanation. Coincident gap in both owner and tenant ledgers Mar–Jun 2018. Owner 2025 negative close −R2,697.32. Levy charges R0.00 from March 2023 onwards."
      },
      {
        heading: "Financial Summary",
        body: "Owner outstanding gross: R18,640.24 (of which R16,656.52 historic 2016–2017, R4,681.04 recent 2022–2024, less R2,697.32 negative close). Net recent owner balance: R1,983.72. Total closed tenant outstanding: R31,043.06 (of which R28,816.14 historic Masilela + Khumalo; R3,227.92 Ncube + Dadidi + Kalambayi). Siamaiya 2026 pre-existing opening: R4,240.00 (origin unconfirmed). Makhoba 2025 unexplained opening: R5,114.00."
      },
      {
        heading: "Next Steps",
        body: "Formal reconciliation request sent to Kemprent — 14-day response deadline. Detailed irregularities enquiry sent to Kemprent — 14-day response deadline. Trustees to confirm whether historic balances (2016–2017 owner and tenant) are to be written off or pursued. Incoming agent to confirm Siamaiya deposit / opening balance R4,240.00. Body corporate to confirm levy arrangements post February 2023. All correspondence to be retained on Trust property file."
      }
    ],
    financials: [
      { label: "Owner account outstanding (gross)", value: "R18,640.24", status: "danger" },
      { label: "Net recent owner balance", value: "R1,983.72", status: "warning" },
      { label: "Closed tenant accounts outstanding", value: "R31,043.06", status: "danger" },
      { label: "Historic tenant balances (Masilela + Khumalo)", value: "R28,816.14", status: "danger" },
      { label: "Siamaiya pre-existing opening balance", value: "R4,240.00", status: "warning" },
      { label: "Makhoba unexplained opening balance", value: "R5,114.00", status: "warning" },
    ],
    docs: [{ name: "D26_Malindi_Trustee_Debrief.pdf", file: "D26_Malindi_Trustee_Debrief.pdf" }],
    properties: ["Malindi"]
  },
  {
    id: 3,
    month: "February 2026",
    monthShort: "Feb 2026",
    date: "27 February 2026",
    title: "Trustees Meeting – Handout & Decision Pack",
    tag: "MEETING",
    summary: "Supporting handout for the 27 February trustees meeting. Provides detailed municipal account summaries for all three sale properties, risk register, decisions required from trustees, and full action item log with owners and deadlines.",
    sections: [
      {
        heading: "Municipal Account Summary Table",
        body: "Malindi (Ekurhuleni): Balance unconfirmed — account must be located or created. Target: locate within 7 days of instruction. Indaba (Tshwane): Account 5004692062 confirmed never paid. Settlement R25,730 subject to itemised statement. Full arrears ~R68,000. Target: confirm and settle within 14 days. Villeroy (Joburg + Prestige Metering): Municipal arrears ~R23,000. Prestige Metering pre-termination notice active — IMMEDIATE action required within 7 days."
      },
      {
        heading: "Decisions Required from Trustees",
        body: "Decision 1: Malindi — Authorise MPSCC account locate/create (R795 / R1,950 ex VAT). Decision 2: Indaba — Authorise Tshwane 3-year settlement (R25,730) or instruct specialist. Decision 3: Villeroy — Authorise immediate Prestige Metering payment + address Joburg municipal arrears (~R23,000). Decision 4: Malindi D26 — Confirm maintenance dispute resolution approach (reimbursement vs. contractor). Decision 5: Specialist engagement — confirm preferred specialist per property."
      },
      {
        heading: "Action Items Log",
        body: "Authorise MPSCC to locate/create Malindi account (Mignon, within 2 business days). Request itemised Tshwane statement and confirm settlement (Mignon / Trustee signatory, within 7 days). Request Prestige Metering invoice and pay/arrange plan (Mignon / Trafalgar, IMMEDIATE). Resolve Malindi D26 maintenance dispute (Mignon / Rentals, within 7 days). Collate fixed quotes from specialists per property (Mignon, 7–14 days). Confirm allocation of Trafalgar trust payments: R2,733.76 and R7,222.87 (Mignon, at meeting)."
      },
      {
        heading: "Key Risks",
        body: "Villeroy (Prestige Metering): disconnection IMMEDIATE — pre-termination notice 5 Jan 2026; R800+ penalty applies. Malindi D26 (tenant): vacancy risk if maintenance complaint unresolved. Municipal accounts: none of the three fully settled; upfront specialist fees R795–R1,950 needed to unlock next steps. Indaba: R25,730 figure requires verification against full ~R68,000 estimate. Trafalgar payments: R2,733.76 + R7,222.87 unallocated — confirmation required."
      }
    ],
    financials: [
      { label: "Villeroy Prestige Metering penalty", value: "R800", status: "danger" },
      { label: "Indaba settlement (3-year)", value: "R25,730", status: "warning" },
      { label: "Villeroy municipal estimate", value: "~R23,000", status: "danger" },
      { label: "Trafalgar unallocated payments total", value: "R9,956.63", status: "warning" },
    ],
    docs: [{ name: "enthuse-trust-meeting-handout.docx", file: "enthuse-trust-meeting-handout.docx" }],
    properties: ["Malindi", "Indaba", "Villeroy", "Oakdale"]
  },
  {
    id: 2,
    month: "February 2026",
    monthShort: "Feb 2026",
    date: "27 February 2026",
    title: "Trustees Meeting – Formal Agenda",
    tag: "MEETING",
    summary: "Formal agenda for trustees meeting covering municipal clearance authorisations for Malindi, Indaba, and Villeroy; Malindi D26 tenant maintenance dispute; and ratification of two Trafalgar trust payments totalling R9,956.63.",
    sections: [
      {
        heading: "Meeting Purpose",
        body: "Approve authorisations for municipal clearance for the sale of Malindi, Indaba, and Villeroy. Address Malindi D26 tenant maintenance dispute. Ratify two Trafalgar trust payments (R2,733.76 and R7,222.87). Estimated duration: ~60 minutes, 10 agenda items."
      },
      {
        heading: "Malindi – SS Malindi Court, Unit 15 (Ekurhuleni)",
        body: "Account number unconfirmed — to be located or created via MPSCC / Lional Swiegers. Locate fee: R795 ex VAT; Creation fee (if required): R1,950 ex VAT. MDS alternative: R1,500 preliminary / R6,500 full. Decision required: authorise MPSCC instruction to locate; if unsuccessful, authorise creation. Attach deed and Letter of Authority."
      },
      {
        heading: "Indaba – SS Indaba, Unit 5 (City of Tshwane)",
        body: "Account 5004692062 located. City confirms account has never been paid. 3-year settlement figure: R25,730 (write-off of >3-year debt). Full arrears estimate: ~R68,000. Decision: approve R25,730 settlement subject to itemised statement OR instruct specialist (Info CityCouncilSolutions / MDS)."
      },
      {
        heading: "Villeroy – SS Villeroy Court, Unit 135 (City of Joburg)",
        body: "Municipal arrears estimate: ~R23,000. Prestige Metering 14-day pre-termination notice issued 5 Jan 2026 — URGENT. Decision: confirm balance from Joburg February statement; approve direct settlement OR instruct specialist. Agree specialist fee budget. Reconnection penalty: R800 incl. VAT."
      },
      {
        heading: "Malindi D26 – New Tenant Maintenance Dispute [HIGH URGENCY]",
        body: "New tenant arrived to find unit unpainted / unrepaired; threatened to give notice. Tenant proposes sourcing own contractor and submitting receipts for reimbursement. Mignon's reply confirms no promise of works was made by the Trust. Risk: vacancy and re-letting costs. Options: A) authorise tenant reimbursement on verified invoices, or B) instruct Trafalgar to appoint contractors from Trust funds."
      },
      {
        heading: "Trafalgar Trust Payments – Allocation Confirmation",
        body: "R2,733.76 paid 27 Feb 2026 (Oakdale / Trafalgar) — allocation unconfirmed. R7,222.87 paid 02 Mar 2026 — account: Sarah Elizabeth Binos (P434L_OP434L) — allocation unconfirmed. Mignon to bring proof of payment and invoices / allocations to meeting."
      }
    ],
    financials: [
      { label: "Malindi account locate fee", value: "R795", status: "neutral" },
      { label: "Indaba 3-year settlement", value: "R25,730", status: "warning" },
      { label: "Villeroy municipal arrears (est.)", value: "~R23,000", status: "danger" },
      { label: "Villeroy reconnection penalty", value: "R800", status: "warning" },
      { label: "Trafalgar payment – unallocated #1", value: "R2,733.76", status: "warning" },
      { label: "Trafalgar payment – unallocated #2", value: "R7,222.87", status: "warning" },
    ],
    docs: [
      { name: "enthuse-trust-meeting-agenda.docx", file: "enthuse-trust-meeting-agenda.docx" },
      { name: "enthuse-trust-meeting-handout.docx", file: "enthuse-trust-meeting-handout.docx" }
    ],
    properties: ["Malindi", "Indaba", "Villeroy", "Oakdale"]
  },
  {
    id: 1,
    month: "January 2026",
    monthShort: "Jan 2026",
    date: "January 2026",
    title: "Unknown Bond Payment Report",
    tag: "FORENSIC",
    summary: "Analysis of unidentified historical bond payments in Trust bank statements (2014–2019). Two concurrent home loan streams identified — NEDBHL (Nedbank) and SBSAHOMEL (Standard Bank) — contradicting the assumption that only one additional bonded property existed.",
    sections: [
      {
        heading: "Purpose & Background",
        body: "Report prepared to document, analyse, and explain unidentified historical bond payments in the Trust's bank statements. Review covers 2014–2019. Duplicate rows removed; decimal-shift errors corrected. Two distinct concurrent bond repayment streams identified."
      },
      {
        heading: "Bond Accounts Identified",
        body: "NEDBHL (Nedbank Home Loan): ~R4,600–R4,900/month. SBSAHOMEL (Standard Bank Home Loan): ~R4,100–R4,300/month. Payments were notably similar in magnitude and regularity, strongly indicating two separate residential mortgage loans."
      },
      {
        heading: "Cessation of Payments",
        body: "Standard Bank Home Loan payments cease in December 2017. Nedbank Home Loan payments continue until November 2019 (last bond transaction in dataset). Pattern suggests one bonded property was settled or disposed of before the other."
      },
      {
        heading: "Attribution Limitation & Conclusion",
        body: "Not possible to definitively assign either bond to the River Hamlet property based solely on bank statement data — no property identifiers in transaction descriptions. Unallocated levy payments, rental income, and municipal rates payments further complicate attribution. Any allocation to River Hamlet must be treated as assumptive and unverified."
      },
      {
        heading: "Annual Bond Payment Pivot Summary",
        body: "2014: NEDBHL R4,651 (Dec only), SBSAHOMEL R4,162 (Dec only). 2015: NEDBHL R4,656–R4,759/month, SBSAHOMEL R4,145–R4,177/month. 2016: NEDBHL R4,759–R4,915/month, SBSAHOMEL R4,204–R4,307/month. 2017: Both streams active all 12 months. 2018: Standard Bank ceases entirely; Nedbank R4,839–R4,881/month. 2019: Nedbank only, R4,848–R4,881/month through November."
      }
    ],
    financials: [
      { label: "Nedbank Home Loan (peak monthly)", value: "R4,915", status: "neutral" },
      { label: "Standard Bank Home Loan (peak monthly)", value: "R4,307", status: "neutral" },
      { label: "SBSA payments ceased", value: "Dec 2017", status: "neutral" },
      { label: "Nedbank payments ceased", value: "Nov 2019", status: "neutral" },
    ],
    docs: [{ name: "Enthuse Trust – Unknown Bond Payment Report.docx", file: "Enthuse_Trust___Unknown_Bond_Payment_Report.docx" }],
    properties: ["River Hamlet"]
  }
];

const MONTHS = ["All", "January 2026", "February 2026", "May 2026"];

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  FORENSIC: { bg: "#1a1a2e", text: "#e8c87a", border: "#3d3d5c" },
  LEGAL:    { bg: "#1e0a2e", text: "#c87ae8", border: "#3d1a5c" },
  MEETING:  { bg: "#0a1e2e", text: "#7ab8e8", border: "#1a3d5c" },
  OPERATIONAL: { bg: "#0a2e1a", text: "#7ae8a8", border: "#1a5c3d" },
  STRATEGIC: { bg: "#2e1a0a", text: "#e8b87a", border: "#5c3d1a" },
  URGENT:   { bg: "#2e0a0a", text: "#e87a7a", border: "#5c1a1a" },
};

const STATUS_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  ok:      { color: "#1a6b3c", bg: "#eaf7f0", dot: "#2ecc71" },
  warning: { color: "#7a5200", bg: "#fdf6ec", dot: "#f39c12" },
  danger:  { color: "#7a1a1a", bg: "#fdf0ef", dot: "#e74c3c" },
  neutral: { color: "#444",   bg: "#f5f5f5", dot: "#999" },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Tag({ tag }: { tag: string }) {
  const c = TAG_COLORS[tag] || TAG_COLORS.OPERATIONAL;
  return (
    <span
      className="text-[0.58rem] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase shrink-0"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >{tag}</span>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="text-[0.58rem] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono tracking-wide">
      {label}
    </span>
  );
}

function FinRow({ label, value, status }: { label: string; value: string; status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.neutral;
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 rounded mb-0.5" style={{ backgroundColor: s.bg }}>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
        <span className="text-[0.76rem] text-gray-500 font-mono">{label}</span>
      </div>
      <span className="text-[0.8rem] font-bold font-mono" style={{ color: s.color }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.6rem] font-bold tracking-widest text-gray-400 uppercase font-mono mb-1.5">
      {children}
    </div>
  );
}

function Card({ d, onClick }: { d: Debrief; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const tc = TAG_COLORS[d.tag];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer flex flex-col gap-2 relative overflow-hidden transition-shadow duration-150"
      style={{
        boxShadow: hov ? "0 6px 24px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "none"
      }}
    >
      <div className="absolute top-0 left-0 w-0.5 h-full opacity-80" style={{ backgroundColor: tc.text }} />
      <div className="flex items-center justify-between pl-1.5">
        <Tag tag={d.tag} />
        <span className="text-[0.67rem] text-gray-400 font-mono">{d.date}</span>
      </div>
      <h3 className="text-[0.88rem] font-bold text-gray-900 leading-snug pl-1.5 m-0">{d.title}</h3>
      <p className="text-[0.76rem] text-gray-500 leading-relaxed italic pl-1.5 m-0 line-clamp-2">{d.summary}</p>
      <div className="flex gap-1 flex-wrap pl-1.5">
        {d.properties.map(p => <Pill key={p} label={p} />)}
      </div>
      <div className="flex items-center justify-between pl-1.5 pt-0.5">
        <span className="text-[0.67rem] text-gray-300 font-mono">{d.sections.length} sections &middot; {d.docs.length} doc{d.docs.length !== 1 ? "s" : ""}</span>
        <span className="text-[0.7rem] font-bold font-mono" style={{ color: tc.text }}>Open &rarr;</span>
      </div>
    </div>
  );
}

function SidePanel({ d, onClose }: { d: Debrief; onClose: () => void }) {
  const [open, setOpen] = useState(-1);
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
      <div
        className="fixed top-0 right-0 bottom-0 w-[min(560px,100vw)] bg-[#fdfcfa] shadow-2xl z-50 flex flex-col"
        style={{ animation: "panelIn .22s cubic-bezier(.4,0,.2,1)" }}
      >
        <style>{`@keyframes panelIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Tag tag={d.tag} />
                <span className="text-[0.7rem] text-gray-400 font-mono">{d.date}</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-tight m-0">{d.title}</h2>
              <div className="flex gap-1 flex-wrap mt-1.5">
                {d.properties.map(p => <Pill key={p} label={p} />)}
              </div>
            </div>
            <button onClick={onClose} className="border-0 bg-gray-200 cursor-pointer text-gray-500 p-1.5 rounded ml-3 shrink-0 leading-none hover:bg-gray-300 transition-colors">
              <X size={14} />
            </button>
          </div>
          <p className="mt-2 text-[0.8rem] text-gray-500 leading-relaxed italic m-0">{d.summary}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <SectionLabel>Debrief Sections</SectionLabel>
            {d.sections.map((s, i) => (
              <div key={i} className="mb-0.5">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full text-left bg-gray-50 border border-gray-200 px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                  style={{ borderRadius: open === i ? "5px 5px 0 0" : "5px" }}
                >
                  <span className="text-[0.83rem] font-semibold text-gray-800">{s.heading}</span>
                  <span className="text-gray-400 text-[0.7rem] ml-2 shrink-0">{open === i ? "\u25B2" : "\u25BC"}</span>
                </button>
                {open === i && (
                  <div className="px-3.5 py-3 bg-white border border-gray-200 border-t-0 text-[0.8rem] text-gray-600 leading-relaxed rounded-b" style={{ borderRadius: "0 0 5px 5px" }}>
                    {s.body}
                  </div>
                )}
              </div>
            ))}
          </div>

          {d.financials.length > 0 && (
            <div className="mb-5">
              <SectionLabel>Financial Snapshot</SectionLabel>
              {d.financials.map((f, i) => <FinRow key={i} label={f.label} value={f.value} status={f.status} />)}
            </div>
          )}

          <div>
            <SectionLabel>Source Documents</SectionLabel>
            {d.docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 border border-gray-200 rounded mb-1 bg-gray-50">
                <span className="text-sm shrink-0 text-gray-400">&#x1F4C4;</span>
                <span className="flex-1 text-[0.73rem] text-gray-500 font-mono truncate">{doc.name}</span>
                <div className="flex gap-1 shrink-0">
                  <a href={`/mnt/user-data/uploads/${doc.file}`} target="_blank" rel="noreferrer" className="text-[0.68rem] px-2.5 py-0.5 rounded bg-gray-900 text-white no-underline font-bold font-mono">View</a>
                  <a href={`/mnt/user-data/uploads/${doc.file}`} download className="text-[0.68rem] px-2 py-0.5 rounded border border-gray-300 text-gray-500 no-underline font-bold font-mono hover:bg-gray-100">&darr;</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface Debrief {
  id: number
  month: string
  monthShort: string
  date: string
  title: string
  tag: string
  summary: string
  sections: Array<{ heading: string; body: string }>
  financials: Array<{ label: string; value: string; status: string }>
  docs: Array<{ name: string; file: string }>
  properties: string[]
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function DebriefHub() {
  const [selected, setSelected] = useState<Debrief | null>(null);
  const [month, setMonth] = useState("All");

  const filtered = month === "All" ? debriefs : debriefs.filter(d => d.month === month);

  const totals = {
    docs: debriefs.length,
    properties: [...new Set(debriefs.flatMap(d => d.properties))].length,
    urgent: debriefs.filter(d => d.tag === "URGENT" || d.tag === "LEGAL" || d.tag === "FORENSIC").length,
    months: [...new Set(debriefs.map(d => d.monthShort))].length
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-heading text-xl font-bold text-pomp-navy">Debrief</h2>
          <p className="text-xs text-gray-400">Trustee debriefs &amp; reports</p>
        </div>
      </div>

      {selected && <SidePanel d={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-col flex-1 min-h-0 mt-4">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 shrink-0 mb-4">
          {([
            ["Debriefs", totals.docs],
            ["Properties", totals.properties],
            ["High Priority", totals.urgent],
            ["Months", totals.months],
          ] as const).map(([label, val]) => (
            <div key={label} className="card py-3 px-4">
              <p className="text-[0.6rem] font-mono tracking-wider text-gray-400 uppercase mb-1">{label}</p>
              <p className="text-xl font-bold text-pomp-navy font-mono">{val}</p>
            </div>
          ))}
        </div>

        {/* Month filter */}
        <div className="shrink-0 mb-4">
          <p className="text-[0.6rem] font-mono tracking-wider text-gray-400 uppercase mb-1.5">Filter by Month</p>
          <div className="flex gap-1.5 flex-wrap">
            {MONTHS.map(m => (
              <button key={m} onClick={() => setMonth(m)}
                className={`text-[0.72rem] font-bold font-mono tracking-wide px-3 py-1 rounded transition-colors ${month === m ? 'bg-pomp-navy text-white' : 'bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-100'}`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Month group headers + cards */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {(month === "All" ? MONTHS.slice(1) : [month]).map(m => {
            const group = filtered.filter(d => d.month === m);
            if (!group.length) return null;
            return (
              <div key={m} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[0.72rem] font-bold font-mono tracking-wider text-gray-500 uppercase whitespace-nowrap">{m}</p>
                  <div className="flex-1 h-px bg-gray-200" />
                  <p className="text-[0.65rem] text-gray-400 font-mono whitespace-nowrap">{group.length} debrief{group.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.map(d => <Card key={d.id} d={d} onClick={() => setSelected(d)} />)}
                </div>
              </div>
            );
          })}

          <div className="border-t border-gray-200 pt-4 mt-2 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[0.65rem] text-gray-300 font-mono tracking-wide">CONFIDENTIAL &mdash; ENTHUSE TRUST INTERNAL USE ONLY</span>
            <span className="text-[0.65rem] text-gray-300 font-mono">{filtered.length} of {debriefs.length} debriefs shown</span>
          </div>
        </div>
      </div>
    </div>
  );
}
