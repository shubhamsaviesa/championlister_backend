//routes

/**
 * @swagger
 * /api/user/userRegistration:
 *  post:
 *    security:
 *       - Bearer: []
 *    responses:
 *      '200':
 *        description: A successful response
 *    requestBody:
 *       content:
 *          application/json:
 *              schema:
 *                 type: object
 *                 properties:
 *                    firstname:
 *                       type: string
 *                    lastname:
 *                       type: string
 *                    username:
 *                       type: string
 *                    email:
 *                       type: string
 *                    mobilenumber:
 *                       type: integer
 *                    password:
 *                       type: string
 *                    confirmPassword:
 *                       type: string
 *
 *
 */
