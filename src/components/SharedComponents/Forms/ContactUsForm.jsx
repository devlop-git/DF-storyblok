const QUERY_TYPES = [
  "General Enquiry",
  "Order Support",
  "Media and Press Inquiries",
  "Wholesale/Trade",
  "Other",
];

const inputClass =
  "w-full border-0 border-b border-[#A5744A] bg-transparent focus:outline-none focus:border-black py-2";

export default function ContactUsForm({ data }) {
  return (
    <section className="w-full mt-10">
      <div className="max-w-3xl mx-auto px-6 py-14 lg:py-10">
        {data?.heading && (
          <p className="text-center text-base text-[#1D1D1B] mb-8">
            {data.heading}
          </p>
        )}

        <form className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-700">
                First Name <span className="text-red-600">*</span>
              </label>
              <input type="text" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input type="text" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input type="email" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Contact Number <span className="text-red-600">*</span>
              </label>
              <input type="tel" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Media and Press Inquiries <span className="text-red-600">*</span>
              </label>
              <select defaultValue="" required className={inputClass}>
                <option value="" disabled hidden />
                {QUERY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Order Number
              </label>
              <input type="text" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Type Here"
              className="w-full border border-[#A5744A] bg-transparent p-3 focus:outline-none focus:border-black"
            />
          </div>

          <p className="text-xs text-gray-500">
            Fields marked with a * are compulsory
          </p>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              id="contact-us-consent"
              className="mt-1"
            />
            <label htmlFor="contact-us-consent" className="text-sm text-gray-700">
              I give consent to be contacted by Diamonds Factory about my
              enquiry via phone or email.
            </label>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#A5744A] text-white px-10 py-3 font-medium hover:bg-[#8D6642] transition-colors"
            >
              {data?.btnLabel || "Submit"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
