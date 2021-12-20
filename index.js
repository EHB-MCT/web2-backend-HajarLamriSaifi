
//express maakt en server op onze localmachine 
const express = require('express')();
const app = express;
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');

app.use(bodyParser.json());

const {
    MongoClient,
    ObjectId
  } = require('mongodb');
  const config = require('./config.json')
  //new mongo client
  const client = new MongoClient(config.baseUrl);

app.get('/', (req, res) =>{
    res.send("Het werkt")
})


app.get("/museum", async (req, res)=> {
    try {

        //connect met de database
        await client.connect();
        console.log("its working bitch");

        //
        const collection = client.db('course-project').collection('saved-items')
        const savedItems = await collection.find({}).toArray();

        //correct -> send back to file
        res.status(200).send(savedItems)

    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: "GET route error",
            value: error
        })
    }
})

app.get("/museum/:id", async (req, res) => {
    try {
        //connect db
        await client.connect();
  
        //retrieve data // haalt de data uit de database 
        const collection = client.db('course-project').collection('saved-items')
       
        //only look for a with id // pakt de id van de saved-items
        const query = {
          _id: ObjectId(req.params.id)
        };
        // findone = mondodb method // vind 1 object op basis van de query(id)
        const savedItems = await collection.findOne(query)
  
        if (savedItems) {
          //send back the file
          res.status(200).send(savedItems);
          return;
        } else {
          res.status(400).send("could not be found with id " + req.params.id)
        }
  
      } catch (error) {
        console.log(error);
        res.status(500).send({
          error: "GET ID request went wrong",
          value: error
        })
      }
  
})

app.post('/museum', async(req, res) =>{

    try {
        //connect db  //connect met de database
        await client.connect();
  
        //retrieve(halen) data // 
        const collection = client.db('course-project').collection('saved-items');
  
        // create new item object //haalt wat er in u request body is 
        let newItem = {
          "name": req.body.name,
    
        }
  
        //insert into db
        let insertResult = await collection.insertOne(newItem)
  
        //succes message
        res.status(201).json(newItem)
        return;
  
      } catch (error) {
        console.log(error);
        res.status(500).send("POST error has occured")
      } finally {
        await client.close()
      }
})

app.put('/museum/:id', async(req,res) => {
    try {
        //connect db
        await client.connect();
  
        //retrieve challenge data from db
        const collection = client.db('course-project').collection('saved-items')
  
        //only look for a challenge with id
        const query = {
          _id: ObjectId(req.params.id)
        };
  
        const updateDocument = {
          $set: {
            name: req.body.name,
          }
        };
        // updates document based on query
        await collection.updateOne(query, updateDocument)
        res.status(200).json({
          message: 'Succesfully Updated to: ' + req.body.name
        });
  
      } catch (error) {
        console.log(error);
        res.status(500).send({
          error: "something went wrong",
          value: error
        })
      }
})

app.delete('/museum/:id', async(req, res)=> {
//id is located in the query: req.params.id
try {
    //connect db
    await client.connect();

    //retrieve challenge data
    const collection = client.db('course-project').collection('saved-items')

    //only look for a challenge with id
    const query = {
      _id: ObjectId(req.params.id)
    };

    //DELETE challenge
    await collection.deleteOne(query)
    res.status(200).json({
      message: 'Succesfully Deleted!'
    });


  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "something went wrong",
      value: error
    })
  }
})



app.listen(port, () => {
    console.log(`The REST API is running at port: ${port}`);

})