exports.list = function(req, res) {
       res.render('sellDetails', {
            title: "Product Details",
            req: req,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }