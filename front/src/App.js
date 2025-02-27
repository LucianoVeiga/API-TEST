import "./App.css";
import React, { useState, useEffect } from "react";
import Topnav from "./Components/Topnav";
import AddTeamForm from "./Components/AddTeamForm";
import Team from "./Components/Team";

export const URL = process.env.REACT_APP_API_URL;

function App() {
  const [teams, setTeams] = useState([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [number, setNumber] = useState(0);
  const [classified, setClassified] = useState(false);
  const [logo, setLogo] = useState(null);
  const [currentSearch, setCurrentSearch] = useState("");

  const [addTeamVisibility, setAddTeamVisibility] = useState(false);
  const [openedTeam, setOpenedTeam] = useState(-1);

  useEffect(() => {
    getTeamsFromAPI().then(setTeams);
  }, []);

  let getTeamsFromAPI = async () => {
    return fetch(URL + "/teams", { method: "GET" })
      .then((response) => response.json())
      .then((response) => {
        console.log("Received " + JSON.stringify(response));
        return response ?? [];
      })
      .catch((error) => {
        console.log("Error in request");
        console.log(error);
        return [];
      });
  };

  let postTeamToAPI = async (e) => {
    e.preventDefault();

    if (teams.find((team) => team.id === id)) {
      console.log("Another team already has that id assigned");
      return;
    }

    if (teams.find((team) => team.number === number)) {
      console.log("Another team already has that number assigned");
      return;
    }

    try {
      const newTeam = {
        name: name,
        color: color,
        number: number,
        classified: classified,
        id: id,
      };

      const formData = new FormData();
      formData.append("logo", logo);
      formData.append("team", JSON.stringify(newTeam));

      let res = await fetch(URL + "/teams", {
        method: "POST",
        body: formData,
      });

      if (res.status === 201) {
        setName("");
        setColor("");
        setNumber(0);
        setClassified(false);
        setId("");
        console.log("Team created successfully");
        setTeams([newTeam, ...teams]);
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }

	e.target.reset();
  };

  let patchTeamFromAPI = async (newId, team, e) => {
    e.preventDefault();

    try {
      const patchedTeam = {
        logo: team.logo,
        name: team.name,
        color: team.color,
        number: team.number,
        classified: team.classified,
        id: newId,
      };

      let res = await fetch(URL + "/teams/" + team.id, {
        method: "PATCH",
        body: JSON.stringify(patchedTeam),
      });

      if (res.status === 200) {
        setName("");
        setColor("");
        setNumber(0);
        setClassified(false);
        setId("");
        console.log("Team patched successfully");
        setTeams(teams.map((t) => (t.id === team.id ? patchedTeam : t)));
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let deleteTeamFromAPI = async (team, e) => {
    e.preventDefault();

    try {
      const teamToDelete = {
        logo: team.logo,
        name: team.name,
        color: team.color,
        number: team.number,
        classified: team.classified,
        id: team.id,
      };

      let res = await fetch(URL + "/teams/" + team.id, {
        method: "DELETE",
        body: JSON.stringify(teamToDelete),
      });

      if (res.status === 200) {
        setName("");
        setColor("");
        setNumber(0);
        setClassified(false);
        setId("");
        console.log("Team deleted successfully");
        setTeams(teams.filter((t) => t.id !== teamToDelete.id));
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Topnav setCurrentSearch={setCurrentSearch} />
      <header className="App-header">
        <h1>Tournament</h1>
        <button
          className="button"
          onClick={() => {
            setAddTeamVisibility(!addTeamVisibility);
          }}
        >
          {addTeamVisibility ? "x" : "Add team"}
        </button>
        {addTeamVisibility && (
          <AddTeamForm
            {...{
              classified,
              setId,
              setLogo,
              postTeamToAPI,
              setName,
              setColor,
              setNumber,
              setClassified,
            }}
          />
        )}
        {teams
          .filter((t) =>
            currentSearch !== ""
              ? t.id.toLowerCase().includes(currentSearch) ||
                t.name.toLowerCase().includes(currentSearch) ||
                t.color.toLowerCase().includes(currentSearch) ||
                String(t.number).toLowerCase().includes(currentSearch)
              : true
          )
          .map((team, i) => (
            <Team
              key={i}
              {...{
                i,
                team,
                setOpenedTeam,
                openedTeam,
                setId,
                patchTeamFromAPI,
                id,
                deleteTeamFromAPI,
              }}
            />
          ))}
      </header>
    </div>
  );
}

export default App;
