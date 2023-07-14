import path from 'path'
import {fileURLToPath} from 'url';
import multer from 'multer';
import {Storage} from '@google-cloud/storage'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);
const gc = new Storage({
    keyFilename: path.join(__dirname, "./platinum-sorter-172610-0d2d41517966.json"),
    projectId:'platinum-sorter-172610'
})
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'template')
    },
    filename: async (req, file, cb) => {
        var today = new Date();
        var month = today.getMonth() + 1;
        var tdate = today.getDate();
        if (month < 10 && tdate < 10) {
            var date = ('' + today.getFullYear()).substring(2) + '0' + (today.getMonth() + 1) + '0' + today.getDate() + '_' + today.getHours() + + today.getMinutes();
        }
        else {
            var date = ('' + today.getFullYear()).substring(2) + + (today.getMonth() + 1) + + today.getDate() + '_' + today.getHours() + + today.getMinutes();
        }
        const filename = date + file.originalname;
        
        cb(null, filename);
    }
});

// multer({ storage });
export const templateupload = multer({ storage: storage })