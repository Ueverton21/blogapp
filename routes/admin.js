const express = require('express');
const router = express.Router();
const {eAdmin} = require('../helpers/eAdmin');
const Categoria = require('../models/Categoria');
const Postagem = require('../models/Postagem');

router.get('/',eAdmin, (req, res) => {
    res.render('admin/index');
});

router.get('/categorias',eAdmin, (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias });
    }).catch(() => {
        req.flash("error_msg", "Erro ao listar categorias!");
        res.redirect("/admin");
    });
});
router.get('/categorias/add',eAdmin, (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova',eAdmin, (req, res) => {

    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros });
    }
    else {
        Categoria.create({
            nome: req.body.nome,
            slug: req.body.slug
        }).then(() => {
            req.flash("success_msg", "Categoria adicionada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch(() => {
            req.flash("error_msg", "Erro ao salvar categoria, tente novamente!");
            res.redirect("/admin");
        });
    }
});

router.get('/categorias/editar/:id',eAdmin, (req, res) => {
    Categoria.findById(req.params.id).then((categoria) => {
        res.render('admin/editcategorias', { categoria });
    }).catch(() => {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/edit',eAdmin, (req, res) => {
    Categoria.where({ _id: req.body.id }).update({ nome: req.body.nome, slug: req.body.slug }).
        then(() => {
            req.flash("success_msg", "Categoria editada com sucesso");
            res.redirect("/admin/categorias");
        }).
        catch((err) => {
            req.flash("error_msg", "Erro ao tentar editar categoria");
            res.redirect("/admin/categorias");
        });
});

router.get('/categorias/excluir/:id',eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso");
        res.redirect("/admin/categorias");
    }).catch(() => {
        req.flash("error_msg", "Erro ao tentar excluir categoria");
        res.redirect("/admin/categorias");
    });
});

router.get('/postagens',eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({ date: "DESC" }).then((postagens) => {
        res.render('admin/postagens', { postagens });
    });
});

router.get('/postagens/add',eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagens', { categorias });
    }).catch((err) => {
        res.render('admin/categorias');
    });

});

router.post('/postagens/nova',eAdmin, (req, res) => {
    const titulo = req.body.titulo;
    const slug = req.body.slug;
    const descricao = req.body.descricao;
    const categoria = req.body.categoria;
    const conteudo = req.body.conteudo;

    var erros = [];

    if (!titulo || typeof titulo == undefined || titulo == null) {
        erros.push({ texto: "Titulo inválido" });
    }
    if (!slug || typeof slug == undefined || slug == null) {
        erros.push({ texto: "Slug inválido" });
    }
    if (!descricao || typeof descricao == undefined || descricao == null) {
        erros.push({ texto: "Descrição inválida" });
    }
    if (!conteudo || typeof conteudo == undefined || conteudo == null) {
        erros.push({ texto: "Conteudo inválido" });
    }

    if (categoria == "0") {
        erros.push({ texto: "Categoria inválida, crie uma categoria!" });
    }

    if (erros.length > 0) {
        Categoria.find().then((categorias) => {
            res.render('admin/addpostagens', { erros, categorias });
        });
    }
    else {
        Postagem.create({
            titulo, slug, descricao, categoria, conteudo,
        })
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!");
                res.redirect('/admin/postagens');
            }).catch(() => {
                req.flash("error_msg", "Erro ao criar postagem");
                res.redirect('/admin/postagens');
            });
    }
});

router.get('/postagens/editar/:id',eAdmin, (req, res) => {
    Postagem.findById(req.params.id).populate('categoria').then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', { postagem, categorias });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar categorias");
            res.render('admin/postagens');
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro na página de editar");
        res.render('admin/postagens');
    });
});

router.post('/postagens/edit',eAdmin, (req, res) => {
    const titulo = req.body.titulo;
    const slug = req.body.slug;
    const descricao = req.body.descricao;
    const categoria = req.body.categoria;
    const conteudo = req.body.conteudo;


    Postagem.where({ _id: req.body.id }).update({ titulo, slug, descricao, conteudo })
        .then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a postagem!");
            res.redirect("/admin/postagens");
        });
    

});

router.get('/postagens/excluir/:id',eAdmin, (req, res) => {
    Postagem.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Postagem excluída com sucesso");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("error_msg", "Errp ao tentar excluir postagem");
        res.redirect("/admin/postagens");
    });
})

module.exports = router;