const bodyParser = require('body-parser');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose  = require('mongoose');
const Event = require("./Models/event");

const app = express();
app.use(bodyParser.json());
const events = [];

app.use(
    '/graphql',
    graphqlHTTP({
        schema: buildSchema(`

type Event {
    _id: ID!
    title: String!
    description : String!
    price : Float!
    date : String!      

}    
input EventInput{
    title: String!
    description : String!
    price : Float!  
    date : String! 

}
      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput:EventInput): Event   
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
        rootValue: {
            events: () => {
              return  Event.find()
                .then((events)=>{
                    return events.map(event=>{
                        return {...event._doc, _id:event.id }
                    })

                }).catch(err=>{
                    console.log(err);
                    throw err;
                })
            },
            createEvent: (args) => {
               
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)

                })
                return event.save().then(result => {
                    console.log(result);
                    return { ...result._doc , _id: result.id}
                }).catch(err => {
                    console.log(err);
                    throw err
                });

            }
        },
        graphiql: true,
    })
);
mongoose.connect(`mongodb+srv://test:test@cluster0.9x7zwsy.mongodb.net/?retryWrites=true&w=majority`,{useNewUrlParser: true,
useUnifiedTopology: true})
    .then(() => {
        app.listen(3000,
        ()=>{
            console.log('server is running on port 3000');
        }

)
    }).catch(err => {
        console.log(err);
    })

// app.listen(3000)
//     () => {
//   console.log('GraphQL server is running at http://localhost:3000/graphql');
// });
