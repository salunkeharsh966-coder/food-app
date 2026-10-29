import { useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

const SUBJECTS = [
  'A table booking',
  'A large group or private hire',
  'Allergens and dietary questions',
  'Something else',
];

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function submit(ev) {
    ev.preventDefault();
    setBanner('');
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'That email address does not look right.';
    if (form.message.trim().length < 10) e.message = 'Please write at least a sentence or two.';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setBanner('Please check the highlighted fields.');
      return;
    }

    setBusy(true);
    try {
      const res = await api.sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      toast.success(res.message);
      setSent(true);
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length > 0) setErrors(err.fields);
      setBanner(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <p className="section__eyebrow">Contact</p>
        <h1 className="page__title">Say hello, or book a table</h1>
        <p className="page__lede">
          We read every message and usually reply the same day. For same-night bookings, calling is
          faster.
        </p>
      </header>

      <div className="contact">
        <div className="contact__info">
          <div className="info-card">
            <h2 className="info-card__title">Find us</h2>
            <address className="info-card__address">
              42 Brick Lane<br />
              Shoreditch<br />
              London E1 6RF
            </address>
            <p className="info-card__line">
              <a href="tel:+442079460958">+44 20 7946 0958</a>
            </p>
            <p className="info-card__line">
              <a href="mailto:hello@saffronandsmoke.example">hello@saffronandsmoke.example</a>
            </p>
          </div>

          <div className="info-card">
            <h2 className="info-card__title">Opening hours</h2>
            <dl className="hours">
              <div><dt>Monday</dt><dd className="hours__closed">Closed</dd></div>
              <div><dt>Tuesday – Thursday</dt><dd>5:00pm – 11:00pm</dd></div>
              <div><dt>Friday – Saturday</dt><dd>5:00pm – 12:00am</dd></div>
              <div><dt>Sunday</dt><dd>4:00pm – 10:30pm</dd></div>
            </dl>
          </div>

          <div className="info-card info-card--note">
            <h2 className="info-card__title">Allergens</h2>
            <p className="info-card__body">
              Our kitchen handles nuts, dairy, gluten, fish and mustard. Tell us what to avoid and we
              will tell you honestly what we can and cannot do.
            </p>
          </div>
        </div>

        <div className="contact__form-wrap">
          {sent ? (
            <div className="state state--success">
              <div className="state__icon" aria-hidden="true">✓</div>
              <h2 className="state__title">Message sent</h2>
              <p className="state__body">
                Thank you — it is in our inbox and we will come back to you shortly.
              </p>
              <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          ) : (
            <form className="contact__form" onSubmit={submit} noValidate>
              <h2 className="contact__form-title">Send us a message</h2>

              {banner && <div className="alert alert--error" role="alert">{banner}</div>}

              <div className="field">
                <label htmlFor="c-name">Your name</label>
                <input
                  id="c-name" type="text" value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'c-name-error' : undefined}
                  placeholder="Priya Nair" autoComplete="name"
                />
                {errors.name && <p className="field__error" id="c-name-error" role="alert">{errors.name}</p>}
              </div>

              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email" type="email" value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'c-email-error' : undefined}
                  placeholder="you@example.com" autoComplete="email"
                />
                {errors.email && <p className="field__error" id="c-email-error" role="alert">{errors.email}</p>}
              </div>

              <div className="field">
                <label htmlFor="c-subject">What is it about?</label>
                <select id="c-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="c-message">Message</label>
                <textarea
                  id="c-message" rows="6" value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'c-message-error' : undefined}
                  placeholder="Tell us the date, how many of you, and anything we should know."
                />
                {errors.message && <p className="field__error" id="c-message-error" role="alert">{errors.message}</p>}
              </div>

              <button type="submit" className="btn btn--primary btn--lg" disabled={busy}>
                {busy ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
