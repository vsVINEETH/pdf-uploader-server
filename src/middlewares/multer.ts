import multer from "multer";

const storage = multer.memoryStorage();

export const uploads = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      console.log(file)
      cb(new Error("Only PDF files are allowed!"));
    }
  }
}).single("pdf"); // Accepts only one PDF file at a time
