import React from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import image15 from "../assets/images/image/image15.png"

function Home() {
  return (
    <>
      <Header />

      <section className="">
        <div className="Container flex mx-20 px-8 py-24 md:flex-row flex-col items-center">
          <div className="md:w-1/2">
            <h1 className="font-bold font-extrabold text-[2rem]">
              Nepal Scholarship Site
            </h1>
            <p className="my-4 text-justify">
              Computer Association of Nepal (CAN) was formed in May 1992 but was
              formally registered in December 1992 and later registered as
              Federation of Computer Association Nepal (CAN Federation) in
              January 2015 with the involvement of professionals, specialists,
              institutions and related organizations from the Information
              Communication Technology sector in Nepal. It is an umbrella
              organization with membership base ranging from ICT Institutions,
              Associations to Individuals working in this sector. CAN Federation
              works along with thelines of an autonomous, non-political,
              nonpartisan,nonprofitable and service oriented sector of ICT.
            </p>
            <button className="bg-red-500 px-5 py-2 rounded-md text-white">
              Read More...
            </button>
          </div>
          <div className="md:w-1/2">
            <img src={image15} alt="Background Image" />
          </div>
        </div>
      </section>
      <section className=" bg-gray-100">
        <div className="Container flex mx-20 px-8 py-24 md:flex-row flex-col items-center">
          <div className="md:w-1/2">Image</div>
          <div className="md:w-1/2">
            <h1 className="font-bold font-extrabold text-[2rem]">
              Welcome to Scholarship Site of Nepal
            </h1>
            <p className="my-4 text-justify">
              Computer Association of Nepal (CAN) was formed in May 1992 but was
              formally registered in December 1992 and later registered as
              Federation of Computer Association Nepal (CAN Federation) in
              January 2015 with the involvement of professionals, specialists,
              institutions and related organizations from the Information
              Communication Technology sector in Nepal. It is an umbrella
              organization with membership base ranging from ICT Institutions,
              Associations to Individuals working in this sector. CAN Federation
              works along with thelines of an autonomous, non-political,
              nonpartisan,nonprofitable and service oriented sector of ICT.
            </p>
          </div>
        </div>
      </section>
      <section>
        <div>
          <div>
            <h1>Our Services</h1>
          </div>
          <div className="flex gap-10 mx-20 my-10 px-8 py-24 md:flex-row flex-col items-center">
            <div>
              <p>Search Scholarship</p>
              <p>Search for the scholarship that’s best suited for you.</p>
            </div>
            <div>
              <p>Submit Scholarship</p>
              <p>
                Submit your organizational Scholarship without and manage them
                efficiently.
              </p>
            </div>
            <div>
              <p>Scholarship Filtering</p>
              <p>
                We filter Scholarships and post only the best, legit and viable
                scholarship on provincial scale.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Home;
