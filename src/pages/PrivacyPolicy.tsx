import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: May 19, 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Information Collection
        </h2>
        <p className="text-gray-700">
          We do not collect personal information from users unless you
          voluntarily provide it through forms or direct contact. Non-personal
          data such as browser type, device, and usage statistics may be
          collected for analytics and site improvement.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Use of Information
        </h2>
        <p className="text-gray-700">
          Any information collected is used solely to improve the website,
          respond to inquiries, and ensure the security and integrity of
          election data. We do not use your information for marketing or
          advertising purposes.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Information Sharing
        </h2>
        <p className="text-gray-700">
          We do not share, sell, or rent your personal information to third
          parties. Information may be disclosed if required by law or to protect
          the rights and safety of users and the public.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Data Security
        </h2>
        <p className="text-gray-700">
          We implement reasonable security measures to protect your information.
          However, no method of transmission over the Internet or electronic
          storage is 100% secure.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Contact</h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please contact
          the Election Commission of Sri Lanka via the details on our Contact
          page.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
