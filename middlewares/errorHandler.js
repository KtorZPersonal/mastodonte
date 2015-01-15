/* In case of error, always do the same thing. Log the internal error if there is one, and 
  redirect to the destination error with a defined flash message */
module.exports = function(err, req, res, next) {
  console.log("Frontend Error : " + err.message);
  console.log(err);
  if(err.internalError) console.log("    Internal Error : " + err.internalError.message);
  req.flash('alert', err.message);
  res.redirect(err.destination);
};