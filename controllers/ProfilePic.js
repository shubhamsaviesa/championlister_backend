import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Profilepicture");
  },
  filename: function (req, file, cb) {
  cb(null, file.originalname);
  },
});
export const ProfilePic = multer({ storage: storage });


export const updateProfilepic = async (req, res) => {
    const userId = req.user.user_id;
    const fileurl = `http://localhost:5000/` + req.file.path;
    try {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        {
          updated_at: new Date(),
          profile_pic_url: fileurl,
        },
        { new: true }
      );
      res.send(user);
    } catch (e) {
      next(e);
    }
   
};


    //     if (req.headers && req.headers.authorization) {
      //       }
      //     else {
      //      console.log("provide token");
      //    }