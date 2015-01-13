/* In case of error, always do the same thing. Log the internal error if there is one, and 
  redirect to the destination error with a defined flash message */
module.exports = function(err, req, res, next) {
  if(err.internalError) console.log(err.internalError.message);
  req.flash(err.message);
  res.redirect(err.destination);
};