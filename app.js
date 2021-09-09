const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let db = null;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at localhost 3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

intializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from
     cricket_team;`;

  const playersArray = await db.all(getPlayersQuery);
  reponse.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `insert into cricket_team
     (player_id, player_name, jersey_number, role)
     values 
       ('${playerName}', ${jerseyNumber}, '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from
     cricket_team 
     where player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  reponse.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    update cricket_team
    set 
     player_name = '${playerName}',,
    jersey_number = ${jerseyNumber},
    role = '${role}'
    where player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from cricket_team
    where player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
