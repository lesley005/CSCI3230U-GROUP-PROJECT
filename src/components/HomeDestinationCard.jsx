
import { Link } from "react-router-dom";

// AI-assisted - see AI-USAGE.md #4
function HomeDestinationCard({
  destination,
  isSaved,
  isExpanded,
  onToggleSaved,
  onToggleDetails,
}) {
  // give each quick info button its own panel to control
  const detailsId = `destination-details-${destination.id}`;

  return (
    <article className="home-card">
      {destination.image && (
        <div className="home-image-placeholder">
          {destination.image ? (
            <img
              className="home-card-image"
              src={destination.image}
              alt={`View of ${destination.name}`}
              loading="lazy"
            />
          ) : (
            <div className="home-photo-fallback">Photo unavailable</div>
          )}
        </div>
      )}

      {destination.imageCredit && (
        <small>
          Photo by{" "}
          <a href={destination.imageCredit.authorUrl}>
            {destination.imageCredit.author}
          </a>
          {" · "}
          <a href={destination.imageCredit.licenseUrl}>
            {destination.imageCredit.license}
          </a>
        </small>
      )}

      <div className="home-card-content">
        <h3>
          {destination.name}{destination.country && `, ${destination.country}`}
        </h3>

        {isExpanded && (
          <div className="home-card-details" id={detailsId}>
            <p>{destination.description}</p>
            {destination.factSource && (
              <small>
                From <a href={destination.factSource}>Wikipedia</a>
                {" · "}
                <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
              </small>
            )}

            {destination.activities?.length > 0 && (
              <p>{destination.activities.length} activities to explore</p>
            )}

            {destination.restaurants?.length > 0 && (
              <p>
                {destination.restaurants.length} restaurant recommendations
              </p>
            )}
          </div>
        )}
      </div>

      <div className="home-card-actions">
        <button
          className="home-save-button"
          type="button"
          aria-pressed={isSaved}
          onClick={onToggleSaved}
        >
          {isSaved ? "♥ Saved" : "♡ Save"}
        </button>
          {/* cities without a detail page show quick info on the card */}
          {destination.page ? (
            <Link
              className="home-details-button"
              to={`/destinations/${encodeURIComponent(destination.id)}`}
            >
              View Details
            </Link>
          ) : (
            <button
              className="home-details-button"
              type="button"
              aria-expanded={isExpanded}
              aria-controls={detailsId}
              onClick={onToggleDetails}
            >
              {isExpanded ? "Hide Quick Info" : "Quick Info"}
            </button>
          )}
      </div>
    </article>
  );
}

export default HomeDestinationCard;
