
import { Template, Department, ChatMessage } from './types';

export const DEPARTMENTS: Department[] = ['Sales', 'Legal', 'HR', 'Finance', 'Operations', 'Title', 'General'];

export const TEMPLATES: Template[] = [
    { id: 're1', name: 'Purchase Agreement', category: 'Real Estate', fields: 12, description: 'Professional template for residential property transactions.' },
    { id: 're2', name: 'Lease Agreement', category: 'Real Estate', fields: 15, description: 'Comprehensive lease agreement for rental properties.' },
    { id: 're3', name: 'Listing Agreement', category: 'Real Estate', fields: 10, description: 'Agreement between a seller and a real estate broker.' },
    { id: 're4', name: 'Offer to Purchase', category: 'Real Estate', fields: 9, description: 'Formal offer to buy a piece of real estate.' },
    { id: 're5', name: 'Addendum', category: 'Real Estate', fields: 5, description: 'Add or modify terms of an existing contract.' },
    { id: 're6', name: 'Closing Disclosure', category: 'Real Estate', fields: 20, description: 'Standardized form that details final loan terms and closing costs.' },
    { id: 'l1', name: 'NDA', category: 'Legal', fields: 8, description: 'Non-Disclosure Agreement to protect confidential information.' },
    { id: 'l2', name: 'Service Agreement', category: 'Legal', fields: 14, description: 'Contract between a service provider and a client.' },
    { id: 'l3', name: 'Consulting Agreement', category: 'Legal', fields: 11, description: 'Defines the terms of a consulting relationship.' },
    { id: 'l4', name: 'Cease and Desist', category: 'Legal', fields: 7, description: 'Formal letter demanding a stop to an illegal activity.' },
    { id: 'l5', name: 'Power of Attorney', category: 'Legal', fields: 10, description: 'Grant legal authority to another person.' },
    { id: 'b1', name: 'Employee Contract', category: 'Business', fields: 16, description: 'Employment agreement between an employer and employee.' },
    { id: 'b2', name: 'Sales Agreement', category: 'Business', fields: 12, description: 'Contract outlining the terms of a transaction of goods.' },
    { id: 'b3', name: 'Vendor Agreement', category: 'Business', fields: 13, description: 'Lays out the provisions for work performed by a vendor.' },
    { id: 'b4', name: 'Partnership Agreement', category: 'Business', fields: 18, description: 'Contract that establishes a business partnership.' },
    { id: 'b5', name: 'Invoice Template', category: 'Business', fields: 9, description: 'Standard invoice format for billing clients.' },
];

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: 'init',
  sender: 'ai',
  text: "Hello! I can help you with your documents. What would you like to know?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const SIMULATED_SUMMARY = {
  executive: "This Real Estate Purchase Agreement establishes terms for the sale of residential property at 123 Main Street, Miami, FL for $450,000 with a closing date of Feb 15, 2025.",
  keyPoints: [
    "Purchase price: $450,000",
    "Earnest money deposit: $15,000",
    "30-day financing contingency",
    "10-day inspection period",
    "Property sold with all appliances",
    "Closing costs split equally"
  ],
  dates: [
    { title: "Contract Date", value: "January 15, 2025" },
    { title: "Financing Deadline", value: "February 14, 2025" },
    { title: "Inspection Deadline", value: "January 25, 2025" },
    { title: "Closing Date", value: "February 15, 2025" },
  ],
  parties: [
    { name: "John Smith", role: "Buyer", contact: "813-555-0456" },
    { name: "Jane Doe", role: "Seller", contact: "305-555-0123" },
    { name: "Miami Title Company", role: "Closing Agent", contact: "" },
  ],
  financial: [
    { title: "Total Price", value: "$450,000" },
    { title: "Down Payment", value: "$90,000 (20%)" },
    { title: "Loan Amount", value: "$360,000" },
    { title: "HOA Fees", value: "$150/month" },
  ],
  actions: [
    "Submit financing application (due 1/18)",
    "Schedule property inspection (by 1/25)",
    "Obtain homeowner's insurance quote",
    "Review HOA documents"
  ]
};

export const SIMULATED_EXTRACTION = {
  dates: [
    { value: "Jan 15, 2025", context: "Agreement Date" },
    { value: "Jan 25, 2025", context: "Inspection Deadline" },
    { value: "Feb 14, 2025", context: "Financing Deadline" },
    { value: "Feb 15, 2025", context: "Closing Date" },
    { value: "Feb 15, 2025", context: "Possession Date" },
  ],
  financials: [
      { item: "Purchase Price", value: "$450,000" },
      { item: "Earnest Money", value: "$15,000" },
      { item: "Down Payment", value: "$90,000" },
      { item: "Loan Amount", value: "$360,000" },
      { item: "Closing Costs", value: "$4,500 (estimated)" },
      { item: "HOA Fees", value: "$150/month" },
      { item: "Property Tax", value: "$5,400/year" },
      { item: "Insurance", value: "$1,800/year (estimated)" },
  ],
  contacts: [
    { name: "John Smith", role: "Buyer", phone: "(813) 555-0456", email: "john.smith@email.com" },
    { name: "Jane Doe", role: "Seller", phone: "(305) 555-0123", email: "jane.doe@email.com" },
    { name: "Robert Johnson", role: "Real Estate Agent", phone: "(305) 555-7890", email: "" },
  ],
  addresses: [
      { type: "Property", value: "123 Main Street, Miami, FL 33101" },
      { type: "Buyer", value: "456 Oak Ave, Tampa, FL 33602" },
  ],
  clauses: [
      "Financing Contingency: 30 days",
      "Inspection Contingency: 10 business days",
      'Property sold "as-is" after inspection',
      "All appliances included in sale",
      "Seller provides clear title",
      "Costs split equally between parties",
  ],
};

