import jwt from "jsonwebtoken";

//protext esari use garrepaxi paxi sabbai ma hamle protect use garna apauxam aaba

    //hamro jaile panni frontend ko request header ko architecture:
    // request header Authorization : Bearer <token> hunxa
    // so yo code le suthorization ma Bearera bata suru hunxa ki hunna hera
    // Bearer bata suru vako xa vane aaba teslai split garxa aani token matra linxa
    // condition ? if-true : if-false condition rakheko ho
  

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access, No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


