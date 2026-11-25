import { Link, useLocation } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

const pages = {
  '/about': {
    title: 'About Toolora',
    description: 'Toolora is a collection of practical online calculators, converters and productivity tools designed to give clear answers with minimal friction.',
    sections: [
      ['Useful tools, kept simple', 'Toolora brings everyday calculations and small productivity tasks into one accessible, easy-to-use website. Our goal is to make tools understandable, responsive and practical for people around the world.'],
      ['How the tools work', 'Most calculations run locally in your browser. We explain formulas where they are useful, keep inputs clearly labeled and avoid asking you to create an account for basic features. Currency conversion is intentionally unavailable until a live data provider is configured.'],
      ['Accuracy and limitations', 'We work to make formulas and interactions clear, but results can depend on assumptions, rounding and local rules. Financial results are estimates, BMI is a screening measure, and education tools may not match every institution’s policy. Review the Disclaimer before relying on an output.'],
    ],
  },
  '/contact': {
    title: 'Contact Toolora',
    description: 'Contact Toolora with questions, corrections or feedback about our online tools.',
    sections: [
      ['Get in touch', 'For questions, feedback or a correction about a tool, contact the site owner using the details below. Please do not send passwords, financial account details, health records or other sensitive information.'],
      ['Contact details', 'Ritik Meena\nEmail: mritik351@gmail.com\nPhone: 98932551151\nLocation: Bhopal, Madhya Pradesh, India'],
      ['Reporting a tool issue', 'When reporting an issue, include the tool name, the steps that led to it and an example using non-sensitive values. This helps us investigate while protecting your privacy.'],
    ],
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Learn how Toolora handles browser preferences, tool inputs, analytics configuration and privacy.',
    sections: [
      ['Information processed by tools', 'Calculator entries, text and generated content are processed in your browser. Toolora does not save these inputs to an account or send them to its application server. Do not enter sensitive personal information into a website unless you are comfortable doing so.'],
      ['Local browser storage', 'Favorites, recently used tools and your light or dark theme preference may be stored in your browser’s LocalStorage. These preferences remain on your device and can be removed by clearing site data in your browser.'],
      ['Analytics and external services', 'Analytics are disabled unless the site operator supplies a Google Analytics measurement ID through VITE_GA_ID. If enabled, Google Analytics may process technical and usage information under its own policies. QR code images are generated locally. The currency tool requires an explicitly configured external rate provider before it can return live conversions.'],
      ['Contact and policy updates', 'If you contact the owner, the information you choose to include is used to respond to that message. This policy may be updated as the site changes. For privacy questions, email mritik351@gmail.com.'],
    ],
  },
  '/terms': {
    title: 'Terms of Use',
    description: 'Terms for using Toolora calculators, converters and productivity tools.',
    sections: [
      ['Use of the website', 'You may use Toolora for lawful personal or professional reference. Do not misuse the site, interfere with its operation, attempt unauthorized access or use its tools to violate applicable law.'],
      ['Informational results', 'Tools are provided for general informational and educational purposes. Outputs may be rounded or depend on assumptions and are provided without a guarantee of accuracy, completeness or fitness for a particular purpose. Verify important results independently.'],
      ['Third-party providers and availability', 'The website may rely on third-party hosting or optional services. Features can change or become unavailable. The currency converter will not display a rate unless a live provider has been configured.'],
      ['Changes and contact', 'These terms may be revised as Toolora develops. Continued use after an update means you accept the updated terms. Questions can be sent to mritik351@gmail.com.'],
    ],
  },
  '/disclaimer': {
    title: 'Disclaimer',
    description: 'Important limitations for Toolora’s financial, health, educational and general-purpose calculations.',
    sections: [
      ['General information', 'Toolora provides general-purpose calculation and productivity tools. Results are generated from your inputs and stated formulas, may use rounding and are not a substitute for independent verification.'],
      ['Financial tools', 'EMI, loan, interest, investment, SIP, FD, RD, salary, tax and related figures are estimates, not financial, tax, legal or investment advice. Actual lender terms, taxes, fees, compounding conventions and investment performance vary. Returns are not guaranteed. Consult a qualified professional before making financial decisions.'],
      ['Health tools', 'The BMI tool is a general screening calculation and is not a diagnosis or personalized medical advice. BMI does not account for every factor relevant to health. Speak with a qualified healthcare professional about health concerns.'],
      ['Education tools', 'Grade, GPA, CGPA and percentage conversions are illustrative. Institutions may use different scales, grading boundaries or conversion formulas. Confirm requirements with your school or examining body.'],
      ['Dates, units and other results', 'Check date formats, units, local conventions and assumptions before relying on outputs. Toolora is not responsible for decisions made solely from a calculator result.'],
    ],
  },
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const page = pages[pathname] || pages['/about']
  return <>
    <SEO title={page.title} description={page.description} path={pathname} />
    <section className="container info-page">
      <span className="eyebrow">Toolora information</span><h1>{page.title}</h1><p className="info-lead">{page.description}</p>
      <div className="info-content">{page.sections.map(([title, body]) => <article key={title}><h2>{title}</h2><p>{body}</p></article>)}</div>
      <Link className="button button-secondary" to="/">Back to Toolora home</Link>
    </section>
  </>
}
