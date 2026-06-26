/** CONCEPT：中央寄せ＋左右のぼかし煙。文言は Desktop 版を維持。 */
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
          <p>日常を離れ、上質な時間に浸る大人のための隠れ家。</p>
          <p>落ち着いた空間と、心をほどくおもてなしで、</p>
          <p>ゆったりとした夜の時間をお迎えします。</p>
        </div>
      </div>
    </section>
  );
}
