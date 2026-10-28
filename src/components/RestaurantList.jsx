
function RestaurantList({ restaurants }) {
  return (
    <section className="destination-restaurants">
      <h2>Great places to eat</h2>

      {restaurants !== undefined && restaurants.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Cuisine</th>
              <th>Rating</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.cuisine}</td>
                <td>{restaurant.rating}/5</td>
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
