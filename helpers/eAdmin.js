module.exports = {
    eAdmin: (req, res, next) => {
        if(req.isAuthenticated() && req.user.isAdmin==true){
            return next();
        }
        else{
            req.flash("error_msg","Você precisa ser um admin");
            res.redirect("/");
        }
    }
}