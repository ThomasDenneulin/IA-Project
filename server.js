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

app.post("/process",(req,res)=>{
    //console.log(req.body)
    //var checked = JSON.parse(req.body)
    console.log(req.body.q)
    var checked = req.body.q
    //console.log(checked[0])
    jsonQuest = LoadJSON()
    incrementAnswer()
    writeALL()
    checked.forEach(element => {
        jsonQuest = LoadJSON()
        var quest = searchById(parseInt(element),jsonQuest)
        console.log("RETURNED QUESTION : "+JSON.stringify(quest))
        RecalculPriority(quest)
    });
    console.log("PASSED")
    
    //ProcessSubmit(2,req.body)
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

function searchById(id){
    //console.log(objects)
    var returned = null;
    returned = jsonQuest.find(element => element.id === id)
    console.log("FINDED : "+ returned)
    return returned
}

function ProcessSubmit(qId){
    var jsonQuest = LoadJSON()
    RecalculPriority(qId)
    //var question = searchById(qId,jsonQuest)
}

function incrementAnswer(){
    jsonQuest.forEach(element => {
        element.answers += 1
    });
}
function RecalculPriority(question){ //Xnew = Cn-1 + (1 - Cn-1) * Cpositif / Ctotal
    console.log("A "+question.enonced)
    console.log("b "+question.priority)
    console.log("c "+question.positif_answers)
    console.log("d "+question.answers)
    question.positif_answers += 1
    var Xnew = question.priority + (1 - question.priority) * (question.positif_answers / question.answers)
    console.log("XNew "+ Xnew)
    jsonQuest.forEach(element => {
        if(element == question){
            element.priority = Xnew
        }
    });
    
    writeALL()
   
}

function writeALL(){
    try{
        fs.writeFileSync("./Questions.json",JSON.stringify(jsonQuest))
    }catch(exc){
        console.log("ERROR IN WRITTING FILE")
    }
}

app.listen(8080);
console.log("Serveur open on port 8080");