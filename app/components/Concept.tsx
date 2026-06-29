import { concept } from "../data/siteData";

/** CONCEPT：中央寄せ＋左右のぼかし煙。文言は app/data/siteData.ts に一元管理。 */
export default function Concept() {
  return (
    <section className="section concept" id="concept">
      <span className="smoke l"></span>
      <span className="smoke r"></span>
      <div className="wrap">
        <div className="sec-head reveal">
          <h2>CONCEPT</h2>
          <span className="sub">コンセプト</span>
          <span className="rule"></span>
        </div>
        <div className="concept-body reveal">
          {concept.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
