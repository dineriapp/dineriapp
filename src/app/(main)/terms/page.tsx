import React from "react";

const TermsOfService = () => {
  return (
    <div className="lg:px-8 lg:py-8 py-8 px-0">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Terms of Service
      </h1>

      <p className="text-slate-600 mb-6 leading-relaxed">
        These Terms of Service ("Terms") govern your access to and use of our
        website and services. By accessing or using our services, you agree to
        comply with these Terms. If you do not agree to these Terms, you may not
        access or use our services.
      </p>

      <p className="text-sm text-slate-500 mb-8">
        Last updated: June 6th, 2023
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            1. Acceptance of Terms
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              By accessing or using our services, you agree to be bound by these
              Terms and our Privacy Policy. If you are using our services on
              behalf of an organization, you represent and warrant that you have
              the authority to bind that organization to these Terms.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            2. Use of the Services
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              You agree to use our services only for lawful purposes and in
              accordance with these Terms. You are prohibited from using the
              services to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>
                Engage in any activity that could harm or disrupt the services
              </li>
              <li>
                Attempt to gain unauthorized access to any systems or networks
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            3. Account Registration
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              To access certain features of our services, you may be required to
              create an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            4. Termination
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We reserve the right to suspend or terminate your access to the
              services at our discretion, without notice, for any violation of
              these Terms or for any other reason deemed necessary.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            5. Disclaimers and Limitation of Liability
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              The services are provided "as is" without any warranties or
              guarantees of any kind, either express or implied. We do not
              guarantee that the services will be error-free, uninterrupted, or
              secure.
            </p>
            <p>
              To the fullest extent permitted by law, we shall not be liable for
              any direct, indirect, incidental, or consequential damages arising
              from your use of the services.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            6. Governing Law
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of [Your Jurisdiction]. Any disputes shall be resolved in
              the appropriate courts in [Your Jurisdiction].
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            7. Changes to the Terms
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We may update these Terms from time to time. When changes are
              made, we will update the "Last updated" date at the top of this
              page. Your continued use of the services after the changes take
              effect constitutes your acceptance of the revised Terms.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            8. Contact Us
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>Email: support@cdineri.app</p>
            <p>Phone: +123 456 7890</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
