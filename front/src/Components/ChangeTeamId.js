export default function ChangeTeamId({ patchTeamFromAPI, setId, id, team }) {
  return (
    <form
      className="box"
      style={{
        margin: 0,
        minHeight: "auto",
        width: "100%",
        justifyContent: "left",
        flexDirection: "row",
        backgroundColor: "#303030",
      }}
      onSubmit={(e) => {
        patchTeamFromAPI(id, team, e);
      }}
    >
      <input
        className="input"
        attribute="button"
        placeholder="New id"
        onChange={(e) => setId(e.target.value)}
      />
      <button className="button">Submit</button>
    </form>
  );
}
