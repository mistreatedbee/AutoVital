import React, { useState } from 'react';
import { MailIcon, MapPinIcon, PhoneIcon, SendIcon } from 'lucide-react';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Accordion } from '../../components/ui/Accordion';
import { submitContactMessage } from '../../services/contact';
export function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!firstName || !lastName || !email || !subject || !message) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submitContactMessage({
        firstName,
        lastName,
        email,
        subject,
        message,
      });
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while sending your message. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionHeading
            title="Get in Touch"
            description="Have questions about AutoVital? Want to request a feature or report a bug? Our team is here to help."
            centered />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 flex items-start gap-4 border-slate-100">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <MailIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
                <p className="text-slate-500 text-sm mb-2">
                  Our friendly team is here to help.
                </p>
                <a
                  href="mailto:support@autovital.com"
                  className="text-primary-600 font-medium hover:underline">

                  support@autovital.com
                </a>
              </div>
            </Card>

            <Card className="p-6 flex items-start gap-4 border-slate-100">
              <div className="w-12 h-12 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Office</h3>
                <p className="text-slate-500 text-sm mb-2">
                  Come say hello at our HQ.
                </p>
                <p className="text-slate-700 font-medium">
                  100 Tech Parkway
                  <br />
                  San Francisco, CA 94105
                </p>
              </div>
            </Card>

            <Card className="p-6 flex items-start gap-4 border-slate-100">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <PhoneIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                <p className="text-slate-500 text-sm mb-2">
                  Mon-Fri from 8am to 5pm.
                </p>
                <a
                  href="tel:+15550000000"
                  className="text-slate-700 font-medium hover:text-primary-600">

                  +1 (555) 000-0000
                </a>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 md:p-10 border-slate-100 shadow-xl">
              {!sent ?
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input name="firstName" label="First Name" placeholder="John" required />
                    <Input name="lastName" label="Last Name" placeholder="Doe" required />
                  </div>
                  <Input
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required />

                  <Input
                  name="subject"
                  label="Subject"
                  placeholder="How can we help?"
                  required />


                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Message
                    </label>
                    <textarea
                    name="message"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-h-[150px] resize-y"
                    placeholder="Tell us more about your inquiry..."
                    required />

                  </div>

                  {error &&
                  <p className="text-sm text-red-600">
                      {error}
                    </p>
                  }

                  <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  icon={!loading && <SendIcon className="w-4 h-4" />}>

                    Send Message
                  </Button>
                </form> :

              <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SendIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">
                    Message Sent!
                  </h3>
                  <p className="text-slate-500 mb-8">
                    Thanks for reaching out. Our team will get back to you
                    within 24 hours.
                  </p>
                  <Button variant="secondary" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              }
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-32">
          <SectionHeading title="Common Questions" centered className="mb-10" />
          <Accordion
            items={[
            {
              question: 'How quickly do you respond to support tickets?',
              answer:
              'For Pro and Fleet users, we guarantee a response within 4 hours during business days. Starter plan users typically receive a response within 24 hours.'
            },
            {
              question: 'Can I request a custom feature for my fleet?',
              answer:
              'Yes! We work closely with our Fleet customers to develop custom integrations and features. Contact our sales team using the form above.'
            },
            {
              question: 'Do you offer phone support?',
              answer:
              'Phone support is exclusively available for our Fleet plan customers. Starter and Pro users receive priority email support.'
            }]
            } />

        </div>
      </div>
    </div>);

}