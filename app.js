var express=require('express');
var app=express();

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

//connecting server file for awt
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');
//database connection
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement';
let db

MongoClient.connect(url,{useUnifiedToology:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database:${url}`);
    console.log(`Database:${dbName}`);
});

//FETCHING HOSPITAL DETAILS
app.get("/hospitalsdetails",middleware.checkToken,function(req,res){
    console.log("Fetching data from hospital collection");
    var data = db.collection('hospitalDetails').find().toArray()
         .then(result => res.send(result));
});

//FETCHING VENTILATORS DETAILS
app.get("/ventilatordetails",middleware.checkToken,function(req,res){
    console.log("Fetching data from ventilators collection");
    var data = db.collection('ventilatorDetails').find().toArray()
         .then(result => res.send(result));
});

//SEARCH VENTILATORS BY status
app.post('/searchventilatorbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilatorDetails')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//SEARCH VENTILATORS BY hospital name
app.post('/searchventilatorbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilatorDetails')
    .find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//SEARCH HOSPITAL BY name
app.post('/searchhospitalbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospitaldetails=db.collection('hospitalDetails')
    .find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//UPDATE VENTILATOR DETAILS
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId:req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilatorDetails").update(ventid,newvalues,function(err,result){
        res.json('1 document updated');
        if(err)throw err;
        //console.log("1 document updated");
    });
});


//ADD VENTILATOR
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hid=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item=
    {
        hid:hid,ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('ventilatorDetails').insertOne(item,function(err,result){
        res.json('Item inserted');
    });
});

//DELETE VENTILATOR BY ventilatorId
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);

    var myquery1={ventilatorId:myquery};
    db.collection('ventilatorDetails').deleteOne(myquery1,function(err,obj)
    {
        if(err)throw err;
        res.json("1 document deleted");
    });

});
app.listen(8080);