function HomeDestinationCard({
  destination,
  isSaved,
  isExpanded,
  onToggleSaved,
  onToggleDetails,
}) {
  const detailsId = `destination-details-${destination.id}`;

  return (
    <article className="home-card">
      <div className="home-image-placeholder">
        <img
          className="home-card-image"
          src={destination.image}
          alt={`View of ${destination.name}, ${destination.country}`}
          loading="lazy"
        />
      </div>

      <div className="home-card-content">
        <h3>
          {destination.name}, {destination.country}
        </h3>

        {isExpanded && (
          <div className="home-card-details" id={detailsId}>
            <p>{destination.description}</p>

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

        {destination.page ? (
          <a className="home-details-button" href={destination.page}>
            View Details
          </a>
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