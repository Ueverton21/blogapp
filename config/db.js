if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://ueverton-blog-app:nagatopainnaruto@cluster0-qbwuk.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"};
}