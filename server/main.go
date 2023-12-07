package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Response struct {
	Message string `json:"message"`
	Data    any    `json:"data"`
}

func createResponse(message string, data any) Response {
	return Response{Message: message, Data: data}
}

var client *mongo.Client

type Team struct {
	Name       string `json:"name"`
	Color      string `json:"color"`
	Number     int    `json:"number,omitempty"`
	Classified bool   `json:"classified,omitempty"`
	Id         string `json:"id,omitempty"`
}

func getTeams(c *gin.Context) {
	var results []Team
	coll := client.Database("Database").Collection("Teams")
	cursor, err := coll.Find(c, bson.M{})

	if err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if err := cursor.All(c, &results); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, results)
}

func addTeam(c *gin.Context) {
	var newTeam Team

	if err := c.BindJSON(&newTeam); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if err := insert(c, "Teams", []any{newTeam}); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	c.JSON(http.StatusCreated, createResponse("se creo correctamente", newTeam))
}

func getTeamById(c *gin.Context) {
	idstr := c.Param("id")
	var team Team
	coll := client.Database("Database").Collection("Teams")
	result := coll.FindOne(c, bson.M{"id": idstr})

	if err := result.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if err := result.Decode(&team); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, team)
}

func changeTeamId(c *gin.Context) {
	var team Team
	coll := client.Database("Database").Collection("Teams")

	if err := c.BindJSON(&team); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	idstr := c.Param("currentId")

	if _, err := coll.UpdateOne(c, bson.M{"id": idstr}, bson.M{"$set": bson.M{"id": team.Id}}); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
	}

	c.JSON(http.StatusOK, team)
}

func deleteTeamId(c *gin.Context) {
	var team Team
	coll := client.Database("Database").Collection("Teams")

	if err := c.BindJSON(&team); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if _, err := coll.DeleteOne(c, bson.M{"id": team.Id}); err != nil {
		c.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
	}

	c.JSON(http.StatusOK, team)
}

func insert(c *gin.Context, collectionName string, docs []interface{}) error {
	coll := client.Database("Database").Collection(collectionName)
	result, err := coll.InsertMany(c, docs)

	if err != nil {
		fmt.Printf("A bulk write error occurred, but %v documents were still inserted.\n", len(result.InsertedIDs))
		return err
	}

	for _, id := range result.InsertedIDs {
		fmt.Printf("Inserted document with _id: %v\n", id)
	}

	return nil
}

func main() {
	router := gin.Default()
	router.Use(cors.Default())

	router.GET("/Teams", getTeams)
	router.GET("/Teams/:id", getTeamById)
	router.PATCH("/Teams/:currentId", changeTeamId)
	router.DELETE("/Teams/:currentId", deleteTeamId)
	router.POST("/Teams", addTeam)

	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	cl, err := mongo.Connect(context.Background(), clientOptions)
	client = cl

	err = client.Ping(context.Background(), nil)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to mongo")

	router.Run("localhost:8080")
}
