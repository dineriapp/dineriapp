import React from "react";

const CookiesPolicy = () => {
  return (
    <div className="lg:px-8 lg:py-8 py-8 px-0">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Cookies Policy</h1>

      <p className="text-slate-600 mb-6 leading-relaxed">
        This Cookies Policy explains how we use cookies and similar technologies
        to recognize you when you visit our website, dineri.app, and interact
        with our services. By continuing to use our website, you agree to the
        use of cookies as described in this policy.
      </p>

      <p className="text-sm text-slate-500 mb-8">
        Last updated: June 6th, 2023
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            1. What Are Cookies?
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Cookies are small text files that are stored on your device or
              computer when you visit a website. Cookies allow the website to
              recognize your device and remember certain information about your
              preferences or actions over time.
            </p>
            <p>
              Cookies can be either session cookies (which are deleted when you
              close your browser) or persistent cookies (which remain on your
              device for a specified period or until manually deleted).
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            2. How We Use Cookies
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To remember your preferences and settings</li>
              <li>To improve the performance of our website</li>
              <li>To analyze website usage and track analytics</li>
              <li>To enhance user experience with personalized content</li>
              <li>To provide targeted advertising based on your interests</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            3. Types of Cookies We Use
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary
                for the website to function and cannot be switched off. They are
                typically set in response to actions made by you, such as
                setting your privacy preferences or filling out forms.
              </li>
              <li>
                <strong>Performance Cookies:</strong> These cookies allow us to
                measure website performance and track how users interact with
                the site. This helps us improve our website&apos;s content and
                functionality.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> These cookies allow the
                website to remember your preferences and choices (e.g., language
                preferences) and provide enhanced, more personalized features.
              </li>
              <li>
                <strong>Targeting/Advertising Cookies:</strong> These cookies
                are used to deliver relevant ads to you based on your interests
                and browsing behavior.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            4. Managing Cookies
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              You can control and manage cookies in your browser settings. Most
              browsers allow you to reject or delete cookies, or notify you when
              a cookie is set. Please note that disabling cookies may affect the
              functionality of some website features.
            </p>
            <p>
              For more information on how to control cookies in your browser,
              visit the{" "}
              <a
                href="https://www.allaboutcookies.org/"
                className="text-main-action hover:underline"
              >
                All About Cookies
              </a>{" "}
              website.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            5. Changes to the Cookies Policy
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We may update this Cookies Policy to reflect changes in our
              practices or for other operational, legal, or regulatory reasons.
              Any changes will be posted on this page, and the &ldquo;Last
              updated&ldquo; date will be revised accordingly.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            6. Contact Us
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              If you have any questions or concerns about our Cookies Policy,
              please contact us at:
            </p>
            <p>Email: support@cdineri.app</p>
            <p>Phone: +123 456 7890</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CookiesPolicy;
