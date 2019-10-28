//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyparse = require('body-parser');
const mongoose = require('mongoose');
const db = require('./config/db');
const app = express();
//Rotas externas
const routes = require('./routes/admin');
const usuarios = require('./routes/usuario');

const path = require("path");
const session = require("express-session");
const flash = require('connect-flash');
const Postagem = require('./models/Postagem');
const Categoria = require('./models/Categoria');

const passport = require('passport');
require('./config/auth')(passport);

//Configurações

//Session
    app.use(session({
        secret: "cursonode",
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

//Middleware
    app.use((req,res,next) => {
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
        res.locals.user = req.user || null;
        next();
    });

//Body parser
    app.use(bodyparse.urlencoded({extended: true}));
    app.use(bodyparse.json());

//Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');

//Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI).then(() => {
        console.log("Conectado ao Mongo");
    }).catch((err)=>{
        console.log("Erro ao se conectar "+err);
    });

//Public
    app.use(express.static(path.join(__dirname, "public")));

//Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({date: "desc"}).then( (postagens) => {
            res.render('index', {postagens});
        }).catch(() => {
            req.flash('error_msg','Houve um erro interno');
            res.redirect('/404');
        });
        
    });
    app.get('/404',(req, res) => {
        res.send("Erro 404");
    });

    app.get('/postagem/:slug',(req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem});
            }
            else{
                console.log("ERR");
                req.flash('error_msg', 'Essa postagem não existe');
                res.redirect('/');
            }
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/');
        });
    });

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias});
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao chamar as categorias');
            res.redirect('/');
        });
    });

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render('categorias/postagens',{postagens, categoria});
                })
                .catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno ao chamar as postagens');
                    res.redirect('/');
                });
            }
            else{
                req.flash('error_msg', 'Categoria não existe');
                res.redirect('/');
            }
            
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao chamar a categoria');
            res.redirect('/categorias/');
        });;
    });

    app.use('/usuarios', usuarios);
    app.use('/admin', routes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, ()=> {
    console.log('Servidor rodando!');
});
