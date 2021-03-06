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
    console.log(req.body.q)
    var checked = req.body.q
    jsonQuest = LoadJSON()
    incrementAnswer()
    writeALL()
    //recalculAllNotChecked(checked)
    checked.forEach(element => {
        jsonQuest = LoadJSON()
        var quest = searchById(parseInt(element),jsonQuest)
        console.log("RETURNED QUESTION : "+JSON.stringify(quest))
        RecalculPriority(quest)
    });
    jsonQuest = LoadJSON()
    res.send({conclude : conclude(checked),
              newQuestions : jsonQuest})
})

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});


function LoadJSON(){
    var text = fs.readFileSync("./Questions.json")
    var questions = JSON.parse(text);
    questions.sort((a,b)=>{
        return b.priority - a.priority
    })
    return questions;
}

function searchById(id){
    //console.log(objects)
    var returned = null;
    returned = jsonQuest.find(element => element.id === id)
    console.log("FINDED : "+ returned)
    return returned
}

function incrementAnswer(){
    jsonQuest.forEach(element => {
        element.answers += 1
    });
}

function conclude(checked){
    var moy = 0
    var returned = false
    console.log(checked)
    var moyAllCalc = 0
    jsonQuest.forEach(element => {
        moyAllCalc += element.priority
    });
    moyAllCalc = moyAllCalc / jsonQuest.length
    checked.forEach(element => {
        var u = searchById(parseInt(element))
        moy += u.priority
    });
    var moy = moy / checked.length
    if(moy >moyAllCalc){
        returned = true
    }
    console.log("Moy :"+moy)
    return returned
}

function RecalculPriority(question){ //Xnew = Cn-1 + (1 - Cn-1) * Cpositif / Ctotal
    question.positif_answers += 1
    var Xnew = question.priority + (1 - question.priority) * (question.positif_answers / question.answers)
    console.log("XNew "+ Xnew)
    jsonQuest.forEach(element => {
        if(element == question){
            element.priority = Xnew
        }
    });
    
    writeALL()
    LoadJSON()
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