
function RestaurantList({ restaurants }) {
  return (
    <section className="destination-restaurants">
      <h2>Great places to eat</h2>

      {restaurants && restaurants.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Cuisine</th>
              <th scope="col">Rating</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.cuisine || "Not listed"}</td>
                <td>
                  {typeof restaurant.rating === "number"
                    ? `${restaurant.rating}/5`
                    : "Not listed"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No restaurants available yet.</p>
      )}
    </section>
  );
}

export default RestaurantList;
