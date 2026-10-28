
function ActivityList({ activities }) {
  return (
    <section className="destination-activities">
      <h2>Fun things to do</h2>

      {activities.length > 0 ? (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              {activity.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No activities available yet.</p>
      )}
    </section>
  );
}

export default ActivityList;
