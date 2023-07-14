// import * as jwt from 'jsonwebtoken';
import jwt from "jsonwebtoken"

export async function tokenverify(req, res) {
    if (req.headers && req.headers.authorization) {
          var authorization = req.headers.authorization.split(' ')[1],
            decoded;
        try {
            // console.log(authorization);
            decoded = jwt.verify(authorization, process.env.JWT_SECRET_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userIdd = decoded.userId;
        return userIdd
    }
    else {
        return res.send("provide token")

    }
}
// module.exports = {tokenverify}