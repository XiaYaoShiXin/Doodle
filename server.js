const Express = require('express');
const App = Express();
const Mongo = require('mongodb').MongoClient;
const BodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;
const Path = require('path');
const FileSystem = require('fs');

//数据库配置
const MONGO_URL = 'mongodb://localhost:27017';
const MONGO_DOC = 'doodle';
const MONGO_COL = "works";

App.use(Express.static('assets'));
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({ extended: true }));

App.set("view engine", "ejs");
App.set("views", Path.resolve('assets/views'))


//监听端口666
const Server = App.listen(666, '127.0.0.1', () => {
    console.log("Doddle server work now.");
});


App.get('/', (request, response) => { //index首页
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        client.db(MONGO_DOC).collection(MONGO_COL).find({}).toArray((err, doodles) => {
            if (err) throw err;
            client.close();
            response.render('index', {
                doodles: doodles
            });
        });
    });
});

App.get('/doodle/:id', (request, response) => { //涂鸦页面
    let id;
    try {
        id = ObjectID(request.params.id);
    } catch (e) {
        response.status(404);
        response.end();
        return;
    }
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        client.db(MONGO_DOC).collection(MONGO_COL).find({ "_id": id }).toArray((err, list) => {
            if (err) throw err;
            client.close();
            if (list.length == 0) {
                response.status(404);
                response.end();
            } else {
                response.render('doodle', {
                    id: id,
                    title: list[0].title
                });
            }
        });
    });
});



App.post('/save', (request, response) => { //api 保存涂鸦
    let id = ObjectID(request.body.id);
    let dataUrl = request.body.dataUrl;
    let title = request.body.title;
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        let work = { "title": title, "dataUrl": dataUrl };
        client.db(MONGO_DOC).collection(MONGO_COL).updateOne({ "_id": id }, { $set: work }, (err, result) => {
            if (err) throw err;
            client.close();
            response.end();
        });
    });
});

App.post('/load', (request, response) => { //api 加载涂鸦
    let id = ObjectID(request.body.id);
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        client.db(MONGO_DOC).collection(MONGO_COL).find({ "_id": id }).toArray((err, list) => {
            if (err) throw err;
            client.close();
            if (list.length == 0) {
                response.json(null);
            } else {
                response.json(list[0]);
            }
            response.end();
        });
    });
});


App.post('/doodle/create', (request, response) => { //api 创建涂鸦
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        let id = ObjectID();
        client.db(MONGO_DOC).collection(MONGO_COL).insertOne({ "_id": id, "title": "新建图片文件", dataUrl: null }, (err, result) => {
            if (err) throw err;
            client.close();
            response.json({ "id": id });
            response.end();
        });
    });
});

App.get('/doodle/:id/download', (request, response) => { //api 下载涂鸦
    let id;
    try {
        id = ObjectID(request.params.id);
    } catch (e) {
        response.status(404);
        response.end();
        return;
    }
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        client.db(MONGO_DOC).collection(MONGO_COL).find({ "_id": id }).toArray((err, list) => {
            if (err) throw err;
            client.close();
            if (list.length == 0) {
                response.status(404);
                response.end();
            } else {
                let dataUrl = list[0].dataUrl;
                if (!dataUrl) {
                    response.status(404);
                    response.end();
                } else {
                    let title = list[0].title + '.png';
                    let image = dataUrl.replace(/^data:image\/\w+;base64,/, "");
                    let buffer = new Buffer(image, 'base64');
                    FileSystem.writeFile(Path.resolve("assets/img/temp.png"), buffer, () => {
                        response.download(Path.resolve("assets/img/temp.png"), title);
                    });
                }
            }
        });
    });
});


App.post('/doodle/:id/remove', (request, response) => { //api 删除涂鸦
    let id = ObjectID(request.params.id);
    Mongo.connect(MONGO_URL, (err, client) => {
        if (err) throw err;
        client.db(MONGO_DOC).collection(MONGO_COL).deleteOne({ "_id": id }, (err, result) => {
            if (err) throw err;
            client.close();
            response.end();
        });
    });
});