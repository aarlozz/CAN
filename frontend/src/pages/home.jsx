import { Link } from "react-router-dom";
import Header from "../Components/header";
import Footer from "../Components/footer";

const services = [
  {
    icon: "🔍",
    title: "Search Scholarships",
    desc: "Find scholarships across Nepal filtered by province, institution type, and eligibility.",
  },
  {
    icon: "🏫",
    title: "Register Institution",
    desc: "Submit your institution and manage scholarship listings efficiently.",
  },
  {
    icon: "✅",
    title: "Verified Listings",
    desc: "Every scholarship is reviewed and verified before being published.",
  },
];

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section id="home" className="bg-gradient-to-br from-red-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Nepal's Scholarship Portal
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Connecting Students with <span className="text-red-500">Opportunities</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              CAN Federation brings verified scholarships from institutions across Nepal's provinces to
              students who need them most — in one trusted platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                Get Started
              </Link>
              <Link
                to="/all-institutions"
                className="bg-white border border-gray-200 hover:border-red-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm"
              >
                Browse Institutions
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-gray-100">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-gray-900 font-bold text-xl mb-2">Find Your Scholarship</h3>
              <p className="text-gray-500 text-sm mb-6">
                Hundreds of scholarships from verified institutions across all provinces.
              </p>
              <Link
                to="/signup"
                className="block text-center bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Register →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 flex justify-center">
            <div className="w-64 h-64 bg-red-100 rounded-full flex items-center justify-center text-8xl">
              🇳🇵
            </div>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">About CAN Federation</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Computer Association of Nepal (CAN) was established in May 1992 and formally
              registered in December 1992. It was later re-registered as CAN Federation in
              January 2015 — an umbrella organization for Nepal's ICT sector.
            </p>
            <p className="text-gray-600 leading-relaxed">
              CAN Federation operates as an autonomous, non-political, non-profit service
              organization, bringing together ICT professionals, institutions, and associations
              across Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-500">Everything you need to find or offer scholarships in Nepal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 hover:shadow-md hover:border-red-100 transition-all"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Is your institution on CAN's portal?
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Register today and connect with thousands of students seeking scholarships.
          </p>
          <Link
            to="/signup-institution"
            className="bg-white text-red-500 hover:bg-red-50 font-bold px-8 py-3 rounded-lg transition-colors shadow-sm inline-block"
          >
            Register Institution
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}