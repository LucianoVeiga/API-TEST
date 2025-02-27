export default function Topnav({ setCurrentSearch }) {
  return (
    <div className="topnav">
      <button className="button" onClick={() => window.location.reload(false)}>
        Home
      </button>
      <input
        id="searchBar"
        className="input"
        placeholder="Search team"
        onChange={() => {
          setCurrentSearch(document.getElementById("searchBar").value);
        }}
      />
    </div>
  );
}
