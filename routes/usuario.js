const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcryp = require('bcryptjs');

const passport = require('passport');

router.get('/registro', (req, res) => {
    if(req.user){
        res.redirect('/');
    }
    else {
        res.render("usuarios/registro");
    }
});

router.post('/registro', (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Preencha o nome corretamente"});
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Preencha o email corretamente"});
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Preencha senha corretamente"});
    }
    if(req.body.senha2 !== req.body.senha){
        erros.push({texto: "Senhas não coincidem"});
    }

    if(erros.length>0){
        res.render('usuarios/registro', {erros});
    }
    else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg","Já existe usuário com esse email");
                res.redirect('/usuarios/registro');
            }
            else{
                bcryp.genSalt(10, (erro, salt) => {
                    bcryp.hash(req.body.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg','Houve um erro no salvamento da senha');
                            res.redirect('/usuarios/registro');
                        }
                        else{
                            Usuario.create({nome: req.body.nome, email: req.body.email, senha: hash}).then(() => {
                                req.flash("success_msg","Usuário criado com sucesso!");
                                res.redirect('/');
                            }).catch(() => {
                                req.flash("error_msg","Houve um erro ao criar usuário, tente novamente");
                                res.redirect('/usuarios/registro');
                            });   
                        }
                    });
                });
            }
        })
        .catch((err) => {
            req.flash("error_msg","Houve um erro interno ao buscar usuário");
            res.redirect('/usuarios/registro');
        });
    }
});


router.get('/login', (req, res) => {
    if(req.user){
        res.redirect('/');
    }
    else{
        res.render('usuarios/login');
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {

    req.logout();
    req.flash('success_msg','Usuário deslogado com sucesso');
    res.redirect('/');

});


module.exports = router;