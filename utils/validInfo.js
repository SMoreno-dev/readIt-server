module.exports = (req, res, next) => {
    const { email, user, password } = req.body;
  
    const validEmail = (userEmail) => {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }
  
    if (req.path === "/signup") {
      if (![email, user, password].every(Boolean)) {
        return res.status(401).json("Missing Credentials");
        
      } else if (!validEmail(email)) {
        return res.status(401).json("Invalid Email");
      }

    } else if (req.path === "/signin") {
      if (![user, password].every(Boolean)) {
        return res.status(401).json("Missing Credentials");
      }
    }
  
    next();
  };