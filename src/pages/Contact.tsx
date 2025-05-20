import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Send us a message
            </h2>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-gray-100"
                  disabled
                ></textarea>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
                disabled
                title="Coming soon"
              >
                Submit
              </button>

              <p className="text-sm text-gray-500 italic">
                * Contact form functionality coming soon
              </p>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-teal-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">Address</h3>
                  <p className="text-gray-600">
                    Election Commission of Sri Lanka
                    <br />
                    Sarana Mawatha
                    <br />
                    Rajagiriya 10107
                    <br />
                    Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-teal-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">Phone</h3>
                  <p className="text-gray-600">
                    +94 11 2868441
                    <br />
                    +94 11 2868442
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-5 w-5 text-teal-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">Email</h3>
                  <p className="text-gray-600">
                    info@elections.gov.lk
                    <br />
                    webmaster@elections.gov.lk
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Office Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 8:30 AM - 4:30 PM
                  <br />
                  Saturday, Sunday & Public Holidays: Closed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>

          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Google Maps iframe would appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