export const SIMULATED_COMPARISON = {
    similarities: [
        "Both are Real Estate Purchase Agreements",
        "Same closing date: February 15, 2025",
        "Similar financing contingency (30 days)",
        "Both include inspection period",
    ],
    differences: [
        { item: "Purchase Price", docA: "$450,000", docB: "$425,000", diff: "$25,000" },
        { item: "Earnest Money", docA: "$15,000 (3.33%)", docB: "$10,000 (2.35%)", diff: "" },
        { item: "Inspection Period", docA: "10 business days", docB: "7 calendar days", diff: "" },
    ],
    uniqueA: [
        "Includes furniture addendum",
        "Buyer waived appraisal contingency",
        "Extended home warranty included",
    ],
    uniqueB: [
        "Seller financing option available",
        "60-day rent-back agreement for seller",
    ],
    recommendations: [
        "Verify which purchase price is correct",
        "Clarify inspection timeline expectations",
        "Review furniture addendum if applicable",
        "Confirm seller financing terms if selected",
    ],
};

export const GENERATED_CONTRACT_CONTENT = `
<h1 class="text-2xl font-bold text-center mb-4">REAL ESTATE PURCHASE AGREEMENT</h1>
<p class="text-sm text-center mb-8">This Agreement is made on <strong>January 15, 2025</strong></p>

<h2 class="text-lg font-semibold mt-6 mb-2">1. PARTIES</h2>
<p class="mb-2"><strong>SELLER:</strong> Jane Doe<br>Address: 789 Sunset Blvd, Miami, FL<br>Phone: (305) 555-0123 | Email: jane.doe@email.com</p>
<p><strong>BUYER:</strong> John Smith<br>Address: 456 Oak Ave, Tampa, FL<br>Phone: (813) 555-0456 | Email: john.smith@email.com</p>

<h2 class="text-lg font-semibold mt-6 mb-2">2. PROPERTY DESCRIPTION</h2>
<p><strong>Address:</strong> 123 Main Street, Miami, FL<br><strong>Legal Description:</strong> Lot 15, Block 8, Sunshine Estates<br><strong>Parcel ID:</strong> 30-4512-000-0150</p>

<h2 class="text-lg font-semibold mt-6 mb-2">3. PURCHASE PRICE</h2>
<p>The total purchase price for the property shall be <strong>$450,000.00</strong> (Four Hundred Fifty Thousand Dollars).</p>

<h2 class="text-lg font-semibold mt-6 mb-2">4. FINANCIAL TERMS</h2>
<ul class="list-disc list-inside space-y-1">
  <li><strong>Earnest Money:</strong> $15,000 (due within 3 days of execution)</li>
  <li><strong>Down Payment:</strong> $90,000 (20% of purchase price)</li>
  <li><strong>Loan Amount:</strong> $360,000</li>
  <li><strong>Closing Costs:</strong> To be split equally between Buyer and Seller.</li>
</ul>

<h2 class="text-lg font-semibold mt-6 mb-2">5. CONTINGENCIES</h2>
<ul class="list-disc list-inside space-y-1">
  <li><strong>Financing:</strong> 30 days from execution date to secure a loan commitment.</li>
  <li><strong>Inspection:</strong> 10 business days for Buyer to conduct inspections.</li>
  <li><strong>Appraisal:</strong> Property must appraise for no less than the purchase price.</li>
  <li><strong>Title:</strong> Seller to provide clear and marketable title.</li>
</ul>

<h2 class="text-lg font-semibold mt-6 mb-2">6. CLOSING</h2>
<p><strong>Closing Date:</strong> On or before February 15, 2025<br><strong>Location:</strong> Miami Title Company, 555 Biscayne Blvd, Miami, FL</p>

<h2 class="text-lg font-semibold mt-6 mb-2">7. ADDITIONAL TERMS</h2>
<ul class="list-disc list-inside space-y-1">
  <li>Property is sold "as-is" following the inspection period.</li>
  <li>All existing appliances are included in the sale.</li>
  <li>Seller to provide a standard termite inspection report.</li>
</ul>

<h2 class="text-lg font-semibold mt-6 mb-2">8. SIGNATURES</h2>
<div class="mt-12 grid grid-cols-2 gap-8">
  <div>
    <div class="border-b border-gray-400 pb-1"></div>
    <p class="mt-2">SELLER: Jane Doe</p>
  </div>
  <div>
    <div class="border-b border-gray-400 pb-1"></div>
    <p class="mt-2">BUYER: John Smith</p>
  </div>
</div>
`;
