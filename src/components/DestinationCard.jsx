function DestinationCard({ destination, onRemove }) {
  const { name, country, image, imageCredit, page } = destination;

  const cardTop = (
    <>
      <span className="destination_label">
        {name}, {country}
      </span>
      <img
        className="destination_background"
        src={image}
        alt={`Picture of ${name}, ${country}`}
      />
    </>
  );

  return (
    <article className="destination">
      {/* Link to the city's page when it has one (only Toronto so far) */}
      {page ? (
        <a className="destination_link" href={page}>
          {cardTop}
        </a>
      ) : (
        <div className="destination_link">{cardTop}</div>
      )}

      {imageCredit && (
        <span className="image_credit">
          <a href={imageCredit.authorUrl}>{imageCredit.author}</a>,{" "}
          <a href={imageCredit.licenseUrl}>{imageCredit.license}</a>
        </span>
      )}

      <button
        className="wishlist-remove-button"
        type="button"
        onClick={() => onRemove(destination.id)}
      >
        Remove
      </button>
    </article>
  );
}

export default DestinationCard;