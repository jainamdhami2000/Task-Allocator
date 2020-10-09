
module.exports = function(app) {
    app.get('/dashboard',(req,res)=>{
        res.render('dashboard');
    })
}