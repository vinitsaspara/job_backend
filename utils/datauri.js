import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    const parser = new DataUriParser();

    // Ensure `file` is valid
    if (!file || !file.originalname || !file.buffer) {
        throw new Error("Invalid file object passed to getDataUri");
    }

    const extName = path.extname(file.originalname).toString();
    
    return parser.format(extName, file.buffer);
};

export default getDataUri;
