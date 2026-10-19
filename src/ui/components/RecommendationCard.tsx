import { BLANKET_LEVELS, type Housing, type Recommendation } from '../../domain/types';
import { formatSteps, formatTemperature } from '../format';
import { ADJUSTMENT_LABELS, blanketLabel, TEMPERATURE_BASIS_LABELS, TEXTS } from '../texts';

interface RecommendationCardProps {
  readonly title: string;
  readonly recommendation: Recommendation | undefined;
  readonly housing: Housing;
  /** Shown when the forecast does not cover this period. */
  readonly missingText: string;
}

export function RecommendationCard({
  title,
  recommendation,
  housing,
  missingText,
}: RecommendationCardProps) {
  return (
    <article className="card recommendation" aria-label={title}>
      <h3>{title}</h3>
      {recommendation === undefined ? (
        <p>{missingText}</p>
      ) : (
        <RecommendationDetails recommendation={recommendation} housing={housing} />
      )}
    </article>
  );
}

function RecommendationDetails({
  recommendation,
  housing,
}: {
  readonly recommendation: Recommendation;
  readonly housing: Housing;
}) {
  return (
    <>
      <WarmthMeter recommendation={recommendation} />
      <p className="blanket">{blanketLabel(recommendation.level, housing)}</p>
      {recommendation.requiresWaterproof && <p className="badge">{TEXTS.waterproof}</p>}
      <ul className="reasons">
        <li>
          {TEMPERATURE_BASIS_LABELS[recommendation.temperatureBasis]}:{' '}
          {formatTemperature(recommendation.lowestTemperatureC)}
        </li>
        {recommendation.adjustments.map((adjustment) => (
          <li key={adjustment.kind}>
            {ADJUSTMENT_LABELS[adjustment.kind]}: {formatSteps(adjustment.steps)}
          </li>
        ))}
        {recommendation.warmingCapApplied && <li>{TEXTS.warmingCap}</li>}
      </ul>
    </>
  );
}

/** A row of segments showing how warm the blanket is. The text above says the same. */
function WarmthMeter({ recommendation }: { readonly recommendation: Recommendation }) {
  const levelIndex = BLANKET_LEVELS.indexOf(recommendation.level);
  return (
    <div className="meter" aria-hidden="true">
      {BLANKET_LEVELS.slice(1).map((level, index) => (
        <span key={level} className={index < levelIndex ? 'meter-on' : 'meter-off'} />
      ))}
    </div>
  );
}
