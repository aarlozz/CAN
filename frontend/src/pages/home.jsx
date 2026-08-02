import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import img1 from "../assets/images/image/can1.jpg";
import img2 from "../assets/images/image/can2.jpg";
import img3 from "../assets/images/image/can3.jpg";
import img4 from "../assets/images/image/can4.jpg";
import img5 from "../assets/images/image/can5.jpeg";
import img6 from "../assets/images/image/can6.jpeg";
import img7 from "../assets/images/image/can7.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7];

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
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 to-white py-24">
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
                to="/institutions"
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
                to="/scholarships"
                className="block text-center bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Scholarships →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">

          {/* Image Slideshow */}
          <div className="md:w-1/2 flex justify-center">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <img
                key={currentImage}
                src={images[currentImage]}
                alt="CAN Federation"
                className="w-full max-w-lg h-[420px] object-cover transition-all duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* About Text */}
          <div className="md:w-1/2">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
              About CAN Federation
            </h2>

            <div className="space-y-5 text-gray-600 leading-8 text-justify">
              <p>
                Computer Association of Nepal (CAN) was established in May 1992 and
                formally registered in December 1992. In January 2015, it was
                restructured and registered as the{" "}
                <strong>
                  Federation of Computer Association Nepal (CAN Federation)
                </strong>
                , with the involvement of professionals, specialists, institutions,
                and organizations from Nepal's Information and Communication
                Technology (ICT) sector.
              </p>

              <p>
                CAN Federation serves as the umbrella organization for the ICT
                community, with a diverse membership base that includes ICT
                institutions, associations, and individuals actively working in the
                sector throughout Nepal.
              </p>

              <p>
                The federation operates as an autonomous, non-political,
                non-partisan, non-profit, and service-oriented organization dedicated
                to promoting the growth and development of Nepal's ICT industry.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-500 py-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Is your institution on CAN's portal?
          </h2>
          <p className="text-gray-100 text-lg mb-6 max-w-xl mx-auto">
            Register today and connect with thousands of students seeking scholarships.
          </p>
          <Link
            to="/signup?role=institution"
            className="bg-white text-gray-700 hover:bg-gray-100 hover:scale-105 font-bold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg inline-block"
          >
            Register Institution →
          </Link>
        </div>
      </section>
    </>
  );
}