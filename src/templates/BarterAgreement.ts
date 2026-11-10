export type AgreementParams = {
  effectiveDate: string;
  partyAName: string;
  partyAAddress: string;
  partyBName: string;
  partyBAddress: string;
  partyAOffering: string;
  partyAValue: number;
  partyBOffering: string;
  partyBValue: number;
  deliveryDate: string;
  barterId: string;
};

export function generateBarterReference(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TBS-${ts}-${rand}`;
}

export function generateAgreementText(params: AgreementParams): string {
  return `BARTER AGREEMENT

THIS BARTER AGREEMENT ("Agreement") is made effective on ${params.effectiveDate} by and between:

Party A: ${params.partyAName}
Address: ${params.partyAAddress}

Party B: ${params.partyBName}
Address: ${params.partyBAddress}


I. THE OFFERINGS

The Parties agree to exchange services described below:

a. Party A Offering: ${params.partyAOffering}
   Monetary Value: $${params.partyAValue.toLocaleString()}

b. Party B Offering: ${params.partyBOffering}
   Monetary Value: $${params.partyBValue.toLocaleString()}


II. DELIVERY

Services shall be delivered on or before ${params.deliveryDate}.


III. TAXES

All taxes due as a result of this agreement will be paid by the Party incurring such. The Barter Shop Inc. bears no responsibility for any taxes owed as a result of this Agreement.


IV. TERMINATION

This contract shall be in full force from ${params.effectiveDate} through ${params.deliveryDate} or until delivery of services, whichever occurs first.


V. BREACH OF CONTRACT

Remedy for any breach is limited to the monetary value of the Offering as defined in Section I.


VI. REPRESENTATIONS

Each party represents and warrants that:
a. They freely and legally entered this agreement;
b. Their service can legally be provided by them;
c. Their services do not violate any laws;
d. They have full power to enter this Agreement;
e. Their services do not infringe upon any rights;
f. Services are free of all encumbrances;
g. All information is true and correct.


VII. INDEMNIFICATION

The Parties agree to indemnify and hold harmless The Barter Shop Inc. from all claims, losses, damages, and expenses arising out of this Agreement.


VIII. RELATIONSHIPS

This contract creates no employer/employee, principal/agent, or partnership relationship between Parties or The Barter Shop Inc.


IX. GOVERNING LAW

This contract shall be construed in accordance with the laws of Colorado. Exclusive Original Jurisdiction and venue for any action involving The Barter Shop Inc. relating to this contract shall be solely in the Denver County District Court of the State of Colorado.


X. ELECTRONIC SIGNATURES

Both parties agree that electronic signatures on this Agreement are valid and enforceable under the ESIGN Act.


XI. ENTIRE AGREEMENT

This Agreement contains the entire agreement of the Parties regarding this barter exchange.


Agreement Reference: ${params.barterId}
Powered by The Barter Shop Inc.
info@thebartershop.app`;
}
