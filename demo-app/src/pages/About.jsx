import { Link } from 'react-router-dom';
import { imageUrl } from '../api.js';

const TIMELINE = [
  {
    year: '2016',
    title: 'One tandoor, one room',
    body: 'We started with a single clay oven in a rented kitchen on Hanbury Street, cooking for whoever walked past. Six tables, no bookings, no menu — you ate what was ready.',
  },
  {
    year: '2019',
    title: 'The dal that takes six hours',
    body: 'A regular asked why our dal tasted different. Because it is cooked for six hours, we said. He did not believe us, so we let him watch. It has been on the menu ever since, and it still takes six hours.',
  },
  {
    year: '2022',
    title: 'Brick Lane',
    body: 'We moved into the old fabric warehouse at number 42. Same tandoor, rebuilt brick by brick by the man who built the first one. Same cooks. A few more tables.',
  },
  {
    year: 'Today',
    title: 'Still small, on purpose',
    body: 'Twenty-four dishes. We add one or two a year and take one away when it stops being worth the effort. Everything is cooked to order, which is why it takes twenty minutes and not five.',
  },
];

const VALUES = [
  { title: 'Cooked to order', body: 'Nothing is held under a lamp. If it is on your table, it was made after you asked for it.' },
  { title: 'Spices ground here', body: 'Whole spices, roasted and ground in the kitchen each morning. It is the difference you can taste.' },
  { title: 'Small batches', body: 'We would rather run out at 10pm than serve you something that has been sitting since six.' },
  { title: 'Honest heat', body: 'Our spice levels mean something. If it says hot, it is hot — and the lassi is there for a reason.' },
];

export default function About() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="section__eyebrow">Our story</p>
        <h1 className="page__title">A small kitchen that refuses to hurry</h1>
        <p className="page__lede">
          Saffron &amp; Smoke is run by eight people and one very old tandoor. This is how it got
          here.
        </p>
      </header>

      <div className="about__hero">
        <img
          src={imageUrl('hero.jpg')}
          alt="A table of Indian dishes at Saffron and Smoke, lit warmly from the side"
          width="1800"
          height="1012"
          loading="lazy"
        />
      </div>

      <section className="section">
        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li className="timeline__item" key={t.year}>
              <span className="timeline__year">{t.year}</span>
              <div className="timeline__body">
                <h2 className="timeline__title">{t.title}</h2>
                <p className="timeline__text">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">How we cook</p>
            <h2 className="section__title">Four things we will not compromise on</h2>
          </div>
        </div>
        <ul className="values">
          {VALUES.map((v) => (
            <li className="value" key={v.title}>
              <h3 className="value__title">{v.title}</h3>
              <p className="value__body">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="cta">
          <div className="cta__text">
            <h2 className="cta__title">Come and eat</h2>
            <p className="cta__body">
              We are at 42 Brick Lane, Tuesday to Sunday, 5pm until 11pm. Walk-ins welcome, but
              weekends fill up — book ahead if you can.
            </p>
          </div>
          <div className="cta__actions">
            <Link to="/menu" className="btn btn--primary btn--lg">See the menu</Link>
            <Link to="/contact" className="btn btn--ghost btn--lg">Book a table</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
