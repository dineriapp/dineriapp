import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="lg:px-8 lg:py-8 py-8 px-0">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>

      <p className="text-slate-600 mb-6 leading-relaxed">
        Your use of and access to our service are subject to the following
        terms; if you do not agree to all of the following, you may not use or
        access the service in any manner.
      </p>

      <p className="text-sm text-slate-500 mb-8">
        Last updated: June 6th, 2023
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            1. Introduction
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              In the following, we provide information about the collection of
              personal data when using
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                our website{" "}
                <a
                  href="https://www.cdineri.app"
                  className="text-main-action hover:underline"
                >
                  dineri.app
                </a>
              </li>
              <li>our profiles in social media.</li>
            </ul>
            <p>
              Personal data is any data that can be related to a specific
              natural person, such as their name or IP address.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            2. Contact Details
          </h2>
          <div className="text-slate-600 leading-relaxed">
            <p>
              The controller within the meaning of Art. 4 para. 7 EU General
              Data Protection Regulation (GDPR) is:
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            3. Data Collection and Processing
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We collect and process personal data only to the extent necessary
              for providing our services and improving user experience. This
              includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Information you provide when creating an account</li>
              <li>Usage data and analytics</li>
              <li>Communication preferences</li>
              <li>Technical information about your device and browser</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            4. Data Sharing and Third Parties
          </h2>
          <div className="text-slate-600 leading-relaxed">
            <p>
              We do not sell, trade, or otherwise transfer your personal data to
              third parties without your consent, except as described in this
              privacy policy or as required by law.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            5. Your Rights
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Under GDPR, you have the following rights regarding your personal
              data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&ldquo;right to be forgotten&ldquo;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
          </div>
        </section>

        {/* New Sections Added */}

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            6. Data Security
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We take the security of your personal data seriously. We have
              implemented technical and organizational measures to protect your
              personal data from unauthorized access, loss, misuse, or
              alteration.
            </p>
            <p>
              Despite these efforts, no security measures are completely
              foolproof. Therefore, we cannot guarantee the absolute security of
              your data.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            7. Cookies and Tracking Technologies
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We use cookies and similar tracking technologies to improve your
              experience on our website and to analyze usage patterns. By using
              our website, you consent to the use of cookies.
            </p>
            <p>
              Cookies are small text files that are stored on your device. You
              can control cookie settings through your browser settings.
              However, disabling certain cookies may affect your ability to use
              some features of our website.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            8. Data Retention
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We retain your personal data only for as long as necessary to
              fulfill the purposes for which it was collected or as required by
              law. When your data is no longer needed, we will securely delete
              or anonymize it.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            9. International Data Transfers
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Your personal data may be transferred to, and processed in, a
              country outside of the European Economic Area (EEA). We will
              ensure that any such transfers are in compliance with applicable
              data protection laws, and appropriate safeguards will be in place
              to protect your data.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            10. Updates to the Privacy Policy
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. When we make
              changes, we will update the &ldquo;Last updated&ldquo; date at the
              top of this page.
            </p>
            <p>
              Please review this Privacy Policy periodically to stay informed
              about how we are protecting your data.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            11. Contact Us
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              If you have any questions about this Privacy Policy or wish to
              exercise any of your rights regarding your personal data, please
              contact us at:
            </p>
            <p>Email: support@cdineri.app</p>
            <p>Phone: +123 456 7890</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
