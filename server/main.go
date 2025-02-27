package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
	Name       string           `json:"name"`
	Color      string           `json:"color"`
	Number     int              `json:"number,omitempty"`
	Classified bool             `json:"classified,omitempty"`
	Id         string           `json:"id,omitempty"`
	Logo       primitive.Binary `json:"-"`
}

func getTeams(ctx *gin.Context) {
	var results []Team
	coll := client.Database("Database").Collection("Teams")
	cursor, err := coll.Find(ctx, bson.M{})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if err := cursor.All(ctx, &results); err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, results)
}

func getTeamLogo(ctx *gin.Context) {
	teamId := ctx.Param("teamId")

	coll := client.Database("Database").Collection("Teams")

	result := coll.FindOne(ctx, bson.M{"id": teamId})
	err := result.Err()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	var team Team
	err = result.Decode(&team)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	ctx.Stream(func(w io.Writer) bool {
		w.Write(team.Logo.Data)
		return false
	})
}

func addTeam(ctx *gin.Context) {
	var newTeam Team

	header, err := ctx.FormFile("logo")

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	file, err := header.Open()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	bytes, err := io.ReadAll(file)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	newTeam.Logo = primitive.Binary{Data: bytes}

	teamString := ctx.Request.FormValue("team")
	teamBytes := []byte(teamString)
	err = json.Unmarshal(teamBytes, &newTeam)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if err := insert(ctx, "Teams", []any{newTeam}); err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, createResponse("se creo correctamente", newTeam))
}

func changeTeamId(ctx *gin.Context) {
	var team Team
	coll := client.Database("Database").Collection("Teams")

	if err := ctx.BindJSON(&team); err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	idstr := ctx.Param("currentId")

	if _, err := coll.UpdateOne(ctx, bson.M{"id": idstr}, bson.M{"$set": bson.M{"id": team.Id}}); err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
	}

	ctx.JSON(http.StatusOK, team)
}

func deleteTeam(ctx *gin.Context) {
	var team Team
	coll := client.Database("Database").Collection("Teams")

	if err := ctx.BindJSON(&team); err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
		return
	}

	if _, err := coll.DeleteOne(ctx, bson.M{"id": team.Id}); err != nil {
		ctx.JSON(http.StatusInternalServerError, createResponse("error", err.Error()))
	}

	ctx.JSON(http.StatusOK, team)
}

func insert(ctx *gin.Context, collectionName string, docs []interface{}) error {
	coll := client.Database("Database").Collection(collectionName)
	result, err := coll.InsertMany(ctx, docs)

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

	router.GET("/teams", getTeams)
	router.PATCH("/teams/:currentId", changeTeamId)
	router.DELETE("/teams/:currentId", deleteTeam)
	router.POST("/teams", addTeam)
	router.GET("/logo/:teamId", getTeamLogo)

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
