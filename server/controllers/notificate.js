exports.list = function(req, res) {
    res.render('notificate', {
         title: "notification",
         req: req,
         urlPath: req.protocol + "://" + req.get("host") + req.url
     });
 }
