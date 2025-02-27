import ChangeTeamId from "../Components/ChangeTeamId";
import { URL } from "../App";

export default function Team({
  i,
  team,
  setOpenedTeam,
  openedTeam,
  setId,
  patchTeamFromAPI,
  id,
  deleteTeamFromAPI,
}) {
  return (
    <div className="box">
      <div className="logo">
        <h1>{team.name}</h1>
        <img src={URL + "/logo/" + team.id} alt="Team logo" />
      </div>
      <div className="App">
        <h3>
          &emsp;<span style={{ color: "lightgrey" }}>Color:</span> {team.color}
        </h3>
        <h3>
          &emsp;<span style={{ color: "lightgrey" }}>Number:</span>{" "}
          {team.number}
        </h3>
        <h3>
          &emsp;<span style={{ color: "lightgrey" }}>Classification:</span>{" "}
          {team.classified ? "Classified" : "Not classified"}
        </h3>
        <h3>
          &emsp;<span style={{ color: "lightgrey" }}>Id:</span> {team.id}
        </h3>
        &emsp;
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "130px",
            alignItems: "center",
          }}
        >
          <button
            className="button"
            onClick={() => {
              setOpenedTeam(openedTeam === i ? -1 : i);
            }}
          >
            {openedTeam === i ? "x" : "Change id"}
          </button>
          {openedTeam === i && (
            <ChangeTeamId {...{ patchTeamFromAPI, setId, id, team }} />
          )}
          <button
            className="button"
            style={{ backgroundColor: "#BD0505" }}
            onClick={(e) => {
              deleteTeamFromAPI(team, e);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
