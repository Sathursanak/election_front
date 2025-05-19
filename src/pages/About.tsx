import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const About: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: "What is the Parliamentary Election process in Sri Lanka?",
      answer:
        "The Parliamentary Elections in Sri Lanka follow a proportional representation system where voters elect 225 members to the Parliament. 196 members are elected from electoral districts through proportional representation, and 29 are appointed from national lists submitted by political parties.",
    },
    {
      question: "What are bonus seats and how are they allocated?",
      answer:
        "Bonus seats are additional seats given to the party that receives the highest number of votes in each electoral district. This system is designed to provide a slight advantage to the most popular party in each district.",
    },
    {
      question:
        "How are seats allocated in the proportional representation system?",
      answer:
        "Seats are allocated based on the proportion of votes each party receives in the district. The number of votes a party receives is divided by the total valid votes, then multiplied by the number of seats available in that district.",
    },
    {
      question: "What happens if there are rejected votes?",
      answer:
        "Rejected votes are ballots that cannot be counted due to various reasons, such as unclear marking or voting for multiple candidates when only one choice is allowed. These votes are not included in the calculation of seat allocation.",
    },
    {
      question: "When are election results finalized?",
      answer:
        "Election results are typically finalized within a week after the election day. The counting process begins immediately after voting closes, and results are announced district by district as they become available.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          About the Parliamentary Election
        </h1>

        <section className="mb-10">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              The Parliamentary Elections in Sri Lanka are conducted under the
              proportional representation system, established by the 1978
              Constitution. The Parliament consists of 225 members, serving a
              term of 5 years.
            </p>

            <p className="text-gray-700 mb-4">
              Out of the 225 members, 196 are elected from 23 electoral
              districts, while 29 are appointed from national lists submitted by
              political parties based on the total number of votes received by
              each party.
            </p>

            <p className="text-gray-700 mb-6">
              The election uses a preferential voting system where voters can
              indicate preferences for up to three candidates from their chosen
              party. This system allows voters to influence not only which
              parties win seats but also which specific candidates from those
              parties are elected.
            </p>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Key Features of the Election System
              </h3>
              <ul className="list-disc ml-5 text-gray-700">
                <li>Proportional representation with preferential voting</li>
                <li>23 electoral districts across 9 provinces</li>
                <li>
                  Bonus seats for the highest-voted party in each district
                </li>
                <li>
                  National list appointments based on overall party performance
                </li>
                <li>5-year parliamentary term</li>
              </ul>
            </div>
          </div>

          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Infographic about the election process would appear here
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-gray-800">
                    {item.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Electoral Districts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Western Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Colombo</li>
                <li>Gampaha</li>
                <li>Kalutara</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Central Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Kandy</li>
                <li>Matale</li>
                <li>Nuwara Eliya</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Southern Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Galle</li>
                <li>Matara</li>
                <li>Hambantota</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Northern Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Jaffna</li>
                <li>Vanni</li>
                <li>Mannar</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Eastern Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Batticaloa</li>
                <li>Digamadulla</li>
                <li>Trincomalee</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                North Western Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Kurunegala</li>
                <li>Puttalam</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                North Central Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Anuradhapura</li>
                <li>Polonnaruwa</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Uva Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Badulla</li>
                <li>Moneragala</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-purple-800 mb-2">
                Sabaragamuwa Province
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Ratnapura</li>
                <li>Kegalle</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
