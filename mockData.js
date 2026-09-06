export const EXAMPLE_QUESTIONS = [
  {
    id: 'eq-1',
    category: 'Corporate & Contract Law',
    title: 'Piercing the Corporate Veil',
    query: 'What are the established legal grounds for piercing the corporate veil under company law precedent?'
  },
  {
    id: 'eq-2',
    category: 'Tort Law & Liability',
    title: 'Strict vs Absolute Liability',
    query: 'Compare the Rule in Rylands v. Fletcher with the doctrine of Absolute Liability established in MC Mehta.'
  },
  {
    id: 'eq-3',
    category: 'Constitutional Rights',
    title: 'Article 21 & Privacy Principles',
    query: 'Analyze the landmark Puttaswamy judgment regarding the right to privacy under Article 21.'
  },
  {
    id: 'eq-4',
    category: 'Criminal Procedure',
    title: 'Bail Standards & Anticipatory Relief',
    query: 'What legal factors dictate the grant of anticipatory bail under Section 438 CrPC?'
  }
];

export const MOCK_RECENT_CONVERSATIONS = [
  {
    id: 'conv-101',
    title: 'Fiduciary Duty of Directors in Mergers',
    timestamp: '2 hours ago',
    queryCount: 4
  },
  {
    id: 'conv-102',
    title: 'Arbitration Clause Enforceability in Foreign Seats',
    timestamp: 'Yesterday',
    queryCount: 6
  },
  {
    id: 'conv-103',
    title: 'Section 138 Negotiable Instruments Defense',
    timestamp: '3 days ago',
    queryCount: 3
  },
  {
    id: 'conv-104',
    title: 'IP Infringement & Fair Use Doctrines',
    timestamp: '1 week ago',
    queryCount: 5
  }
];

export const INITIAL_EVIDENCE_MOCK = [
  {
    id: 'ev-demo-1',
    title: 'Companies Act, 2013',
    document_type: 'Statutory Act',
    section_article: 'Section 166 (Duties of Directors)',
    citation: 'Act No. 18 of 2013',
    snippet: 'A director of a company shall act in good faith in order to promote the objects of the company for the benefit of its members as a whole, and in the best interests of the company...',
    verification_status: 'Verified'
  },
  {
    id: 'ev-demo-2',
    title: 'Salomon v Salomon & Co Ltd',
    document_type: 'House of Lords Precedent',
    section_article: 'Separate Legal Entity Doctrine',
    citation: '[1897] AC 22',
    snippet: 'The company is at law a different person altogether from the subscribers to the memorandum; and, though it may be that after incorporation the business is precisely the same...',
    verification_status: 'Verified'
  },
  {
    id: 'ev-demo-3',
    title: 'M.C. Mehta v. Union of India',
    document_type: 'Supreme Court Landmark Judgment',
    section_article: 'Absolute Liability Doctrine',
    citation: '1987 AIR 1086',
    snippet: 'An enterprise engaged in a hazardous or inherently dangerous industry owes an absolute and non-delegable duty to the community to ensure that no harm results to anyone...',
    verification_status: 'High Confidence'
  }
];
