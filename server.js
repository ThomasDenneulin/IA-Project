var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var app = express();
var jsonQuest;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// set the view engine to ejs
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    jsonQuest = LoadJSON();
    res.render('index', {questions : jsonQuest});
});

app.post("/",(req,res)=>{
    console.log(req.body)
    ProcessSubmit(2,req.body)
    res.render("index",{questions : jsonQuest});
})

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});


function LoadJSON(){
    var text = fs.readFileSync("./Questions.json")
    var questions = JSON.parse(text);
    return questions;
}

function searchById(id,objects){
    console.log(objects)
    var returned = null;
    returned = objects.find(element => element.id === id)
    console.log(returned)
    return returned
}

function ProcessSubmit(qId,data){
    var jsonQuest = LoadJSON()
    //console.log(req)
    data.forEach(element => {
        console.log(element)
    });
    //var question = searchById(qId,jsonQuest)
}

function RecalculPriority(question){ //Xnew = Cn-1 + (1 - Cn-1) * Cpositif / Ctotal
    var Xnew = question.priority + (1 - question.priority) * (question.positif_answers / question.answers)
    jsonQuest.forEach(element => {
        if(element == question){
            element.priority = Xnew
        }
    });
    try{
        fs.writeFileSync("./Questions.json",JSON.stringify(jsonQuest))
    }catch(exc){
        console.log("ERROR IN WRITTING FILE")
    }
   
}

app.listen(8080);
console.log("Serveur open on port 8080");