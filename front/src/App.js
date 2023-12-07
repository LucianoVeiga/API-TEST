import './App.css';
import React, { useState, useEffect, useRef } from 'react';

const URL = "http://localhost:8080";

function getTeamsFromAPI() {
    return fetch(URL + '/Teams', { method: 'GET' })
    .then(response => response.json())
    .then(response => {
      console.log("Received " + JSON.stringify(response));
      return response;
    })
    .catch(error => {
      console.log('Error in request');
      console.log(error);
      return [];
    })
  }

function App() {
  const teamsFetched = useRef(false);
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [number, setNumber] = useState(0);
  const [classified, setClassified] = useState(false);
  const [id, setId] = useState("");
  const [currentId, setCurrentId] = useState("");
  
  const [addTeamVisibility, setAddTeamVisibility] = useState(false);
  const [openedTeam, setOpenedTeam] = useState(-1);
  
  useEffect(() => {
    if (!teamsFetched.current) {
      teamsFetched.current = true;
      getTeamsFromAPI().then(setTeams);
    }
  }, [])
  
  let getTeamFromAPI = async () => {
    return fetch(URL + '/Teams/' + id, { method: 'GET' })
    .then(response => response.json())
    .then(response => {
      console.log("Received " + JSON.stringify(response));
      return response;
    })
    .catch(error => {
      console.log('Error in request');
      console.log(error);
      return [];
    })
  };
  
  let postTeamToAPI = async (e) => {
    let err = false;

    teams.map((team) => {
      if(team.number === number) {
        err = true;
      }
    });

    if(err) {
      e.preventDefault();
      console.log("Another team already has that number assigned");
      return;
    }

    try {
      let res = await fetch(URL + '/Teams', { method: "POST",
        body: JSON.stringify({
          name: name,
          color: color,
          number: number,
          classified: classified,
          id: id,
        }),
      });
      
      if (res.status === 201) {
        setName("");
        setColor("");
        setNumber(0);
        setClassified(false);
        setId("");
        console.log("Team created successfully");
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let patchTeamFromAPI = async (currentId, team) => {
    try {
      let res = await fetch(URL + '/Teams/' + team.id, { method: "PATCH",
        body: JSON.stringify({
          name: team.name,
          color: team.color,
          number: team.number,
          classified: team.classified,
          id: currentId,
        }),
      });
      
      if (res.status === 200) {
        setName("");
        setColor("");
        setNumber(0);
        setClassified(false);
        setId("");
        console.log("Team patched successfully");
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };

  let deleteTeamFromAPI = async (team) => {
    try {
      let res = await fetch(URL + '/Teams/' + team.id, { method: "DELETE",
        body: JSON.stringify({
          name: team.name,
          color: team.color,
          number: team.number,
          classified: team.classified,
          id: team.id,
        }),
      });
      
      if (res.status === 200) {
        setName("");
        setColor("");
        setNumber(0);
        setClassified(false);
        setId("");
        console.log("Team deleted successfully");
        window.location.reload();
      } else {
        console.log("Some error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <div className = "App">
      <div className = "topnav">
      <div>
        <button className = "button" onClick = {() => setId("") }>Home</button>
        <input className = "input" placeholder = "Search team..." id = "team"/>
        <button className = "button" onClick = {() => { setId(document.getElementById("team").value) } }>🔎</button>
      </div>
      </div>
      <header className = "App-header">
        <h1>API TEST</h1>
        <div className = "box">
        <button className = "button" onClick = {() => { setAddTeamVisibility(!addTeamVisibility) }}>{ addTeamVisibility ? "x" : "Add team" }</button>
        { addTeamVisibility && (
          <form className = "box" style = {{ backgroundColor: '#303030' }} onSubmit = { postTeamToAPI }>
            <input className = "input" placeholder = "Name" onChange = {(e) => setName(e.target.value) }/>
            <input className = "input" placeholder = "Color" onChange = {(e) => setColor(e.target.value) }/>
            <input className = "input" type = "number" placeholder = "Number" onChange = {(e) => setNumber(parseInt(e.target.value)) }/>
            <div className = "input">
              <input type = "checkbox" onChange = {() => { setClassified(!classified)}}/><small style = {{ textShadow:"none" ,fontSize: "15px", color: "#999999" }}>{ classified ? "Classified" : "Not classified"  }</small>
            </div>
            <input className = "input" placeholder = "Id" onChange = {(e) => setId(e.target.value) }/>
            <button className = "button">Add</button>
          </form>
        ) }
        </div>
        { teams.map((team, i) =>
           team.id === id || id === "" ?
            <div className = "box" key = { i }>
              <h1>{ team.name }</h1>
              <div className = "App">
                <label>&emsp;{ team.color }</label>
                <label>&emsp;{ team.number }</label>
                <label>&emsp;{ team.classified ? "Classified" : "Not classified" }</label>
                <label>&emsp;{ team.id }</label>&emsp;
                <button className = "button" onClick = {() => { setOpenedTeam(openedTeam === i ? -1 : i) }}>{ openedTeam === i ? 'x' : 'Change id' }</button>
                { openedTeam === i && (
                  <form className = "box" style = {{ width: "100%", justifyContent: "left", flexDirection: "row", backgroundColor: '#303030' }} onSubmit = {() => { setTeams([...teams]); patchTeamFromAPI(currentId, team) } }>
                    <input className = "input" attribute = "button" placeholder = "New id" onChange = {(e) => setCurrentId(e.target.value)}/>
                    <button className = "button">Submit</button>
                  </form>    
                ) }
                <button className = "button" style = {{ backgroundColor: '#BD0505' }} onClick = {() => { deleteTeamFromAPI(team) }}>Delete</button>
              </div>
            </div>
            : null
        ) }
      </header>
    </div>
  );
}

export default App;