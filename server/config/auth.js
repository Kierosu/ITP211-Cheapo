module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('message', 'Please login')
        res.redirect('/login');
    }
}